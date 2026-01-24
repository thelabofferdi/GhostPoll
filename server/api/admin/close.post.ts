import { redis } from '../../utils/redis'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validation
    if (!body.roomId || !body.adminKey) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        })
    }

    // Vérifier la clé admin
    try {
        const roomData = await redis.get(`room:${body.roomId}`)
        if (!roomData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Room not found'
            })
        }

        const room = JSON.parse(roomData)
        if (room.adminToken !== body.adminKey) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Invalid admin key'
            })
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid admin key'
        })
    }

    // Supprimer la room et toutes les données associées
    try {
        await redis.del(`room:${body.roomId}`)
        await redis.del(`admin:${body.roomId}`)
        await redis.del(`votes:${body.roomId}`)

        return {
            success: true,
            message: 'Room closed and deleted'
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to close room'
        })
    }
})
