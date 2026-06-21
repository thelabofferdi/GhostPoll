import { getAdminToken, loadAdminRoom } from '../../utils/admin'
import { redis, roomTtlSeconds, saveRoom } from '../../utils/redis'
import { durationToMs } from '../../utils/duration'
import type { RoomDuration } from '~/types'

const VALID_EXTENSIONS: RoomDuration[] = ['1h', '6h', '12h', '24h', '48h']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const roomId = body.roomId as string | undefined
  const adminToken = getAdminToken(body)
  const extension = body.extension as RoomDuration | undefined

  if (!extension || !VALID_EXTENSIONS.includes(extension)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid extension duration' })
  }

  const room = await loadAdminRoom(roomId || '', adminToken)
  const now = Date.now()

  room.expiresAt = Math.max(room.expiresAt, now) + durationToMs(extension)
  if (room.status === 'expired') {
    room.status = 'active'
  }

  await saveRoom(room)
  await refreshRoomTtls(room.id, room.type, roomTtlSeconds(room))

  return {
    success: true,
    expiresAt: room.expiresAt,
    ttlSeconds: roomTtlSeconds(room)
  }
})

async function refreshRoomTtls(roomId: string, type: string, ttlSeconds: number) {
  const counterKey = type === 'poll' ? `poll:${roomId}` : `votes:${roomId}`
  const votedKeys = await redis.keys(`voted:${roomId}:*`)

  await Promise.all([
    redis.expire(counterKey, ttlSeconds),
    ...votedKeys.map(key => redis.expire(key, ttlSeconds))
  ])
}
