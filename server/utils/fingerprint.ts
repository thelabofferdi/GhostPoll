import type { Fingerprint } from '~/types'
import { sha256 } from './crypto'

/**
 * Génère un fingerprint avancé du navigateur.
 * Uses Web Crypto through ./crypto for runtime portability.
 */
export async function generateFingerprint(data: {
  userAgent: string
  ip: string
  canvas?: string
  timezone?: string
  language?: string
  screen?: string
  fonts?: string[]
}): Promise<Fingerprint> {
  const components = [
    data.userAgent,
    data.ip,
    data.canvas || '',
    data.timezone || '',
    data.language || '',
    data.screen || '',
    (data.fonts || []).sort().join(',')
  ]

  const hash = (await sha256(components.join('|'))).substring(0, 16)

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
 * Valide un fingerprint.
 */
export function validateFingerprint(fingerprint: string): boolean {
  return /^[a-f0-9]{16}$/.test(fingerprint)
}

/**
 * Détecte si un fingerprint semble suspect (bot, automation).
 */
export function isSuspiciousFingerprint(data: Partial<Fingerprint>): boolean {
  if (!data.canvas) return true
  if (!data.timezone) return true
  if (!data.fonts || data.fonts.length < 5) return true

  return false
}
