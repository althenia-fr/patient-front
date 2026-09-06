<template>

    <!-- Déclaratif quotidien -->
    <div class="rounded-2xl bg-white p-5">
      <div class="flex justify-center">
        <div class="text-center text-lg font-semibold text-gray-800">{{ today }}</div>
      </div>
      <div class="mt-3 space-y-2">

        <!-- Multiple session buttons based on sessionsDaily -->
        <div v-if="availableSessions.length >= 1" class="space-y-2">
          <!--RouterLink
            v-for="session in availableSessions"
            :key="session.pstid"
            :to="{ name: 'timer', params: { pecid:session.pecid, pstid: session.pstid } }"
            class="block w-full"
          -->
          <div  v-for="session in availableSessions" @click="gotoTimer(session)"
                class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold transition focus:outline-none"
                :class="{
                'bg-brand-secondary text-white': session.isAvailable && !session.isCompleted,
                'bg-gray-300 text-gray-500 cursor-not-allowed': !session.isAvailable || session.isCompleted
              }"
          >
            {{ session.isCompleted ? `Séance ${session.sessionNumber} terminée` :
              !session.isAvailable ? `Séance ${session.sessionNumber} non disponible` :
                  session.isAvailable && session.sessionTimeRemaining===session.sessionTimeMax? `Commencer la Séance ${session.sessionNumber}` :
                      `Continuer la séance ${session.sessionNumber}` }}
          </div>
          <!--/RouterLink-->
        </div>

      </div>


    </div>

</template>
<script setup lang="ts">

import {computed, onMounted, ref, watch} from "vue";
import router from "@/router";
import {globalState} from "@/composables/useGlobalTimer.ts";
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";
import {currentWeek} from "@/services/protocol.service.ts";
import {useSessionTracking} from "@/composables/useSessionTracking.ts";
import {getNowParisDateYYYYMMDD} from "@/utils/protocol.ts";

const { createSession } = useSessionTracking()

interface AvailableSession {
  sessionNumber: number
  isCompleted: boolean
  isAvailable: boolean | undefined
}

const availableSessions = ref<AvailableSession[]>([])

const today = computed(() => {
  try {
    const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  } catch {
    return new Date().toLocaleDateString()
  }
})

async function gotoTimer(session: any)
{
  let pstid = +session.pstid
  if(pstid===0)
  {
    const payload = {
      pecid: globalState.protocol?.pecid,
      weekNumber: currentWeek.value,
      sessionNumber : session.sessionNumber,
    }

    const createdSession = await createSession(payload)
    pstid = createdSession.pstid
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
    return session1 && session1.sessionTimeRemaining > 0
  }

  // For session 2+, check if previous session is completed
  const previousSession = todaySessions.find((s: any) => s.sessionNumber === sessionNumber - 1)
  const currentSession = todaySessions.find((s: any) => s.sessionNumber === sessionNumber)

  const isPreviousCompleted = previousSession && previousSession.sessionTimeRemaining <= 0
  const isCurrentCompleted = currentSession && currentSession.sessionTimeRemaining <= 0

  return isPreviousCompleted && !isCurrentCompleted
}

function initSessions(pecid:number, trackedSessions:any, sessionsDaily:number)
{
  const todayYYYYMMDD = getNowParisDateYYYYMMDD()

  // work out today's sessions
  const todaySessions = trackedSessions.filter((session: any) =>
      session.sessionDate.startsWith(todayYYYYMMDD)
  )

  const sessions = []
  for (let i = 1; i <= sessionsDaily; i++) {
    const session = todaySessions.find(s => s.sessionNumber === i)
    sessions.push({
      pstid: session?session.pstid:0,
      pecid: session?session.pecid:pecid,
      sessionNumber: i,
      isCompleted: session ? session.sessionTimeRemaining <= 0 : false,
      isAvailable: i===1 && !session?true:canStartSession(i, todaySessions) //if 1st session hasnt started yet, it's available for start
    })
  }

  availableSessions.value = sessions

}

watch(()=> globalState.protocol?.pecid, async (newPecid : any) => {

  console.log('new pecid '+newPecid)

  if(!newPecid) return

  // After getting protocol agenda, fetch session tracking data
  let sessions = await sessionTrackingApi.listSessionTracking(newPecid)
  initSessions(newPecid, sessions, globalState.protocol?.sessionsDaily)

})

onMounted(() => {

  let pecid = globalState.protocol?.pecid
  let sessions = globalState.sessions
  let sessionsDaily = globalState.protocol?.sessionsDaily

  if(pecid && sessions && sessionsDaily) initSessions(pecid, sessions,sessionsDaily) //when we navigate back to this page, we must redisplay the sessions

})


</script>
