<script setup lang="ts">
import { computed, ref, onMounted, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getResults, getLatestResultByWeekAndQuestionnaire } from '@/utils/questionnaireResults'
import { getOnboarding } from '@/utils/onboarding'
import { getProtocolAgenda, getQuestionnairesForWeekExcludingCalendar } from '@/utils/protocolAgenda'
import { getChartDataByWeek } from '@/utils/chartData'
import type { QuestionnaireResult } from '@/utils/questionnaireResults'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()
const route = useRoute()
const results = ref<QuestionnaireResult[]>([])
const apiRawWeeks = ref<any[]>([])
const chartData = ref([])
const expandedWeeks = ref<Set<number>>(new Set())

const protocolDuration = computed(() => getOnboarding()?.protocolDuration || 13)
const protocolAgenda = computed(() => getProtocolAgenda(protocolDuration.value))

import apiClient from '@/services/core/apiClient'

function normalizeFormType(type: string): string {
  const upper = String(type).toUpperCase()
  if (upper.includes('QUALIVEEN')) return 'Qualiveen'
  if (upper.includes('SATISFACTION')) return 'Satisfaction'
  if (upper.includes('PG') || upper.includes('PG-I') || upper.includes('PGI')) return 'PG-I'
  if (upper.includes('EVOLUTION') || upper.includes('ÉVOLUTION') || upper.includes('THERA')) return 'Evolution Thérapeutique'
  if (upper.includes('MICTIONNEL')) return 'Calendrier Mictionnel'
  if (upper.includes('USP')) return 'USP'
  return type
}

async function refreshResults() {
  try {
    const userStr = sessionStorage.getItem('alth_user') || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || user.id || null
    
    const response = await apiClient.get('/formSubmission/list', {
      params: { patientId }
    })
    
    const apiData = response.data?.data || response.data || []
    apiRawWeeks.value = Array.isArray(apiData) ? apiData : []
    const flatResults: QuestionnaireResult[] = []
    
    if (Array.isArray(apiData)) {
      apiData.forEach((weekGroup: any) => {
        const weekNum = weekGroup.weekNumber
        const forms = weekGroup.forms || []
        
        forms.forEach((formGroup: any) => {
          const type = normalizeFormType(formGroup.formType)
          const submissions = formGroup.submissions || []
          
          submissions.forEach((sub: any) => {
            // Reconstruct the flat 'data' object the frontend expects
            const dataObj = {
               ...(sub.answers || {}),
               scores: sub.scores || {}
            }
            
            flatResults.push({
              id: String(sub.id || Math.random()),
              questionnaireName: type,
              date: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
              timestamp: sub.submittedAt ? new Date(sub.submittedAt).getTime() : Date.now(),
              week: weekNum,
              data: dataObj
            })
          })
        })
      })
      
      results.value = flatResults
    } else {
      results.value = getResults()
    }
  } catch (err) {
    console.error('Failed to fetch external results:', err)
    results.value = getResults()
  }
  
  chartData.value = getChartDataByWeek()
}

onMounted(() => {
  refreshResults()
})

// Also refresh when the component becomes visible (e.g., when returning from another page)
onActivated(() => {
  refreshResults()
})

// Watch for route changes to ensure results are refreshed when navigating to this page
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'questionnaire-results') {
    refreshResults()
  }
})

const resultsByWeek = computed(() => {
  const weeks: Record<number, Record<string, QuestionnaireResult[]>> = {}

  // Pre-fill every week and every form the API knows about (even if empty)
  for (const weekData of apiRawWeeks.value) {
    const w = weekData.weekNumber
    if (!weeks[w]) weeks[w] = {}
    for (const f of weekData.forms || []) {
      const type = normalizeFormType(f.formType)
      weeks[w][type] = []
    }
  }

  // Populate buckets with actual submissions
  for (const r of results.value) {
    if (!weeks[r.week]) {
      weeks[r.week] = {}
    }
    if (!weeks[r.week][r.questionnaireName]) {
      weeks[r.week][r.questionnaireName] = []
    }
    weeks[r.week][r.questionnaireName].push(r)
  }

  for (const week in weeks) {
    for (const q in weeks[week]) {
      weeks[week][q].sort((a, b) => b.timestamp - a.timestamp)
    }
  }

  return weeks
})

const weeksShouldDisplay = computed(() => {
  return Object.keys(resultsByWeek.value)
    .map(Number)
    .sort((a, b) => a - b)
})

function getQuestionnaireStatus(results: QuestionnaireResult[]) {
  if (results.length === 0) return 'Non complété'
  return 'Complété'
}

function getQuestionnaireDate(results: QuestionnaireResult[], week?: number) {
  if (results.length === 0) return '—'

  // If week is provided, calculate the theoretical date based on protocol start date
  if (week !== undefined) {
    const onb = getOnboarding()
    if (onb?.protocolStartDate) {
      const startDate = new Date(onb.protocolStartDate)
      const weekDate = new Date(startDate)
      weekDate.setDate(weekDate.getDate() + (week - 1) * 7)
      return weekDate.toLocaleDateString('fr-FR')
    }
  }

  // Fallback to actual result date
  return results[0].date
}

function getScoreDisplay(results: QuestionnaireResult[]): string {
  if (results.length === 0) return '—'

  const result = results[0]
  const questionnaire = result.questionnaireName
  const data = result.data

  switch (questionnaire) {
    case 'Satisfaction':
      const satisfactionLevel = data.satisfaction !== undefined ? data.satisfaction : null
      if (satisfactionLevel === null) return '—'
      const satisfactionOptions = [
        'Très grandement améliorés',
        'Grandement améliorés',
        'Légèrement améliorés',
        'Aucun changement',
        'Légèrement aggravés',
        'Grandement aggravés',
        'Très grandement aggravés',
      ]
      const satisfactionScore = data.satisfactionScore !== undefined ? data.satisfactionScore : 6 - satisfactionLevel
      return `${satisfactionOptions[satisfactionLevel]} (${satisfactionScore}/6)`

    case 'PG-I':
      const pgiLevel = data.pgi_i !== undefined ? data.pgi_i : null
      if (pgiLevel === null) return '—'
      const pgiOptions = [
        'Très grandement mieux',
        'Grandement mieux',
        'Un peu mieux',
        'Pas de changement',
        'Un peu plus mal',
        'Grandement plus mal',
        'Très grandement plus mal',
      ]
      const pgiScore = data.pgiScore !== undefined ? data.pgiScore : 6 - pgiLevel
      return `${pgiOptions[pgiLevel]} (${pgiScore}/6)`

    case 'Qualiveen':
      if (data.scores) {
        return `Score: ${data.scores.total}/4`
      }
      return '—'

    case 'USP':
      if (data.scores) {
        const effort = data.effort?.q1 !== undefined ? (data.effort?.q1 || 0) + (data.effort?.q2 || 0) + (data.effort?.q3 || 0) : 0
        const hyper = data.hyper?.q1 !== undefined ? (data.hyper?.q1 || 0) + (data.hyper?.q2 || 0) + (data.hyper?.q3 || 0) + (data.hyper?.q4 || 0) + (data.hyper?.q5 || 0) + (data.hyper?.q6 || 0) + (data.hyper?.q7 || 0) : 0
        const dysurie = data.dysurie?.q1 !== undefined ? (data.dysurie?.q1 || 0) + (data.dysurie?.q2 || 0) + (data.dysurie?.q3 || 0) : 0
        return `Score: ${data.scores.total}/39 (Effort: ${effort}/9, Hyperactivité: ${hyper}/21, Dysurie: ${dysurie}/9)`
      }
      return '—'

    case 'Evolution Thérapeutique':
      if (data.urgenturies?.nombre !== undefined) {
        return `Urgences: ${data.urgenturies.nombre}, Nuit: ${data.mictions_nocturnes?.nombre || 0}, Fuites: ${data.fuites_urinaires?.nombre || 0}`
      }
      return '—'

    default:
      return '—'
  }
}

function goHome() {
  router.push({ name: 'home' })
}

function toggleWeekExpanded(week: number) {
  if (expandedWeeks.value.has(week)) {
    expandedWeeks.value.delete(week)
  } else {
    expandedWeeks.value.add(week)
  }
}

function isWeekExpanded(week: number): boolean {
  return expandedWeeks.value.has(week)
}

function openQuestionnaire(questionnaire: string) {
  const routeMap: Record<string, string> = {
    'Qualiveen': 'qualiveen',
    'PG-I': 'pgi_i',
    'USP': 'usp',
    'Satisfaction': 'satisfaction',
    'Evolution Thérapeutique': 'evaluation_evolution',
  }

  const routeName = routeMap[questionnaire]
  if (routeName) {
    router.push({ name: routeName })
  }
}

// Function to get normalized score on 0-7 scale for charting
function getNormalizedScoreForChart(questionnaire: string, data: Record<string, any>): number {
  switch (questionnaire) {
    case 'Satisfaction':
      return data.satisfactionScore !== undefined ? data.satisfactionScore : (data.satisfaction !== undefined ? 6 - data.satisfaction : 0)
    case 'PG-I':
      return data.pgiScore !== undefined ? data.pgiScore : (data.pgi_i !== undefined ? 6 - data.pgi_i : 0)
    case 'USP':
      if (data.scores?.total !== undefined) {
        const scoreOnSevenScale = (data.scores.total / 39) * 7
        return Math.round(scoreOnSevenScale * 100) / 100
      }
      return 0
    case 'Qualiveen':
      if (data.scores?.total !== undefined) {
        const scoreOnSevenScale = (data.scores.total / 4) * 7
        return Math.round(scoreOnSevenScale * 100) / 100
      }
      return 0
    default:
      return 0
  }
}

// Make function available to template
const getQuestionnairesForWeekExcludingCalendarFn = getQuestionnairesForWeekExcludingCalendar

// Options pour le graphique en barres Evolution Thérapeutique
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Évolution Thérapeutique',
      font: { size: 16, weight: 'bold' as const },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 7,
      ticks: {
        stepSize: 1,
      },
      title: {
        display: true,
        text: 'Score',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Semaine',
      },
    },
  },
}

// Préparer les données pour le graphique en barres (Evolution)
function getBarChartData() {
  const weeks = chartData.value
    .filter((d: any) => d.evolutionData)
    .map((d: any) => `S${d.week}`)

  const evolutionDataPoints = chartData.value.filter((d: any) => d.evolutionData)

  console.log('Evolution data points:', evolutionDataPoints)
  console.log('Weeks:', weeks)

  return {
    labels: weeks,
    datasets: [
      {
        label: 'Urgences',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.urgences ?? 0),
        backgroundColor: '#EF4444',
      },
      {
        label: 'Mictions nocturnes',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.nuit ?? 0),
        backgroundColor: '#F59E0B',
      },
      {
        label: 'Fuites urinaires',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.fuites ?? 0),
        backgroundColor: '#FBBF24',
      },
      {
        label: 'Douleur miction',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.douleurMiction ?? 0),
        backgroundColor: '#F87171',
      },
      {
        label: 'Douleur hors miction',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.douleurHorsMiction ?? 0),
        backgroundColor: '#FB923C',
      },
      {
        label: 'État protection',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.etatProtection ?? 0),
        backgroundColor: '#6366F1',
      },
      {
        label: 'Évolution protection',
        data: evolutionDataPoints.map((d: any) => d.evolutionData?.evolutionProtection ?? 0),
        backgroundColor: '#8B5CF6',
      },
    ],
  }
}
</script>

<template>
  <section class="mx-auto w-full px-4 py-6 sm:max-w-md md:max-w-2xl">
    <header class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-gray-800">Evaluation longitudinale</h3>
          <p class="mt-1 text-sm text-gray-500">Vue par semaine et par questionnaire</p>
        </div>
        <button
          v-if="results.length > 0"
          @click="router.push({ name: 'chart-results' })"
          class="px-4 py-2 rounded-lg bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition"
        >
          📊 Graphiques
        </button>
      </div>
    </header>

    <div v-if="results.length === 0" class="rounded-2xl border border-gray-100 bg-white p-6 text-center">
      <p class="text-gray-500">Aucun résultat enregistré pour le moment.</p>
    </div>

    <div v-else-if="results.length > 0" class="space-y-6">
      <div v-for="week in weeksShouldDisplay" :key="week" class="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <!-- Week Header -->
        <button
          @click="toggleWeekExpanded(week)"
          class="w-full bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 px-4 py-3 border-b border-gray-100 flex items-center justify-between hover:from-brand-primary/10 hover:to-brand-primary/15 transition"
        >
          <h2 class="font-bold text-lg text-gray-800 text-left">Semaine {{ week }}</h2>
          <span class="text-brand-primary transition-transform" :style="{ transform: isWeekExpanded(week) ? 'rotate(180deg)' : 'rotate(0deg)' }">
            ▼
          </span>
        </button>

        <!-- Questionnaires for this week -->
        <div v-show="isWeekExpanded(week)" class="divide-y">
          <div v-for="(resultsArr, questionnaire) in resultsByWeek[week]" :key="String(questionnaire)" class="p-4 hover:bg-gray-50 transition">
            <!-- If multiple results, show each one -->
            <div v-if="resultsByWeek[week][questionnaire].length > 1" class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-gray-800">{{ questionnaire }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ resultsByWeek[week][questionnaire].length }} complétions</div>
                </div>
                <button
                  @click="openQuestionnaire(questionnaire)"
                  class="text-xs font-semibold text-brand-primary hover:underline"
                >
                  Ajouter
                </button>
              </div>

              <!-- Show each result -->
              <div v-for="(result, idx) in resultsByWeek[week][questionnaire]" :key="result.id" class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-gray-700">Complétude {{ idx + 1 }}</div>
                    <div class="mt-1 text-sm text-gray-600">{{ getScoreDisplay([result]) }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ getQuestionnaireDate([result], week) }}</div>
                  </div>
                  <div class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Complété</div>
                </div>
              </div>
            </div>

            <!-- If single result -->
            <div v-else class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="font-semibold text-gray-800">{{ questionnaire }}</div>
                <div class="mt-1 text-sm text-gray-600">
                  <div>{{ getScoreDisplay(resultsByWeek[week][questionnaire]) }}</div>
                  <div class="mt-1 text-xs text-gray-500">
                    {{ getQuestionnaireDate(resultsByWeek[week][questionnaire], week) }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                  resultsByWeek[week][questionnaire].length > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                ]">
                  <p>{{ getQuestionnaireStatus(resultsByWeek[week][questionnaire]) }}</p>
                </div>
                <button
                  v-if="resultsByWeek[week][questionnaire].length === 0"
                  @click="openQuestionnaire(questionnaire)"
                  class="mt-2 block text-xs font-semibold text-brand-primary hover:underline"
                >
                  Remplir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 mb-24">
      <button class="w-full btn-secondary" @click="goHome">Retour</button>
    </div>
  </section>
</template>
