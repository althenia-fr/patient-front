<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Timer from '@/components/Timer.vue'
import GamificationModal from '@/components/GamificationModal.vue'
import {globalState, useGlobalTimer} from '@/composables/useGlobalTimer'
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";
import {STORAGE_KEYS} from "@/types/api.types.ts";


const router = useRouter()

const sessionNumber = ref(null)

const props = defineProps({
  pstid: Number,
});

if(props.pstid) globalState.pstid = props.pstid

// Global timer state
const {
  isRunning,
  sessionRemainingSec,
  sessionMaxSec,
  toggleTimer,
    timerOn,
    timerOff,
} = useGlobalTimer()


// Fetch protocol agenda and initialize global timer
const fetchAndInitializeTimer = async () => {
  try {

    let protocolDataJson = localStorage.getItem(STORAGE_KEYS.STIMEO_PROTOCOL)
    let protocolData = protocolDataJson?JSON.parse(protocolDataJson):null
    let pecid = protocolData?.pecid
    let pstid = props.pstid
    if(!protocolData.pstid) protocolData.pstid= pstid //paranoid

   let trackingSession = await sessionTrackingApi.getSessionTracking(pecid,pstid)

    if (trackingSession)
    {
      globalState.pstid = trackingSession.pstid
      globalState.sessionMaxSec = trackingSession.sessionMaxSec
      globalState.sessionNumber = trackingSession.sessionNumber || null
      globalState.sessionRemainingSec = Math.round(trackingSession.sessionRemainingSec)
      if(trackingSession.status==='running')
      {
        await timerOn(trackingSession.sessionNumber)
      }
      else  await timerOff()

    }

  } catch (error) {
    console.error('Failed to fetch protocol agenda in ProtocolDetail:', error)
  }
}

const sessionDurationMinutes = computed(() => {
  // Use API data if available, otherwise fallback to onboarding
  let protocolDataJson = localStorage.getItem(STORAGE_KEYS.STIMEO_PROTOCOL)
  let protocolData = protocolDataJson?JSON.parse(protocolDataJson):null
  return  protocolData?.sessionMaxSec * 60
})

const steps = ref([
  { id: 1, label: 'Hydrater la peau', done: true },
  { id: 2, label: 'Placer les électrodes', done: true },
  { id: 3, label: `Lancer la séance TENS – ${sessionDurationMinutes.value} min`, done: true },
])

watch(sessionDurationMinutes, () => {
  steps.value[2].label = `Lancer la séance TENS – ${sessionDurationMinutes.value} min`
})

const showCongrats = ref(false)
const congratsMsg = ref('')

const showSessionCompleteModal = ref(false)


function closeSessionModal() {
  showSessionCompleteModal.value = false
  router.replace({ name: 'home' })
}

onMounted(() => {
  if(!globalState.running) fetchAndInitializeTimer()
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
            Votre régularité fait la différence !
          </p>
          <button class="btn-primary mt-5 w-full" @click="closeSessionModal">Fermer</button>
        </div>
      </div>
    </transition>
  </Teleport>
  <section class="mx-auto max-w-md px-4 py-6">

    <!-- Timer card -->
    <div class="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-soft">
      <div class="text-xl font-bold text-center">Protocole TENS</div>
      <br/>
      <Timer
        :size="220"
        :stroke="12"
      />

      <!-- Global Timer Controls (if needed for larger interface) -->
      <div class="mt-4 flex justify-center gap-4">
        <button
          @click="toggleTimer(sessionNumber)"
          :class="[
            'px-6 py-2 rounded-full font-semibold transition-colors w-full',
            isRunning
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          ]"
        >
          {{ isRunning ? 'Pause' : (sessionRemainingSec<sessionMaxSec) ? 'Reprendre la séance' : 'Démarrer la séance' }}
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
