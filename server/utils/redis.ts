/**
 * Redis client with an in-memory development mock.
 */

import type { RedisKeys, Room } from '~/types'
import { createClient } from 'redis'

export interface RedisClient {
    get<T = string>(key: string): Promise<T | null>
    set(key: string, value: string, options?: { ex?: number }): Promise<void>
    incr(key: string): Promise<number>
    del(key: string): Promise<void>
    exists(key: string): Promise<boolean>
    hget(key: string, field: string): Promise<string | null>
    hset(key: string, field: string, value: string): Promise<void>
    hincrby(key: string, field: string, increment: number): Promise<number>
    hgetall(key: string): Promise<Record<string, string>>
    expire(key: string, seconds: number): Promise<boolean>
    ttl(key: string): Promise<number>
    keys(pattern: string): Promise<string[]>
    zcount(key: string, min: number, max: number): Promise<number>
}

export const keys: RedisKeys = {
    room: (roomId: string) => `room:${roomId}`,
    votes: (roomId: string) => `votes:${roomId}`,
    voted: (roomId: string, fingerprint: string) => `voted:${roomId}:${fingerprint}`,
    ratelimit: (roomId: string) => `ratelimit:${roomId}`,
    ratelimitIp: (ip: string) => `ratelimit:ip:${ip}`,
}

class NodeRedisClient implements RedisClient {
    private client: ReturnType<typeof createClient>
    private connectPromise: Promise<void> | null = null

    constructor(private readonly url: string) {
        this.client = createClient({ url: this.url })
        this.client.on('error', (error) => {
            console.error('[Redis] Client error', error)
        })
    }

    private async getClient() {
        if (!this.client.isOpen) {
            this.connectPromise ||= this.client.connect().then(() => undefined).finally(() => {
                this.connectPromise = null
            })
            await this.connectPromise
        }

        return this.client
    }

    async get<T = string>(key: string): Promise<T | null> {
        const client = await this.getClient()
        return await client.get(key) as T | null
    }

    async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
        const client = await this.getClient()
        if (options?.ex && options.ex > 0) {
            await client.set(key, value, { EX: Math.floor(options.ex) })
            return
        }

        await client.set(key, value)
    }

    async incr(key: string): Promise<number> {
        const client = await this.getClient()
        return await client.incr(key)
    }

    async del(key: string): Promise<void> {
        const client = await this.getClient()
        await client.del(key)
    }

    async exists(key: string): Promise<boolean> {
        const client = await this.getClient()
        return await client.exists(key) > 0
    }

    async hget(key: string, field: string): Promise<string | null> {
        const client = await this.getClient()
        return await client.hGet(key, field)
    }

    async hset(key: string, field: string, value: string): Promise<void> {
        const client = await this.getClient()
        await client.hSet(key, field, value)
    }

    async hincrby(key: string, field: string, increment: number): Promise<number> {
        const client = await this.getClient()
        return await client.hIncrBy(key, field, increment)
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        const client = await this.getClient()
        return await client.hGetAll(key)
    }

    async expire(key: string, seconds: number): Promise<boolean> {
        const client = await this.getClient()
        return await client.expire(key, Math.floor(seconds)) > 0
    }

    async ttl(key: string): Promise<number> {
        const client = await this.getClient()
        return await client.ttl(key)
    }

    async keys(pattern: string): Promise<string[]> {
        const client = await this.getClient()
        return await client.keys(pattern)
    }

    async zcount(key: string, min: number, max: number): Promise<number> {
        const client = await this.getClient()
        return await client.zCount(key, min, max)
    }

    async close(): Promise<void> {
        if (this.client.isOpen) {
            await this.client.quit()
        }
    }
}

let _redisInstance: RedisClient | null = null

class MockRedisClient implements RedisClient {
    private store = new Map<string, { value: string; expiresAt?: number }>()

    private getItem(key: string) {
        const item = this.store.get(key)
        if (!item) return null
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key)
            return null
        }
        return item
    }

    private parseHash(key: string): Record<string, string> {
        const item = this.getItem(key)
        if (!item) return {}
        try {
            const parsed = JSON.parse(item.value)
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
        } catch {
            return {}
        }
    }

    async get<T = string>(key: string): Promise<T | null> {
        const item = this.getItem(key)
        return item ? (item.value as T) : null
    }

    async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
        const expiresAt = options?.ex && options.ex > 0 ? Date.now() + (Math.floor(options.ex) * 1000) : undefined
        this.store.set(key, { value, expiresAt })
    }

    async incr(key: string): Promise<number> {
        const current = parseInt((await this.get<string>(key)) || '0', 10) || 0
        const newValue = current + 1
        const ttl = await this.ttl(key)
        await this.set(key, String(newValue), ttl > 0 ? { ex: ttl } : undefined)
        return newValue
    }

    async del(key: string): Promise<void> {
        this.store.delete(key)
    }

    async exists(key: string): Promise<boolean> {
        return this.getItem(key) !== null
    }

    async hget(key: string, field: string): Promise<string | null> {
        const data = this.parseHash(key)
        return data[field] ?? null
    }

    async hset(key: string, field: string, value: string): Promise<void> {
        const item = this.getItem(key)
        const data = this.parseHash(key)
        data[field] = value
        this.store.set(key, { value: JSON.stringify(data), expiresAt: item?.expiresAt })
    }

    async hincrby(key: string, field: string, increment: number): Promise<number> {
        const item = this.getItem(key)
        const data = this.parseHash(key)
        const newValue = (parseInt(data[field] || '0', 10) || 0) + increment
        data[field] = String(newValue)
        this.store.set(key, { value: JSON.stringify(data), expiresAt: item?.expiresAt })
        return newValue
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        return this.parseHash(key)
    }

    async expire(key: string, seconds: number): Promise<boolean> {
        const item = this.getItem(key)
        if (!item) return false
        item.expiresAt = Date.now() + (Math.floor(seconds) * 1000)
        this.store.set(key, item)
        return true
    }

    async ttl(key: string): Promise<number> {
        const item = this.getItem(key)
        if (!item) return -2
        if (!item.expiresAt) return -1
        return Math.max(0, Math.ceil((item.expiresAt - Date.now()) / 1000))
    }

    async keys(pattern: string): Promise<string[]> {
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
        const regex = new RegExp(`^${escaped}$`)
        return Array.from(this.store.keys()).filter((key) => this.getItem(key) && regex.test(key))
    }

    async zcount(): Promise<number> {
        return 0
    }
}

export const redis = new Proxy({} as RedisClient, {
    get(_target, prop) {
        if (!_redisInstance) {
            const config = getRedisConfig()

            if (config.redisUrl && config.redisUrl !== 'mock') {
                _redisInstance = new NodeRedisClient(config.redisUrl)
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Redis] Using in-memory mock (no Redis credentials configured)')
                }
                _redisInstance = new MockRedisClient()
            }
        }

        return (_redisInstance as any)[prop]
    }
})

function getRedisConfig() {
    let runtimeConfig: any = {}

    try {
        if (typeof useRuntimeConfig === 'function') {
            runtimeConfig = useRuntimeConfig()
        }
    } catch {
        runtimeConfig = {}
    }

    return {
        redisUrl: runtimeConfig.redisUrl || process.env.REDIS_URL || '',
    }
}

export async function getJson<T>(key: string): Promise<T | null> {
    const data = await redis.get<string>(key)
    return data ? JSON.parse(data) as T : null
}

export async function setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), ttlSeconds && ttlSeconds > 0 ? { ex: ttlSeconds } : undefined)
}

export function roomTtlSeconds(room: Pick<Room, 'expiresAt'>, fallback = 60): number {
    const ttl = Math.floor((room.expiresAt - Date.now()) / 1000)
    return ttl > 0 ? ttl : fallback
}

export async function saveRoom(room: Room): Promise<void> {
    await setJson(keys.room(room.id), room, roomTtlSeconds(room))
}

export async function deleteByPattern(pattern: string): Promise<void> {
    const matchedKeys = await redis.keys(pattern)
    await Promise.all(matchedKeys.map((key) => redis.del(key)))
}

export async function closeRedis(): Promise<void> {
    const client = _redisInstance as (RedisClient & { close?: () => Promise<void> }) | null
    await client?.close?.()
    _redisInstance = null
}
