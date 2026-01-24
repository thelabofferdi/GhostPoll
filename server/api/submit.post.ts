import { redis } from '../utils/redis'
import { sha256 } from '../utils/crypto'
import { generateId } from '../utils/nano'
import type { Room, OpenResponse } from '~/types'
import { checkSpeedLimit, checkVolumeLimit } from '../utils/ratelimit'

export default defineEventHandler(async (event) => {
    try {
        const clientIP = getRequestIP(event) || getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
        const userAgent = getHeader(event, 'user-agent') || 'unknown'

        // 🛡️ Layer 1: Speed Limit
        if (!await checkSpeedLimit(clientIP)) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Too many requests'
            })
        }

        const body = await readBody(event)
        console.log('[Submit API] Received body:', JSON.stringify(body))

        // Validation de base
        if (!body.roomId || !body.type) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            })
        }

        // 🛡️ Layer 2: Integrity Checks
        if (userAgent === 'unknown' || userAgent.length < 5) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid User-Agent'
            })
        }

        const clientFingerprint = body.fingerprint
        if (!clientFingerprint || clientFingerprint.length < 20 || !clientFingerprint.startsWith('data:image')) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid fingerprint'
            })
        }

        // 🛡️ Layer 3: Volume Limit (IP Cap)
        if (!await checkVolumeLimit(clientIP, body.roomId)) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Volume limit reached for this IP'
            })
        }

        // Récupérer la room
        const roomData = await redis.get(`room:${body.roomId}`)
        if (!roomData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Room not found or expired'
            })
        }

        const room: Room = JSON.parse(roomData)

        // Vérifications communes
        if (room.locked) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Room is locked'
            })
        }

        if (room.expiresAt < Date.now()) {
            throw createError({
                statusCode: 410,
                statusMessage: 'Room has expired'
            })
        }

        // Générer fingerprint
        // PRIMARY IDENTITY: Fingerprint!
        const fingerprintData = `${clientFingerprint}:${body.roomId}`
        const fingerprintHash = await sha256(fingerprintData)

        // Traitement selon le type
        if (body.type === 'poll_vote') {
            // Sondage à choix multiples
            if (room.type !== 'poll') {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid submission type for this room'
                })
            }

            if (!body.optionId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Option ID is required'
                })
            }

            // Vérifier que l'option existe
            const validOption = room.pollOptions?.find(opt => opt.id === body.optionId)
            if (!validOption) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid option'
                })
            }

            const voteKey = `voted:${body.roomId}:${fingerprintHash}`
            const pollKey = `poll:${body.roomId}`

            // Gestion selon le mode de vote
            if (room.voteMode === 'single_vote') {
                const hasVoted = await redis.exists(voteKey)
                if (hasVoted) {
                    throw createError({
                        statusCode: 409,
                        statusMessage: 'Already voted'
                    })
                }

                await redis.set(voteKey, body.optionId, { ex: 86400 })
                await redis.hincrby(pollKey, body.optionId, 1)

            } else if (room.voteMode === 'allow_revote') {
                const previousVote = await redis.get(voteKey)

                if (previousVote && previousVote !== body.optionId) {
                    // Décrémenter l'ancien et incrémenter le nouveau
                    const currentOld = await redis.hget(pollKey, previousVote) || '0'
                    await redis.hset(pollKey, previousVote, Math.max(0, parseInt(currentOld) - 1).toString())
                }

                if (!previousVote || previousVote !== body.optionId) {
                    await redis.hincrby(pollKey, body.optionId, 1)
                }

                await redis.set(voteKey, body.optionId, { ex: 86400 })
            }

            // Récupérer les résultats actuels
            const pollData = await redis.hgetall(pollKey)
            const results = room.pollOptions?.map(option => ({
                id: option.id,
                text: option.text,
                votes: parseInt(pollData[option.id]) || 0
            })) || []

            return {
                success: true,
                currentResults: results,
                totalVotes: results.reduce((sum, opt) => sum + opt.votes, 0)
            }
        }

        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid submission type'
        })

    } catch (error: any) {
        console.error('[Submit API Error]', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: `Submission failed: ${error instanceof Error ? error.message : String(error)}`
        })
    }
})
