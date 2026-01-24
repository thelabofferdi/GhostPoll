<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'

const { language, toggleLanguage } = useLanguage()

useHead({
  htmlAttrs: {
    class: 'dark'
  },
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
    },
    {
      rel: 'icon',
      type: 'image/gif',
      href: '/assets/hero-mascot.gif'
    }
  ]
})
</script>

<template>
  <div class="bg-bg min-h-screen text-text font-sans antialiased selection:bg-primary/20">
    <div class="fixed top-4 right-4 z-50">
        <button 
            @click="toggleLanguage" 
            class="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold transition-all text-white"
        >
            {{ language.toUpperCase() }}
        </button>
    </div>
    <NuxtPage />
  </div>
</template>

<style>
/* Global Reset & Dark Mode enforcement */
html, body {
  margin: 0;
  padding: 0;
  background-color: #021a28; /* Colors.bg.DEFAULT */
  color: #f8fafc;
  width: 100%;
  height: 100%;
}
</style>
