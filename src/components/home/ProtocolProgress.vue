<template>

  <!-- Protocole en cours -->
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-800">Protocole en cours</h2>
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


</template>
<script setup lang="ts">

import {computed} from "vue";
import {globalState} from "@/composables/useGlobalTimer.ts";
import {daysElapsed} from "@/services/protocol.service.ts";

const protocolStartDate = computed(() => {
  const date = globalState.protocol?.startDate
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
})

const protocolEndDate = computed(() => {
  const date = globalState.protocol?.startDate
  if (!date) return '—'
  const startDate = new Date(date)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + (globalState.protocol?.durationWeeks) * 7)
  return endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
})

const protocolProgress = computed(() => {
  const date = globalState.protocol?.startDate
  if (!date) return { percentage: 0, remaining: 0 }

  const startDate = new Date(date)
  const today = new Date()

  const msPerDay = 24 * 60 * 60 * 1000
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const totalDays = (globalState.protocol?.durationWeeks) * 7
  const elapsedDays = Math.max(0, Math.floor((todayDay - startDay) / msPerDay))
  const percentage = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
  const remaining = Math.max(0, Math.round((totalDays - elapsedDays) / 7))

  return { percentage, remaining }
})

const adherence = computed(() => {
  // Calculate adherence based on completed sessions vs expected sessions
  // Now supports multiple sessions per day
  const sessionsDaily = globalState.protocol?.sessionsDaily || 1
  const expectedSessions = daysElapsed.value * sessionsDaily
  const completedSessions = sessionsDone.value

  if (expectedSessions === 0) return 0
  return Math.min(100, Math.round((completedSessions / expectedSessions) * 100))
})


const sessionsDone = computed(() => {
  const date = globalState.protocol?.startDate
  if (!date) return 0

  // Use session tracking API data instead of history
  const startDate = new Date(date)
  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()

  return globalState.sessions.filter((session: any) => {
    const sessionDate = new Date(session.date).getTime()
    // Consider a session "done" if sessionTimeRemaining is 0 or less
    return sessionDate >= startDateOnly && session.sessionTimeRemaining <= 0
  }).length
})

const incompleteSessionsCount = computed(() => {

  let sessionsDaily = globalState.protocol?.sessionsDaily
  let elapsedDays = daysElapsed.value

  let expectedSessions = sessionsDaily * elapsedDays

  return expectedSessions - sessionsDone.value

})


</script>
