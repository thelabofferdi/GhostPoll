import jsPDF from 'jspdf'
import type { Room, VoteResults, OpenResponse, PollOption } from '~/types'

/**
 * Génère un PDF des résultats
 */
export function generateResultsPDF(room: Room, results: any): Buffer {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('📊 Résultats du Vote', 20, 30)
  
  // Question
  if (room.question) {
    doc.setFontSize(14)
    doc.text(`Question: ${room.question}`, 20, 50)
  }
  
  // Infos room
  doc.setFontSize(10)
  doc.text(`Room ID: ${room.id}`, 20, 70)
  doc.text(`Créé le: ${new Date(room.createdAt).toLocaleString('fr-FR')}`, 20, 80)
  doc.text(`Expire le: ${new Date(room.expiresAt).toLocaleString('fr-FR')}`, 20, 90)
  
  let yPos = 110
  
  if (room.type === 'emoji_vote') {
    // Résultats émojis
    const emojiResults = results as VoteResults
    const total = Object.values(emojiResults).reduce((sum: number, count: number) => sum + count, 0)
    
    doc.setFontSize(12)
    doc.text('Résultats:', 20, yPos)
    yPos += 20
    
    Object.entries(emojiResults).forEach(([emoji, count]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
      doc.text(`${emoji} ${count} votes (${percentage}%)`, 30, yPos)
      yPos += 15
    })
    
    doc.text(`Total: ${total} votes`, 20, yPos + 10)
  }
  
  if (room.type === 'open_question') {
    // Réponses ouvertes
    const responses = results as OpenResponse[]
    
    doc.setFontSize(12)
    doc.text(`Réponses (${responses.length}):`, 20, yPos)
    yPos += 20
    
    responses.forEach((response, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }
      
      doc.setFontSize(10)
      doc.text(`${index + 1}. ${response.text}`, 20, yPos)
      yPos += 15
    })
  }
  
  if (room.type === 'poll') {
    // Résultats sondage
    const pollResults = results as PollOption[]
    const total = pollResults.reduce((sum, option) => sum + option.votes, 0)
    
    doc.setFontSize(12)
    doc.text('Résultats du sondage:', 20, yPos)
    yPos += 20
    
    pollResults.forEach((option) => {
      const percentage = total > 0 ? ((option.votes / total) * 100).toFixed(1) : '0'
      doc.text(`• ${option.text}: ${option.votes} votes (${percentage}%)`, 30, yPos)
      yPos += 15
    })
    
    doc.text(`Total: ${total} votes`, 20, yPos + 10)
  }
  
  // Footer
  doc.setFontSize(8)
  doc.text('Généré par GhostPoll - Vote Éphémère', 20, 280)
  doc.text(`Exporté le: ${new Date().toLocaleString('fr-FR')}`, 20, 290)
  
  return Buffer.from(doc.output('arraybuffer'))
}

/**
 * Génère les données pour le screenshot automatique
 */
export function generateScreenshotData(room: Room, results: any) {
  return {
    roomId: room.id,
    question: room.question,
    type: room.type,
    results,
    timestamp: Date.now(),
    // Données pour le rendu côté client
    chartData: room.type === 'emoji_vote' ? formatEmojiChartData(results) : null
  }
}

function formatEmojiChartData(results: VoteResults) {
  const total = Object.values(results).reduce((sum, count) => sum + count, 0)
  
  return Object.entries(results).map(([emoji, count]) => ({
    emoji,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }))
}
