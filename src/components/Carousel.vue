<script setup lang="ts">
interface Item { id: string | number; title: string; type?: string; color?: string; description?: string }
const props = defineProps<{ items: Item[] }>()
</script>

<template>
  <div class="overflow-x-auto">
    <div class="flex gap-4 pr-4">
      <article v-for="it in props.items" :key="it.id" class="min-w-[240px] card">
        <div class="h-28 w-full rounded-lg" :style="{ background: it.color || '#ffd54f' }"></div>
        <h4 class="mt-3 text-sm font-bold text-gray-900">{{ it.title }}</h4>
        <p v-if="it.description" class="text-xs text-gray-500">{{ it.description }}</p>
        <RouterLink :to="{ name: 'faq' }" class="mt-3 inline-block text-brand-primary font-semibold">Voir</RouterLink>
      </article>
    </div>
  </div>
</template>
