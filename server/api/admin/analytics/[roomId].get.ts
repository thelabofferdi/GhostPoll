import { getAdminToken, loadAdminRoom } from '../../../utils/admin'
import { redis, saveRoom } from '../../../utils/redis'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')
  const query = getQuery(event)
  const adminToken = getAdminToken(query)

  try {
    const room = await loadAdminRoom(roomId || '', adminToken)
    const now = Date.now()

    let chartData: any = []
    let totalVotes = 0

    if (room.type === 'emoji_vote') {
      const votes = await redis.hgetall(`votes:${roomId}`)
      totalVotes = Object.values(votes).reduce((sum: number, count: string) => sum + (parseInt(count, 10) || 0), 0)

      chartData = Object.entries(votes).map(([emoji, count]) => {
        const parsedCount = parseInt(count, 10) || 0
        return {
          emoji,
          count: parsedCount,
          percentage: totalVotes > 0 ? (parsedCount / totalVotes) * 100 : 0
        }
      })
    } else if (room.type === 'poll') {
      const pollData = await redis.hgetall(`poll:${roomId}`)
      totalVotes = Object.values(pollData).reduce((sum: number, count: string) => sum + (parseInt(count, 10) || 0), 0)

      chartData = room.pollOptions?.map(option => {
        const votes = parseInt(pollData[option.id], 10) || 0
        return {
          id: option.id,
          text: option.text,
          votes,
          percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0
        }
      }) || []
    }

    const fingerprintKeys = await redis.keys(`voted:${roomId}:*`)
    const updatedRoom = {
      ...room,
      analytics: {
        totalParticipants: fingerprintKeys.length || totalVotes,
        peakActivity: Math.max(room.analytics?.peakActivity || 0, totalVotes),
        lastActivity: room.analytics?.lastActivity || room.createdAt
      }
    }

    await saveRoom(updatedRoom)

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
