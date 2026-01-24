<template>
  <div class="space-y-3">
    <h4 class="font-semibold text-gray-900">Résultats</h4>
    <div v-for="emoji in emojis" :key="emoji.emoji" class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <span class="text-xl">{{ emoji.emoji }}</span>
        <span class="text-sm font-medium">{{ emoji.label }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-20 bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-500"
            :style="{ 
              width: `${getPercentage(emoji.emoji)}%`, 
              backgroundColor: emoji.color 
            }"
          ></div>
        </div>
        <span class="text-sm font-semibold w-8 text-right">{{ results[emoji.emoji] || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  results: Record<string, number>
  total: number
}

const props = defineProps<Props>()

const emojis = [
  { emoji: '😍', label: 'Excellent', color: '#ef4444' },
  { emoji: '😊', label: 'Bien', color: '#10b981' },
  { emoji: '😐', label: 'Moyen', color: '#6b7280' },
  { emoji: '😕', label: 'Décevant', color: '#f59e0b' },
  { emoji: '😢', label: 'Très mauvais', color: '#8b5cf6' },
]

const getPercentage = (emoji: string) => {
  if (!props.total) return 0
  return Math.round(((props.results[emoji] || 0) / props.total) * 100)
}
</script>
