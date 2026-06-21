<template>
  <div class="min-h-screen bg-[#020617] font-sans text-slate-100 overflow-x-hidden selection:bg-orange-500 selection:text-white relative">
    <!-- Background Gradients -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      <div class="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="relative z-10 max-w-xl mx-auto px-4 py-12">
      
      <!-- Navbar / Logo minimal -->
      <div class="flex justify-center mb-10">
        <div class="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" @click="router.push('/')">
          <div class="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 backdrop-blur-md">
             <img src="/assets/logo.png" alt="GhostPoll" class="w-5 h-5 object-contain" />
          </div>
          <span class="font-bold text-lg tracking-tight text-white">GhostPoll</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 animate-pulse">
        <div class="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4 border border-white/10"></div>
        <p class="text-slate-500">{{ t('conjuring') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-md">
        <span class="material-icons text-4xl text-red-500 mb-4">warning</span>
        <h2 class="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p class="text-red-200/70 mb-6">{{ error }}</p>
        <button @click="() => loadRoom()" class="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-xl transition-all border border-red-500/20">
          {{ t('try_again') }}
        </button>
      </div>

      <!-- Room Content -->
      <div v-else-if="room" class="space-y-6 animate-fade-in">
        
        <!-- Header Card -->
        <div class="bg-[#1a1c2e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none"></div>
          
          <h1 class="font-serif text-3xl md:text-4xl text-white mb-6 leading-tight">
            {{ room.question || getDefaultTitle() }}
          </h1>
          
          <div class="flex items-center justify-center gap-6 text-xs font-medium uppercase tracking-wider text-slate-400">
            <div class="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span class="material-icons text-sm text-orange-500">timer</span>
              <span>{{ timeLeft }}</span>
            </div>
            <div class="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span class="material-icons text-sm text-blue-500">people</span>
              <span>{{ results?.total || 0 }} {{ t('votes') }}</span>
            </div>
          </div>
        </div>

        <!-- Emoji Vote -->
        <div v-if="room.type === 'emoji_vote'" class="bg-[#1e293b]/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div v-if="canVote" class="space-y-4">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest text-center mb-6">{{ t('how_feel') }}</h3>
            <div class="grid grid-cols-1 gap-3">
              <button
                v-for="emoji in emojis"
                :key="emoji.emoji"
                @click="selectEmoji(emoji.emoji)"
                :class="[
                  'flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden',
                  selectedEmoji === emoji.emoji
                    ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                ]"
              >
                <div class="flex items-center space-x-4 relative z-10">
                  <span class="text-3xl group-hover:scale-110 transition-transform duration-300 transform origin-center">{{ emoji.emoji }}</span>
                  <span class="font-medium text-slate-200">{{ emoji.label_en }}</span>
                </div>
                <div class="relative z-10">
                    <div :class="['w-5 h-5 rounded-full border flex items-center justify-center transition-all', selectedEmoji === emoji.emoji ? 'border-orange-500 bg-orange-500' : 'border-slate-600']">
                       <span v-if="selectedEmoji === emoji.emoji" class="material-icons text-[14px] text-white font-bold">check</span>
                    </div>
                </div>
              </button>
            </div>
            
            <button
              v-if="selectedEmoji"
              @click="submitVote"
              :disabled="voting"
              class="w-full mt-4 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <span v-if="!voting">{{ t('cast_vote') }}</span>
              <span v-else class="material-icons animate-spin">refresh</span>
            </button>
          </div>

          <!-- Results for emoji vote -->
          <div v-else class="space-y-6 text-center py-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-2">
               <span class="material-icons text-3xl">check</span>
            </div>

            <!-- HIDDEN STATE -->
            <div v-if="room.status === 'hidden'" class="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
                <div class="text-4xl mb-4">👻</div>
                <h3 class="text-xl font-bold text-white mb-2">Mystery Mode</h3>
                <p class="text-slate-300 text-sm">Votes are hidden until revealed by the host.</p>
                <div class="mt-4 flex justify-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        Waiting for reveal...
                    </span>
                </div>
            </div>
            
            <!-- VISIBLE STATE -->
            <div v-else>
                <h3 class="text-2xl font-serif text-white">{{ t('vote_recorded') }}</h3>
                <p class="text-slate-400 text-sm">{{ t('feedback_void') }}</p>
                
                <div class="mt-8 pt-8 border-t border-white/5 text-left">
                    <EmojiResults :results="results?.results" :total="results?.total" />
                </div>
            </div>
          </div>
        </div>

        <!-- Poll Vote -->
        <div v-else-if="room.type === 'poll'" class="bg-[#1e293b]/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div v-if="canVote" class="space-y-4">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">{{ t('choose_option') }}</h3>
            <div class="space-y-3">
              <button
                v-for="option in pollOptions"
                :key="option.id"
                @click="selectPollOption(option.id)"
                :class="[
                  'w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left duration-300',
                  selectedPollOption === option.id
                    ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                ]"
              >
                <span class="font-medium text-slate-200">{{ option.text }}</span>
                
                <div :class="['w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ml-4', selectedPollOption === option.id ? 'border-orange-500 bg-orange-500' : 'border-slate-600']">
                   <span v-if="selectedPollOption === option.id" class="material-icons text-[14px] text-white font-bold">check</span>
                </div>
              </button>
            </div>
            
            <button
              v-if="selectedPollOption"
              @click="submitPollVote"
              :disabled="voting"
              class="w-full mt-4 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <span v-if="!voting">{{ t('cast_vote') }}</span>
              <span v-else class="material-icons animate-spin">refresh</span>
            </button>
          </div>

          <!-- Results for poll -->
          <div v-else class="space-y-6 text-center py-8">
             <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-2">
               <span class="material-icons text-3xl">check</span>
            </div>
            
            <!-- HIDDEN STATE -->
            <div v-if="room.status === 'hidden'" class="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
                <div class="text-4xl mb-4">👻</div>
                <h3 class="text-xl font-bold text-white mb-2">Mystery Mode</h3>
                <p class="text-slate-300 text-sm">Votes are hidden until revealed by the host.</p>
                <div class="mt-4 flex justify-center">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        Waiting for reveal...
                    </span>
                </div>
            </div>

            <!-- VISIBLE STATE -->
            <div v-else>
                <h3 class="text-2xl font-serif text-white">{{ t('vote_recorded') }}</h3>
                <p class="text-slate-400 text-sm">{{ t('results_disappear') }}</p>

                <div class="mt-8 pt-8 border-t border-white/5 text-left">
                  <PollResults :results="results?.results" :total="results?.total" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useLanguage } from '~/composables/useLanguage'

const { t, language } = useLanguage()
const route = useRoute()
const router = useRouter()
const roomId = computed(() => route.params.id as string)

// État
const room = ref<any>(null)
const results = ref<any>(null)
const loading = ref(true)
const voting = ref(false)
const hasVoted = ref(false)
const error = ref<string | null>(null)

// Emoji vote
const selectedEmoji = ref<string | null>(null)
const emojis = [
  { emoji: '😍', label: 'Excellent', label_en: 'Excellent', color: '#ef4444' },
  { emoji: '😊', label: 'Bien', label_en: 'Good', color: '#10b981' },
  { emoji: '😐', label: 'Moyen', label_en: 'Neutral', color: '#6b7280' },
  { emoji: '😕', label: 'Décevant', label_en: 'Meh', color: '#f59e0b' },
  { emoji: '😢', label: 'Très mauvais', label_en: 'Bad', color: '#8b5cf6' },
]

// Poll vote
const selectedPollOption = ref<string | null>(null)

// Computed property for poll options
const pollOptions = computed(() => {
  if (room.value?.type === 'poll' && results.value?.results) {
    return Array.isArray(results.value.results) ? results.value.results : []
  }
  return []
})

const canVote = computed(() => !hasVoted.value || room.value?.voteMode === 'allow_revote')

// Countdown
const timeLeft = ref('')
let countdownInterval: ReturnType<typeof setInterval> | null = null
let pollInterval: ReturnType<typeof setInterval> | null = null

const updateCountdown = () => {
  if (!room.value?.expiresAt) return

  const now = Date.now()
  const diff = room.value.expiresAt - now

  if (diff <= 0) {
    timeLeft.value = 'Expired'
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  timeLeft.value = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

const getDefaultTitle = () => {
  switch (room.value?.type) {
    case 'emoji_vote': return 'Rate with emojis'
    case 'poll': return 'Vote for your choice'
    default: return 'Vote'
  }
}

const loadRoom = async (silent = false) => {
  try {
    if (!silent) loading.value = true
    error.value = null

    const { apiCall } = useApi()
    const response = await apiCall(`/api/results/${roomId.value}`)
    room.value = response
    results.value = response
    updateCountdown()

    const votedKey = `voted_${roomId.value}`
    hasVoted.value = localStorage.getItem(votedKey) === 'true'
  } catch (err: any) {
    if (!silent) {
      error.value = err.data?.message || 'Error loading room'
    }
  } finally {
    if (!silent) loading.value = false
  }
}

const markAsVoted = async () => {
  hasVoted.value = true
  localStorage.setItem(`voted_${roomId.value}`, 'true')
  await loadRoom()
}

const handleVoteError = async (err: any) => {
  const status = err.statusCode || err.status || err.response?.status || err.data?.statusCode
  if (status === 409) {
    await markAsVoted()
    return
  }
  error.value = err.data?.message || err.data?.statusMessage || 'Error submitting vote'
}

const selectEmoji = (emoji: string) => {
  selectedEmoji.value = emoji
}

const selectPollOption = (optionId: string) => {
  selectedPollOption.value = optionId
}

const submitVote = async () => {
  if (!selectedEmoji.value) return

  try {
    voting.value = true
    const fingerprint = getFingerprint()
    const { apiCall } = useApi()

    await apiCall('/api/vote', {
      method: 'POST',
      body: {
        roomId: roomId.value,
        emoji: selectedEmoji.value,
        fingerprint
      }
    })

    await markAsVoted()
  } catch (err: any) {
    await handleVoteError(err)
  } finally {
    voting.value = false
  }
}

const submitPollVote = async () => {
  if (!selectedPollOption.value) return

  try {
    voting.value = true
    const fingerprint = getFingerprint()
    const { apiCall } = useApi()

    await apiCall('/api/submit', {
      method: 'POST',
      body: {
        roomId: roomId.value,
        type: 'poll_vote',
        optionId: selectedPollOption.value,
        fingerprint
      }
    })

    await markAsVoted()
  } catch (err: any) {
    await handleVoteError(err)
  } finally {
    voting.value = false
  }
}

const getPollOptionVotes = (optionId: string) => {
  if (!results.value?.results) return 0
  const option = results.value.results.find((opt: any) => opt.id === optionId)
  return option?.votes || 0
}


const getFingerprint = () => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no_canvas'

    const txt = 'GhostPoll-Fingerprint-v1'
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText(txt, 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText(txt, 4, 17)

    return canvas.toDataURL()
  } catch {
    return `fingerprint_error_${Date.now().toString(36)}`
  }
}

onMounted(() => {
  loadRoom()
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 60000)
  pollInterval = setInterval(() => loadRoom(true), 3000)
})

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
