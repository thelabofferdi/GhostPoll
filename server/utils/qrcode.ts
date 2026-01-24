// import QRCode from 'qrcode'
// Temporarily disabled for Cloudflare Workers compatibility

interface QRCustomization {
  logo?: string
  primaryColor?: string
  backgroundColor?: string
}

/**
 * Génère un QR code personnalisé
 * TEMPORARILY DISABLED - Returns null for Cloudflare Workers compatibility
 */
export async function generateCustomQR(
  url: string,
  customization?: QRCustomization
): Promise<string | null> {
  // QR code generation temporarily disabled for Cloudflare Workers
  // The library uses Node.js util.inherits which is incompatible
  return null
}

/**
 * Génère l'URL de partage WhatsApp optimisée
 */
export function generateWhatsAppShareUrl(roomUrl: string, question?: string): string {
  const message = question
    ? `🗳️ Votez pour: "${question}"\n\n${roomUrl}\n\n#EphemeralVote`
    : `🗳️ Donnez votre avis ici:\n\n${roomUrl}\n\n#EphemeralVote`

  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
