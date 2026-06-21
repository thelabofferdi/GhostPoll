import { redis, getJson, roomTtlSeconds } from '../utils/redis'
import { sha256 } from '../utils/crypto'
import type { Room } from '~/types'
import { checkSpeedLimit, checkVolumeLimit } from '../utils/ratelimit'

function assertValidFingerprint(fingerprint: unknown) {
    if (typeof fingerprint !== 'string' || fingerprint.length < 8 || fingerprint.length > 10000) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid fingerprint'
        })
    }
}

export default defineEventHandler(async (event) => {
    try {
        const clientIP = getRequestIP(event) || getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
        const userAgent = getHeader(event, 'user-agent') || 'unknown'

        if (!await checkSpeedLimit(clientIP)) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Too many requests'
            })
        }

        const body = await readBody(event)

        if (!body.roomId || body.type !== 'poll_vote') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            })
        }

        if (userAgent === 'unknown' || userAgent.length < 5) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid User-Agent'
            })
        }

        assertValidFingerprint(body.fingerprint)

        const room = await getJson<Room>(`room:${body.roomId}`)
        if (!room) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Room not found or expired'
            })
        }

        if (room.type !== 'poll') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid submission type for this room'
            })
        }

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

        if (!body.optionId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Option ID is required'
            })
        }

        const validOption = room.pollOptions?.find(opt => opt.id === body.optionId)
        if (!validOption) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid option'
            })
        }

        if (!await checkVolumeLimit(clientIP, body.roomId)) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Volume limit reached for this IP'
            })
        }

        const fingerprintData = `${body.fingerprint}:${body.roomId}`
        const fingerprintHash = await sha256(fingerprintData)
        const voteKey = `voted:${body.roomId}:${fingerprintHash}`
        const pollKey = `poll:${body.roomId}`
        const voteTtl = roomTtlSeconds(room)

        if (room.voteMode === 'single_vote') {
            const hasVoted = await redis.exists(voteKey)
            if (hasVoted) {
                throw createError({
                    statusCode: 409,
                    statusMessage: 'Already voted'
                })
            }

            await redis.set(voteKey, body.optionId, { ex: voteTtl })
            await redis.hincrby(pollKey, body.optionId, 1)
        } else if (room.voteMode === 'allow_revote') {
            const previousVote = await redis.get<string>(voteKey)

            if (previousVote && previousVote !== body.optionId) {
                const currentOld = await redis.hget(pollKey, previousVote) || '0'
                await redis.hset(pollKey, previousVote, Math.max(0, parseInt(currentOld, 10) - 1).toString())
            }

            if (!previousVote || previousVote !== body.optionId) {
                await redis.hincrby(pollKey, body.optionId, 1)
            }

            await redis.set(voteKey, body.optionId, { ex: voteTtl })
        }

        const pollData = await redis.hgetall(pollKey)
        const results = room.pollOptions?.map(option => ({
            id: option.id,
            text: option.text,
            votes: parseInt(pollData[option.id], 10) || 0
        })) || []

        return {
            success: true,
            currentResults: results,
            totalVotes: results.reduce((sum, opt) => sum + opt.votes, 0)
        }
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
