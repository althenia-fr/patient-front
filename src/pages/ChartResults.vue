<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TooltipItem, Plugin } from 'chart.js'
import { Line } from 'vue-chartjs'
import { getChartDataByWeek, type ChartDataPoint } from '@/utils/chartData'
import { getResults } from '@/utils/questionnaireResults'
import { getOnboarding } from '@/utils/onboarding'

// Enregistrer les plugins Chart.js de base
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const chartData = ref<ChartDataPoint[]>([])

// Calculer la semaine d'appareillage apnée sommeil
const sleepApneaWeek = computed(() => {
  const onb = getOnboarding()
  if (!onb?.deviceSleepDate || !onb?.protocolStartDate) return -1

  const protocolStart = new Date(onb.protocolStartDate)
  const sleepDate = new Date(onb.deviceSleepDate)

  // Calculer la différence en jours
  const diffTime = sleepDate.getTime() - protocolStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Convertir en semaine (1-indexed)
  const week = Math.floor(diffDays / 7) + 1
  return week > 0 ? week : -1
})

// Toggles pour chaque dataset
const visibleDatasets = ref({
  usp: true,
  qualiveen: true,
  pgi: true,
  satisfaction: true,
  evolution: true,
})

// Plugin pour dessiner un losange à la position de l'appareillage apnée sommeil
const sleepApneaMarkerPlugin: Plugin = {
  id: 'sleepApneaMarker',
  afterDatasetsDraw(chart: any) {
    const week = sleepApneaWeek.value
    if (week < 0) return

    const ctx = chart.ctx
    const xScale = chart.scales.x
    const yScale = chart.scales.y

    // Trouver l'index de la semaine dans les labels
    const labels = chart.data.labels || []
    const weekIndex = labels.findIndex((label: string) => parseInt(label.replace('S', '')) === week)

    if (weekIndex === -1) return

    // Obtenir les coordonnées x et y
    const x = xScale.getPixelForValue(weekIndex)
    const yTop = yScale.getPixelForValue(7) // Haut du graphique
    const yBottom = yScale.getPixelForValue(0) // Bas du graphique

    // Dessiner un losange rouge vertical
    const diamondSize = 12

    ctx.save()
    ctx.fillStyle = '#EF4444' // Rouge
    ctx.strokeStyle = '#DC2626' // Rouge foncé
    ctx.lineWidth = 2

    // Dessiner le losange (carré tourné à 45°)
    ctx.beginPath()
    ctx.moveTo(x, yTop + diamondSize) // Point bas
    ctx.lineTo(x + diamondSize, yTop) // Point droit
    ctx.lineTo(x, yTop - diamondSize) // Point haut
    ctx.lineTo(x - diamondSize, yTop) // Point gauche
    ctx.closePath()

    ctx.fill()
    ctx.stroke()

    // Ajouter une ligne verticale de l'appareillage
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(x, yTop)
    ctx.lineTo(x, yBottom)
    ctx.stroke()

    ctx.restore()
  }
}

// Options pour le graphique combiné
const combinedChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    sleepApneaMarker: {
      enabled: true,
    },
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Résultats des Questionnaires et Évolution Thérapeutique',
      font: { size: 16, weight: 'bold' as const },
    },
    tooltip: {
      callbacks: {
        afterLabel: function(context: any) {
          const weekIndex = context.dataIndex
          const data = chartData.value[weekIndex]
          const label = context.dataset.label

          // Détail pour USP
          if (label === 'USP') {
            // Récupérer les données USP originales
            const uspResults = getResults().filter(r => r.week === data.week && r.questionnaireName === 'USP')
            if (uspResults.length > 0) {
              const latest = uspResults[uspResults.length - 1]
              if (latest.data.effort && latest.data.hyper && latest.data.dysurie) {
                const effort = (latest.data.effort.q1 || 0) + (latest.data.effort.q2 || 0) + (latest.data.effort.q3 || 0)
                const hyper = (latest.data.hyper.q1 || 0) + (latest.data.hyper.q2 || 0) + (latest.data.hyper.q3 || 0) + (latest.data.hyper.q4 || 0) + (latest.data.hyper.q5 || 0) + (latest.data.hyper.q6 || 0) + (latest.data.hyper.q7 || 0)
                const dysurie = (latest.data.dysurie.q1 || 0) + (latest.data.dysurie.q2 || 0) + (latest.data.dysurie.q3 || 0)
                return [
                  '',
                  'Détail des 39 points:',
                  `Effort: ${effort}/9`,
                  `Hyperactivité: ${hyper}/21`,
                  `Dysurie: ${dysurie}/9`,
                  `Total: ${effort + hyper + dysurie}/39`,
                ]
              }
            }
          }

          // Détail pour Évolution Thérapeutique
          if (label === 'Évolution Thérapeutique') {
            if (data?.evolutionData) {
              return [
                '',
                'Détail des 7 métriques:',
                `Urgences: ${data.evolutionData.urgences.toFixed(1)}/7`,
                `Mictions nocturnes: ${data.evolutionData.nuit.toFixed(1)}/7`,
                `Fuites urinaires: ${data.evolutionData.fuites.toFixed(1)}/7`,
                `Douleur miction: ${data.evolutionData.douleurMiction.toFixed(1)}/7`,
                `Douleur hors miction: ${data.evolutionData.douleurHorsMiction.toFixed(1)}/7`,
                `État protection: ${data.evolutionData.etatProtection.toFixed(1)}/7`,
                `Évolution protection: ${data.evolutionData.evolutionProtection.toFixed(1)}/7`,
              ]
            }
          }

          return ''
        },
      },
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

// Préparer les données combinées (courbes + barres) pour un seul graphique
function getCombinedChartData() {
  // Générer les labels pour toutes les semaines présentes
  const weeks = chartData.value.map((d) => `S${d.week}`)

  // Obtenir tous les questionnaires disponibles
  const hasUsp = chartData.value.some((d) => d.usp !== undefined)
  const hasQualiveen = chartData.value.some((d) => d.qualiveen !== undefined)
  const hasPgi = chartData.value.some((d) => d.pgi !== undefined)
  const hasSatisfaction = chartData.value.some((d) => d.satisfaction !== undefined)

  const datasets: any[] = []

  // Ajouter les courbes des questionnaires
  if (hasUsp && visibleDatasets.value.usp) {
    datasets.push({
      label: 'USP',
      data: chartData.value.map((d) => d.usp ?? null),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      spanGaps: true,
      type: 'line',
    })
  }

  if (hasQualiveen && visibleDatasets.value.qualiveen) {
    datasets.push({
      label: 'Qualiveen',
      data: chartData.value.map((d) => d.qualiveen ?? null),
      borderColor: '#EC4899',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      spanGaps: true,
      type: 'line',
    })
  }

  if (hasPgi && visibleDatasets.value.pgi) {
    datasets.push({
      label: 'PG-I',
      data: chartData.value.map((d) => d.pgi ?? null),
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      spanGaps: true,
      type: 'line',
    })
  }

  if (hasSatisfaction && visibleDatasets.value.satisfaction) {
    datasets.push({
      label: 'Satisfaction',
      data: chartData.value.map((d) => d.satisfaction ?? null),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      spanGaps: true,
      type: 'line',
    })
  }

  // Ajouter une barre avec la moyenne Evolution Thérapeutique
  const evolutionDataPoints = chartData.value.filter((d) => d.evolutionData)

  if (evolutionDataPoints.length > 0 && visibleDatasets.value.evolution) {
    // Calculer la moyenne des 7 métriques pour chaque semaine
    const evolutionAverages = chartData.value.map((d) => {
      if (!d.evolutionData) return null
      const metrics = [
        d.evolutionData.urgences,
        d.evolutionData.nuit,
        d.evolutionData.fuites,
        d.evolutionData.douleurMiction,
        d.evolutionData.douleurHorsMiction,
        d.evolutionData.etatProtection,
        d.evolutionData.evolutionProtection,
      ]
      const sum = metrics.reduce((acc, val) => acc + (val ?? 0), 0)
      const average = sum / metrics.length
      return average > 0 ? average : null
    })

    datasets.push({
      label: 'Évolution Thérapeutique',
      data: evolutionAverages,
      backgroundColor: 'rgba(199, 164, 229, 0.3)',
      borderColor: 'rgba(199, 164, 229, 0.6)',
      borderWidth: 1,
      type: 'bar',
      order: 1,
    })
  }

  return {
    labels: weeks,
    datasets,
  }
}

// Enregistrer le plugin de marqueur d'appareillage
ChartJS.register(sleepApneaMarkerPlugin)

onMounted(() => {
  chartData.value = getChartDataByWeek()
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6">
    <h3 class="text-3xl font-extrabold mb-6">Evaluation longitudinale</h3>

    <!-- Toggles pour afficher/masquer les datasets -->
    <div v-if="chartData.length > 0" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
      <h2 class="text-sm font-semibold text-gray-800 mb-4">Afficher/masquer les données :</h2>
      <div v-if="sleepApneaWeek > 0" class="mb-4 p-3 bg-red-50 rounded border border-red-200">
        <p class="text-xs text-red-700">
          <span class="font-semibold">◆ Losange rouge</span> = Date d'appareillage pour l'apnée du sommeil (Semaine {{ sleepApneaWeek }})
        </p>
      </div>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="visibleDatasets.usp"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 accent-blue-600"
          />
          <span class="text-sm text-gray-700 font-medium">USP</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="visibleDatasets.qualiveen"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 accent-pink-600"
          />
          <span class="text-sm text-gray-700 font-medium">Qualiveen</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="visibleDatasets.pgi"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 accent-purple-600"
          />
          <span class="text-sm text-gray-700 font-medium">PG-I</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="visibleDatasets.satisfaction"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 accent-green-600"
          />
          <span class="text-sm text-gray-700 font-medium">Satisfaction</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="visibleDatasets.evolution"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 accent-purple-500"
          />
          <span class="text-sm text-gray-700 font-medium">Évolution Thérapeutique</span>
        </label>
      </div>
    </div>

    <!-- Graphique combiné (courbes + barres) -->
    <div v-if="chartData.length > 0" class="bg-white rounded-lg shadow-lg p-6">
      <div style="height: 500px">
        <Line :data="getCombinedChartData()" :options="combinedChartOptions" />
      </div>
    </div>

    <div v-if="chartData.length === 0" class="text-center py-12">
      <p class="text-gray-500">Aucune donnée disponible pour afficher le graphique.</p>
    </div>
  </section>
</template>

<style scoped>
</style>
