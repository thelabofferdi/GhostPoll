import type { PollOption, Room, VoteResults } from '~/types'
import PDFDocument from 'pdfkit'

export function generateResultsExport(room: Room, results: VoteResults | PollOption[]) {
  const total = Array.isArray(results)
    ? results.reduce((sum, option) => sum + option.votes, 0)
    : Object.values(results).reduce((sum, count) => sum + count, 0)

  return {
    roomId: room.id,
    question: room.question,
    type: room.type,
    createdAt: room.createdAt,
    expiresAt: room.expiresAt,
    exportedAt: Date.now(),
    total,
    locked: room.locked,
    results
  }
}

export function generateScreenshotData(room: Room, results: VoteResults | PollOption[]) {
  return {
    roomId: room.id,
    question: room.question,
    type: room.type,
    results,
    timestamp: Date.now(),
    chartData: room.type === 'emoji_vote' && !Array.isArray(results) ? formatEmojiChartData(results) : null
  }
}

export function generateCsvExport(room: Room, results: VoteResults | PollOption[]): string {
  const rows = [
    ['room_id', room.id],
    ['question', room.question || ''],
    ['type', room.type],
    ['created_at', new Date(room.createdAt).toISOString()],
    ['expires_at', new Date(room.expiresAt).toISOString()],
    ['locked', String(room.locked)],
    [],
    ['label', 'votes']
  ]

  getResultRows(results).forEach(row => rows.push([row.label, String(row.votes)]))

  return rows.map(row => row.map(escapeCsvCell).join(',')).join('\n') + '\n'
}

export function generatePdfExport(room: Room, results: VoteResults | PollOption[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 })
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(Buffer.from(chunk)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const total = getResultRows(results).reduce((sum, row) => sum + row.votes, 0)

    doc.fontSize(22).text('GhostPoll Results', { align: 'left' })
    doc.moveDown(0.5)
    doc.fontSize(12).fillColor('#444444')
    doc.text(`Room: ${room.id}`)
    doc.text(`Question: ${sanitizePdfText(room.question || 'Untitled')}`)
    doc.text(`Type: ${room.type}`)
    doc.text(`Total votes: ${total}`)
    doc.text(`Exported: ${new Date().toISOString()}`)
    doc.moveDown()

    doc.fillColor('#000000').fontSize(14).text('Breakdown')
    doc.moveDown(0.5)

    getResultRows(results).forEach((row) => {
      const percentage = total > 0 ? Math.round((row.votes / total) * 100) : 0
      doc.fontSize(12).text(`${sanitizePdfText(row.label)}: ${row.votes} (${percentage}%)`)
    })

    doc.end()
  })
}

function formatEmojiChartData(results: VoteResults) {
  const total = Object.values(results).reduce((sum, count) => sum + count, 0)

  return Object.entries(results).map(([emoji, count]) => ({
    emoji,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }))
}

function getResultRows(results: VoteResults | PollOption[]) {
  if (Array.isArray(results)) {
    return results.map(option => ({ label: option.text, votes: option.votes }))
  }

  return Object.entries(results).map(([emoji, votes]) => ({
    label: emojiLabel(emoji),
    votes
  }))
}

function emojiLabel(emoji: string): string {
  const labels: Record<string, string> = {
    '😍': 'Excellent',
    '😊': 'Good',
    '😐': 'Neutral',
    '😕': 'Meh',
    '😢': 'Bad'
  }

  return labels[emoji] || emoji
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

function sanitizePdfText(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, '')
}
