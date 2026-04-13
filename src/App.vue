<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainNav from './layouts/MainNav.vue'
import TopBanner from './components/TopBanner.vue'

const route = useRoute()

const requiresAuth = computed(() => {
  return route.meta?.requiresAuth
})

</script>

<template>
  <div class="min-h-screen overflow-x-hidden overflow-y-auto bg-[#e0d8a0] text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <main :class="[requiresAuth ? 'pt-safe pb-[92px] pb-safe' : 'pt-safe']" class="flex flex-col sm:block">
      <TopBanner v-if="requiresAuth" />
      <router-view />
    </main>
    <footer v-if="requiresAuth" class="fixed inset-x-0 z-[9999] pointer-events-auto" style="bottom: env(safe-area-inset-bottom)">
      <MainNav />
    </footer>
  </div>
</template>

<style scoped></style>
