<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Timer from '@/components/Timer.vue'
import GamificationModal from '@/components/GamificationModal.vue'
import { getOnboarding } from '@/utils/onboarding'
import { protocolApi } from '@/services/api'
import { useGlobalTimer } from '@/composables/useGlobalTimer'
import type { ProtocolAgenda } from '@/types/protocol.types'

// Protocol agenda state
const protocolAgenda = ref<ProtocolAgenda | null>(null)

// Route and session number handling
const route = useRoute()
const router = useRouter()
const sessionNumber = computed(() => {
  return Number(route.query.sessionNumber) || 1
})

// Global timer state
const {
  isRunning,
  remainingTime,
  totalTime,
  progress,
  timeDisplay,
  hasActiveSession,
  canResumeSession,
  initializeTimer,
  toggleTimer,
  endTimer,
} = useGlobalTimer()

// Fetch protocol agenda and initialize global timer
const fetchProtocolAgenda = async () => {
  try {
    protocolAgenda.value = await protocolApi.getProtocolAgenda()

    // Initialize global timer with session duration
    if (protocolAgenda.value) {
      const sessionDuration = protocolAgenda.value?.sessionDurationMin || getOnboarding()?.sessionDuration || 20
      await initializeTimer(protocolAgenda.value, sessionDuration)
    }
  } catch (error) {
    console.error('Failed to fetch protocol agenda in ProtocolDetail:', error)
  }
}

const sessionDurationMinutes = computed(() => {
  // Use API data if available, otherwise fallback to onboarding
  return protocolAgenda.value?.sessionDurationMin || getOnboarding()?.sessionDuration || 20
})

const steps = ref([
  { id: 1, label: 'Hydrater la peau', done: true },
  { id: 2, label: 'Placer les électrodes', done: true },
  { id: 3, label: `Lancer la séance TENS – ${sessionDurationMinutes.value} min`, done: true },
])
const lastElapsed = ref(0)

watch(sessionDurationMinutes, () => {
  steps.value[2].label = `Lancer la séance TENS – ${sessionDurationMinutes.value} min`
})

const showCongrats = ref(false)
const congratsMsg = ref('')

const specialty = computed(() => getOnboarding()?.protocol?.specialty || '')

const showSessionCompleteModal = ref(false)


// Handle global timer completion
const handleTimerEnd = async (elapsedTime: number) => {
  lastElapsed.value = Math.max(0, elapsedTime)
  endTimer()
  showSessionCompleteModal.value = true
}

function onFinished(sec: number) {
  handleTimerEnd(sec)
}

function closeSessionModal() {
  showSessionCompleteModal.value = false
  router.replace({ name: 'home' })
}

// Fetch protocol agenda on component mount
onMounted(() => {
  fetchProtocolAgenda()
})

</script>

<template>
  <GamificationModal :open="showCongrats" :title="'Séance terminée'" :message="congratsMsg" :streak-days="5" :progress-delta="2" @close="showCongrats=false" />
  <Teleport to="body">
    <transition name="fade">
      <div v-if="showSessionCompleteModal" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="closeSessionModal" aria-hidden="true"></div>
        <div role="dialog" aria-modal="true" class="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-6 text-center shadow-soft">
          <div class="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h3 class="text-xl font-extrabold text-gray-800">Séance terminée</h3>
          <p class="mx-auto mt-2 max-w-sm whitespace-pre-line text-sm text-gray-600">
            Votre séance TENS du jour est validée.
            Excellent travail !
            votre régularité fait vraiment la différence
          </p>
          <button class="btn-primary mt-5 w-full" @click="closeSessionModal">Fermer</button>
        </div>
      </div>
    </transition>
  </Teleport>
  <section class="mx-auto max-w-md px-4 py-6">

    <!-- Timer card -->
    <div class="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-soft">
      <div class="text-xl font-bold text-center">Protocole TENS {{ specialty }}</div>
      <br/>
      <Timer
        :duration-sec="totalTime"
        :size="220"
        :stroke="12"
        :can-start="true"
        :remaining-time="remainingTime"
        :is-running="isRunning"
        @finished="onFinished"
      />

      <!-- Global Timer Controls (if needed for larger interface) -->
      <div class="mt-4 flex justify-center gap-4">
        <button
          @click="toggleTimer(sessionNumber)"
          :class="[
            'px-6 py-2 rounded-full font-semibold transition-colors',
            isRunning
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          ]"
        >
          {{ isRunning ? 'Pause' : canResumeSession ? 'Reprendre la séance' : `Démarrer la séance ${sessionNumber}` }}
        </button>

      </div>
    </div>

  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
