<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useClipboard } from '@vueuse/core'

import { useLanguage } from '~/composables/useLanguage'

const { t, language } = useLanguage()
const route = useRoute()
const { copy } = useClipboard()

const roomId = computed(() => route.query.id as string)
const adminKey = computed(() => route.query.key as string)

// État
const room = ref<any>(null)
const results = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const actionLoading = ref(false)

// Emojis
const emojis = [
  { emoji: '😍', label: 'Excellent', color: '#ef4444' },
  { emoji: '😊', label: 'Bien', color: '#10b981' },
  { emoji: '😐', label: 'Moyen', color: '#6b7280' },
  { emoji: '😕', label: 'Décevant', color: '#f59e0b' },
  { emoji: '😢', label: 'Très mauvais', color: '#8b5cf6' },
]

// Countdown
const timeLeft = ref('')
const updateCountdown = () => {
  if (!room.value?.expiresAt) return
  
  const now = new Date().getTime()
  const expiry = new Date(room.value.expiresAt).getTime()
  const diff = expiry - now
  
  if (diff <= 0) {
    timeLeft.value = 'Expiré'
    return
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  timeLeft.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Charger les données
async function loadData() {
  if (!roomId.value || !adminKey.value) {
    error.value = 'Paramètres manquants'
    loading.value = false
    return
  }
  
  try {
    const data = await $fetch(`/api/results/${roomId.value}`)
    
    if (data) {
      room.value = data
      results.value = data.results
    }
  } catch (e) {
    // @ts-ignore
    if (import.meta.env.DEV) {
      console.error(e)
    }
    error.value = 'Erreur lors du chargement'
  } finally {
    loading.value = false
  }
}

// Calculer les stats
const totalVotes = computed(() => {
  if (!results.value) return 0
  
  if (Array.isArray(results.value)) {
    return results.value.reduce((sum: number, opt: any) => sum + opt.votes, 0)
  }
  
  return Object.values(results.value).reduce((sum: number, count: any) => sum + count, 0)
})

function getPercentage(count: number): number {
  if (totalVotes.value === 0) return 0
  return Math.round((count / totalVotes.value) * 100)
}

const topResult = computed(() => {
  if (!results.value || totalVotes.value === 0) return null
  
  if (Array.isArray(results.value)) {
    // Poll
    return results.value.reduce((prev: any, current: any) => {
      return (prev.votes > current.votes) ? prev : current
    })
  } else {
    // Emoji
    let max = 0
    let top = null
    
    emojis.forEach(item => {
      const count = results.value[item.emoji] || 0
      if (count > max) {
        max = count
        top = item
      }
    })
    return top
  }
})

// Returns label or text for top result
const topResultLabel = computed(() => {
  if (!topResult.value) return '—'
  if ('emoji' in topResult.value) return topResult.value.emoji
  return topResult.value.text
})

// Poll options for display
const pollOptions = computed(() => {
  if (room.value?.type === 'poll' && Array.isArray(results.value)) {
    return results.value
  }
  return []
})

// Helper functions for export image
function getTopResultDisplay() {
  if (!topResult.value || totalVotes.value === 0) return '—'
  
  if (room.value?.type === 'poll') {
    // For polls, show percentage
    const percentage = Math.round((topResult.value.votes / totalVotes.value) * 100)
    return `${percentage}%`
  } else {
    // For emoji votes, show the emoji
    return topResult.value.emoji || '—'
  }
}

function getTopResultLabel() {
  if (!topResult.value) return 'No votes yet'
  
  if (room.value?.type === 'poll') {
    return topResult.value.text || 'Unknown option'
  } else {
    return topResult.value.label || 'Unknown'
  }
}

function getOptionsCount() {
  if (room.value?.type === 'poll') {
    return pollOptions.value.length || 0
  }
  return 5 // Emoji votes always have 5 options
}

function getSortedResults() {
  if (!results.value) return []
  
  let items = []
  
  if (room.value?.type === 'poll') {
    items = pollOptions.value.map((opt: any) => ({
      label: opt.text,
      count: opt.votes,
      percentage: totalVotes.value > 0 ? Math.round((opt.votes / totalVotes.value) * 100) : 0,
      isWinner: false
    }))
  } else {
    // Emoji votes - ensure results.value is a valid object (not null, not array)
    const emojiResults = (results.value && typeof results.value === 'object' && !Array.isArray(results.value)) ? results.value : {}
    items = emojis.map(e => ({
      label: e.emoji + ' ' + e.label,
      count: emojiResults[e.emoji] || 0,
      percentage: totalVotes.value > 0 ? Math.round(((emojiResults[e.emoji] || 0) / totalVotes.value) * 100) : 0,
      isWinner: false
    }))
  }
  
  // Sort descending
  items.sort((a, b) => b.count - a.count)
  
  // Mark winner(s)
  if (items.length > 0 && items[0].count > 0) {
    const max = items[0].count
    items.forEach(i => {
      if (i.count === max) i.isWinner = true
    })
  }
  
  return items.slice(0, 5) // Top 5 max to fit layout
}


// ... (rest of the script)



// Actions admin
async function lockRoom() {
  if (!confirm('Verrouiller cette room ? Plus aucun vote ne sera accepté.')) return
  
  actionLoading.value = true
  try {
    await $fetch('/api/admin/lock', {
      method: 'POST',
      body: {
        roomId: roomId.value,
        adminKey: adminKey.value
      }
    })
    
    alert('Room verrouillée !')
    await loadData()
  } catch (e) {
    alert('Erreur lors du verrouillage')
  } finally {
    actionLoading.value = false
  }
}

async function closeRoom() {
  if (!confirm('Fermer définitivement cette room ? Cette action est irréversible !')) return
  
  actionLoading.value = true
  try {
    await $fetch('/api/admin/close', {
      method: 'POST',
      body: {
        roomId: roomId.value,
        adminKey: adminKey.value
      }
    })
    
    alert('Room fermée !')
    navigateTo('/')
  } catch (e) {
    alert('Erreur lors de la fermeture')
  } finally {
    actionLoading.value = false
  }
}

async function revealResults() {
  if (!confirm('Révéler les résultats maintenant ? Les participants pourront voir les votes.')) return
  
  actionLoading.value = true
  try {
    await $fetch('/api/admin/reveal', {
      method: 'POST',
      body: {
        roomId: roomId.value,
        adminKey: adminKey.value
      }
    })
    
    alert('Résultats révélés ! 👻')
    await loadData()
  } catch (e) {
    alert('Erreur lors de la révélation')
  } finally {
    actionLoading.value = false
  }
}




// Enhanced image export with mascot and branding
async function shareAsImage() {
    actionLoading.value = true
    try {
        // Load html2canvas from CDN if not already loaded
        if (typeof window.html2canvas === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
                script.onload = resolve
                script.onerror = reject
                document.head.appendChild(script)
            })
        }
        
        const element = document.getElementById('capture-target')
        
        if (!element) {
            alert('Capture element not found')
            return
        }

        // Temporarily reveal for capture
        element.style.display = 'block'
        element.style.position = 'fixed'
        element.style.left = '-9999px'
        element.style.top = '0'
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // @ts-ignore - html2canvas is loaded from CDN
        const canvas = await window.html2canvas(element, {
            backgroundColor: '#0B1121',
            scale: 2, // High resolution
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            width: 1000,
            height: 667
        })
        
        // Hide again
        element.style.display = 'none'
        element.style.position = ''
        element.style.left = ''
        element.style.top = ''

        // Convert to blob and download
        canvas.toBlob((blob) => {
            if (!blob) {
                alert('Failed to generate image')
                return
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = `ghostpoll-results-${roomId.value}.png`
            link.href = url
            link.click()
            window.URL.revokeObjectURL(url)
        }, 'image/png', 1.0)

    } catch(e) {
        console.error('Image export error:', e)
        alert('Failed to generate image. Please try again.')
    } finally {
        actionLoading.value = false
    }
}

const publicLink = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/vote/${roomId.value}`
})

function copyPublicLink() {
  copy(publicLink.value)
}

// Polling
let pollInterval: any = null
let countdownInterval: any = null

onMounted(() => {
  loadData()
  
  countdownInterval = setInterval(updateCountdown, 1000)
  
  pollInterval = setInterval(async () => {
    if (!roomId.value) return
    
    try {
      // Add timestamp to prevent caching
      const data = await $fetch(`/api/results/${roomId.value}?t=${Date.now()}`)
      if (data) {
        // Force update reference if data changed
        if (JSON.stringify(results.value) !== JSON.stringify(data.results)) {
           results.value = data.results
        }
        room.value = data
      }
    } catch (e) {
      console.error('Polling error', e)
    }
  }, 3000)
})

onBeforeUnmount(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
})

// Cleanup on route change
watch(() => route.path, () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
})
</script>

<template>
  <div class="min-h-screen bg-bg text-text p-6 relative overflow-hidden">
    
    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p class="text-text-secondary">{{ t('loading') }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-6">🔒</div>
        <h1 class="text-2xl font-bold mb-4">{{ t('access_denied') }}</h1>
        <p class="text-text-secondary mb-8">{{ error }}</p>
        <a href="/" class="btn-primary px-8 py-3 rounded-xl inline-block">
          {{ t('back_home') }}
        </a>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <main v-else class="max-w-6xl mx-auto relative z-10">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <img src="/assets/logo.png" alt="Logo" class="w-10 h-10" />
          <h1 class="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        <div class="flex flex-wrap items-center gap-4">
          <div class="px-4 py-2 bg-surface rounded-xl border border-white/10">
            <span class="text-xs text-text-secondary">Room ID:</span>
            <span class="ml-2 font-mono text-primary">{{ roomId }}</span>
          </div>
          
          <div class="px-4 py-2 bg-surface rounded-xl border border-white/10">
            <i class="i-carbon-time text-accent-cyan mr-2"></i>
            <span class="font-mono text-accent-cyan">{{ timeLeft }}</span>
          </div>
          
          <div v-if="room?.locked" class="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl">
            <i class="i-carbon-locked text-red-500 mr-2"></i>
            <span class="text-red-500 font-medium">{{ t('locked') }}</span>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Stats -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Question Card -->
          <div class="bg-surface border border-white/10 rounded-3xl p-8">
            <h2 class="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">{{ t('question') }}</h2>
            <p class="text-2xl font-bold">{{ room?.question || 'Untitled' }}</p>
          </div>

          <!-- Stats Overview -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-surface border border-white/10 rounded-2xl p-6 text-center">
              <div class="text-4xl font-bold text-primary mb-2">{{ totalVotes }}</div>
              <div class="text-sm text-text-secondary">{{ t('total_votes') }}</div>
            </div>
            
            <div class="bg-surface border border-white/10 rounded-2xl p-6 text-center">
              <div class="text-4xl mb-2">{{ topResultLabel }}</div>
              <div class="text-sm text-text-secondary">{{ t('top_vote') }}</div>
            </div>
            
            <div class="bg-surface border border-white/10 rounded-2xl p-6 text-center">
              <div class="text-sm font-bold text-text-secondary uppercase mb-2">Mode</div>
              <div class="text-xs text-text-muted">
                {{ room?.voteMode === 'single_vote' ? 'Single' : room?.voteMode === 'allow_revote' ? 'Revote' : 'Multiple' }}
              </div>
            </div>
          </div>

          <!-- Results Chart -->
          <div class="bg-surface border border-white/10 rounded-3xl p-8">
            <h2 class="text-xl font-bold mb-6">{{ t('detailed_results') }}</h2>
            
            <div class="space-y-6">
              
              <!-- Emoji View -->
              <template v-if="results && !Array.isArray(results)">
                <div
                  v-for="item in emojis"
                  :key="item.emoji"
                  class="flex items-center gap-4"
                >
                  <span class="text-4xl">{{ item.emoji }}</span>
                  
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium">{{ item.label }}</span>
                      <div class="flex items-center gap-3">
                        <span class="text-2xl font-bold">{{ getPercentage(results[item.emoji] || 0) }}%</span>
                        <span class="text-sm text-text-muted">{{ results[item.emoji] || 0 }}</span>
                      </div>
                    </div>
                    
                    <div class="h-4 bg-bg rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :style="{
                          width: `${getPercentage(results[item.emoji] || 0)}%`,
                          backgroundColor: item.color
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Poll View -->
              <template v-else>
                <div
                  v-for="option in results"
                  :key="option.id"
                  class="flex flex-col gap-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-lg">{{ option.text }}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-2xl font-bold text-primary">{{ getPercentage(option.votes) }}%</span>
                      <span class="text-sm text-text-muted">{{ option.votes }}</span>
                    </div>
                  </div>
                  
                  <div class="h-4 bg-bg rounded-full overflow-hidden border border-white/5">
                    <div
                      class="h-full rounded-full transition-all duration-500 bg-primary"
                      :style="{
                        width: `${getPercentage(option.votes)}%`
                      }"
                    ></div>
                  </div>
                </div>
              </template>

            </div>
          </div>

        </div>

        <!-- Right Column: Actions -->
        <div class="space-y-6">
          
          <!-- Share Card -->
          <div class="bg-surface border border-white/10 rounded-3xl p-6">
            <h3 class="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">{{ t('share') }}</h3>
            
            <div class="relative mb-4">
              <input
                type="text"
                readonly
                :value="publicLink"
                class="w-full bg-bg border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm font-mono text-text-muted select-all"
              />
              <button
                @click="copyPublicLink"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <i class="i-carbon-copy text-text-muted"></i>
              </button>
            </div>
            
            <a
              :href="publicLink"
              target="_blank"
              class="btn-primary w-full py-3 rounded-xl text-center block"
            >
              <i class="i-carbon-launch mr-2"></i>
              {{ t('open_page') }}
            </a>
          </div>

          <!-- Actions Card -->
          <div class="bg-surface border border-white/10 rounded-3xl p-6">
            <h3 class="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">{{ t('actions') }}</h3>
            
            <div class="space-y-3">
              <!-- REVEAL BUTTON (Special) -->
              <button
                v-if="room?.resultsVisibility === 'after_reveal' && !room?.isRevealed"
                @click="revealResults"
                :disabled="actionLoading"
                class="w-full bg-purple-600 hover:bg-purple-700 border border-purple-500/50 hover:border-purple-400 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(147,51,234,0.3)] mb-4"
              >
                <div class="text-xl">👻</div>
                <span class="font-bold text-white uppercase tracking-wider">REVEAL RESULTS</span>
              </button>
              <button
                @click="shareAsImage"
                class="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors"
                :disabled="actionLoading"
              >
                <i class="i-carbon-image"></i>
                <span>{{ t('share_image') }} 📸</span>
              </button>


              
              <button
                v-if="!room?.locked"
                @click="lockRoom"
                :disabled="actionLoading"
                class="w-full bg-bg hover:bg-white/5 border border-white/10 hover:border-yellow-500/30 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <i class="i-carbon-locked"></i>
                <span>{{ t('lock') }}</span>
              </button>
              
              <button
                @click="closeRoom"
                :disabled="actionLoading"
                class="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <i class="i-carbon-close"></i>
                <span>{{ t('close_permanent') }}</span>
              </button>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-surface/50 border border-white/10 rounded-2xl p-6 text-sm text-text-secondary">
            <p class="mb-2">
              <i class="i-carbon-information mr-2 text-primary"></i>
              Les données seront automatiquement supprimées après expiration.
            </p>
            <p>
              <i class="i-carbon-security mr-2 text-primary"></i>
              Gardez cette URL admin secrète.
            </p>
          </div>

        </div>

      </div>

    </main>

    <!-- CAPTURE AREA - SIMPLE & CLEAN -->
    <div id="capture-target" class="fixed top-0 left-0 w-[1000px] h-[667px] text-white font-sans" style="display:none; z-index: -1; background: #0B1121;">
        
        <div class="h-full flex flex-col p-12">
            
            <!-- Simple Header -->
            <div class="flex items-center justify-between mb-12">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                        <img src="/assets/logo.png" class="w-9 h-9" alt="" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold" style="color: white;">GhostPoll</h1>
                        <div class="text-slate-400 text-xs uppercase tracking-wide" style="color: #94a3b8;">{{ t('official_results') }}</div>
                    </div>
                </div>
                <div class="w-14 h-14 opacity-60">
                    <img src="/assets/hero-mascot.gif" class="w-full h-full" alt="" />
                </div>
            </div>

            <!-- Question -->
            <div class="mb-12">
                <h2 class="text-4xl font-serif italic text-white mb-3" style="font-family: Georgia, serif;">
                    "{{ room?.question || t('untitled_poll') }}"
                </h2>
                <div class="h-1 w-24 bg-orange-500 rounded"></div>
            </div>

            <!-- Results -->
            <div class="flex-1">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-slate-300 uppercase">{{ t('vote_breakdown') }}</h3>
                    <span class="text-sm text-slate-400">{{ t('based_on') }} <strong class="text-white">{{ totalVotes }}</strong> {{ t('votes') }}</span>
                </div>

                <div class="space-y-5">
                    <div v-for="(item, index) in getSortedResults()" :key="index">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center gap-3">
                                <span class="text-xl font-bold text-slate-400 w-6">{{ index + 1 }}</span>
                                <span :class="item.isWinner ? 'text-white font-bold' : 'text-slate-300'">{{ item.label }}</span>
                                <span v-if="item.isWinner" class="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 uppercase font-bold">Top</span>
                            </div>
                            <div>
                                <span class="text-2xl font-bold text-white">{{ item.percentage }}%</span>
                                <span class="text-slate-400 text-sm ml-2">{{ item.count }} v</span>
                            </div>
                        </div>
                        <div class="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                class="h-full rounded-full"
                                :class="item.isWinner ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-slate-600'"
                                :style="{ width: item.percentage === 0 ? '6px' : item.percentage + '%' }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-8 flex justify-between text-sm">
                <div class="text-blue-400 font-mono">
                    🔗 ghostpoll.com/vote/{{ room?.id || roomId }}
                </div>
                <div class="text-slate-500">
                    {{ new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') }}
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
