<template>
  <div class="space-y-3">
    <h4 class="font-semibold text-gray-900">Résultats</h4>
    
    <div v-if="!results || results.length === 0" class="text-center text-gray-500 py-8">
      Aucun vote pour le moment
    </div>
    
    <div v-else class="space-y-3">
      <div v-for="option in results" :key="option.id" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-900">{{ option.text }}</span>
          <div class="flex items-center space-x-2">
            <span class="text-sm font-semibold">{{ option.votes }}</span>
            <span class="text-xs text-gray-500">({{ getPercentage(option.votes) }}%)</span>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            :style="{ width: `${getPercentage(option.votes)}%` }"
          ></div>
        </div>
      </div>
      
      <div class="pt-2 border-t border-gray-200">
        <div class="text-sm text-gray-600 text-center">
          Total: {{ total }} votes
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PollOption {
  id: string
  text: string
  votes: number
}

interface Props {
  results: PollOption[]
  total: number
}

const props = defineProps<Props>()

const getPercentage = (votes: number) => {
  if (!props.total) return 0
  return Math.round((votes / props.total) * 100)
}
</script>
