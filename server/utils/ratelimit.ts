import { redis } from './redis'

const RATE_LIMIT_WINDOW = 10 // seconds
const RATE_LIMIT_MAX_REQUESTS = 20 // requests per window
const VOLUME_LIMIT_MAX_VOTES = 10 // votes per IP per room

export const checkSpeedLimit = async (ip: string) => {
    const key = `ratelimit:speed:${ip}`
    const current = await redis.incr(key)
    if (current === 1) {
        await redis.expire(key, RATE_LIMIT_WINDOW)
    }
    return current <= RATE_LIMIT_MAX_REQUESTS
}

export const checkVolumeLimit = async (ip: string, roomId: string) => {
    const key = `ratelimit:volume:${roomId}:${ip}`
    const current = await redis.incr(key)
    // No expiration for volume limit (or long expiration like 24h matching room TTL)
    if (current === 1) {
        await redis.expire(key, 86400) // 24h
    }
    return current <= VOLUME_LIMIT_MAX_VOTES
}
