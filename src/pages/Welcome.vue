<script setup lang="ts">
import Button from '@/components/Button.vue'
</script>

<template>
  <section class="relative mx-auto w-full min-h-[100svh] min-h-screen overflow-hidden">
    <!-- Background image with soft white overlay -->
    <div class="absolute inset-0">
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Fb883ba48179746f6970b95b16cac1756?format=webp&width=1600"
        alt="Fond d'accueil"
        class="h-full w-full object-cover"
      />
      <div class="pointer-events-none absolute inset-0 bg-white/80"></div>
      <!-- Brand logo on background -->
      <div class="pointer-events-none absolute inset-x-0 flex justify-center" style="top: calc(12vh + env(safe-area-inset-top))">
        <img src="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?format=webp&width=1400" alt="STIMEO+" class="h-24 sm:h-28 md:h-32 lg:h-36 max-w-[92%] opacity-95 drop-shadow" />
      </div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white/95 via-white/80 to-transparent"></div>
    </div>

    <!-- Foreground content -->
    <div class="relative z-10 flex min-h-[100svh] min-h-screen flex-col pt-safe">
      <div class="mt-auto px-4 pb-28 pb-safe">
        <RouterLink :to="{ name: 'login' }" class="block w-full">
          <Button variant="primary" class="w-full rounded-full py-4 text-base">Démarrer</Button>
        </RouterLink>
        <!-- Handle indicator -->
        <div class="pointer-events-none mx-auto mt-3 grid h-7 w-10 place-items-center rounded-full bg-white/80 shadow-soft">
          <svg viewBox="0 0 24 24" class="h-4 w-4 text-gray-800" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  </section>
</template>
