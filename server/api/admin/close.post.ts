import { getAdminToken, loadAdminRoom } from '../../utils/admin'
import { deleteByPattern, redis } from '../../utils/redis'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const roomId = body.roomId as string | undefined
    const adminToken = getAdminToken(body)

    await loadAdminRoom(roomId || '', adminToken)

    await Promise.all([
        redis.del(`room:${roomId}`),
        redis.del(`votes:${roomId}`),
        redis.del(`poll:${roomId}`),
        deleteByPattern(`voted:${roomId}:*`),
    ])

    return {
        success: true,
        message: 'Room closed and deleted'
    }
})
