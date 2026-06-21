import { getAdminToken, loadAdminRoom } from '../../utils/admin'
import { redis, setJson } from '../../utils/redis'
import { durationToMs, durationToSeconds } from '../../utils/duration'
import { generateId, generateKey } from '../../utils/nano'
import { generateCustomQR, generateWhatsAppShareUrl } from '../../utils/qrcode'
import type { Room, RoomDuration } from '~/types'

const VALID_DURATIONS: RoomDuration[] = ['1h', '6h', '12h', '24h', '48h']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const sourceRoomId = body.roomId as string | undefined
  const adminToken = getAdminToken(body)
  const sourceRoom = await loadAdminRoom(sourceRoomId || '', adminToken)
  const duration = (body.duration || sourceRoom.duration) as RoomDuration

  if (!VALID_DURATIONS.includes(duration)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid duration' })
  }

  const roomId = generateId()
  const newAdminToken = generateKey()
  const secretKey = generateKey()
  const now = Date.now()
  const expiresAt = now + durationToMs(duration)
  const ttlSeconds = durationToSeconds(duration)

  const room: Room = {
    id: roomId,
    adminToken: newAdminToken,
    secretKey,
    question: sourceRoom.question,
    type: sourceRoom.type,
    voteMode: sourceRoom.voteMode,
    duration,
    pollOptions: sourceRoom.pollOptions?.map(option => ({
      id: option.id,
      text: option.text,
      votes: 0
    })),
    qrCustomization: sourceRoom.qrCustomization,
    createdAt: now,
    expiresAt,
    locked: false,
    status: 'active',
    analytics: {
      totalParticipants: 0,
      peakActivity: 0,
      lastActivity: now
    },
    resultsVisibility: sourceRoom.resultsVisibility,
    isRevealed: false
  }

  const config = useRuntimeConfig()
  const configuredBaseUrl = process.env.BASE_URL || process.env.NUXT_PUBLIC_BASE_URL || config.public?.baseUrl
  const baseUrl = (configuredBaseUrl || 'http://localhost:3000').replace(/\/$/, '')
  const publicUrl = `${baseUrl}/vote/${roomId}`
  const adminUrl = `${baseUrl}/admin?id=${roomId}&key=${newAdminToken}`
  const qrCodeDataUrl = await generateCustomQR(publicUrl, room.qrCustomization)
  const whatsappShareUrl = generateWhatsAppShareUrl(publicUrl, room.question)

  await setJson(`room:${roomId}`, room, ttlSeconds)

  if (room.type === 'emoji_vote') {
    await Promise.all(['😍', '😊', '😐', '😕', '😢'].map(emoji => redis.hset(`votes:${roomId}`, emoji, '0')))
    await redis.expire(`votes:${roomId}`, ttlSeconds)
  } else {
    await Promise.all((room.pollOptions || []).map(option => redis.hset(`poll:${roomId}`, option.id, '0')))
    await redis.expire(`poll:${roomId}`, ttlSeconds)
  }

  return {
    roomId,
    adminToken: newAdminToken,
    publicUrl,
    adminUrl,
    qrCodeDataUrl,
    expiresAt,
    whatsappShareUrl,
    sourceRoomId
  }
})
