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
        <span>{{ protocolProgress.remainingWeek }} semaines restantes</span>
      </div>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div class="flex items-center gap-2 rounded-2xl bg-gray-50 p-3">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <div>
          <div class="text-gray-500">Début</div>
          <div class="font-semibold text-gray-800">{{ protocolLocaleStartDate }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-2xl bg-gray-50 p-3">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <div>
          <div class="text-gray-500">Fin prévue</div>
          <div class="font-semibold text-gray-800">{{ protocolLocaleEndDate }}</div>
        </div>
      </div>
    </div>
    <div class="mt-3 grid grid-cols-3 gap-3 text-center">
      <div class="rounded-xl border border-gray-100 bg-white p-3">
        <div class="text-lg font-bold text-brand-primary">{{ kpi.completedSessions?kpi.completedSessions:'-' }}</div>
        <div class="text-[11px] text-gray-500 whitespace-nowrap">
          <p>Réalisé</p>
        </div>
      </div>
      <div class="rounded-xl border border-gray-100 bg-white p-3">
        <div class="text-lg font-bold text-brand-primary">{{ kpi.expectedCompletedSessions>0?Math.round(100*kpi.completedSessions/kpi.expectedCompletedSessions)+'%':'-' }}</div>
        <div class="text-[11px] text-gray-500 whitespace-nowrap">Assiduité</div>
      </div>
      <div class="rounded-xl border border-gray-100 bg-white p-3">
        <div class="text-lg font-bold text-brand-primary">{{ kpi.expectedCompletedSessions?kpi.expectedCompletedSessions - kpi.completedSessions:'-' }}</div>
        <div class="text-[11px] text-gray-500 whitespace-nowrap">
          <p>Manqué</p>
        </div>
      </div>
    </div>
  </div>


</template>
<script setup lang="ts">

import {computed, onMounted, reactive} from "vue";

import {wrapLocalStorage} from "@/services/storage.service.ts";
import {api} from "@/services/api.ts";
const {protocol} = wrapLocalStorage()

const kpi = reactive({})


const protocolLocaleStartDate = computed(() => {

  const date = protocol.value?.startDate
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
})

const protocolLocaleEndDate = computed(() => {

  if(protocol.value)
  {
    const startDate = protocol.value?.startDate;
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + (protocol.value?.durationWeeks) * 7)
    return endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
  }
  else return '-'
})

const protocolProgress = computed(() => {
  const date = protocol.value?.startDate;
  if (!date) return { percentage: 0, remainingWeek: 0 }

  const startDate = new Date(date)
  const today = new Date()

  const msPerDay = 24 * 60 * 60 * 1000
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const totalDays = protocol.value.durationWeeks * 7
  const elapsedDays = Math.max(0, Math.floor((todayDay - startDay) / msPerDay))
  const percentage = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
  const remainingWeek = Math.max(0, Math.round((totalDays - elapsedDays) / 7))

  return { percentage, remainingWeek }
})

onMounted(async ()=>{
  let newKpi = await api.getProtocolKpi();
  Object.assign(kpi, newKpi); //as kpi is reactive, do not use = or it will kill reactivity

})

</script>
