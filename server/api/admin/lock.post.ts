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
        const storedKey = await redis.get(`admin:${body.roomId}`)

        if (!storedKey || storedKey !== body.adminKey) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Invalid admin key'
            })
        }
    } catch (error) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid admin key'
        })
    }

    // Récupérer et verrouiller la room
    try {
        const roomData = await redis.get(`room:${body.roomId}`)

        if (!roomData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Room not found'
            })
        }

        const room = JSON.parse(roomData as string)
        room.locked = true
        room.status = 'locked'

        // Sauvegarder
        const ttl = Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000)
        await redis.set(`room:${body.roomId}`, JSON.stringify(room), { ex: ttl > 0 ? ttl : 60 })

        return {
            success: true,
            locked: true
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to lock room'
        })
    }
})
