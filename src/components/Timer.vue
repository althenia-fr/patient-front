<script setup lang="ts">
import { ref, computed, onBeforeUnmount, defineEmits, watch } from 'vue'

const props = withDefaults(defineProps<{ 
  durationSec?: number; 
  size?: number; 
  stroke?: number; 
  canStart?: boolean;
  remainingTime?: number;
  isRunning?: boolean;
}>(), {
  durationSec: 1200, // 20 minutes par défaut
  size: 220,
  stroke: 12,
  canStart: true,
  remainingTime: undefined,
  isRunning: false,
})

const emit = defineEmits<{ 
  (e: 'finished', seconds: number): void; 
  (e: 'blocked'): void;
  (e: 'started'): void;
  (e: 'paused', remainingTime: number): void;
}>()

const running = ref(false)
const remaining = ref(props.durationSec)

// Use global timer state if provided, otherwise use local state
const effectiveRunning = computed(() => {
  return props.isRunning !== undefined ? props.isRunning : running.value
})

const effectiveRemaining = computed(() => {
  return props.remainingTime !== undefined ? props.remainingTime : remaining.value
})

const isUsingGlobalState = computed(() => {
  return props.isRunning !== undefined || props.remainingTime !== undefined
})

const timeDisplay = computed(() => {
  const m = Math.floor(effectiveRemaining.value / 60)
  const s = Math.floor(effectiveRemaining.value % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return m > 0 || effectiveRemaining.value > 0 ? `${pad(m)}:${pad(s)}` : '00:00'
})
let timer: number | null = null

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - (props.durationSec - effectiveRemaining.value) / props.durationSec))

function toggle() {
  // If using global state, don't handle local timer logic
  if (props.isRunning !== undefined || props.remainingTime !== undefined) {
    return // Global timer controls the state
  }
  
  if (running.value) {
    running.value = false
    if (timer) window.clearInterval(timer)
    timer = null
    emit('paused', remaining.value)
  } else {
    if (!props.canStart) { emit('blocked'); return }
    running.value = true
    if (timer) window.clearInterval(timer)
    timer = window.setInterval(() => {
      if (remaining.value > 0) remaining.value -= 1
      if (remaining.value <= 0) {
        finish()
      }
    }, 1000)
    emit('started')
  }
}
function reset() {
  // If using global state, don't handle local timer logic
  if (props.isRunning !== undefined || props.remainingTime !== undefined) {
    return // Global timer controls the state
  }
  
  if (timer) window.clearInterval(timer)
  timer = null
  running.value = false
  remaining.value = props.durationSec
}
function finish() {
  // If using global state, don't handle local timer logic
  if (props.isRunning !== undefined || props.remainingTime !== undefined) {
    return // Global timer controls the state
  }
  
  if (timer) window.clearInterval(timer)
  timer = null
  running.value = false
  const elapsed = props.durationSec - remaining.value
  remaining.value = 0
  emit('finished', elapsed)
}

function formatHHMMSS(t: number) {
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = Math.floor(t % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

watch(() => props.durationSec, (nv) => { remaining.value = nv })

onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <svg :width="props.size" :height="props.size" :viewBox="`0 0 ${props.size} ${props.size}`" class="block">
      <defs>
        <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1e40af"/>
        </linearGradient>
      </defs>
      <g :transform="`translate(${props.size/2}, ${props.size/2})`">
        <!-- background ring -->
        <circle :r="radius" cx="0" cy="0" :stroke-width="props.stroke" stroke="#f3f4f6" fill="none" />
        <!-- progress ring -->
        <circle :r="radius" cx="0" cy="0" :stroke-width="props.stroke" stroke-linecap="round"
                :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" stroke="url(#timerGrad)" fill="none"
                transform="rotate(-90)" />
      </g>
      <!-- tick marks - small graduations (drawn on top) -->
      <g :transform="`translate(${props.size/2}, ${props.size/2})`">
        <g v-for="i in 60" :key="`small-${i}`" :transform="`rotate(${i*6}) translate(${radius+2},0)`">
          <rect x="-1" y="-2" width="2" height="4" fill="#1e40af" opacity="0.8"></rect>
        </g>
      </g>
      <!-- tick marks - large graduations (drawn on top, every 5 minutes) -->
      <g :transform="`translate(${props.size/2}, ${props.size/2})`">
        <g v-for="i in 12" :key="`large-${i}`" :transform="`rotate(${(i-1)*30}) translate(${radius+2},0)`">
          <rect x="-2" y="-4" width="4" height="8" fill="#1e40af"></rect>
        </g>
      </g>
      <!-- time text -->
      <text :x="props.size/2" :y="props.size/2 + 8" text-anchor="middle" class="font-mono font-bold" style="font-size: 48px; fill: #111827;">
        {{ timeDisplay }}
      </text>
    </svg>

    <div v-if="!isUsingGlobalState" class="flex flex-wrap justify-center gap-3">
      <Button :variant="running ? 'secondary' : 'primary'" @click="toggle" :class="!running && !props.canStart ? 'opacity-70' : ''">{{ running ? 'Pause' : 'Démarrer' }}</Button>
      <Button variant="secondary" @click="finish">Terminer</Button>
    </div>
  </div>
</template>

<script lang="ts">
import Button from './Button.vue'
export default { components: { Button } }
</script>
