<script setup lang="ts">
import { computed } from 'vue'
import { getOnboarding } from '@/utils/onboarding'
import { RouterLink } from 'vue-router'

const ob = getOnboarding()
const facility = computed(() => ({
  name: ob.facility?.name || 'Centre Hospitalier Universitaire',
  address: ob.facility?.address || '123 Avenue de la République, 75001 Paris',
  doctor: ob.facility?.doctor || 'Dr. Marie BERNARD',
}))
</script>

<template>
  <section class="mx-auto w-full px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-xl">

    <!-- Aide (moved first) -->
    <div class="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="mb-3 font-semibold">Besoin d'aide ?</div>
      <div class="space-y-3 text-sm">
        <RouterLink :to="{ name: 'education' }" class="rounded-full bg-white px-4 py-2 border border-gray-100 flex items-center justify-center gap-2 w-full whitespace-nowrap">
          Guide d'utilisation
        </RouterLink>
        <RouterLink :to="{ name: 'education' }" class="rounded-full bg-white px-4 py-2 border border-gray-100 flex items-center justify-center gap-2 w-full whitespace-nowrap">
          Vidéos tutoriels
        </RouterLink>
        <RouterLink :to="{ name: 'faq' }" class="rounded-full bg-white px-4 py-2 border border-gray-100 flex items-center justify-center gap-2 w-full whitespace-nowrap">
          FAQ
        </RouterLink>
      </div>
    </div>

    <!-- Support STIMEO (moved second) -->
    <div class="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-gray-700 font-semibold">
          <svg class="h-5 w-5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18v-6h6v6"/><path d="M8 6h8l1 3H7l1-3z"/></svg>
          Support STIMEO
        </div>
      </div>
      <div class="mt-2 space-y-2 text-sm">
        <div class="text-gray-500">Support technique et questions</div>
        <div>0 801 270 111 (gratuit)</div>
        <div>crp@stimeo.fr</div>
        <div>Lun–Ven: 9h–18h</div>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <a href="tel:0801270111" class="btn-primary">Appeler</a>
        <a href="mailto:crp@stimeo.fr" class="rounded-full bg-gray-50 px-4 py-2 text-center font-semibold text-gray-700">Email</a>
      </div>
    </div>

    <!-- Médecin prescripteur -->
    <div class="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="flex items-center gap-2 text-gray-700 font-semibold">
        <svg class="h-5 w-5 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21a6 6 0 0 1 12 0"/></svg>
        Médecin prescripteur
      </div>
      <div class="mt-3 space-y-2 text-sm">
        <div class="font-semibold">{{ facility.name }}</div>
        <div class="flex items-center gap-2"><svg class="h-4 w-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg> {{ facility.address }}</div>
        <div class="flex items-center gap-2"><svg class="h-4 w-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.12.81.3 1.6.55 2.36a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 5 5l1.72-1.72a2 2 0 0 1 2.11-.45c.76.25 1.55.43 2.36.55A2 2 0 0 1 22 16.92z"/></svg> 01 45 67 89 12</div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <a href="tel:+33145678912" class="btn-primary">Appeler</a>
        <a href="mailto:contact@chu.fr" class="rounded-full bg-gray-50 px-4 py-2 text-center font-semibold text-gray-700">Email</a>
      </div>
    </div>

  </section>
</template>
