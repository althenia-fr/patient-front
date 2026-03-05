<script setup lang="ts">
import { computed } from 'vue'
interface Props { data: number[]; height?: number; barColor?: string }
const props = withDefaults(defineProps<Props>(), { height: 80, barColor: '#7cb342' })
const maxV = computed(() => Math.max(1, ...props.data))
const w = computed(() => Math.max(1, props.data.length * 14))
function barHeight(v: number) { return (v / maxV.value) * props.height }
</script>
<template>
  <svg :width="w" :height="height" :viewBox="`0 0 ${w} ${height}`" class="w-full">
    <g v-for="(v,i) in data" :key="i">
      <rect :x="i*14+2" :y="height - barHeight(v)" width="10" :height="barHeight(v)" :fill="barColor" rx="2" />
    </g>
  </svg>
</template>
