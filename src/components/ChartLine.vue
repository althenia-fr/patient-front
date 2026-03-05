<script setup lang="ts">
interface Props { data: number[]; stroke?: string; fill?: string }
const props = withDefaults(defineProps<Props>(), { stroke: '#7cb342', fill: 'rgba(124,179,66,0.15)' })
const width = 300
const height = 80
const padding = 8
function points() {
  if (!props.data.length) return ''
  const max = Math.max(1, ...props.data)
  const step = (width - padding * 2) / (props.data.length - 1)
  return props.data
    .map((v, i) => {
      const x = padding + i * step
      const y = height - padding - (v / max) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}
</script>

<template>
  <svg :width="width" :height="height" viewBox="0 0 300 80" class="w-full">
    <polyline :points="points()" :stroke="props.stroke" stroke-width="3" fill="none" stroke-linecap="round" />
    <polygon v-if="data.length" :points="points() + ` ${300 - padding},${80 - padding} ${padding},${80 - padding}`" :fill="props.fill" />
  </svg>
</template>
