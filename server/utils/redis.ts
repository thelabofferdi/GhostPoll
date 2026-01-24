/**
 * Client Redis (Upstash)
 */

import type { Room, VoteResults, RedisKeys, REDIS_TTL } from '../types';

/**
 * Interface du client Redis
 */
export interface RedisClient {
    get<T = string>(key: string): Promise<T | null>;
    set(key: string, value: string, options?: { ex?: number }): Promise<void>;
    incr(key: string): Promise<number>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    hget(key: string, field: string): Promise<string | null>;
    hset(key: string, field: string, value: string): Promise<void>;
    hincrby(key: string, field: string, increment: number): Promise<number>;
    hgetall(key: string): Promise<Record<string, string>>;
    expire(key: string, seconds: number): Promise<boolean>;
}

/**
 * Clés Redis
 */
export const keys: RedisKeys = {
    room: (roomId: string) => `room:${roomId}`,
    votes: (roomId: string) => `votes:${roomId}`,
    voted: (roomId: string, fingerprint: string) => `voted:${roomId}:${fingerprint}`,
    ratelimit: (roomId: string) => `ratelimit:${roomId}`,
    ratelimitIp: (ip: string) => `ratelimit:ip:${ip}`,
};

/**
 * Crée un client Redis Upstash
 * 
 * @param url - URL Upstash Redis
 * @param token - Token Upstash
 * @returns Client Redis
 */
export function createRedisClient(url: string, token: string): RedisClient {
    // Nettoyage URL
    const baseUrl = url ? url.replace(/\/$/, '') : '';

    async function execute<T = unknown>(command: string[]): Promise<T> {
        if (!baseUrl || !token) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Redis credentials missing");
            }
            throw new Error("Redis configuration missing");
        }

        // Utiliser POST pour gérer correctement les caractères spéciaux (emojis)
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command)
        });

        if (!response.ok) {
            throw new Error(`Redis error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result as T;
    }

    return {
        async get<T = string>(key: string): Promise<T | null> {
            return execute<T>(['GET', key]);
        },

        async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
            const command = ['SET', key, value];
            if (options?.ex) {
                command.push('EX', options.ex.toString());
            }
            await execute(command);
        },

        async incr(key: string): Promise<number> {
            return execute<number>(['INCR', key]);
        },

        async del(key: string): Promise<void> {
            await execute(['DEL', key]);
        },

        async exists(key: string): Promise<boolean> {
            const result = await execute<number>(['EXISTS', key]);
            return result === 1;
        },

        async hget(key: string, field: string): Promise<string | null> {
            return execute<string | null>(['HGET', key, field]);
        },

        async hset(key: string, field: string, value: string): Promise<void> {
            await execute(['HSET', key, field, value]);
        },

        async hincrby(key: string, field: string, increment: number): Promise<number> {
            return execute<number>(['HINCRBY', key, field, increment.toString()]);
        },

        async hgetall(key: string): Promise<Record<string, string>> {
            const result = await execute<string[]>(['HGETALL', key]);

            // Security: Block dangerous keys to prevent prototype pollution
            const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

            // Convertir le tableau plat [k1, v1, k2, v2] en objet
            const obj: Record<string, string> = {};
            if (Array.isArray(result)) {
                for (let i = 0; i < result.length; i += 2) {
                    const key = result[i];
                    // Skip dangerous keys
                    if (!DANGEROUS_KEYS.includes(key)) {
                        obj[key] = result[i + 1];
                    }
                }
            }

            return obj;
        },

        async expire(key: string, seconds: number): Promise<boolean> {
            const result = await execute<number>(['EXPIRE', key, seconds.toString()]);
            return result === 1;
        },
    };
}

/**
 * Service Redis pour Ephemeral Vote
 */
export class RedisService {
    constructor(private redis: RedisClient) { }

    /**
     * Sauvegarde une room
     */
    async saveRoom(room: Room): Promise<void> {
        const key = keys.room(room.id);
        const ttl = Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000);

        await this.redis.set(
            key,
            JSON.stringify(room),
            { ex: ttl > 0 ? ttl : 60 }
        );
    }

    /**
     * Récupère une room
     */
    async getRoom(roomId: string): Promise<Room | null> {
        const key = keys.room(roomId);
        const data = await this.redis.get<string>(key);

        if (!data) return null;

        return JSON.parse(data) as Room;
    }

    /**
     * Supprime une room
     */
    async deleteRoom(roomId: string): Promise<void> {
        await this.redis.del(keys.room(roomId));
        await this.redis.del(keys.votes(roomId));
    }

    /**
     * Vérifie si une room existe
     */
    async roomExists(roomId: string): Promise<boolean> {
        return this.redis.exists(keys.room(roomId));
    }

    /**
     * Verrouille une room
     */
    async lockRoom(roomId: string): Promise<void> {
        const room = await this.getRoom(roomId);
        if (!room) throw new Error('Room not found');

        room.locked = true;
        room.status = 'locked';
        await this.saveRoom(room);
    }
}



// Export singleton instance using runtime config
// Note: useRuntimeConfig() is available because this file is in server/utils/
// Mais il faut faire attention à l'import côté serveur
let _redisInstance: RedisClient | null = null;

// Simple in-memory mock for development
class MockRedisClient implements RedisClient {
    private store = new Map<string, { value: string; expiresAt?: number }>();

    async get<T = string>(key: string): Promise<T | null> {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        try {
            return JSON.parse(item.value) as T;
        } catch {
            return item.value as T;
        }
    }

    async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
        const expiresAt = options?.ex ? Date.now() + (options.ex * 1000) : undefined;
        this.store.set(key, { value, expiresAt });
    }

    async incr(key: string): Promise<number> {
        const current = await this.get<number>(key) || 0;
        const newValue = current + 1;
        await this.set(key, String(newValue));
        return newValue;
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        const item = this.store.get(key);
        if (!item) return false;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }

    async hget(key: string, field: string): Promise<string | null> {
        const data = await this.get<Record<string, string>>(key);
        return data?.[field] || null;
    }

    async hset(key: string, field: string, value: string): Promise<void> {
        const data = await this.get<Record<string, string>>(key) || {};
        data[field] = value;
        await this.set(key, JSON.stringify(data));
    }

    async hincrby(key: string, field: string, increment: number): Promise<number> {
        const data = await this.get<Record<string, string>>(key) || {};
        const current = parseInt(data[field] || '0', 10);
        const newValue = current + increment;
        data[field] = String(newValue);
        await this.set(key, JSON.stringify(data));
        return newValue;
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        return await this.get<Record<string, string>>(key) || {};
    }

    async expire(key: string, seconds: number): Promise<boolean> {
        const item = this.store.get(key);
        if (item) {
            item.expiresAt = Date.now() + (seconds * 1000);
            this.store.set(key, item);
            return true;
        }
        return false;
    }
}

export const redis = new Proxy({} as RedisClient, {
    get(target, prop) {
        if (!_redisInstance) {
            const config = useRuntimeConfig()
            const url = config.upstashRedisUrl;
            const token = config.upstashRedisToken;

            // Security: Never log credentials - only log connection status
            const hasCredentials = Boolean(url && token && url !== 'mock' && token !== 'mock');

            // Use mock if credentials are not configured or are mock values
            if (!hasCredentials) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Redis] Using in-memory mock (no Upstash credentials configured)');
                }
                _redisInstance = new MockRedisClient();
            } else {
                _redisInstance = createRedisClient(url, token);
            }
        }
        // Properly typed Proxy access
        return (_redisInstance as any)[prop];
    }
})

// Ajout du support pipeline manquant dans l'interface RedisClient pour api/rooms.post.ts
// En fait, je vais adapter api/rooms.post.ts pour éviter 'pipeline' car mon client léger ne l'a pas.
