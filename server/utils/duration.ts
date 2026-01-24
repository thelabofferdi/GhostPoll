import type { RoomDuration } from '~/types'

/**
 * Convertit une durée en millisecondes
 */
export function durationToMs(duration: RoomDuration): number {
  const durations = {
    '1h': 1 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '48h': 48 * 60 * 60 * 1000
  }
  
  return durations[duration]
}

/**
 * Convertit une durée en secondes (pour Redis TTL)
 */
export function durationToSeconds(duration: RoomDuration): number {
  return Math.floor(durationToMs(duration) / 1000)
}

/**
 * Formate le temps restant
 */
export function formatTimeRemaining(expiresAt: number): string {
  const now = Date.now()
  const remaining = expiresAt - now
  
  if (remaining <= 0) return 'Expiré'
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}min restantes`
  }
  
  return `${minutes}min restantes`
}

/**
 * Labels des durées
 */
export const DURATION_LABELS: Record<RoomDuration, string> = {
  '1h': '1 heure',
  '6h': '6 heures', 
  '12h': '12 heures',
  '24h': '24 heures',
  '48h': '48 heures'
}
