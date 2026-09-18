<script setup lang="ts">
import {computed, onMounted, onUnmounted} from 'vue'
import TopBarTimer from "@/components/TopBarTimer.vue";
import {currentWeek} from "@/services/agenda.service.ts";
import {useRoute} from "vue-router";

import {wrapLocalStorage} from "@/services/storage.service.ts";
import {globalState, useGlobalTimer} from "@/composables/useGlobalTimer.ts";
const {user,protocol} = wrapLocalStorage()
const {hasActiveSession} = useGlobalTimer()


const route = useRoute()
const isTimerPage = computed(() => route.name.indexOf('timer')>-1)

const firstname = computed(() => user.value?.firstname)

const memoVisibilityState ={
  wentOff:0,
  sessionRemainingSec:0
}

// 3. Forcer le rafraîchissement au retour en premier plan
function handleVisibilityChange() {
  if(globalState.running)
  {
    if (document.visibilityState === 'visible') {
      let deltaTimeMsec =  Date.now() - memoVisibilityState.wentOff
      globalState.sessionRemainingSec = memoVisibilityState.sessionRemainingSec - Math.round(deltaTimeMsec/1000)
    }
    else
    {
      memoVisibilityState.wentOff = Date.now()
      memoVisibilityState.sessionRemainingSec = globalState.sessionRemainingSec
    }
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})



</script>

<template>
  <div class="sticky z-[9998] bg-white backdrop-blur" style="top: env(safe-area-inset-top)">
    <div class="w-full mx-auto px-4 sm:max-w-md md:max-w-lg lg:max-w-xl">
      <div class="w-full bg-white p-3">
      <div class="flex items-start justify-between">
        <div class="grid grid-cols-3 items-center w-full">

          <div class="text-base font-bold whitespace-nowrap justify-self-start" >
            <span v-if="!hasActiveSession">Bonjour, {{ firstname }}</span>
          </div>
          <div class="flex justify-center items-center" >
            <TopBarTimer v-if="!isTimerPage && hasActiveSession" />
          </div>
          <div
              v-if="currentWeek"
              class="justify-self-end inline-flex items-center gap-2 rounded-full bg-brand-secondary/30 px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap"
          >
            <!-- <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> -->
              Semaine {{ currentWeek }}/{{ protocol?.durationWeeks }}
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
</template>
