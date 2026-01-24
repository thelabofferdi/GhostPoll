<template>
  <div class="relative min-h-screen bg-[#020617] font-sans text-slate-100 overflow-x-hidden selection:bg-orange-500 selection:text-white">
    <!-- Scroll Progress Indicator -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[100]">
      <div 
        class="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Background Gradients -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px]"></div>
      <div class="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-orange-900/10 rounded-full blur-[120px]"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md">
          <img src="/assets/logo.png" alt="GhostPoll Logo" class="w-8 h-8 object-contain" />
        </div>
        <span class="font-bold text-xl tracking-tight text-white">GhostPoll</span>
      </div>
      <div class="flex items-center gap-8">
        <a class="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block" href="#how-it-works">{{ t('how_it_works') }}</a>
      </div>
    </nav>

    <!-- Main Hero -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32 flex flex-col items-center lg:flex-row min-h-[85vh]">
      
      <!-- Left Content -->
      <div class="w-full lg:w-[55%] text-left relative z-20 pt-10">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/5 mb-10 w-fit">
          <span class="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          <span class="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-300">{{ t('active_polls_badge') }}</span>
        </div>

        <!-- Headline -->
        <h1 class="font-serif text-[5rem] lg:text-[7.5rem] leading-[0.9] mb-8 text-white tracking-tight">
            {{ t('hero_line1') }} <br/>
            {{ t('hero_line2') }} <br/>
            {{ t('hero_line3') }} 
            <span class="text-orange-500 italic decoration-orange-500/30 underline-offset-8 font-serif" style="font-family: 'Instrument Serif', serif; font-style: italic;">{{ t('hero_void') }}</span>
        </h1>

        <!-- Subtext -->
        <p class="text-xl text-slate-300 max-w-lg mb-12 leading-relaxed font-normal">
            {{ t('hero_subtitle') }}
        </p>

        <!-- CTA Area -->
        <div class="flex flex-col sm:flex-row items-center gap-8">
          <button 
            @click="scrollToCreate"
            class="group relative px-8 py-4 bg-[#1a1510] hover:bg-[#201a14] border border-orange-500/30 hover:border-orange-500/50 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.4)]"
          >
            <span class="text-white font-semibold text-lg">{{ t('start_ghost_poll') }}</span>
            <span class="material-icons text-orange-500 text-xl group-hover:translate-x-1 transition-transform">bolt</span>
          </button>
          <a href="#how-it-works" class="group px-8 py-4 bg-transparent border border-white/20 text-white font-semibold text-lg flex items-center gap-2 hover:bg-white/5 transition-colors rounded-2xl">
            <span>{{ t('how_it_works') }}</span>
            <span class="material-icons text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>

        <!-- Bottom Feature Pills -->
        <div class="mt-20 flex flex-wrap gap-4">
          <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0a0f1e] border border-white/5 text-sm text-slate-300">
            <span class="material-icons text-orange-500 text-lg">shield</span>
            {{ t('privacy_first') }}
          </div>
          <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0a0f1e] border border-white/5 text-sm text-slate-300">
            <span class="material-icons text-orange-500 text-lg">auto_delete</span>
            {{ t('auto_deleted') }}
          </div>
          <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0a0f1e] border border-white/5 text-sm text-slate-300">
            <span class="material-icons text-orange-500 text-lg">person_off</span>
            {{ t('no_signup') }}
          </div>
        </div>
      </div>

      <!-- Right Content (Visual) -->
      <!-- Mascot Section - Now visible on mobile -->
      <div class="w-full lg:w-[45%] mt-12 lg:mt-0 flex justify-center items-center relative z-10">
         <!-- Giant blurred circle backing -->
         <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[700px] lg:h-[700px] bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl opacity-20 pointer-events-none"></div>
         
         <!-- Mascot / Image -->
         <div class="relative w-full max-w-[300px] lg:max-w-[500px] flex justify-center items-center">
            <img 
              src="/assets/hero-mascot.gif" 
              alt="GhostPoll Mascot" 
              class="w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float"
            />
         </div>
      </div>
    </main>

    <!-- How It Works Section -->
    <section class="max-w-7xl mx-auto px-6 py-32 relative z-10" id="how-it-works">
      <div class="text-center mb-24">
        <h2 class="font-serif text-5xl md:text-6xl text-white mb-6 tracking-tight">{{ t('how_works_title') }}</h2>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          {{ t('how_works_subtitle') }}
        </p>
      </div>

      <div class="space-y-32">
        <!-- Step 1: Conjure -->
        <div class="flex flex-col md:flex-row items-center gap-16">
          <div class="w-full md:w-1/2 text-center md:text-right order-2 md:order-1 relative">
            <div class="absolute right-0 top-0 -mr-20 -mt-10 w-32 h-32 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            <h3 class="font-serif text-4xl text-orange-500 mb-4 inline-block relative">
              {{ t('step_conjure') }}
              <span class="absolute -right-12 -top-4 w-10 h-10 rounded-full border border-orange-500/30 flex items-center justify-center text-orange-500 font-sans text-sm font-bold bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.2)]">1</span>
            </h3>
            <p class="text-slate-300 text-lg font-light leading-relaxed max-w-md ml-auto">
              {{ t('step_conjure_desc') }}
            </p>
          </div>
          <div class="w-full md:w-1/2 order-1 md:order-2">
            <div class="relative liquid-glass rounded-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto border-orange-500/10">
              <div class="flex gap-2 mb-4">
                <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div class="space-y-3">
                <div class="h-4 bg-white/10 rounded w-3/4"></div>
                <div class="h-10 bg-white/5 rounded-lg border border-white/5"></div>
                <div class="flex gap-2 mt-4">
                   <div class="h-8 w-8 rounded bg-orange-500/20 ring-1 ring-orange-500/50"></div>
                   <div class="h-8 w-8 rounded bg-white/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Haunt -->
        <div class="flex flex-col md:flex-row items-center gap-16">
          <div class="w-full md:w-1/2 order-1 relative">
             <!-- Floating Social Cards -->
             <div class="relative h-60 max-w-md mx-auto">
                <div class="absolute left-10 top-0 w-40 h-40 liquid-glass rounded-2xl flex flex-col items-center justify-center border-purple-500/10 -rotate-6 hover:rotate-0 transition-all duration-500 z-10">
                   <span class="material-icons text-4xl text-blue-400 mb-2">flutter_dash</span>
                   <span class="text-xs font-mono text-blue-300">Twitter</span>
                </div>
                <div class="absolute right-10 bottom-0 w-40 h-40 liquid-glass rounded-2xl flex flex-col items-center justify-center border-purple-500/10 rotate-12 hover:rotate-0 transition-all duration-500 bg-[#0f172a]/80 backdrop-blur-xl">
                   <span class="material-icons text-4xl text-indigo-400 mb-2">discord</span>
                   <span class="text-xs font-mono text-indigo-300">Discord</span>
                </div>
             </div>
          </div>
          <div class="w-full md:w-1/2 text-center md:text-left order-2 relative">
             <div class="absolute left-0 top-0 -ml-20 -mt-10 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>
             <h3 class="font-serif text-4xl text-purple-400 mb-4 inline-block relative">
              {{ t('step_haunt') }}
              <span class="absolute -left-12 -top-4 w-10 h-10 rounded-full border border-purple-500/30 flex items-center justify-center text-purple-400 font-sans text-sm font-bold bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.2)]">2</span>
            </h3>
            <p class="text-slate-300 text-lg font-light leading-relaxed max-w-md">
              {{ t('step_haunt_desc') }}
            </p>
          </div>
        </div>

        <!-- Step 3: Vanish -->
        <div class="flex flex-col md:flex-row items-center gap-16">
          <div class="w-full md:w-1/2 text-center md:text-right order-2 md:order-1 relative">
             <div class="absolute right-0 top-0 -mr-20 -mt-10 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none"></div>
             <h3 class="font-serif text-4xl text-cyan-400 mb-4 inline-block relative">
              {{ t('step_vanish') }}
              <span class="absolute -right-12 -top-4 w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-sans text-sm font-bold bg-cyan-500/5 shadow-[0_0_15px_rgba(34,211,238,0.2)]">3</span>
            </h3>
            <p class="text-slate-300 text-lg font-light leading-relaxed max-w-md ml-auto">
              {{ t('step_vanish_desc') }}
            </p>
          </div>
          <div class="w-full md:w-1/2 order-1 md:order-2">
            <div class="relative liquid-glass rounded-2xl p-8 max-w-xs mx-auto flex items-center justify-center border-cyan-500/20 shadow-[0_0_50px_-20px_rgba(34,211,238,0.3)]">
               <span class="font-mono text-5xl text-cyan-400 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                 00:00:00
               </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-24 flex justify-center">
         <button 
            @click="scrollToCreate"
            class="group relative px-8 py-4 bg-[#1a1510] hover:bg-[#201a14] border border-orange-500/30 hover:border-orange-500/50 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.4)]"
          >
            <span class="text-white font-semibold text-lg">{{ language === 'en' ? 'Try it now' : 'Essayer maintenant' }}</span>
            <span class="material-icons text-orange-500 text-xl group-hover:translate-x-1 transition-transform">bolt</span>
          </button>
      </div>
    </section>

    <!-- Create Poll Section -->
    <section id="create-poll" class="max-w-7xl mx-auto px-6 py-32 relative z-10">
      <div class="text-center mb-16">
        <h2 class="font-serif text-5xl md:text-6xl text-white mb-4 tracking-tight">{{ t('perfect_for') }}</h2>
        <p class="text-slate-400 text-lg">{{ t('perfect_for_subtitle') }}</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-12 items-start">
        <!-- Benefits Column -->
        <div class="w-full lg:w-1/3 space-y-6">
          <div class="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
              <span class="material-icons text-2xl">bolt</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ t('quick_decisions') }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              {{ t('quick_decisions_desc') }}
            </p>
          </div>

          <div class="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
              <span class="material-icons text-2xl">visibility_off</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ t('sensitive_feedback') }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              {{ t('sensitive_feedback_desc') }}
            </p>
          </div>
        </div>

        <!-- Create Form Column -->
        <div class="w-full lg:w-2/3">
          <div class="bg-[#1a1c2e]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
             <!-- Background Glow -->
             <div class="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>

             <div class="relative z-10 flex items-center justify-between mb-8">
               <h3 class="font-serif text-3xl text-white">{{ t('create_poll') }}</h3>
               <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
             </div>

             <form @submit.prevent="createRoom" class="relative z-10 space-y-8">
                
                <!-- Poll Type -->
                <div class="space-y-3">
                   <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">{{ t('poll_type') }}</div>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <label v-for="type in roomTypes" :key="type.value" 
                       :class="['cursor-pointer group relative p-4 rounded-xl border transition-all duration-300', selectedType === type.value ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20']"
                     >
                       <input type="radio" v-model="selectedType" :value="type.value" class="sr-only">
                       <div class="flex items-center gap-4">
                         <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                           <span class="material-icons text-2xl" :class="type.value === 'emoji_vote' ? 'text-pink-400' : 'text-blue-400'">{{ type.iconName }}</span>
                         </div>
                         <div>
                           <div class="font-bold text-white text-sm mb-0.5">{{ type.title }}</div>
                           <div class="text-xs text-slate-400">{{ type.description }}</div>
                         </div>
                         <div v-if="selectedType === type.value" class="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                       </div>
                     </label>
                   </div>
                </div>

                <!-- Question -->
                <div class="space-y-3">
                   <div class="flex justify-between text-xs font-bold tracking-wider text-slate-500 uppercase">
                     <span>{{ selectedType === 'poll' ? t('poll_question') : t('question_optional') }}</span>
                     <span>{{ question.length }}/200</span>
                   </div>
                   <textarea 
                     v-model="question" 
                     rows="3"
                     :placeholder="selectedType === 'poll' ? t('placeholder_poll') : t('placeholder_emoji')"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-base text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                     :required="selectedType === 'poll'"
                   ></textarea>
                </div>

                <!-- Options (Conditional) -->
                <div v-if="selectedType === 'poll'" class="space-y-3">
                   <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">{{ t('options') }}</div>
                   <div class="space-y-3">
                      <div v-for="(option, index) in pollOptions" :key="index" class="flex items-center gap-3">
                        <span class="text-xs font-mono text-slate-500 w-4">{{ index + 1 }}</span>
                        <input 
                          v-model="pollOptions[index]" 
                          type="text" 
                          :placeholder="`${t('option')} ${index + 1}`"
                          class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                          required
                        />
                        <button v-if="pollOptions.length > 2" type="button" @click="removeOption(index)" class="text-slate-500 hover:text-red-400 transition-colors">
                          <span class="material-icons text-lg">close</span>
                        </button>
                      </div>
                   </div>
                   <button v-if="pollOptions.length < 10" type="button" @click="addOption" class="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors flex items-center gap-1 pl-7">
                     <span class="text-lg font-bold">+</span> {{ t('add_option') }}
                   </button>
                </div>

                <!-- Settings -->
                <div class="space-y-3">
                   <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">{{ t('settings') }}</div>
                   <div class="space-y-2">
                      <label v-for="mode in voteModes" :key="mode.value" 
                        :class="['cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all', voteMode === mode.value ? 'bg-orange-500/5 border-orange-500/50' : 'bg-white/5 border-white/10 hover:border-white/20']"
                      >
                         <input type="radio" v-model="voteMode" :value="mode.value" class="sr-only">
                         <div>
                           <div class="font-bold text-white text-sm">{{ mode.title }}</div>
                           <div class="text-xs text-slate-400 mt-0.5">{{ mode.description }}</div>
                         </div>
                         <div :class="['w-5 h-5 rounded-full border flex items-center justify-center transition-all', voteMode === mode.value ? 'border-orange-500 bg-orange-500' : 'border-slate-600']">
                           <span v-if="voteMode === mode.value" class="material-icons text-[14px] text-white font-bold">check</span>
                         </div>
                      </label>
                   </div>
                </div>

                <!-- Visibility (New) -->
                <div class="space-y-3">
                   <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">{{ t('visibility') }}</div>
                   <div class="space-y-2">
                      <label 
                        :class="['cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all', resultsVisibility === 'public' ? 'bg-orange-500/5 border-orange-500/50' : 'bg-white/5 border-white/10 hover:border-white/20']"
                      >
                         <input type="radio" v-model="resultsVisibility" value="public" class="sr-only">
                         <div>
                           <div class="font-bold text-white text-sm">{{ t('live_results') }}</div>
                           <div class="text-xs text-slate-400 mt-0.5">{{ t('live_results_desc') }}</div>
                         </div>
                         <div :class="['w-5 h-5 rounded-full border flex items-center justify-center transition-all', resultsVisibility === 'public' ? 'border-orange-500 bg-orange-500' : 'border-slate-600']">
                           <span v-if="resultsVisibility === 'public'" class="material-icons text-[14px] text-white font-bold">check</span>
                         </div>
                      </label>

                      <label 
                        :class="['cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all', resultsVisibility === 'after_reveal' ? 'bg-orange-500/5 border-orange-500/50' : 'bg-white/5 border-white/10 hover:border-white/20']"
                      >
                         <input type="radio" v-model="resultsVisibility" value="after_reveal" class="sr-only">
                         <div>
                           <div class="flex items-center gap-2">
                             <div class="font-bold text-white text-sm">{{ t('ghost_reveal') }}</div>
                             <span class="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{{ t('new_badge') }}</span>
                           </div>
                           <div class="text-xs text-slate-400 mt-0.5">{{ t('ghost_reveal_desc') }}</div>
                         </div>
                         <div :class="['w-5 h-5 rounded-full border flex items-center justify-center transition-all', resultsVisibility === 'after_reveal' ? 'border-orange-500 bg-orange-500' : 'border-slate-600']">
                           <span v-if="resultsVisibility === 'after_reveal'" class="material-icons text-[14px] text-white font-bold">check</span>
                         </div>
                      </label>
                   </div>
                </div>

                <!-- Duration -->
                <div class="space-y-3">
                   <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">{{ t('duration') }}</div>
                   <div class="relative">
                     <select v-model="duration" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer">
                        <option value="1h">{{ t('duration_1h') }}</option>
                        <option value="6h">{{ t('duration_6h') }}</option>
                        <option value="12h">{{ t('duration_12h') }}</option>
                        <option value="24h">{{ t('duration_24h') }}</option>
                        <option value="48h">{{ t('duration_48h') }}</option>
                     </select>
                     <span class="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                   </div>
                </div>

                <!-- Actions -->
                  <button 
                    type="submit" 
                    :disabled="isLoading || !isFormValid"
                    class="w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>{{ isLoading ? t('creating') : t('create_poll_btn') }}</span>
                    <!-- <span class="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span> -->
                  </button>
             </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Minimal Footer -->
    <footer class="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-lg mt-32">
      <div class="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
           <img src="/assets/logo.png" alt="GhostPoll Logo" class="w-6 h-6 object-contain opacity-50 grayscale" />
           <span class="font-serif text-lg text-slate-600 font-medium tracking-tight">GhostPoll</span>
        </div>
        <p class="text-slate-600 text-sm">© {{ new Date().getFullYear() }} GhostPoll. {{ t('footer_text') }}</p>
      </div>
    </footer>

    <!-- Create Modal Removed -->

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.font-serif {
  font-family: 'Instrument Serif', serif;
}

/* Subtle floating animation for mascot */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useLanguage } from '~/composables/useLanguage'

const router = useRouter()
const { t, language } = useLanguage()

// Scroll Progress
const scrollProgress = ref(0)

const updateScrollProgress = () => {
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY
  const scrollable = documentHeight - windowHeight
  scrollProgress.value = (scrollTop / scrollable) * 100
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollProgress)
  updateScrollProgress() // Initial calculation
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollProgress)
})

// Methods
const scrollToCreate = () => {
    const el = document.getElementById('create-poll')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// State
const isLoading = ref(false)
const selectedType = ref<'emoji_vote' | 'poll'>('emoji_vote')
const question = ref('')
const voteMode = ref<'single_vote' | 'allow_revote' | 'multiple_votes'>('single_vote')
const resultsVisibility = ref<'public' | 'after_reveal'>('public') // Added
const duration = ref<'1h' | '6h' | '12h' | '24h' | '48h'>('24h')
const pollOptions = ref(['', ''])

// Room types
const roomTypes = computed(() => [
  {
    value: 'emoji_vote',
    iconName: 'sentiment_satisfied_alt',
    title: t('emoji_vote'),
    description: t('emoji_vote_desc')
  },
  {
    value: 'poll',
    iconName: 'poll',
    title: t('multiple_choice'),
    description: t('multiple_choice_desc')
  }
])

// Vote modes
const voteModes = computed(() => [
  {
    value: 'single_vote',
    title: t('single_vote'),
    description: t('single_vote_desc')
  },
  {
    value: 'allow_revote',
    title: t('allow_revote'),
    description: t('allow_revote_desc')
  }
])

// Computed
const isFormValid = computed(() => {
  if (selectedType.value === 'poll') {
    if (!question.value.trim()) return false
    const validOptions = pollOptions.value.filter(opt => opt.trim().length > 0)
    return validOptions.length >= 2
  }
  return true
})

// Methods
const getQuestionLabel = () => {
  switch (selectedType.value) {
    case 'emoji_vote': return 'Question (Optional)'
    case 'poll': return 'Poll Question *'
    default: return 'Question'
  }
}

const getQuestionPlaceholder = () => {
  switch (selectedType.value) {
    case 'emoji_vote': return 'Ex: How was the demo?'
    case 'poll': return 'Ex: What time should we meet?'
    default: return 'Your question...'
  }
}

const addOption = () => {
  if (pollOptions.value.length < 10) {
    pollOptions.value.push('')
  }
}

const removeOption = (index: number) => {
  if (pollOptions.value.length > 2) {
    pollOptions.value.splice(index, 1)
  }
}

const createRoom = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  
  try {
    const { apiCall } = useApi() // Assuming useApi is globally available or imported
    const body: any = {
      type: selectedType.value,
      voteMode: voteMode.value,
      duration: duration.value,
      resultsVisibility: resultsVisibility.value // Added
    }
    
    if (question.value.trim()) {
      body.question = question.value.trim()
    }
    
    if (selectedType.value === 'poll') {
      body.pollOptions = pollOptions.value.filter(opt => opt.trim().length > 0)
    }
    
    const response = await apiCall('/api/rooms', {
      method: 'POST',
      body
    })
    
    await router.push({
      path: '/created',
      query: {
        id: response.roomId,
        token: response.adminToken
      }
    })
    
  } catch (error: any) {
    alert(error.data?.message || 'Error creating room')
  } finally {
    isLoading.value = false
  }
}
</script>
