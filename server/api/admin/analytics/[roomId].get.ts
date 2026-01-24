import { redis } from '../../../utils/redis'
import type { Room } from '~/types'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')
  const query = getQuery(event)
  const adminToken = query.token as string

  if (!roomId || !adminToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room ID and admin token required'
    })
  }

  try {
    // Récupérer la room
    const roomData = await redis.get(`room:${roomId}`)
    if (!roomData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Room not found'
      })
    }

    const room: Room = JSON.parse(roomData)

    // Vérifier le token admin
    if (room.adminToken !== adminToken) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Invalid admin token'
      })
    }

    // Récupérer les analytics temps réel
    const now = Date.now()
    const hourAgo = now - (60 * 60 * 1000)

    // Compter les participants uniques (approximation via les fingerprints stockés)
    const fingerprintKeys = await redis.keys(`voted:${roomId}:*`)
    const uniqueParticipants = fingerprintKeys.length

    // Récupérer l'activité récente (votes dans la dernière heure)
    const recentActivity = await redis.zcount(`activity:${roomId}`, hourAgo, now)

    // Calculer le pic d'activité (approximation)
    const peakActivity = Math.max(room.analytics.peakActivity, recentActivity)

    // Mettre à jour les analytics dans la room
    const updatedRoom = {
      ...room,
      analytics: {
        totalParticipants: uniqueParticipants,
        peakActivity,
        lastActivity: room.analytics.lastActivity
      }
    }

    // Sauvegarder les analytics mises à jour
    await redis.set(`room:${roomId}`, JSON.stringify(updatedRoom))

    // Récupérer les données de vote pour les graphiques
    let chartData: any = null

    if (room.type === 'emoji_vote') {
      const votes = await redis.hgetall(`votes:${roomId}`)
      const total = Object.values(votes).reduce((sum: number, count: any) => sum + parseInt(count, 10), 0)

      chartData = Object.entries(votes).map(([emoji, count]) => ({
        emoji,
        count: parseInt(count as string, 10),
        percentage: total > 0 ? (parseInt(count as string, 10) / total) * 100 : 0
      }))
    } else if (room.type === 'poll') {
      const pollData = await redis.hgetall(`poll:${roomId}`)
      const total = Object.values(pollData).reduce((sum: number, count: any) => sum + parseInt(count, 10), 0)

      chartData = room.pollOptions?.map(option => ({
        id: option.id,
        text: option.text,
        votes: parseInt(pollData[option.id], 10) || 0,
        percentage: total > 0 ? ((parseInt(pollData[option.id], 10) || 0) / total) * 100 : 0
      })) || []
    }

    return {
      roomId,
      analytics: updatedRoom.analytics,
      chartData,
      timeRemaining: Math.max(0, room.expiresAt - now),
      status: room.status,
      locked: room.locked
    }

  } catch (error: any) {
    console.error('[Analytics Error]', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get analytics'
    })
  }
})
