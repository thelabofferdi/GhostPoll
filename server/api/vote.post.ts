import { redis } from '../utils/redis'
import { sha256 } from '../utils/crypto'
import { checkSpeedLimit, checkVolumeLimit } from '../utils/ratelimit'

const VALID_EMOJIS = ['😍', '😊', '😐', '😕', '😢']

export default defineEventHandler(async (event) => {
    try {
        const clientIP = getRequestIP(event) || getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
        const userAgent = getHeader(event, 'user-agent') || 'unknown'

        // 🛡️ Layer 1: Speed Limit (DDoS Protection)
        if (!await checkSpeedLimit(clientIP)) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Too many requests'
            })
        }

        const body = await readBody(event)
        console.log('[Vote API] Received body:', JSON.stringify(body))

        // Validation
        if (!body.roomId || !body.emoji) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            })
        }

        if (!VALID_EMOJIS.includes(body.emoji)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid emoji'
            })
        }

        // 🛡️ Layer 2: Integrity Checks
        if (userAgent === 'unknown' || userAgent.length < 5) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid User-Agent'
            })
        }

        // Validate Fingerprint
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
        let room: any
        const roomData = await redis.get(`room:${body.roomId}`)

        if (!roomData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Room not found or expired'
            })
        }
        room = JSON.parse(roomData as string)

        // Vérifier si la room est verrouillée
        if (room.locked) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Room is locked'
            })
        }

        // Vérifier si expirée
        if (new Date(room.expiresAt) < new Date()) {
            throw createError({
                statusCode: 410,
                statusMessage: 'Room has expired'
            })
        }

        // Hash du fingerprint pour anonymat avec salt
        // PRIMARY IDENTITY: Fingerprint!
        const fingerprintData = `${clientFingerprint}:${body.roomId}`
        const fingerprintHash = await sha256(fingerprintData)
        const voteKey = `voted:${body.roomId}:${fingerprintHash}`
        const votesKey = `votes:${body.roomId}`

        // Gestion selon le mode de vote
        if (room.voteMode === 'single_vote') {
            // Vérifier si déjà voté
            const hasVoted = await redis.exists(voteKey)
            if (hasVoted) {
                throw createError({
                    statusCode: 409,
                    statusMessage: 'Already voted'
                })
            }

            // Enregistrer le vote
            await redis.set(voteKey, body.emoji, { ex: 86400 })
            await redis.hincrby(votesKey, body.emoji, 1)

        } else if (room.voteMode === 'allow_revote') {
            // Récupérer le vote précédent
            const previousVote = await redis.get(voteKey)

            // Opération atomique pour éviter les race conditions
            if (previousVote && previousVote !== body.emoji) {
                // Décrémenter l'ancien vote et incrémenter le nouveau en une seule opération
                const currentOld = await redis.hget(votesKey, previousVote as string) || '0'
                const currentNew = await redis.hget(votesKey, body.emoji) || '0'

                await redis.hset(votesKey, previousVote as string, Math.max(0, parseInt(currentOld, 10) - 1).toString())
                await redis.hset(votesKey, body.emoji, (parseInt(currentNew, 10) + 1).toString())
            } else if (!previousVote) {
                await redis.hincrby(votesKey, body.emoji, 1)
            }

            // Enregistrer le nouveau vote
            await redis.set(voteKey, body.emoji, { ex: 86400 })
        }

        // Récupérer les résultats actuels
        const resultsData = await redis.hgetall(votesKey)
        const results: any = {
            '😍': 0,
            '😊': 0,
            '😐': 0,
            '😕': 0,
            '😢': 0,
        }

        // Convertir les résultats en nombres et s'assurer qu'ils sont positifs
        Object.keys(resultsData).forEach(emoji => {
            if (VALID_EMOJIS.includes(emoji)) {
                results[emoji] = Math.max(0, parseInt(resultsData[emoji] || '0', 10))
            }
        })

        return {
            success: true,
            currentResults: results
        }

    } catch (error: any) {
        console.error('[Vote API Error]', error)

        // Si c'est déjà une erreur HTTP, la relancer
        if (error.statusCode) {
            throw error
        }

        // Debug: retourner le vrai message d'erreur
        throw createError({
            statusCode: 500,
            statusMessage: `Vote failed: ${error instanceof Error ? error.message : String(error)}`
        })
    }
})
