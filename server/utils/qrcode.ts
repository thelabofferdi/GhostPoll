import QRCode from 'qrcode'

interface QRCustomization {
  logo?: string
  primaryColor?: string
  backgroundColor?: string
}

/**
 * Génère un QR code personnalisé
 */
export async function generateCustomQR(
  url: string,
  customization?: QRCustomization
): Promise<string | null> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 8,
    color: {
      dark: normalizeQrColor(customization?.primaryColor, '#111827'),
      light: normalizeQrColor(customization?.backgroundColor, '#ffffff')
    }
  })
}

function normalizeQrColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback
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
