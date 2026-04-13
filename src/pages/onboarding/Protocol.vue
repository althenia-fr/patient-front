<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { saveOnboarding, getOnboarding } from '@/utils/onboarding'

const router = useRouter()
const selected = ref(getOnboarding().protocol?.specialty || '')
const specialties = [
  { key: 'UROLOGIE', desc: 'Protocole pour troubles urologiques', weeks: 13, freq: 'Séances quotidiennes' },
]
function next() {
  const spec = specialties.find(s => s.key === selected.value)
  saveOnboarding({ protocol: { specialty: selected.value, weeks: spec?.weeks, frequency: spec?.freq } })
  router.push({ name: 'onb-device' })
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-6">
    <div class="mb-4">
      <div class="h-2 w-full rounded-full bg-gray-200"><div class="h-2 w-1/3 rounded-full bg-brand-primary"></div></div>
      <div class="mt-2 text-xs text-gray-500"><p>Configuration du protocole • Étape 1 sur 2</p></div>
    </div>
    <header class="mb-4 text-center">
      <div class="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">⚕</div>
      <h1 class="mt-2 text-lg font-bold"><p>Confirmez votre protocole</p></h1>
      <p class="text-xs text-gray-500">Choisissez le protocole prescrit par votre médecin</p>
    </header>

    <div class="space-y-3">
      <label v-for="s in specialties" :key="s.key" class="flex cursor-pointer items-center justify-between rounded-xl border bg-white p-4 shadow-soft" :class="selected===s.key ? 'border-brand-primary' : 'border-gray-100'">
        <div>
          <div class="font-semibold"><p>TENS {{ s.key }}</p></div>
        </div>
        <input type="radio" class="h-5 w-5 text-brand-primary" :value="s.key" v-model="selected" />
      </label>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <RouterLink :to="{ name: 'home' }" class="text-sm text-gray-500">Retour</RouterLink>
      <button class="btn-primary rounded-full px-6 py-3" :disabled="!selected" @click="next">Suivant</button>
    </div>
  </section>
</template>
