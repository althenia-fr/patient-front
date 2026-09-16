<template>

    <!-- Déclaratif quotidien -->
    <div class="rounded-2xl bg-white p-5">
      <div class="flex justify-center">
        <div class="text-center text-lg font-semibold text-gray-800">{{ today }}</div>
      </div>
      <div class="mt-3 space-y-2">

        <!-- Multiple session buttons based on sessionsDaily -->
        <div v-if="todayEnrichedSessions.length >= 1" class="space-y-2">
          <!--RouterLink
            v-for="session in availableSessions"
            :key="session.pstid"
            :to="{ name: 'timer', params: { pecid:session.pecid, pstid: session.pstid } }"
            class="block w-full"
          -->
          <button v-for="session in todayEnrichedSessions" @click="gotoTimer(session.sessionNumber)"
               class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold transition focus:outline-none"
               :class="{
                'bg-brand-secondary text-white': session.isAvailable && !session.isCompleted,
                'bg-gray-300 text-gray-500 cursor-not-allowed': !session.isAvailable || session.isCompleted
              }"
           :disabled="session.isCompleted || !session.isAvailable">
            {{ session.isCompleted ? `Séance ${session.sessionNumber} terminée` :
              !session.isAvailable ? `Séance ${session.sessionNumber}` :
                      `Séance ${session.sessionNumber}` }}
          </button>
          <!--/RouterLink-->
        </div>

      </div>


    </div>

</template>
<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import router from "@/router";
import {currentWeek} from "@/services/agenda.service.ts";
import {useSessionTracking} from "@/composables/useSessionTracking.ts";
import {getNowParisDateYYYYMMDD} from "@/utils/protocol.ts";
import {STORAGE_KEYS} from "@/types/api.types.ts";

const { createSession } = useSessionTracking()


const todayEnrichedSessions = ref([])

const today = computed(() => {
  try {
    const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  } catch {
    return new Date().toLocaleDateString()
  }
})

async function gotoTimer(sessionNumber: any)
{
  const todayYYYYMMDD = getNowParisDateYYYYMMDD()
  let sessionsJson = localStorage.getItem(STORAGE_KEYS.STIMEO_SESSIONS+'_'+todayYYYYMMDD);
  let sessions = sessionsJson?JSON.parse(sessionsJson):null

  let pstid = 0;
  for(let i=0;i<sessions.length;i++)
  {
    let session = sessions[i]
    if(session.sessionNumber===sessionNumber)
    {
      pstid = session.pstid
    }
  }

  if(pstid===0)
  {
    let protocolDataJson = localStorage.getItem(STORAGE_KEYS.STIMEO_PROTOCOL)
    let protocolData = protocolDataJson?JSON.parse(protocolDataJson):null

    const payload = {
      pecid: protocolData?protocolData.pecid:null,
      weekNumber: currentWeek.value,
      sessionNumber : sessionNumber,
    }

    const createdSession = await createSession(payload)
    pstid = createdSession.pstid

    sessions.push({
      pstid: pstid,
      pecid: createdSession.pecid,
      sessionRemainingSec: createdSession.sessionRemainingSec,
      sessionMaxSec: createdSession.sessionMaxSec,
      sessionNumber: sessionNumber,
      sessionDate: createdSession.sessionDate,
      isCompleted: false,
      isAvailable: true //if 1st session hasnt started yet, it's available for start
    });

    localStorage.setItem(STORAGE_KEYS.STIMEO_SESSIONS+'_'+todayYYYYMMDD,JSON.stringify(sessions));
  }

  router.push({
    name: 'timer',
    params: { pstid:pstid }
  });
}

// Check if a specific session number can be started
const canStartSession = (sessionNumber: number, sessionsArray: any) => {

  const todayYYYYMMDD = getNowParisDateYYYYMMDD()

  const todaySessions = sessionsArray.filter((session: any) => session.sessionDate.startsWith(todayYYYYMMDD))

  // Session 1 can always be started if not completed
  if (sessionNumber === 1) {
    const session1 = todaySessions.find((s: any) => s.sessionNumber === 1)
    return session1 && session1.sessionRemainingSec > 0
  }

  // For session 2+, check if previous session is completed
  const previousSession = todaySessions.find((s: any) => s.sessionNumber === sessionNumber - 1)
  const currentSession = todaySessions.find((s: any) => s.sessionNumber === sessionNumber)

  const isPreviousCompleted = previousSession && previousSession.sessionRemainingSec <= 0
  const isCurrentCompleted = currentSession && currentSession.sessionRemainingSec <= 0

  return isPreviousCompleted && !isCurrentCompleted
}

function initSessions(){

  const todayYYYYMMDD = getNowParisDateYYYYMMDD()
  let sessionsJson = localStorage.getItem(STORAGE_KEYS.STIMEO_SESSIONS+'_'+todayYYYYMMDD);
  let sessions = sessionsJson?JSON.parse(sessionsJson):null

  // work out today's sessions
  const todayTrackedSessions =sessions.filter((session: any) =>
      session.sessionDate.startsWith(todayYYYYMMDD)
  )

  let protocolDataJson = localStorage.getItem(STORAGE_KEYS.STIMEO_PROTOCOL)
  let protocolData = protocolDataJson?JSON.parse(protocolDataJson):null

  let sessionsOfTheDay = []
  for (let i = 1; i <= protocolData?.sessionsDaily; i++) {
    const session = todayTrackedSessions.find(s => s.sessionNumber === i)
    sessionsOfTheDay.push({
      pstid: session?session.pstid:0,
      pecid: protocolData?.pecid,
      sessionRemainingSec: session?session.sessionRemainingSec:0,
      sessionMaxSec: session?session.sessionMaxSec:0,
      sessionNumber: session?session.sessionNumber:i,
      isCompleted: session ? session.sessionRemainingSec <= 0 : false,
      isAvailable: i===1 && !session?true:canStartSession(i, todayTrackedSessions) //if 1st session hasnt started yet, it's available for start
    })
  }

  todayEnrichedSessions.value = sessionsOfTheDay
}

onMounted(() => {

  initSessions()

})


</script>
