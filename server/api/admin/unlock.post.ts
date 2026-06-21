import { getAdminToken, loadAdminRoom } from '../../utils/admin'
import { saveRoom } from '../../utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const roomId = body.roomId as string | undefined
  const adminToken = getAdminToken(body)

  const room = await loadAdminRoom(roomId || '', adminToken)

  if (room.expiresAt < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'Room has expired' })
  }

  room.locked = false
  room.status = 'active'
  await saveRoom(room)

  return {
    success: true,
    locked: false,
    status: room.status
  }
})
