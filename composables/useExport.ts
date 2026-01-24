import html2canvas from 'html2canvas'

/**
 * Composable pour l'export et screenshot automatique
 */
export const useExport = () => {
  const downloadPDF = async (roomId: string, adminToken: string) => {
    try {
      const response = await $fetch(`/api/admin/export/${roomId}?token=${adminToken}`, {
        method: 'GET'
      })

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `results-${roomId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error)
      return { success: false, error }
    }
  }

  const captureScreenshot = async (elementId: string, filename?: string): Promise<boolean> => {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error('Élément non trouvé:', elementId)
        return false
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Haute qualité
        logging: false,
        useCORS: true
      })

      // Convertir en blob
      canvas.toBlob((blob) => {
        if (!blob) return

        // Déclencher le téléchargement automatique
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename || `screenshot-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 'image/png', 0.95)

      return true
    } catch (error) {
      console.error('Erreur capture screenshot:', error)
      return false
    }
  }

  const autoScreenshotOnClose = (roomId: string, elementId: string) => {
    // Capturer automatiquement quand la room se ferme
    const filename = `results-${roomId}-${new Date().toISOString().split('T')[0]}.png`
    return captureScreenshot(elementId, filename)
  }

  const shareToWhatsApp = (url: string, message?: string) => {
    const text = message || `🗳️ Donnez votre avis ici: ${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  return {
    downloadPDF,
    captureScreenshot,
    autoScreenshotOnClose,
    shareToWhatsApp
  }
}
