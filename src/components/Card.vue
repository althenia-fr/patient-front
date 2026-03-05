<script setup lang="ts">
withDefaults(defineProps<{ title?: string; subtitle?: string }>(), {})
</script>

<template>
  <div class="card">
    <div v-if="title || subtitle" class="mb-3">
      <h3 v-if="title" class="text-base font-bold text-gray-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>
