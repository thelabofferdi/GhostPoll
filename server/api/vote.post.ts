import { redis, getJson, roomTtlSeconds } from '../utils/redis'
import { sha256 } from '../utils/crypto'
import { checkSpeedLimit, checkVolumeLimit } from '../utils/ratelimit'
import type { Room, VoteEmoji } from '~/types'

const VALID_EMOJIS: VoteEmoji[] = ['😍', '😊', '😐', '😕', '😢']

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

        if (room.type !== 'emoji_vote') {
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

        if (!await checkVolumeLimit(clientIP, body.roomId)) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Volume limit reached for this IP'
            })
        }

        const fingerprintData = `${body.fingerprint}:${body.roomId}`
        const fingerprintHash = await sha256(fingerprintData)
        const voteKey = `voted:${body.roomId}:${fingerprintHash}`
        const votesKey = `votes:${body.roomId}`
        const voteTtl = roomTtlSeconds(room)

        if (room.voteMode === 'single_vote') {
            const hasVoted = await redis.exists(voteKey)
            if (hasVoted) {
                throw createError({
                    statusCode: 409,
                    statusMessage: 'Already voted'
                })
            }

            await redis.set(voteKey, body.emoji, { ex: voteTtl })
            await redis.hincrby(votesKey, body.emoji, 1)
        } else if (room.voteMode === 'allow_revote') {
            const previousVote = await redis.get<string>(voteKey)

            if (previousVote && previousVote !== body.emoji) {
                const currentOld = await redis.hget(votesKey, previousVote) || '0'
                const currentNew = await redis.hget(votesKey, body.emoji) || '0'

                await redis.hset(votesKey, previousVote, Math.max(0, parseInt(currentOld, 10) - 1).toString())
                await redis.hset(votesKey, body.emoji, (parseInt(currentNew, 10) + 1).toString())
            } else if (!previousVote) {
                await redis.hincrby(votesKey, body.emoji, 1)
            }

            await redis.set(voteKey, body.emoji, { ex: voteTtl })
        }

        const resultsData = await redis.hgetall(votesKey)
        const results: Record<VoteEmoji, number> = {
            '😍': 0,
            '😊': 0,
            '😐': 0,
            '😕': 0,
            '😢': 0,
        }

        Object.keys(resultsData).forEach(emoji => {
            if (VALID_EMOJIS.includes(emoji as VoteEmoji)) {
                results[emoji as VoteEmoji] = Math.max(0, parseInt(resultsData[emoji] || '0', 10))
            }
        })

        return {
            success: true,
            currentResults: results
        }
    } catch (error: any) {
        console.error('[Vote API Error]', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: `Vote failed: ${error instanceof Error ? error.message : String(error)}`
        })
    }
})
