<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { readConf } from '@/utils/reminders'
import { getWeekInfo, getProtocolStart } from '@/utils/protocol'
import { getOnboarding } from '@/utils/onboarding'
import { RouterLink } from 'vue-router'
import { getHistory, ACTION_POINTS } from '@/utils/gamification'
import { listMeasures } from '@/utils/measures'
import { listSessions } from '@/utils/sessions'
import { useProtocol } from '@/composables/useProtocol'

const reminder = ref(readConf())
const remEnabled = computed(() => reminder.value.enabled)
const remTime = computed(() => `${String(reminder.value.hour).padStart(2,'0')}:${String(reminder.value.minute).padStart(2,'0')}`)

onMounted(() => {
  const read = () => { try { reminder.value = readConf() } catch {}
  }
  window.addEventListener('storage', read)
  const id = window.setInterval(read, 2000)
  onUnmounted(() => { window.removeEventListener('storage', read); clearInterval(id) })
})

const week = computed(() => {
  protocolDuration.value
  return getWeekInfo()
})
const today = computed(() => {
  try {
    const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  } catch {
    return new Date().toLocaleDateString()
  }
})

const history = computed(() => getHistory())
const sessionsDone = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date) return 0
  const startDate = new Date(date).getTime()
  return history.value.filter(h => {
    const isSession = h.points === ACTION_POINTS.sessionComplete || /séance/i.test(h.reason || '')
    const entryDate = new Date(h.date).getTime()
    return isSession && entryDate >= startDate
  }).length
})
const incompleteSessionsCount = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date) return 0
  const startDate = new Date(date).getTime()
  const sessions = listSessions()
  return sessions.filter(s => {
    const sessionDate = new Date(s.date).getTime()
    return s.durationSec < 1200 && sessionDate >= startDate
  }).length
})
const daysElapsed = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date) return 1
  const msPerDay = 24*60*60*1000
  const startDay = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()).getTime()
  const today = new Date(); const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.max(1, Math.floor((todayDay - startDay)/msPerDay) + 1)
})
const adherence = computed(() => Math.min(100, Math.round((sessionsDone.value / daysElapsed.value) * 100)))

const currentWeek = computed(() => {
  const daysElapsedValue = daysElapsed.value
  return Math.ceil(daysElapsedValue / 7)
})

const { protocolDuration } = useProtocol()

const protocolStartDate = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
})

const protocolEndDate = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date) return '—'
  const startDate = new Date(date)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + protocolDuration.value * 7)
  return endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
})

const checkupWeek = computed(() => {
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

const protocolProgress = computed(() => {
  const date = getOnboarding()?.protocolStartDate
  if (!date) return { percentage: 0, remaining: 0 }
  
  const startDate = new Date(date)
  const today = new Date()
  
  const msPerDay = 24 * 60 * 60 * 1000
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  
  const totalDays = protocolDuration.value * 7
  const elapsedDays = Math.max(0, Math.floor((todayDay - startDay) / msPerDay))
  const percentage = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
  const remaining = Math.max(0, Math.round((totalDays - elapsedDays) / 7))
  
  return { percentage, remaining }
})

const lastSession = computed(() => {
  const lastEntry = history.value.find(h => /séance/i.test(h.reason || ''))
  if (!lastEntry) return null

  const date = new Date(lastEntry.date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (dateDay.getTime() === todayDay.getTime()) {
    return `Aujourd'hui ${time}`
  } else if (dateDay.getTime() === yesterdayDay.getTime()) {
    return `Hier ${time}`
  } else {
    return date.toLocaleDateString('fr-FR') + ` ${time}`
  }
})

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

const timingVar = computed(() => {
  const items = history.value.filter(h => /séance/i.test(h.reason || '')).slice(0, 14)
  const hours = items.map(h => new Date(h.date).getHours())
  if (hours.length < 3) return 12
  const mean = hours.reduce((a,b)=>a+b,0)/hours.length
  const variance = hours.reduce((a,b)=>a+(b-mean)**2,0)/hours.length
  return Math.sqrt(variance)
})

const protocolName = computed(() => {
  const specialty = getOnboarding()?.protocol?.specialty
  if (!specialty) return 'Protocole en cours'
  return `Protocole TENS ${specialty}`
})

const sessionCount = computed(() => getOnboarding()?.sessionCount || 1)

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

</script>

<template>
  <section class="mx-auto w-full px-4 pt-5 pb-24 sm:max-w-md md:max-w-lg lg:max-w-xl">
    <!-- Déclaratif quotidien -->
    <div class="rounded-2xl border border-gray-100 bg-white p-5">
      <div class="mb-2 flex flex-col gap-2">
        <div v-if="remEnabled" class="flex w-full items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          <svg viewBox="0 0 24 24" class="mr-1 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Rappel {{ remTime }}
        </div>
      </div>
      <div class="flex justify-center">
        <div class="text-center text-lg font-semibold text-gray-800">{{ today }}</div>
      </div>
      <div class="mt-3 space-y-2">
        <template v-if="sessionCount === 1">
          <RouterLink :to="{ name: 'protocol-detail', params: { id: '1' } }" class="block">
            <div class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold transition focus:outline-none bg-brand-secondary text-white">Débuter une nouvelle séance</div>
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'protocol-detail', params: { id: '1' } }" class="block">
            <div class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold transition focus:outline-none bg-brand-secondary text-white">Ma première séance du jour</div>
          </RouterLink>
          <RouterLink :to="{ name: 'protocol-detail', params: { id: '1' } }" class="block">
            <div class="flex w-full items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 font-semibold transition focus:outline-none bg-brand-secondary text-white">Ma deuxième séance du jour</div>
          </RouterLink>
        </template>
      </div>
      <div v-if="lastSession" class="mt-2 text-center text-xs text-gray-500 sm:text-left">• Dernière séance: {{ lastSession }}</div>
    </div>

    <!-- Agenda de la semaine -->
    <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
      <h2 class="text-lg font-semibold text-gray-800">Agenda de la semaine</h2>
      <div class="mt-3 space-y-2">
        <RouterLink v-if="currentWeek === 1" :to="{ name: 'usp' }" class="block rounded-lg bg-cyan-50 p-3 hover:bg-cyan-100 transition cursor-pointer">
          <p class="text-xs text-gray-600"><span class="text-gray-600"><p>Merci de compléter le questionnaire </p></span> <span class="font-semibold text-cyan-700">USP</span></p>
        </RouterLink>
        <RouterLink v-if="currentWeek === 1" :to="{ name: 'qualiveen' }" class="block rounded-lg bg-cyan-50 p-3 hover:bg-cyan-100 transition cursor-pointer">
          <p class="text-xs text-gray-600"><span class="text-gray-600"><p>Merci de compléter le questionnaire </p></span> <span class="font-semibold text-cyan-700">Qualiveen</span></p>
        </RouterLink>
        <RouterLink v-if="currentWeek === 4 || currentWeek === 9 || currentWeek === 12 || currentWeek === 16 || currentWeek === 20 || currentWeek === 24" :to="{ name: 'satisfaction' }" class="block rounded-lg bg-cyan-50 p-3 hover:bg-cyan-100 transition cursor-pointer">
          <p class="text-xs text-gray-600"><span class="text-gray-600"><p>Merci de compléter le questionnaire </p></span> <span class="font-semibold text-cyan-700">Satisfaction</span></p>
        </RouterLink>
        <RouterLink v-if="currentWeek === 4 || currentWeek === 9 || currentWeek === 12 || currentWeek === 16 || currentWeek === 20 || currentWeek === 24" :to="{ name: 'pgi_i' }" class="block rounded-lg bg-cyan-50 p-3 hover:bg-cyan-100 transition cursor-pointer">
          <p class="text-xs text-gray-600"><span class="text-gray-600"><p>Merci de compléter le questionnaire </p></span> <span class="font-semibold text-cyan-700">PG-I</span></p>
        </RouterLink>
        <div v-if="checkupWeek && currentWeek === checkupWeek" class="rounded-lg bg-gray-50 p-3">
          <p class="text-sm font-semibold text-gray-800">Date Rendez-vous de contrôle</p>
        </div>
        <div v-if="currentWeek === protocolDuration" class="rounded-lg bg-gray-50 p-3">
          <p class="text-sm font-semibold text-gray-800">Date de fin du protocole</p>
        </div>
        <p v-if="!(currentWeek === 1 || currentWeek === 4 || currentWeek === 9 || currentWeek === 12 || currentWeek === 16 || currentWeek === 20 || currentWeek === 24 || (checkupWeek && currentWeek === checkupWeek) || currentWeek === protocolDuration)" class="text-sm text-gray-500">Aucun agenda cette semaine</p>
      </div>
    </div>

    <!-- Protocole en cours -->
    <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">{{ protocolName }}</h2>
      </div>
      <div class="mt-2">
        <div class="h-2 rounded-full bg-gray-200">
          <div class="h-2 rounded-full bg-brand-primary" :style="{ width: protocolProgress.percentage + '%' }"></div>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{{ protocolProgress.percentage }}% terminé</span>
          <span>{{ protocolProgress.remaining }} semaines restantes</span>
        </div>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div class="flex items-center gap-2 rounded-2xl bg-gray-50 p-3">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <div>
            <div class="text-gray-500">Début</div>
            <div class="font-semibold text-gray-800">{{ protocolStartDate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-2xl bg-gray-50 p-3">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <div>
            <div class="text-gray-500">Fin prévue</div>
            <div class="font-semibold text-gray-800">{{ protocolEndDate }}</div>
          </div>
        </div>
      </div>
      <div class="mt-3 grid grid-cols-3 gap-3 text-center">
        <div class="rounded-xl border border-gray-100 bg-white p-3">
          <div class="text-lg font-bold text-brand-primary">{{ sessionsDone }}</div>
          <div class="text-[11px] text-gray-500 whitespace-nowrap">
            <p>Séances</p>
            <p>réalisées</p>
          </div>
        </div>
        <div class="rounded-xl border border-gray-100 bg-white p-3">
          <div class="text-lg font-bold text-brand-primary">{{ adherence }}%</div>
          <div class="text-[11px] text-gray-500 whitespace-nowrap">Assiduité</div>
        </div>
        <div class="rounded-xl border border-gray-100 bg-white p-3">
          <div class="text-lg font-bold text-brand-primary">{{ incompleteSessionsCount }}</div>
          <div class="text-[11px] text-gray-500 whitespace-nowrap">
            <p>Séances</p>
            <p>incomplètes</p>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>
