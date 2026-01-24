// Composable pour les API calls avec URL absolue
export const useApi = () => {
  const apiCall = async (endpoint: string, options: any = {}) => {
    // Utiliser l'URL actuelle du navigateur
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${baseUrl}${endpoint}`
    
    return await $fetch(url, options)
  }
  
  return {
    apiCall
  }
}
