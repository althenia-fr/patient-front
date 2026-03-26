<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { listMeasures } from '@/utils/measures'
import { getWeekInfo, getProtocolStart } from '@/utils/protocol'
import { getHistory, ACTION_POINTS } from '@/utils/gamification'
import { getOnboarding } from '@/utils/onboarding'
import { getProtocolAgenda, getQuestionnairesForWeek } from '@/utils/protocolAgenda'
import { useProtocol } from '@/composables/useProtocol'
import { protocolApi } from '@/services/api'
import type { ProtocolAgendaData } from '@/types/protocol.types'
import { formIdToRouteName, formIdToDisplayName } from '@/types/protocol.types'

const agendaOpen = ref(false)

// Fetched protocol agenda from API
const fetchedAgenda = ref<ProtocolAgendaData | null>(null)

const fetchAgenda = async () => {
  try {
    fetchedAgenda.value = await protocolApi.getProtocolAgenda()
  } catch (e) {
    console.error('Failed to fetch protocol agenda on Protocols page:', e)
  }
}

onMounted(() => {
  fetchAgenda()
})

// Forms for the current week from the API
const currentWeekFormsList = computed(() => {
  if (!fetchedAgenda.value) return []
  return protocolApi.getCurrentWeekForms(fetchedAgenda.value, currentWeek.value)
})

// Calculate current week
const currentWeek = computed(() => {
  const start = getProtocolStart()
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const daysElapsed = Math.floor((todayDay - startDay) / msPerDay)
  return Math.floor(daysElapsed / 7) + 1
})

// Get questionnaires for current week
const questionnairesForCurrentWeek = computed(() => {
  return getQuestionnairesForWeek(currentWeek.value, protocolDuration.value)
})

const inProgress = {
  id: 1,
  name: 'Protocole Rhumatologie',
  tags: ['Éducation', 'TENS'],
  week: '3/13',
  progress: 23,
  start: '25 Nov 2024',
  end: '17 Fév 2025',
  adherence: 95,
  sessionsDone: 18,
  sessionsTotal: 31,
  painAvg: 4.2,
}

const gamHistory = computed(() => getHistory())
const sessionsDone = computed(() => gamHistory.value.filter(h => h.points === ACTION_POINTS.sessionComplete || /séance/i.test(h.reason || '')).length)
const daysElapsed = computed(() => {
  const start = getProtocolStart()
  const msPerDay = 24 * 60 * 60 * 1000
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const today = new Date(); const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.max(1, Math.floor((todayDay - startDay) / msPerDay) + 1)
})
const adherence = computed(() => Math.min(100, Math.round((sessionsDone.value / daysElapsed.value) * 100)))

// Pain trend last 7 days vs previous 7
function avg(arr: number[]) { return arr.length ? Math.round((arr.reduce((a,b)=>a+b,0)/arr.length)*10)/10 : NaN }
const painTrend = computed(() => {
  const now = Date.now()
  const msDay = 24*60*60*1000
  const measures = listMeasures()
  const last7 = measures.filter(m => new Date(m.date).getTime() >= now-7*msDay).map(m=>Number(m.pain)).filter(n=>!Number.isNaN(n))
  const prev7 = measures.filter(m => new Date(m.date).getTime() < now-7*msDay && new Date(m.date).getTime() >= now-14*msDay).map(m=>Number(m.pain)).filter(n=>!Number.isNaN(n))
  const a1 = avg(last7), a0 = avg(prev7)
  if (!Number.isFinite(a1) || !Number.isFinite(a0)) return { dir: 0, delta: 0 }
  const dir = a1 < a0 ? -1 : a1 > a0 ? 1 : 0
  const delta = Math.abs(Math.round((Math.abs(a1-a0)/a0)*100))
  return { dir, delta }
})

// Session timing consistency (std deviation of hours last 14 days)
const timingVar = computed(() => {
  const items = gamHistory.value.filter(h => /séance/i.test(h.reason || '')).slice(0, 14)
  const hours = items.map(h => new Date(h.date).getHours())
  if (hours.length < 3) return 12 // high variance if not enough data
  const mean = hours.reduce((a,b)=>a+b,0)/hours.length
  const variance = hours.reduce((a,b)=>a+(b-mean)**2,0)/hours.length
  return Math.sqrt(variance)
})

const tips = computed(() => {
  const list: string[] = []
  if (adherence.value >= 90) list.push("Excellente assiduité, continuez sur cette lancée !")
  else if (adherence.value >= 70) list.push("Belle régularité. Fixez une heure de séance pour atteindre 90%.")
  else list.push("Assiduité perfectible. Choisissez une heure fixe quotidienne et activez un rappel.")

  if (painTrend.value.dir === -1) list.push(`Douleur moyenne en baisse (≈ ${painTrend.value.delta}%): bravo !`)
  if (painTrend.value.dir === 1) list.push(`Douleur un peu en hausse (≈ ${painTrend.value.delta}%). Réalisez la séance à heure fixe et vérifiez le placement des électrodes.`)

  if (timingVar.value > 3) list.push("Horaires irréguliers détectés. Essayez de garder une plage horaire constante.")
  else list.push("Horaires plutôt réguliers: c'est idéal pour créer l'habitude.")

  return list
})

const strengths = computed(() => {
  const list: string[] = []
  if (adherence.value >= 85) list.push('Assiduité élevée')
  if (painTrend.value.dir === -1) list.push('Douleur en amélioration')
  if (gamHistory.value.some(h=>/Bilan hebdomadaire/i.test(h.reason||''))) list.push('Bilan hebdo régulier')
  return list
})
const weaknesses = computed(() => {
  const list: string[] = []
  if (adherence.value < 70) list.push('Assiduité insuffisante')
  if (painTrend.value.dir === 1) list.push('Douleur en hausse')
  if (timingVar.value > 3) list.push('Horaires irréguliers')
  return list
})

const { protocolDuration } = useProtocol()

const checkupWeekNumber = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date || !protocolDuration.value) return null

  const startDate = new Date(date)
  const checkupDate = new Date(startDate)
  checkupDate.setDate(checkupDate.getDate() + (protocolDuration.value - 1) * 7)

  const msPerDay = 24*60*60*1000
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  const checkupDay = new Date(checkupDate.getFullYear(), checkupDate.getMonth(), checkupDate.getDate()).getTime()
  const daysToCheckup = Math.floor((checkupDay - startDay) / msPerDay)

  return Math.ceil((daysToCheckup + 1) / 7)
})

const usp1Week = computed(() => {
  if (!checkupWeekNumber.value) return null
  return checkupWeekNumber.value - 1
})

const protocolAgenda = computed(() => {
  return getProtocolAgenda(protocolDuration.value)
})

const evaluationEvolutionFrequency = computed(() => {
  return getOnboarding()?.evaluationEvolutionFrequency || 'Hebdomadaire'
})

const evaluationEvolutionStartWeek = computed(() => {
  return getOnboarding()?.evaluationEvolutionStartWeek || 4
})

const history = [
  { id: 2, name: 'Protocole post���opératoire', range: '28 Août 2024 → 14 Nov 2024', adherence: 89, painAvg: 4.0, sessions: 89 },
]
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-3">

    <!-- Agenda du protocole -->
    <div class="mt-3 rounded-xl border border-gray-100 bg-white shadow-soft">
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Agenda du protocole</h2>
          <button
            @click="agendaOpen = !agendaOpen"
            class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
          >
            <svg v-if="agendaOpen" viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <svg v-else viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        <div v-if="agendaOpen" class="space-y-3">
          <div v-for="item in protocolAgenda" :key="item.week" class="rounded-lg bg-gray-50 p-3 flex justify-between items-start">
            <div class="font-semibold text-gray-800 text-sm"><p>S{{ item.week }}</p></div>
            <div class="flex flex-wrap gap-2 justify-end">
              <span v-for="questionnaire in item.questionnaires" :key="questionnaire" class="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                {{ questionnaire }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Questionnaires de la semaine -->
    <div class="mt-3 rounded-xl border border-gray-100 bg-white shadow-soft">
      <div class="p-4">
        <h3 class="mb-3 text-sm font-semibold text-gray-800">Questionnaires — Semaine {{ currentWeek }}</h3>
        <div v-if="currentWeekFormsList.length > 0" class="grid gap-2">
          <RouterLink
            v-for="form in currentWeekFormsList"
            :key="form.formId"
            :to="{ name: formIdToRouteName(form.formId) || 'home' }"
            class="block"
          >
            <div class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold shadow-soft transition focus:outline-none bg-brand-primary text-white">
              {{ formIdToDisplayName(form.formId) }}
            </div>
          </RouterLink>
        </div>
        <p v-else class="text-sm text-gray-500">Aucun questionnaire prévu cette semaine.</p>
      </div>
    </div>

    <!-- Résultats -->
    <RouterLink :to="{ name: 'questionnaire-results' }" class="mt-3 block">
      <div class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold shadow-soft transition focus:outline-none bg-brand-secondary text-white">
        Résultats
      </div>
    </RouterLink>

  </section>
</template>
