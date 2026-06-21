import { redis } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const key = `health:${Date.now()}`

  try {
    await redis.set(key, 'ok', { ex: 10 })
    const redisStatus = await redis.get(key)
    await redis.del(key)

    if (redisStatus !== 'ok') {
      throw new Error('Redis healthcheck failed')
    }

    return {
      status: 'ok',
      redis: 'ok',
      uptime: typeof process.uptime === 'function' ? process.uptime() : null,
      timestamp: Date.now()
    }
  } catch (error) {
    setResponseStatus(event, 503)
    return {
      status: 'error',
      redis: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }
  }
})
