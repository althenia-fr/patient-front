<script setup lang="ts">
import { computed } from 'vue'
interface Item { label: string; value: number; color?: string }
interface Props { items: Item[]; size?: number; thickness?: number }
const props = withDefaults(defineProps<Props>(), { size: 160, thickness: 18 })
const radius = computed(() => props.size / 2)
const innerR = computed(() => radius.value - props.thickness)
const total = computed(() => Math.max(0, props.items.reduce((a, b) => a + Math.max(0, b.value), 0)))
const palette = ['#7cb342', '#64b5f6', '#ffc107', '#ef5350', '#ab47bc', '#26a69a']
function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const startRad = (Math.PI / 180) * (start - 90)
  const endRad = (Math.PI / 180) * (end - 90)
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  const largeArc = end - start > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}
function segments() {
  if (!total.value) return [] as { d: string; c: string }[]
  let angle = 0
  return props.items.map((it, i) => {
    const v = Math.max(0, it.value)
    const portion = total.value ? (v / total.value) * 360 : 0
    const start = angle
    const end = angle + portion
    angle = end
    return { d: arcPath(radius.value, radius.value, radius.value - props.thickness / 2, start, end), c: it.color || palette[i % palette.length] }
  })
}
</script>
<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="w-full">
    <circle :cx="radius" :cy="radius" :r="radius - thickness/2" fill="none" stroke="#eef2f7" :stroke-width="thickness" />
    <g v-for="(s, i) in segments()" :key="i">
      <path :d="s.d" fill="none" :stroke="s.c" :stroke-width="thickness" stroke-linecap="round" />
    </g>
    <circle :cx="radius" :cy="radius" :r="innerR" fill="white" />
  </svg>
</template>
