import { getJson, redis } from '../../utils/redis'
import type { Room } from '~/types'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')

  if (!roomId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room ID is required'
    })
  }

  try {
    const room = await getJson<Room>(`room:${roomId}`)
    if (!room) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Room not found'
      })
    }

    const query = getQuery(event)
    const suppliedToken = query.key || query.adminKey || query.token
    const isAdmin = typeof suppliedToken === 'string' && suppliedToken === room.adminToken

    if (room.resultsVisibility === 'after_reveal' && !room.isRevealed && !isAdmin) {
      const hiddenResults = room.type === 'poll'
        ? room.pollOptions?.map(option => ({
          id: option.id,
          text: option.text,
          votes: 0
        })) || []
        : null

      return {
        roomId,
        question: room.question,
        type: room.type,
        status: 'hidden',
        results: hiddenResults,
        total: 0,
        locked: room.locked,
        voteMode: room.voteMode,
        expiresAt: room.expiresAt,
        resultsVisibility: room.resultsVisibility,
        isRevealed: room.isRevealed
      }
    }

    let results: any
    let total = 0

    if (room.type === 'emoji_vote') {
      const votesData = await redis.hgetall(`votes:${roomId}`)
      results = {
        '😍': 0,
        '😊': 0,
        '😐': 0,
        '😕': 0,
        '😢': 0,
      }

      Object.keys(votesData).forEach(emoji => {
        if (emoji in results) {
          results[emoji as keyof typeof results] = Math.max(0, parseInt(votesData[emoji] || '0', 10))
        }
      })

      total = Object.values(results).reduce((sum: number, count: any) => sum + count, 0)
    } else if (room.type === 'poll') {
      const pollData = await redis.hgetall(`poll:${roomId}`)
      results = room.pollOptions?.map(option => ({
        id: option.id,
        text: option.text,
        votes: parseInt(pollData[option.id], 10) || 0
      })) || []

      total = results.reduce((sum: number, opt: any) => sum + opt.votes, 0)
    }

    return {
      roomId,
      question: room.question,
      type: room.type,
      results,
      total,
      locked: room.locked,
      voteMode: room.voteMode,
      expiresAt: room.expiresAt,
      status: room.status,
      resultsVisibility: room.resultsVisibility,
      isRevealed: room.isRevealed
    }
  } catch (error: any) {
    console.error('[Results Error]', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get results'
    })
  }
})
