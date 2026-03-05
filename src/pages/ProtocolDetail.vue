<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Timer from '@/components/Timer.vue'
import GamificationModal from '@/components/GamificationModal.vue'
import { addPoints, ACTION_POINTS } from '@/utils/gamification'
import { addMeasure } from '@/utils/measures'
import { authUser } from '@/utils/auth'
import { getOnboarding } from '@/utils/onboarding'

const sessionDurationMinutes = computed(() => getOnboarding()?.sessionDuration || 20)
const sessionDurationSeconds = computed(() => sessionDurationMinutes.value * 60)

const steps = ref([
  { id: 1, label: 'Hydrater la peau', done: true },
  { id: 2, label: 'Placer les électrodes', done: true },
  { id: 3, label: `Lancer la séance TENS – ${sessionDurationMinutes.value} min`, done: true },
])
const showPainGuard = ref(false)
const lastElapsed = ref(0)
const isComplete = computed(() => lastElapsed.value >= sessionDurationSeconds.value)

watch(sessionDurationMinutes, () => {
  steps.value[2].label = `Lancer la séance TENS – ${sessionDurationMinutes.value} min`
})
const router = useRouter()
function compositeProgress() {
  const stepsRatio = steps.value.length ? steps.value.filter(s=>s.done).length / steps.value.length : 0
  const timeRatio = Math.min(1, lastElapsed.value / sessionDurationSeconds.value)
  const painRatio = savedPain.value ? 1 : 0
  const pct = Math.round((stepsRatio * 0.4 + timeRatio * 0.4 + painRatio * 0.2) * 100)
  return pct
}

const firstName = computed(() => (authUser.value?.user_metadata?.firstName || (authUser.value?.email||'').split('@')[0] || 'Utilisateur'))
const showCongrats = ref(false)
const congratsMsg = ref('')

const specialty = computed(() => getOnboarding()?.protocol?.specialty || 'Rhumatologie')

const pain = ref<number>(5)
const savedPain = ref(false)
const showSessionCompleteModal = ref(false)
function savePain() {
  if (!isComplete.value) { showPainGuard.value = true; return }
  addMeasure({ pain: pain.value })
  addPoints(1, 'Note de douleur enregistrée')
  savedPain.value = true
}

function onFinished(sec: number) {
  lastElapsed.value = Math.max(0, sec)
  import('@/utils/sessions')
    .then(m => { try { m.addSession({ durationSec: Math.max(0, sec) }) } catch {} })
    .catch(() => {})
  const s = addPoints(ACTION_POINTS.sessionComplete, 'Séance terminée')
  showSessionCompleteModal.value = true
}

function closeSessionModal() {
  showSessionCompleteModal.value = false
  router.replace({ name: 'home' })
}
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
    <h2 class="text-xl font-bold text-center">Protocole TENS {{ specialty }}</h2>
    <div class="flex flex-col relative mt-5 h-[30px]"></div>
    <div class="mt-2"></div>


    <!-- Timer card -->
    <div class="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-soft">
      <Timer :duration-sec="sessionDurationSeconds" :size="220" :stroke="12" :can-start="true" @finished="onFinished" />
    </div>




    <!-- Pain guard overlay -->
    <Teleport to="body">
      <div v-if="showPainGuard" class="fixed inset-0 z-[200]">
        <div class="absolute inset-0 bg-black/40" @click="showPainGuard=false"></div>
        <div class="absolute inset-0 flex items-center justify-center px-4">
          <div class="w-full max-w-md rounded-2xl bg-white p-5 text-center shadow-soft">
            <div class="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div class="text-lg font-extrabold text-gray-800">Séance non terminée</div>
            <p class="mt-2 text-sm text-gray-600">Veuillez terminer la séance de {{ sessionDurationMinutes }} minutes avant d’évaluer votre douleur.</p>
            <div class="mt-4 flex justify-center">
              <button class="btn-primary" @click="showPainGuard=false">OK</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
