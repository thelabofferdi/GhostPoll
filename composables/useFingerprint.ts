/**
 * Composable pour générer un fingerprint avancé côté client
 */
export const useFingerprint = () => {
  const generateCanvasFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return ''

      canvas.width = 200
      canvas.height = 50

      // Dessiner du texte avec différentes propriétés
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('GhostPoll 🗳️', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Fingerprint test', 4, 35)

      return canvas.toDataURL()
    } catch {
      return ''
    }
  }

  const getAvailableFonts = (): string[] => {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Console',
      'Tahoma', 'Geneva', 'Lucida Sans Unicode', 'Franklin Gothic Medium',
      'Arial Narrow', 'Brush Script MT', 'Lucida Bright', 'Copperplate'
    ]

    const availableFonts: string[] = []
    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return []

    // Mesure de référence avec une font par défaut
    ctx.font = `${testSize} monospace`
    const baseWidth = ctx.measureText(testString).width

    testFonts.forEach(font => {
      ctx.font = `${testSize} ${font}, monospace`
      const width = ctx.measureText(testString).width
      
      // Si la largeur diffère, la font est disponible
      if (width !== baseWidth) {
        availableFonts.push(font)
      }
    })

    return availableFonts
  }

  const generateFingerprint = async (): Promise<string> => {
    const components = []

    // User Agent
    components.push(navigator.userAgent)

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

    // Language
    components.push(navigator.language)

    // Screen resolution
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

    // Canvas fingerprint
    components.push(generateCanvasFingerprint())

    // Available fonts
    components.push(getAvailableFonts().sort().join(','))

    // Hardware concurrency
    components.push(navigator.hardwareConcurrency?.toString() || '0')

    // Platform
    components.push(navigator.platform)

    // Créer un hash simple côté client
    const fingerprint = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(components.join('|'))
    )

    // Convertir en hex
    const hashArray = Array.from(new Uint8Array(fingerprint))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
  }

  const getFingerprintData = async () => {
    return {
      userAgent: navigator.userAgent,
      canvas: generateCanvasFingerprint(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      fonts: getAvailableFonts(),
      fingerprint: await generateFingerprint()
    }
  }

  return {
    generateFingerprint,
    getFingerprintData
  }
}
