<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import apiClient from '@/services/core/apiClient'
import { calculateMonthlyStats, calculateGlobalStats, getChartDataByWeek } from '@/utils/mictionnelStats'
import { getWeekInfo, getProtocolStart } from '@/utils/protocol'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Chart } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

type Screen = 'dashboard' | 'monthly' | 'daily' | 'summary' | 'report'

interface MictionData {
  time: string
  volume: number
  urge: 0 | 1 | 2 | 3
  particularities: string[]
  circumstances: string[]
  precautionDetails: string[]
  isOpen: boolean
}

interface LeakData {
  time: string
  intensity: '+' | '++' | '+++' | ''
  circumstances: string[]
  otherText: string
  isOpen: boolean
}

interface HydricIntakeEntry {
  time: string
  drinkType: string
  quantity: number
  otherDrink: string
  isOpen: boolean
}

interface DayData {
  date: string
  mictions: MictionData[]
  leaks: LeakData[]
  hydricIntakes: HydricIntakeEntry[]
  totalUrine: number
  totalLeaks: number
}

interface MonthData {
  month: number
  year: number
  days: DayData[]
}

interface CalendarData {
  months: MonthData[]
}

const currentScreen = ref<Screen>('dashboard')
const selectedMonth = ref(0)
const selectedDay = ref(-1)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const calendarData = ref<CalendarData>({
  months: [],
})

// Load saved results from localStorage
const allSavedResults = ref<DayData[]>([])

const loadSavedResults = () => {
  try {
    const stored = localStorage.getItem('mictionnel_results')
    if (stored) {
      allSavedResults.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des résultats:', error)
  }
}

// Compute monthly statistics
const monthlyStats = computed(() => {
  return calculateMonthlyStats(allSavedResults.value)
})

// Compute global statistics
const globalStats = computed(() => {
  return calculateGlobalStats(allSavedResults.value)
})

// Compute weekly data for charts
const weeklyChartData = computed(() => {
  return getChartDataByWeek(allSavedResults.value)
})

// Chart data for mictions per day - colored by period
const mictionsChartData = computed(() => {
  const colorMap: Record<string, string> = {
    'D1': 'rgba(59, 130, 246, 0.8)',    // Bleu
    'D2': 'rgba(16, 185, 129, 0.8)',    // Vert
    'D3': 'rgba(245, 158, 11, 0.8)',    // Orange
  }

  const labels: string[] = []
  const data: number[] = []
  const colors: string[] = []

  // Group by D with visual separation
  weeklyChartData.value.forEach((item, idx) => {
    const periodPrefix = item.label.substring(0, 2)
    const dayPrefix = item.label.substring(2)

    labels.push(dayPrefix)
    data.push(item.mictionsPerDay)
    colors.push(colorMap[periodPrefix] || 'rgba(100, 100, 100, 0.7)')

    // Add separator after each D (except the last one)
    if ((idx + 1) % 4 === 0 && idx < weeklyChartData.value.length - 1) {
      labels.push('')
      data.push(0)
      colors.push('rgba(0, 0, 0, 0)')
    }
  })

  return {
    labels: labels,
    datasets: [
      {
        label: 'Mictions/jour',
        data: data,
        backgroundColor: colors,
        type: 'bar',
      },
    ],
  }
})

// Chart data for volume per day - colored by period
const volumeChartData = computed(() => {
  const colorMap: Record<string, string> = {
    'D1': 'rgba(59, 130, 246, 0.8)',    // Bleu
    'D2': 'rgba(16, 185, 129, 0.8)',    // Vert
    'D3': 'rgba(245, 158, 11, 0.8)',    // Orange
  }

  const labels: string[] = []
  const data: number[] = []
  const colors: string[] = []

  // Group by D with visual separation
  weeklyChartData.value.forEach((item, idx) => {
    const periodPrefix = item.label.substring(0, 2)
    const dayPrefix = item.label.substring(2)

    labels.push(dayPrefix)
    data.push(item.volumePerDay)
    colors.push(colorMap[periodPrefix] || 'rgba(100, 100, 100, 0.7)')

    // Add separator after each D (except the last one)
    if ((idx + 1) % 4 === 0 && idx < weeklyChartData.value.length - 1) {
      labels.push('')
      data.push(0)
      colors.push('rgba(0, 0, 0, 0)')
    }
  })

  return {
    labels: labels,
    datasets: [
      {
        label: 'Volume urinaire/jour (ml)',
        data: data,
        backgroundColor: colors,
        type: 'bar',
      },
    ],
  }
})

// Chart data for number of leaks per day - colored by period
const leaksChartData = computed(() => {
  const colorMap: Record<string, string> = {
    'D1': 'rgba(59, 130, 246, 0.8)',    // Bleu
    'D2': 'rgba(16, 185, 129, 0.8)',    // Vert
    'D3': 'rgba(245, 158, 11, 0.8)',    // Orange
  }

  const labels: string[] = []
  const data: number[] = []
  const colors: string[] = []

  // Group by D with visual separation
  weeklyChartData.value.forEach((item, idx) => {
    const periodPrefix = item.label.substring(0, 2)
    const dayPrefix = item.label.substring(2)

    labels.push(dayPrefix)
    data.push(item.leaksPerDay)
    colors.push(colorMap[periodPrefix] || 'rgba(100, 100, 100, 0.7)')

    // Add separator after each D (except the last one)
    if ((idx + 1) % 4 === 0 && idx < weeklyChartData.value.length - 1) {
      labels.push('')
      data.push(0)
      colors.push('rgba(0, 0, 0, 0)')
    }
  })

  return {
    labels: labels,
    datasets: [
      {
        label: 'Nombre de fuites/jour',
        data: data,
        backgroundColor: colors,
        type: 'bar',
      },
    ],
  }
})

// Chart data for hydric intake per day - colored by period
const hydricChartData = computed(() => {
  const colorMap: Record<string, string> = {
    'D1': 'rgba(59, 130, 246, 0.8)',    // Bleu
    'D2': 'rgba(16, 185, 129, 0.8)',    // Vert
    'D3': 'rgba(245, 158, 11, 0.8)',    // Orange
  }

  const labels: string[] = []
  const data: number[] = []
  const colors: string[] = []

  // Group by D with visual separation
  weeklyChartData.value.forEach((item, idx) => {
    const periodPrefix = item.label.substring(0, 2)
    const dayPrefix = item.label.substring(2)

    labels.push(dayPrefix)
    data.push(item.hydricPerDay)
    colors.push(colorMap[periodPrefix] || 'rgba(100, 100, 100, 0.7)')

    // Add separator after each D (except the last one)
    if ((idx + 1) % 4 === 0 && idx < weeklyChartData.value.length - 1) {
      labels.push('')
      data.push(0)
      colors.push('rgba(0, 0, 0, 0)')
    }
  })

  return {
    labels: labels,
    datasets: [
      {
        label: 'Apport hydrique/jour (ml)',
        data: data,
        backgroundColor: colors,
        type: 'bar',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  indexAxis: 'x' as const,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const saveToDayResults = (dayData: DayData) => {
  // Find if this day already exists
  const existingIndex = allSavedResults.value.findIndex(d => d.date === dayData.date)
  if (existingIndex >= 0) {
    allSavedResults.value[existingIndex] = dayData
  } else {
    allSavedResults.value.push(dayData)
  }
  // Save to localStorage
  try {
    localStorage.setItem('mictionnel_results', JSON.stringify(allSavedResults.value))
    console.log('✅ Données sauvegardées:', allSavedResults.value)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des résultats:', error)
  }
}

const initializeCalendar = () => {
  const start = getProtocolStart()
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 28)
  
  calendarData.value.months = []
  
  for (let m = 0; m < 3; m++) {
    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1)
    const month: MonthData = {
      month: monthDate.getMonth() + 1,
      year: monthDate.getFullYear(),
      days: [],
    }
    
    for (let d = 0; d < 4; d++) {
      const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 + d)
      month.days.push({
        date: dayDate.toISOString().split('T')[0],
        mictions: [],
        leaks: [],
        hydricIntakes: [],
        totalUrine: 0,
        totalLeaks: 0,
      })
    }
    
    calendarData.value.months.push(month)
  }
}

const getMonthName = (month: number): string => {
  const names = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return names[month] || ''
}

const stats = computed(() => {
  const allMictions: MictionData[] = []
  let totalUrine = 0
  let totalLeaks = 0
  let totalHydric = 0
  let dayCount = 0
  
  calendarData.value.months.forEach(month => {
    month.days.forEach(day => {
      const dayHydricTotal = day.hydricIntakes.reduce((sum, h) => sum + h.quantity, 0)
      if (day.mictions.length > 0 || dayHydricTotal > 0) {
        dayCount++
        allMictions.push(...day.mictions)
        totalUrine += day.totalUrine
        totalLeaks += day.totalLeaks
        totalHydric += dayHydricTotal
      }
    })
  })
  
  const avgMictionsPerDay = dayCount > 0 ? Math.round((allMictions.length / dayCount) * 10) / 10 : 0
  const avgVolumePerMiction = allMictions.length > 0 ? Math.round((totalUrine / allMictions.length) * 10) / 10 : 0
  const avgLeaksPerDay = dayCount > 0 ? Math.round((totalLeaks / dayCount) * 10) / 10 : 0
  const avgHydricPerDay = dayCount > 0 ? Math.round((totalHydric / dayCount) * 10) / 10 : 0
  
  return {
    avgMictionsPerDay,
    avgVolumePerMiction,
    avgLeaksPerDay,
    avgHydricPerDay,
  }
})

const currentMonth = computed(() => calendarData.value.months[selectedMonth.value])
const currentDay = computed(() => {
  if (selectedDay.value >= 0 && currentMonth.value) {
    return currentMonth.value.days[selectedDay.value]
  }
  return null
})

const goToScreen = (screen: Screen) => {
  errorMessage.value = ''
  successMessage.value = ''
  currentScreen.value = screen
}

const goToDailyEntry = (monthIdx: number, dayIdx: number) => {
  selectedMonth.value = monthIdx
  selectedDay.value = dayIdx
  goToScreen('daily')
}

const leakCircumstancesOptions = [
  'Toux',
  'Marche',
  'Petit effort',
  'Effort moyen',
  'Gros effort',
  'Je n\'ai rien ressenti (insensible)',
  'Autre cas',
]

const particularitiesOptions = [
  'Jet urinaire interrompu ou miction en plusieurs fois ("stop-pipi")',
  'Nécessité de pousser pour déclencher le jet',
  'Nécessité de pousser pour éliminer les dernières gouttes',
  'Gouttes d\'urines résiduelles après le pipi',
  'Déclenchement d\'une miction en se levant des toilettes',
  'Déclenchement d\'une miction au contact de l\'eau (sous la douche)',
  'Position particulière : squat (position suspendue), assise vers l\'avant, assise en arrière, marchepied, debout sous la douche, etc.',
  'Gêne ou douleur : sensation de brûlure, douleur abdominale, autre',
]

const circumstancesOptions = [
  'N = Normal',
  'P = Précaution',
  'I = Imperiosité',
  'D = Dysurie / miction difficile',
]

const precautionOptions = [
  'Envie forte',
  'Lourdeur au bas ventre',
  'Douleur au bas ventre',
  'Sueurs froides',
  'Tremblements',
]

const drinkTypeOptions = [
  'Café',
  'Thé',
  'Soupe',
  'Vin blanc',
  'Chocolat chaud',
  'Soda',
  'Bière',
  'Eau gazeuse',
  'Autre',
]

const drinkMeasureReferences = [
  { label: '1 tasse', value: 100 },
  { label: '1 petit verre', value: 150 },
  { label: '1 mug / grand verre', value: 200 },
  { label: '1 canette', value: 330 },
  { label: '1 carafe', value: 500 },
]

const getCurrentTime = (): string => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const addMiction = () => {
  if (currentDay.value) {
    currentDay.value.mictions.push({
      time: getCurrentTime(),
      volume: 0,
      urge: 0,
      particularities: [],
      circumstances: [],
      precautionDetails: [],
      isOpen: true,
    })
  }
}

const toggleMictionEdit = (miction: MictionData) => {
  miction.isOpen = !miction.isOpen
  // Save to results when closing (validating)
  if (!miction.isOpen && currentDay.value) {
    saveToDayResults({
      date: currentDay.value.date,
      mictions: currentDay.value.mictions,
      leaks: currentDay.value.leaks,
      hydricIntakes: currentDay.value.hydricIntakes,
      totalUrine: currentDay.value.totalUrine,
      totalLeaks: currentDay.value.totalLeaks,
    })
    saveDayData()
  }
}

const handleCheckboxChange = (array: string[], option: string, event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked
  if (isChecked && !array.includes(option)) {
    array.push(option)
  } else if (!isChecked) {
    const idx = array.indexOf(option)
    if (idx > -1) {
      array.splice(idx, 1)
    }
  }
}

const addLeak = () => {
  if (currentDay.value) {
    currentDay.value.leaks.push({
      time: getCurrentTime(),
      intensity: '',
      circumstances: [],
      otherText: '',
      isOpen: true,
    })
  }
}

const toggleLeakEdit = (leak: LeakData) => {
  leak.isOpen = !leak.isOpen
  // Save to results when closing (validating)
  if (!leak.isOpen && currentDay.value) {
    saveToDayResults({
      date: currentDay.value.date,
      mictions: currentDay.value.mictions,
      leaks: currentDay.value.leaks,
      hydricIntakes: currentDay.value.hydricIntakes,
      totalUrine: currentDay.value.totalUrine,
      totalLeaks: currentDay.value.totalLeaks,
    })
    saveDayData()
  }
}

const removeLeak = (leakIdx: number) => {
  if (currentDay.value) {
    currentDay.value.leaks.splice(leakIdx, 1)
    calculateDayTotals()
  }
}

const removeMiction = (idx: number) => {
  if (currentDay.value) {
    currentDay.value.mictions.splice(idx, 1)
    calculateDayTotals()
  }
}

const addHydricIntake = () => {
  if (currentDay.value) {
    currentDay.value.hydricIntakes.push({
      time: getCurrentTime(),
      drinkType: '',
      quantity: 0,
      otherDrink: '',
      isOpen: true,
    })
  }
}

const toggleHydricIntakeEdit = (hydricIntake: HydricIntakeEntry) => {
  hydricIntake.isOpen = !hydricIntake.isOpen
  // Save to results when closing (validating)
  if (!hydricIntake.isOpen && currentDay.value) {
    saveToDayResults({
      date: currentDay.value.date,
      mictions: currentDay.value.mictions,
      leaks: currentDay.value.leaks,
      hydricIntakes: currentDay.value.hydricIntakes,
      totalUrine: currentDay.value.totalUrine,
      totalLeaks: currentDay.value.totalLeaks,
    })
    saveDayData()
  }
}

const removeHydricIntake = (idx: number) => {
  if (currentDay.value) {
    currentDay.value.hydricIntakes.splice(idx, 1)
  }
}

const calculateDayTotals = () => {
  if (currentDay.value) {
    currentDay.value.totalUrine = currentDay.value.mictions.reduce((sum, m) => sum + m.volume, 0)
    currentDay.value.totalLeaks = currentDay.value.leaks.length
  }
}

const saveDayData = async () => {
  if (!currentDay.value) return
  
  if (currentDay.value.mictions.length === 0) {
    errorMessage.value = 'Veuillez ajouter au moins une miction'
    return
  }
  
  const hasNegativeHydric = currentDay.value.hydricIntakes.some(h => h.quantity < 0)
  if (hasNegativeHydric) {
    errorMessage.value = 'L\'apport hydrique ne peut pas être négatif'
    return
  }
  
  for (const miction of currentDay.value.mictions) {
    if (miction.volume < 0) {
      errorMessage.value = 'Les volumes ne peuvent pas être négatifs'
      return
    }
  }
  
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    const userStr = sessionStorage.getItem('alth_user') || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || user.id || null
    const payload = {
      patientId: patientId,
      formType: 'Mictionnel',
      date: currentDay.value.date,
      week: getWeekInfo().current,
      answers: {
        mictions: currentDay.value.mictions.map(m => ({
          time: m.time,
          volume: m.volume,
          urge: m.urge,
          particularities: m.particularities,
          circumstances: m.circumstances,
          precautionDetails: m.precautionDetails.length > 0 ? m.precautionDetails : undefined,
        })),
        leaks: currentDay.value.leaks.map(leak => ({
          time: leak.time,
          intensity: leak.intensity,
          circumstances: leak.circumstances,
          otherText: leak.otherText,
        })),
        hydricIntakes: currentDay.value.hydricIntakes.map(h => ({
          time: h.time,
          drinkType: h.drinkType,
          quantity: h.quantity,
          otherDrink: h.otherDrink,
        })),
      },
      scores: {
        totalUrine: currentDay.value.totalUrine,
        totalLeaks: currentDay.value.totalLeaks,
      }
    }
    
    await apiClient.post('/formSubmission/add', payload)
    
    // Save to local results
    if (currentDay.value) {
      saveToDayResults({
        date: currentDay.value.date,
        mictions: currentDay.value.mictions,
        leaks: currentDay.value.leaks,
        hydricIntakes: currentDay.value.hydricIntakes,
        totalUrine: currentDay.value.totalUrine,
        totalLeaks: currentDay.value.totalLeaks,
      })
    }

    successMessage.value = 'Données enregistrées'
    setTimeout(() => {
      goToScreen('monthly')
    }, 1500)
  } catch (error: any) {
    // Even if API fails, save locally
    if (currentDay.value) {
      saveToDayResults({
        date: currentDay.value.date,
        mictions: currentDay.value.mictions,
        leaks: currentDay.value.leaks,
        hydricIntakes: currentDay.value.hydricIntakes,
        totalUrine: currentDay.value.totalUrine,
        totalLeaks: currentDay.value.totalLeaks,
      })
    }
    errorMessage.value = 'Données sauvegardées localement'
  } finally {
    loading.value = false
  }
}

const loadDemoData = () => {
  seedAllDemoData()
  loadSavedResults()
  successMessage.value = 'Données de démo chargées avec succès !'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

onMounted(() => {
  initializeCalendar()
  loadSavedResults()
})
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-6 pb-32">
    <!-- Dashboard Screen -->
    <div v-if="currentScreen === 'dashboard'" class="space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold mb-2">Calendrier Mictionnel</h1>
        <p class="text-sm text-gray-600">Suivi sur 3 mois à partir de S+4</p>
      </div>

      <div v-if="successMessage" class="rounded-xl bg-green-50 border border-green-200 p-4">
        <p class="text-sm text-green-700 font-medium">✓ {{ successMessage }}</p>
      </div>

      <button
        @click="goToScreen('monthly')"
        class="w-full rounded-full bg-brand-primary text-white font-semibold py-3 transition"
      >
        Accéder au calendrier
      </button>

      <button
        @click="goToScreen('report')"
        class="w-full rounded-full bg-brand-secondary text-white font-semibold py-3 transition hover:opacity-90"
      >
        <p>Synthèse des résultats</p>
      </button>
    </div>

    <!-- Monthly Screen -->
    <div v-if="currentScreen === 'monthly'" class="space-y-6">
      <div class="flex items-center justify-between">
        <button @click="goToScreen('dashboard')" class="text-sm font-semibold text-brand-primary">← Retour</button>
        <h2 class="text-lg font-extrabold">Calendrier Mictionnel</h2>
      </div>

      <div class="space-y-4">
        <div v-for="(month, monthIdx) in calendarData.months" :key="monthIdx" class="rounded-xl border border-gray-100 bg-white p-4">
          <h3 class="font-semibold text-gray-800 mb-3">{{ getMonthName(month.month) }} {{ month.year }}</h3>
          
          <div class="space-y-2">
            <div v-for="(day, dayIdx) in month.days" :key="dayIdx" class="p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition" @click="goToDailyEntry(monthIdx, dayIdx)">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-800">Jour {{ dayIdx + 1 }} - {{ new Date(day.date).toLocaleDateString('fr-FR') }}</span>
                <span class="text-xs bg-brand-primary text-white px-2 py-1 rounded-full" v-if="day.mictions.length > 0">{{ day.mictions.length }} mictions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Entry Screen -->
    <div v-if="currentScreen === 'daily'" class="space-y-6">
      <div class="flex items-center justify-between mb-2">
        <button @click="goToScreen('monthly')" class="text-sm font-semibold text-brand-primary hover:opacity-75 transition">← Retour</button>
        <h1 class="text-2xl font-extrabold text-gray-900">Saisie quotidienne</h1>
        <button @click="goToScreen('report')" class="text-sm font-semibold text-brand-primary">📊</button>
      </div>

      <div v-if="currentDay" class="space-y-6">
        <div class="bg-gradient-to-r from-brand-primary/10 to-brand-primary/15 rounded-2xl border border-brand-primary/30 p-5">
          <p class="text-base text-gray-900 font-bold">{{ (new Date(currentDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })).charAt(0).toUpperCase() + (new Date(currentDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })).slice(1) }}</p>
        </div>

        <div v-if="errorMessage" class="rounded-xl bg-red-50 border border-red-200 p-4">
          <p class="text-sm text-red-700 font-medium">⚠️ {{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="rounded-xl bg-green-50 border border-green-200 p-4">
          <p class="text-sm text-green-700 font-medium">✓ {{ successMessage }}</p>
        </div>

        <!-- Mictions -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-gray-900">Mictions</h3>
            <span class="text-xs font-semibold bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">{{ currentDay.mictions.filter(m => m.isOpen).length }}</span>
          </div>
          <div v-for="(miction, idx) in currentDay.mictions.filter(m => m.isOpen)" :key="idx" class="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 space-y-4 shadow-sm hover:shadow-md transition">
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
              <span class="font-bold text-base text-gray-900">Miction {{ idx + 1 }}</span>
              <button @click="removeMiction(idx)" class="text-xs text-red-600 hover:text-red-700 font-semibold transition">Supprimer</button>
            </div>

            <div v-if="miction.isOpen" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs text-gray-600 font-medium">Heure</p>
                  <p class="text-lg font-bold text-gray-900">{{ miction.time }}</p>
                </div>
                <div class="bg-brand-primary/5 rounded-lg p-3">
                  <p class="text-xs text-brand-primary font-medium">Volume</p>
                  <p class="text-lg font-bold text-brand-primary">{{ miction.volume }} ml</p>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-3">
                  <label class="text-sm font-bold text-gray-900">Volume (ml)</label>
                  <span class="text-sm font-bold bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">{{ miction.volume }}</span>
                </div>
                <input
                  v-model.number="miction.volume"
                  @change="calculateDayTotals"
                  type="range"
                  min="0"
                  max="1000"
                  class="w-full h-3 rounded-full appearance-none cursor-pointer accent-brand-primary"
                  :style="{ backgroundImage: `linear-gradient(to right, #b6a943 0%, #b6a943 ${(miction.volume / 1000) * 100}%, #e5e7eb ${(miction.volume / 1000) * 100}%, #e5e7eb 100%)` }"
                />
              </div>

              <div>
                <div class="flex justify-between items-center mb-3">
                  <label class="text-sm font-bold text-gray-900"><p>Envie</p></label>
                  <span class="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{{ ['Aucune', 'Petite', 'Normale', 'Urgente'][miction.urge] }}</span>
                </div>
                <input
                  v-model.number="miction.urge"
                  type="range"
                  min="0"
                  max="3"
                  class="w-full h-3 rounded-full appearance-none cursor-pointer accent-brand-primary"
                  :style="{ backgroundImage: `linear-gradient(to right, #b6a943 0%, #b6a943 ${(miction.urge / 3) * 100}%, #e5e7eb ${(miction.urge / 3) * 100}%, #e5e7eb 100%)` }"
                />
                <div class="flex justify-between text-xs text-gray-600 font-medium mt-2">
                  <span>Aucune</span>
                  <span>Petite</span>
                  <span>Normale</span>
                  <span>Urgente</span>
                </div>
              </div>

              <!-- Remarques Section -->
              <div class="border-t border-gray-200 pt-5 mt-4">
                <h4 class="text-sm font-bold text-gray-900 mb-4">Remarques</h4>

                <!-- Particularités de la miction -->
                <div class="mb-5">
                  <label class="text-sm font-bold text-gray-900 block mb-3">Particularités</label>
                  <div class="space-y-2">
                    <label
                      v-for="option in particularitiesOptions"
                      :key="option"
                      class="flex items-start gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :checked="miction.particularities.includes(option)"
                        @change="handleCheckboxChange(miction.particularities, option, $event)"
                        class="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                      />
                      <span class="text-sm text-gray-800"><p>{{ option }}</p></span>
                    </label>
                  </div>
                </div>

                <!-- Circonstances de survenue -->
                <div class="mb-4">
                  <label class="text-sm font-bold text-gray-900 block mb-3">Circonstances</label>
                  <div class="space-y-2">
                    <label
                      v-for="option in circumstancesOptions"
                      :key="option"
                      class="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :checked="miction.circumstances.includes(option)"
                        @change="handleCheckboxChange(miction.circumstances, option, $event)"
                        class="w-4 h-4 rounded"
                      />
                      <span class="text-sm text-gray-800">{{ option }}</span>
                    </label>

                    <!-- Précaution details (conditional) -->
                    <div
                      v-if="miction.circumstances.includes('P = Précaution')"
                      class="ml-4 mt-3 p-3 rounded-lg border border-blue-200 bg-blue-50"
                    >
                      <label class="text-xs font-semibold text-gray-700 block mb-2">Précaution - situations applicables</label>
                      <div class="space-y-2">
                        <label
                          v-for="precOption in precautionOptions"
                          :key="precOption"
                          class="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            :checked="miction.precautionDetails.includes(precOption)"
                            @change="handleCheckboxChange(miction.precautionDetails, precOption, $event)"
                            class="w-4 h-4 rounded"
                          />
                          <span class="text-sm text-gray-800">{{ precOption }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bouton Valider -->
              <button @click="toggleMictionEdit(miction)" class="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white font-bold py-3 transition hover:shadow-md">
                Valider
              </button>
            </div>

            <!-- Affichage en lecture seule quand fermée -->
            <div v-else class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Heure:</span>
                <span class="font-semibold text-gray-800">{{ miction.time }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Volume:</span>
                <span class="font-semibold text-gray-800">{{ miction.volume }} ml</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Envie:</span>
                <span class="font-semibold text-gray-800">{{ miction.urge }}</span>
              </div>
              <div v-if="miction.particularities.length > 0" class="flex justify-between">
                <span class="text-gray-600">Particularités:</span>
                <span class="font-semibold text-gray-800">{{ miction.particularities.length }} s��lectionnée(s)</span>
              </div>
              <div v-if="miction.circumstances.length > 0" class="flex justify-between">
                <span class="text-gray-600">Circonstances:</span>
                <span class="font-semibold text-gray-800">{{ miction.circumstances.join(', ') }}</span>
              </div>
            </div>
          </div>

          <button
            @click="addMiction"
            :disabled="currentDay.mictions.some(m => m.isOpen)"
            class="w-full rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold py-4 transition hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span class="text-lg">+</span> Ajouter une miction
          </button>
        </div>

        <!-- Fuites -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-gray-900">Fuites</h3>
            <span class="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{{ currentDay.leaks.length }}</span>
          </div>
          <button
            @click="addLeak"
            :disabled="currentDay.leaks.some(l => l.isOpen)"
            class="w-full rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold py-4 transition hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span class="text-lg">+</span> Ajouter une fuite
          </button>

          <!-- Liste des fuites -->
          <div v-for="(leak, leakIdx) in currentDay.leaks.filter(l => l.isOpen)" :key="leakIdx" class="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition">
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
              <span class="font-bold text-base text-gray-900">Fuite {{ leakIdx + 1 }}</span>
              <button @click="removeLeak(leakIdx)" class="text-xs text-red-600 hover:text-red-700 font-semibold transition">Supprimer</button>
            </div>

            <div v-if="leak.isOpen" class="space-y-5">
              <div class="bg-gray-50 rounded-lg p-3 w-32">
                <p class="text-xs text-gray-600 font-medium">Heure</p>
                <p class="text-lg font-bold text-gray-900">{{ leak.time }}</p>
              </div>

              <!-- Survenue (intensité) -->
              <div>
                <label class="text-sm font-bold text-gray-900 block mb-3">Intensité</label>
                <div class="flex gap-2">
                  <button
                    v-for="intensity in ['+', '++', '+++']"
                    :key="intensity"
                    @click="leak.intensity = intensity"
                    :class="leak.intensity === intensity ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-800 border border-gray-200'"
                    class="flex-1 rounded-lg py-2 text-sm font-semibold transition"
                  >
                    {{ intensity }}
                  </button>
                </div>
              </div>

              <!-- Circonstances (checkboxes) -->
              <div>
                <label class="text-sm font-bold text-gray-900 block mb-3">Circonstances</label>
                <div class="space-y-2">
                  <label
                    v-for="option in leakCircumstancesOptions"
                    :key="option"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :checked="leak.circumstances.includes(option)"
                      @change="(e) => {
                        const isChecked = (e.target as HTMLInputElement).checked
                        if (isChecked && !leak.circumstances.includes(option)) {
                          leak.circumstances.push(option)
                        } else if (!isChecked) {
                          leak.circumstances = leak.circumstances.filter(c => c !== option)
                        }
                      }"
                      class="w-4 h-4 rounded"
                    />
                    <span class="text-sm text-gray-800">{{ option }}</span>
                  </label>

                  <!-- Autre cas text field -->
                  <input
                    v-if="leak.circumstances.includes('Autre cas')"
                    v-model="leak.otherText"
                    type="text"
                    placeholder="Préciser..."
                    class="w-full rounded-lg border border-gray-200 p-2 text-sm mt-2"
                  />
                </div>
              </div>

              <!-- Bouton Valider -->
              <button @click="toggleLeakEdit(leak)" class="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white font-bold py-3 transition hover:shadow-md">
                Valider
              </button>
            </div>
          </div>

        </div>

        <!-- Hydric Intakes -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-gray-900">Apport hydrique</h3>
            <span class="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{{ currentDay.hydricIntakes.length }}</span>
          </div>
          <button
            @click="addHydricIntake"
            :disabled="currentDay.hydricIntakes.some(h => h.isOpen)"
            class="w-full rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-semibold py-4 transition hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span class="text-lg">+</span> Ajouter apport hydrique
          </button>

          <!-- Liste des apports hydriques -->
          <div v-for="(hydricIntake, hIdx) in currentDay.hydricIntakes.filter(h => h.isOpen)" :key="hIdx" class="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition">
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
              <span class="font-bold text-base text-gray-900">Apport {{ hIdx + 1 }}</span>
              <button @click="removeHydricIntake(hIdx)" class="text-xs text-red-600 hover:text-red-700 font-semibold transition">Supprimer</button>
            </div>

            <div v-if="hydricIntake.isOpen" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs text-gray-600 font-medium">Heure</p>
                  <p class="text-lg font-bold text-gray-900">{{ hydricIntake.time }}</p>
                </div>
                <div class="bg-brand-primary/5 rounded-lg p-3">
                  <p class="text-xs text-brand-primary font-medium">Quantité</p>
                  <p class="text-lg font-bold text-brand-primary">{{ hydricIntake.quantity }} ml</p>
                </div>
              </div>

              <!-- Type de boisson -->
              <div>
                <label class="text-sm font-bold text-gray-900 block mb-3">Type de boisson</label>
                <select v-model="hydricIntake.drinkType" class="w-full rounded-lg border border-gray-200 p-2 text-sm">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="drink in drinkTypeOptions" :key="drink" :value="drink">{{ drink }}</option>
                </select>

                <!-- Autre drink text field -->
                <input
                  v-if="hydricIntake.drinkType === 'Autre'"
                  v-model="hydricIntake.otherDrink"
                  type="text"
                  placeholder="Préciser le type..."
                  class="w-full rounded-lg border border-gray-200 p-2 text-sm mt-2"
                />
              </div>

              <!-- Quantité -->
              <div>
                <div class="flex justify-between items-center mb-3">
                  <label class="text-sm font-bold text-gray-900">Quantité (mL)</label>
                  <span class="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{{ hydricIntake.quantity }}</span>
                </div>
                <input
                  v-model.number="hydricIntake.quantity"
                  type="range"
                  min="0"
                  max="500"
                  class="w-full h-3 rounded-full appearance-none cursor-pointer accent-brand-primary"
                  :style="{ backgroundImage: `linear-gradient(to right, #b6a943 0%, #b6a943 ${(hydricIntake.quantity / 500) * 100}%, #e5e7eb ${(hydricIntake.quantity / 500) * 100}%, #e5e7eb 100%)` }"
                />

                <!-- Repères de mesure -->
                <div class="text-xs text-gray-700 space-y-1 bg-gray-100/50 p-3 rounded-lg border border-gray-200">
                  <p class="font-semibold text-gray-900 mb-2">Repères utiles:</p>
                  <div class="space-y-1">
                    <button
                      v-for="ref in drinkMeasureReferences"
                      :key="ref.value"
                      @click="hydricIntake.quantity = ref.value"
                      class="block w-full text-left px-2 py-1 rounded hover:bg-blue-100 transition text-gray-800"
                    >
                      {{ ref.label }} ≈ {{ ref.value }} mL
                    </button>
                  </div>
                </div>
              </div>

              <!-- Bouton Valider -->
              <button @click="toggleHydricIntakeEdit(hydricIntake)" class="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white font-bold py-3 transition hover:shadow-md">
                Valider
              </button>
            </div>

            <!-- Affichage en lecture seule quand fermée -->
            <div v-else class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Heure:</span>
                <span class="font-semibold text-gray-800">{{ hydricIntake.time }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Type:</span>
                <span class="font-semibold text-gray-800">{{ hydricIntake.drinkType === 'Autre' ? hydricIntake.otherDrink : hydricIntake.drinkType }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Quantité:</span>
                <span class="font-semibold text-gray-800">{{ hydricIntake.quantity }} mL</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Summary Screen -->
    <div v-if="currentScreen === 'summary'" class="space-y-6">
      <div class="flex items-center justify-between">
        <button @click="goToScreen('dashboard')" class="text-sm font-semibold text-brand-primary">← Retour</button>
        <h2 class="text-lg font-extrabold">Résum��</h2>
        <div></div>
      </div>

      <div class="space-y-4">
        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Moyennes sur 3 mois</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-gray-600">Mictions/jour:</span> <strong>{{ stats.avgMictionsPerDay }}</strong></div>
            <div class="flex justify-between"><span class="text-gray-600">Volume/miction:</span> <strong>{{ stats.avgVolumePerMiction }} ml</strong></div>
            <div class="flex justify-between"><span class="text-gray-600">Pertes/jour:</span> <strong>{{ stats.avgLeaksPerDay }} ml</strong></div>
            <div class="flex justify-between"><span class="text-gray-600">Apport/jour:</span> <strong>{{ stats.avgHydricPerDay }} ml</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Screen -->
    <div v-if="currentScreen === 'report'" class="space-y-8">
      <div class="flex items-center justify-between mb-8">
        <button @click="goToScreen('dashboard')" class="text-sm font-semibold text-brand-primary">← Retour</button>
        <h1 class="text-2xl font-extrabold">Résultats</h1>
        <div></div>
      </div>

      <!-- Données générales par mois -->
      <div class="space-y-4 mt-8">
        <h2 class="text-xl font-bold text-gray-800">Données générales par mois</h2>

        <div v-if="monthlyStats.length === 0" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p class="text-sm text-gray-600">Aucune donnée disponible</p>
        </div>

        <div v-else class="overflow-x-auto rounded-xl border border-gray-200">
          <table class="w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-800">Mois</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-800">Jours mesurés</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-800">Mictions moy/jour</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-800">Volume urinaire moy/jour (ml)</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-800">Volume perdu moy/jour (ml)</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-800">Apport hydrique moy/jour (ml)</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="month in monthlyStats" :key="`${month.year}-${month.monthIndex}`" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-semibold text-gray-800">{{ month.month }} {{ month.year }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ month.daysWithData }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ month.avgMictionsPerDay }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ month.totalVolumePerDay }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ month.avgLeaksPerDay }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ month.avgHydricPerDay }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Synthèse globale -->
      <div class="space-y-6 mt-8">
        <p class="text-xl font-bold text-gray-800">Synthèse globale</p>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Mictions moy/jour</p>
            <p class="text-4xl font-bold text-gray-900">{{ globalStats.avgMictionsPerDay }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Volume moy/jour (ml)</p>
            <p class="text-4xl font-bold text-gray-900">{{ (globalStats.avgMictionsPerDay * globalStats.avgVolumePerMiction).toFixed(1) }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Fuites moy/jour</p>
            <p class="text-4xl font-bold text-gray-900">{{ globalStats.avgLeaksPerDay }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Apport hydrique moy/jour (ml)</p>
            <p class="text-4xl font-bold text-gray-900">{{ globalStats.avgHydricPerDay }}</p>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div v-if="weeklyChartData.length > 0" class="space-y-8 mt-8">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Mictions per day chart -->
          <div class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Nombre de mictions par jour</h3>
            <Chart type="bar" :data="mictionsChartData" :options="chartOptions" />
          </div>

          <!-- Volume per day chart -->
          <div class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Volume urinaire total par jour (ml)</h3>
            <Chart type="bar" :data="volumeChartData" :options="chartOptions" />
          </div>

          <!-- Leaks per day chart -->
          <div class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Nombre de fuites par jour</h3>
            <Chart type="bar" :data="leaksChartData" :options="chartOptions" />
          </div>

          <!-- Hydric intake per day chart -->
          <div class="rounded-xl border border-gray-200 bg-white p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Apport hydrique par jour (ml)</h3>
            <Chart type="bar" :data="hydricChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div v-else class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p class="text-sm text-gray-600">Pas de données de graphique disponibles</p>
      </div>
    </div>
  </section>
</template>
