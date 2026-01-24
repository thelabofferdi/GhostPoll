import { redis } from '../../utils/redis'
import type { Room } from '~/types'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { roomId, adminKey } = body

        if (!roomId || !adminKey) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing parameters'
            })
        }

        const roomData = await redis.get(`room:${roomId}`)
        if (!roomData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Room not found'
            })
        }

        const room: Room = JSON.parse(roomData)

        if (room.adminToken !== adminKey) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Invalid admin key'
            })
        }

        // Apply Reveal
        room.isRevealed = true

        // Update Redis (preserve TTL)
        const ttl = await redis.ttl(`room:${roomId}`)
        await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: ttl > 0 ? ttl : 86400 })

        return { success: true }

    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: e.message
        })
    }
})
