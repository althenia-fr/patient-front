<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; color?: string }>(), { color: '#b6a943' })
</script>

<template>
  <div class="w-full overflow-hidden rounded-full bg-gray-200">
    <div class="h-2 rounded-full transition-all" :style="{ width: `${Math.min(100, Math.max(0, props.value))}%`, backgroundColor: props.color }"></div>
  </div>
</template>
