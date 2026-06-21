import { getAdminToken, loadAdminRoom } from '../../utils/admin'
import { saveRoom } from '../../utils/redis'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const roomId = body.roomId as string | undefined
    const adminToken = getAdminToken(body)

    const room = await loadAdminRoom(roomId || '', adminToken)

    room.isRevealed = true
    await saveRoom(room)

    return { success: true }
})
