import { createHash } from 'crypto'
import type { Fingerprint } from '~/types'

/**
 * Génère un fingerprint avancé du navigateur
 */
export function generateFingerprint(data: {
  userAgent: string
  ip: string
  canvas?: string
  timezone?: string
  language?: string
  screen?: string
  fonts?: string[]
}): Fingerprint {
  const components = [
    data.userAgent,
    data.ip,
    data.canvas || '',
    data.timezone || '',
    data.language || '',
    data.screen || '',
    (data.fonts || []).sort().join(',')
  ]

  const hash = createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 16)

  return {
    hash,
    createdAt: Date.now(),
    canvas: data.canvas,
    timezone: data.timezone,
    language: data.language,
    screen: data.screen,
    fonts: data.fonts
  }
}

/**
 * Valide un fingerprint
 */
export function validateFingerprint(fingerprint: string): boolean {
  return /^[a-f0-9]{16}$/.test(fingerprint)
}

/**
 * Détecte si un fingerprint semble suspect (bot, automation)
 */
export function isSuspiciousFingerprint(data: Partial<Fingerprint>): boolean {
  // Pas de canvas fingerprint = suspect
  if (!data.canvas) return true
  
  // Timezone manquante = suspect
  if (!data.timezone) return true
  
  // Très peu de fonts = suspect
  if (!data.fonts || data.fonts.length < 5) return true
  
  return false
}
