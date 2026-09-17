<template>

    <!-- Déclaratif quotidien -->
    <div class="rounded-2xl bg-white p-5">
      <div class="flex justify-center">
        <div class="text-center text-lg font-semibold text-gray-800">{{ today }}</div>
      </div>
      <div class="mt-3 space-y-2">

        <!-- Multiple session buttons based on sessionsDaily -->
        <div v-if="todayEnrichedSessions.length >= 1" class="space-y-2">
          <button v-for="session in todayEnrichedSessions" @click="gotoTimer(session.sessionNumber)"
               class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold transition focus:outline-none"
               :class="{
                'bg-brand-secondary text-white': session.isAvailable && !session.isCompleted,
                'bg-gray-300 text-gray-500 cursor-not-allowed': !session.isAvailable || session.isCompleted
              }"
           :disabled="session.isCompleted || !session.isAvailable">
            {{`Séance ${session.sessionNumber}`}} {{workoutSessionState(session)}}
          </button>
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

import {wrapLocalStorage} from "@/services/storage.service.ts";
import {globalState} from "@/composables/useGlobalTimer.ts";
const {getSessions,protocol,setSessions, sessionRefresh} = wrapLocalStorage()

const { createSession } = useSessionTracking()

onMounted(() => {

  // Le problème vient du fait que todayEnrichedSessions est une propriété calculée (computed). Dans Vue.js, un computed
  // met en cache son résultat et ne se recalcule que si l'une de ses dépendances réactives change.
  // Puisque getSessions() va lire directement dans le LocalStorage (qui n'est pas réactif par défaut),
  // Vue ne sait pas que les données ont changé lorsque tu reviens de la page du timer.
  // Pour forcer la mise à jour à chaque visite de la page, la méthode la plus simple et efficace est de créer un
  // déclencheur réactif (ref) qu'on incrémente à chaque fois que le composant est monté ou affiché.
  sessionRefresh.value++;
});

function workoutSessionState(session : any)
{
  if(session.isCompleted) return 'terminée'
  else if(globalState.sessionNumber===session.sessionNumber){
    if(globalState.running) return 'en cours'
     else return 'en pause'
   }
   else if(!session.isAvailable) return ''
}


const todayEnrichedSessions = computed(()=>{

  //On lit la valeur : à chaque fois que sessionRefresh changera, ce computed sera recalculé
  sessionRefresh.value;

  let todayTrackedSessions = getSessions()

  let sessionsOfTheDay = []
  for (let i = 1; i <= protocol.value.sessionsDaily; i++) {
    const session = todayTrackedSessions.find(s => s.sessionNumber === i)
    sessionsOfTheDay.push({
      pstid: session?session.pstid:0,
      pecid: protocol.value.pecid,
      sessionRemainingSec: session?session.sessionRemainingSec:0,
      sessionMaxSec: session?session.sessionMaxSec:0,
      sessionNumber: session?session.sessionNumber:i,
      isCompleted: session ? session.sessionRemainingSec <= 0 : false,
      isAvailable: i===1 && !session?true:canStartSession(i, todayTrackedSessions) //if 1st session hasnt started yet, it's available for start
    })
  }

  return sessionsOfTheDay

})


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
  let pstid = 0;
  let sessions = getSessions()
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
    const payload = {
      pecid: protocol.value.pecid,
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

    setSessions(sessions);

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


</script>
