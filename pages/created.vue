<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const { copy, copied } = useClipboard()

// Simulation de récupération des IDs depuis l'URL (redirection après création)
const roomId = (route.query.id as string) || 'ABC-123'
const adminToken = (route.query.token as string) || 'secret_key_example_do_not_share'

// Construction des liens complets
const publicLink = ref('')
const adminLink = ref('')

onMounted(() => {
  const baseUrl = window.location.origin
  publicLink.value = `${baseUrl}/vote/${roomId}`
  // Fix: admin.vue expects id and key as query params
  adminLink.value = `${baseUrl}/admin?id=${roomId}&key=${adminToken}`
})


// États de copie
const copiedAdmin = ref(false)
const copiedPublic = ref(false)

const qrCodeUrl = computed(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=20&data=${encodeURIComponent(publicLink.value)}`
})

async function shareQrCode() {
  try {
    const response = await fetch(qrCodeUrl.value)
    const blob = await response.blob()
    const file = new File([blob], 'ghost-poll-qr.png', { type: 'image/png' })

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title: 'Join the Ghost Poll',
            text: 'Scan to vote anonymously!',
            files: [file]
        })
    } else {
        // Fallback: Download
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'ghost-poll-qr.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
  } catch (e) {
    console.error('Error sharing QR', e)
    alert('Auto-download failed. You can right-click the image to save it.')
  }
}

function copyPublic() {
  copy(publicLink.value)
  copiedPublic.value = true
  setTimeout(() => copiedPublic.value = false, 2000)
}

function copyAdmin() {
  copy(adminLink.value)
  copiedAdmin.value = true
  setTimeout(() => copiedAdmin.value = false, 2000)
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans text-slate-100">
    
    <!-- Background FX -->
    <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
        <div class="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-orange-900/10 rounded-full blur-[120px]"></div>
    </div>

    <!-- Main Card (Single Column Stack) -->
    <main class="w-full max-w-md relative z-10 animate-slide-up flex flex-col gap-8">
      
      <!-- Header -->
      <div class="text-center">
        <div class="inline-block relative mb-6">
            <div class="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-75"></div>
            <img src="/assets/ghost-animated.gif" alt="GhostPoll Mascot" class="relative w-48 h-48 object-contain mx-auto" />
        </div>
        <h1 class="text-3xl font-extrabold mb-2 text-white font-serif">Poll Conjured!</h1>
        <p class="text-slate-400 text-sm">Your ghost is now haunting the internet.</p>
      </div>

      <!-- 1. The Room Card (QR + Action) -->
      <div class="bg-gradient-to-b from-[#1a1c2e] to-[#021a28] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <!-- Decor -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
        
        <div class="text-center mb-6">
             <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500/80 mb-4">Share with the room</h2>
             
             <!-- QR Code Container -->
             <div class="mx-auto w-48 h-48 bg-white rounded-2xl p-3 shadow-lg mb-6 flex items-center justify-center">
                 <img :src="qrCodeUrl" alt="QR Code" class="w-full h-full mix-blend-multiply opacity-90" />
             </div>

             <!-- Primary Button (Share/Download) -->
             <button 
                @click="shareQrCode" 
                class="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform"
             >
                <span class="material-icons">download</span>
                <span>Share / Save QR</span>
             </button>
        </div>
      </div>

      <!-- 2. Public Link Detail -->
      <div>
        <div class="flex items-center gap-2 mb-2 text-orange-500 font-bold">
            <span class="material-icons">link</span> Public Link
        </div>
        <p class="text-xs text-slate-400 mb-3">Send this to your voters. No account needed.</p>
        
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-slate-500 text-xs material-icons text-[16px]">public</span>
            </div>
            <input 
                type="text" 
                readonly 
                class="w-full bg-[#03111a] border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm font-mono text-slate-300 select-all focus:border-orange-500/50 transition-colors cursor-pointer"
                :value="publicLink"
                @click="copyPublic"
            >
            <button 
                @click="copyPublic"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition-colors"
                title="Copy Link"
            >
                <span class="material-icons text-[20px]">{{ copiedPublic ? 'check' : 'content_copy' }}</span>
            </button>
        </div>
      </div>

      <!-- 3. Admin Key (Danger Zone) -->
      <div class="bg-[#0f0404] border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50"></div>
        
        <div class="flex items-start gap-4">
            <div class="mt-1 text-red-500 text-xl">
                <span class="material-icons">security</span>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-red-500 text-sm mb-1">Admin Key</h3>
                <p class="text-[11px] text-red-200/50 mb-3 leading-relaxed">
                    <strong class="text-red-400">Save this document!</strong> You need it to close the vote or view hidden results.
                </p>

                <!-- Secret Input -->
                <div class="relative group">
                    <input 
                        type="text" 
                        readonly 
                        class="w-full bg-black/40 border border-red-500/10 rounded-lg py-2.5 px-3 text-xs font-mono text-red-300/50 select-all focus:border-red-500/30 transition-colors blur-[3px] group-hover:blur-0 duration-300 cursor-pointer"
                        :value="adminLink"
                        @click="copyAdmin"
                    >
                     <div class="absolute inset-y-0 right-0 px-3 flex items-center pointer-events-none group-hover:hidden">
                        <span class="material-icons text-red-500/50 text-[18px]">visibility_off</span>
                    </div>
                    <button 
                        @click="copyAdmin"
                        class="absolute inset-y-0 right-8 px-3 flex items-center text-red-500/50 hover:text-red-400 transition-colors z-10"
                        title="Copy Key"
                    >
                        <span class="material-icons text-[18px]">{{ copiedAdmin ? 'check' : 'content_copy' }}</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      <!-- Footer Link & Language -->
      <div class="flex flex-col items-center gap-6">
          <a :href="publicLink" class="text-center text-sm text-slate-500 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50">
              Go to voting page
          </a>
      </div>

    </main>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
