import { getAdminToken, loadAdminRoom } from '../../utils/admin'
import { saveRoom } from '../../utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const roomId = body.roomId as string | undefined
  const adminToken = getAdminToken(body)
  const resultsVisibility = body.resultsVisibility as string | undefined

  if (resultsVisibility !== 'public' && resultsVisibility !== 'after_reveal') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid results visibility' })
  }

  const room = await loadAdminRoom(roomId || '', adminToken)

  room.resultsVisibility = resultsVisibility
  if (resultsVisibility === 'public') {
    room.isRevealed = true
  } else {
    room.isRevealed = Boolean(body.isRevealed)
  }

  await saveRoom(room)

  return {
    success: true,
    resultsVisibility: room.resultsVisibility,
    isRevealed: room.isRevealed
  }
})
