<template>
  <div v-if="hasActiveSession" class="flex items-center gap-2">
    <!-- Timer Display -->
    <div class="relative flex items-center">
      <!-- Circular Progress -->
      <svg class="h-8 w-8 transform -rotate-90">
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="#e5e7eb"
          stroke-width="3"
          fill="none"
        />
        <circle
          cx="16"
          cy="16"
          r="14"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          stroke="#3b82f6"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          class="transition-all duration-1000 ease-linear"
        />
      </svg>
      
      <!-- Time Display -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs font-semibold text-gray-700">{{ timeDisplay }}</span>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="flex items-center gap-1">
      <!-- Pause/Resume Button -->
      <button
        @click="handleToggle"
        :class="[
          'p-1.5 rounded-full transition-colors',
          isRunning 
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        ]"
        :title="isRunning ? 'Pause' : canResumeSession ? 'Resume' : 'Start'"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <!-- Pause Icon -->
          <rect v-if="isRunning" x="6" y="4" width="4" height="16" />
          <rect v-if="isRunning" x="14" y="4" width="4" height="16" />
          <!-- Play Icon -->
          <polygon v-else points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>

      <!-- End Button -->
      <button
        @click="handleEnd"
        class="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        title="End Session"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalTimer } from '@/composables/useGlobalTimer'

const {
  isRunning,
  remainingTime,
  totalTime,
  progress,
  timeDisplay,
  hasActiveSession,
  canResumeSession,
  toggleTimer,
  endTimer,
} = useGlobalTimer()

// SVG calculations
const radius = 14
const circumference = computed(() => 2 * Math.PI * radius)
const dashOffset = computed(() => {
  return circumference.value * (1 - progress.value / 100)
})

// Event handlers
const handleToggle = async () => {
  await toggleTimer()
}

const handleEnd = async () => {
  await endTimer()
}
</script>

<style scoped>
/* Ensure smooth transitions */
svg circle {
  transition: stroke-dashoffset 1s linear;
}
</style>
