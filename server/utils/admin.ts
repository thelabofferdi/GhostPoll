import type { Room } from '~/types'
import { getJson, keys } from './redis'

export function getAdminToken(input: Record<string, any>): string | undefined {
    return input.adminToken || input.adminKey || input.key || input.token
}

export async function loadRoom(roomId: string): Promise<Room> {
    const room = await getJson<Room>(keys.room(roomId))
    if (!room) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Room not found'
        })
    }
    return room
}

export async function loadAdminRoom(roomId: string, token?: string): Promise<Room> {
    if (!roomId || !token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Room ID and admin token required'
        })
    }

    const room = await loadRoom(roomId)
    if (room.adminToken !== token) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid admin token'
        })
    }

    return room
}
