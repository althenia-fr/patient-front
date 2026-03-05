<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listSessions } from '@/utils/sessions'
import { getOnboarding } from '@/utils/onboarding'

const router = useRouter()

const specialty = computed(() => getOnboarding()?.protocol?.specialty || 'Rhumatologie')

const sessions = computed(() => listSessions())
const sessionsBlockOpen = ref(false)

function toggleSessionsBlock() {
  sessionsBlockOpen.value = !sessionsBlockOpen.value
}

function formatSessionDate(dateString: string) {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

function formatSessionTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(durationSec: number) {
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${minutes}m ${seconds}s`
}

function goHome() {
  router.push({ name: 'home' })
}

function startNewSession() {
  router.push({ name: 'protocol-detail', params: { id: '1' } })
}
</script>

<template>
  <section class="mx-auto w-full max-w-md px-4 py-6">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-gray-800">Historique des séances</h1>
      <p class="mt-1 text-sm text-gray-500">Protocole TENS {{ specialty }}</p>
    </div>

    <div class="rounded-2xl border border-gray-100 bg-white shadow-soft overflow-hidden">
      <!-- En-tête du bloc (cliquable) -->
      <button
        @click="toggleSessionsBlock"
        class="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 hover:from-brand-primary/10 hover:to-brand-primary/15 transition border-b border-gray-100"
      >
        <div>
          <h2 class="font-bold text-lg text-gray-800">Historique des séances</h2>
          <p class="text-xs text-gray-500 mt-1">{{ sessions.length }} séance(s) enregistrée(s)</p>
        </div>
        <svg
          :style="{ transform: sessionsBlockOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
          class="w-5 h-5 text-brand-primary transition-transform flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Contenu du bloc (visible si ouvert) -->
      <div v-if="sessionsBlockOpen" class="divide-y">
        <div v-if="sessions.length === 0" class="py-8 text-center text-gray-500">
          <p>Aucune séance enregistrée</p>
        </div>
        <div v-for="(session, index) in sessions" :key="session.id" class="flex items-center justify-between px-5 py-3 text-sm hover:bg-gray-50 transition">
          <div class="w-1/6 font-semibold text-gray-800">
            <p>S{{ sessions.length - index }}</p>
          </div>
          <div class="flex-1 px-2 text-gray-600">
            {{ formatSessionDate(session.date) }} à {{ formatSessionTime(session.date) }}
          </div>
          <div class="w-1/4 text-right font-semibold text-gray-800">
            {{ formatDuration(session.durationSec) }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-3">
      <button class="btn-secondary w-full" @click="goHome">Retour</button>
      <button class="btn-primary w-full" @click="startNewSession">Nouvelle séance</button>
    </div>
  </section>
</template>
