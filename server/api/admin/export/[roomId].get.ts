import { getAdminToken, loadAdminRoom } from '../../../utils/admin'
import { redis } from '../../../utils/redis'
import { generateCsvExport, generatePdfExport, generateResultsExport } from '../../../utils/export'
import type { PollOption, VoteResults } from '~/types'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')
  const query = getQuery(event)
  const adminToken = getAdminToken(query)
  const format = typeof query.format === 'string' ? query.format : 'json'

  const room = await loadAdminRoom(roomId || '', adminToken)

  let results: VoteResults | PollOption[]

  if (room.type === 'emoji_vote') {
    const votesData = await redis.hgetall(`votes:${roomId}`)
    results = {
      '😍': parseInt(votesData['😍'] || '0', 10) || 0,
      '😊': parseInt(votesData['😊'] || '0', 10) || 0,
      '😐': parseInt(votesData['😐'] || '0', 10) || 0,
      '😕': parseInt(votesData['😕'] || '0', 10) || 0,
      '😢': parseInt(votesData['😢'] || '0', 10) || 0,
    }
  } else {
    const pollData = await redis.hgetall(`poll:${roomId}`)
    results = room.pollOptions?.map(option => ({
      ...option,
      votes: parseInt(pollData[option.id] || '0', 10) || 0
    })) || []
  }

  if (format === 'csv') {
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="ghostpoll-${room.id}.csv"`)
    return generateCsvExport(room, results)
  }

  if (format === 'pdf') {
    const pdf = await generatePdfExport(room, results)
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="ghostpoll-${room.id}.pdf"`)
    return pdf
  }

  return generateResultsExport(room, results)
})
