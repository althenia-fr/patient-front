<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isActive = (name: string) => route.name === (name as any)
</script>

<template>
  <nav role="navigation" aria-label="Navigation principale" class="pointer-events-auto pb-safe w-full bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
    <ul class="grid grid-cols-4 text-[11px] font-semibold text-gray-600">
      <li>&nbsp;</li>
      <li>
        <RouterLink :to="{ name: 'home' }" class="flex flex-col items-center gap-1 py-3" :aria-current="isActive('home') ? 'page' : undefined" :class="isActive('home') ? 'text-brand-primary' : ''">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>
          <span>Accueil</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'support' }" class="flex flex-col items-center gap-1 py-3" :aria-current="route.path === '/support' ? 'page' : undefined" :class="route.path === '/support' ? 'text-brand-primary' : ''">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5"/><path d="M12 17h.01"/></svg>
          <span>Aide</span>
        </RouterLink>
      </li>
      <li>&nbsp;</li>
    </ul>
  </nav>
</template>

<style scoped>
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
</style>
