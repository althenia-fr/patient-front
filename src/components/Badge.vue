<script setup lang="ts">
withDefaults(defineProps<{ label: string; color?: 'green' | 'yellow' | 'orange' }>(), { color: 'green' })
</script>

<template>
  <span class="chip" :class="{
    'bg-brand-primary/10 text-brand-primary': color === 'green',
    'bg-brand-secondary/15 text-brand-secondary': color === 'yellow',
    'bg-brand-primary/10 text-brand-primary': color === 'orange',
  }">{{ label }}</span>
</template>
