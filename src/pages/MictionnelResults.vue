<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MictionEntry {
  time: string
  volume: number
  urge: 0 | 1 | 2 | 3
  particularities: string[]
  circumstances: string[]
  precautionDetails: string[]
}

interface LeakEntry {
  time: string
  intensity: '+' | '++' | '+++' | ''
  circumstances: string[]
  otherText: string
}

interface HydricIntakeEntry {
  time: string
  drinkType: string
  quantity: number
  otherDrink: string
}

interface DayResult {
  date: string
  mictions: MictionEntry[]
  leaks: LeakEntry[]
  hydricIntakes: HydricIntakeEntry[]
  totalUrine: number
  totalLeaks: number
}

const results = ref<DayResult[]>([])
const loading = ref(true)
const errorMessage = ref('')

const fetchResults = () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const stored = localStorage.getItem('mictionnel_results')
    if (stored) {
      results.value = JSON.parse(stored)
    } else {
      results.value = []
    }
  } catch (error: any) {
    errorMessage.value = 'Erreur lors de la récupération des résultats'
    results.value = []
  } finally {
    loading.value = false
  }
}

const getUrgeLabel = (urge: number): string => {
  const labels = ['Aucune (0)', 'Petite (1)', 'Normale (2)', 'Urgente (3)']
  return labels[urge] || ''
}

const getDateLabel = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchResults()
})
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <router-link to="/mictionnel" class="text-sm font-semibold text-brand-primary">← Retour</router-link>
      <h1 class="text-lg font-extrabold">Résultats</h1>
      <div></div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
      <p class="text-sm text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
      <p class="text-sm text-gray-600">Chargement des résultats...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="results.length === 0" class="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
      <p class="text-sm text-gray-600">Aucun résultat enregistré pour le moment</p>
    </div>

    <!-- Results List -->
    <div v-else class="space-y-4">
      <div v-for="(day, idx) in results" :key="idx" class="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <!-- Date Header -->
        <div class="border-b border-gray-200 pb-3">
          <h2 class="font-semibold text-gray-800">{{ getDateLabel(day.date) }}</h2>
        </div>

        <!-- Mictions Section -->
        <div v-if="day.mictions.length > 0">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Mictions ({{ day.mictions.length }})</h3>
          <div class="space-y-3">
            <div v-for="(miction, mIdx) in day.mictions" :key="mIdx" class="rounded-lg bg-gray-50 p-3 space-y-2 text-sm">
              <div class="font-semibold text-gray-800">Miction {{ mIdx + 1 }}</div>

              <div class="flex justify-between">
                <span class="text-gray-600">Heure:</span>
                <span class="font-medium text-gray-800">{{ miction.time }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Volume:</span>
                <span class="font-medium text-gray-800">{{ miction.volume }} ml</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Envie d'uriner:</span>
                <span class="font-medium text-gray-800">{{ getUrgeLabel(miction.urge) }}</span>
              </div>

              <div v-if="miction.particularities.length > 0" class="border-t border-gray-200 pt-2">
                <p class="text-xs font-semibold text-gray-700 mb-1">Particularités:</p>
                <ul class="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                  <li v-for="par in miction.particularities" :key="par" class="ml-2">{{ par }}</li>
                </ul>
              </div>

              <div v-if="miction.circumstances.length > 0" class="border-t border-gray-200 pt-2">
                <p class="text-xs font-semibold text-gray-700 mb-1">Circonstances:</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="circ in miction.circumstances" :key="circ" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {{ circ }}
                  </span>
                </div>
              </div>

              <div v-if="miction.precautionDetails && miction.precautionDetails.length > 0" class="border-t border-gray-200 pt-2">
                <p class="text-xs font-semibold text-gray-700 mb-1">Détails Précaution:</p>
                <ul class="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                  <li v-for="detail in miction.precautionDetails" :key="detail" class="ml-2">{{ detail }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Hydric Intakes Section -->
        <div v-if="day.hydricIntakes.length > 0">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Apport hydrique ({{ day.hydricIntakes.length }})</h3>
          <div class="space-y-3">
            <div v-for="(hydricIntake, hIdx) in day.hydricIntakes" :key="hIdx" class="rounded-lg bg-blue-50 p-3 space-y-2 text-sm">
              <div class="font-semibold text-gray-800">Apport {{ hIdx + 1 }}</div>

              <div class="flex justify-between">
                <span class="text-gray-600">Heure:</span>
                <span class="font-medium text-gray-800">{{ hydricIntake.time }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Type:</span>
                <span class="font-medium text-gray-800">{{ hydricIntake.drinkType === 'Autre' ? hydricIntake.otherDrink : hydricIntake.drinkType }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Quantité:</span>
                <span class="font-medium text-gray-800">{{ hydricIntake.quantity }} mL</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaks Section -->
        <div v-if="day.leaks.length > 0">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Fuites ({{ day.leaks.length }})</h3>
          <div class="space-y-3">
            <div v-for="(leak, lIdx) in day.leaks" :key="lIdx" class="rounded-lg bg-orange-50 p-3 space-y-2 text-sm">
              <div class="font-semibold text-gray-800">Fuite {{ lIdx + 1 }}</div>

              <div class="flex justify-between">
                <span class="text-gray-600">Heure:</span>
                <span class="font-medium text-gray-800">{{ leak.time }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Intensité:</span>
                <span class="font-medium text-gray-800">{{ leak.intensity || '-' }}</span>
              </div>

              <div v-if="leak.circumstances.length > 0" class="border-t border-gray-200 pt-2">
                <p class="text-xs font-semibold text-gray-700 mb-1">Circonstances:</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="circ in leak.circumstances" :key="circ" class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {{ circ }}
                  </span>
                </div>
              </div>

              <div v-if="leak.otherText" class="border-t border-gray-200 pt-2">
                <p class="text-xs font-semibold text-gray-700 mb-1">Détails:</p>
                <p class="text-xs text-gray-700">{{ leak.otherText }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t border-gray-200 pt-3 space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Volume total:</span>
            <strong class="text-gray-800">{{ day.totalUrine }} ml</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Fuites totales:</span>
            <strong class="text-gray-800">{{ day.totalLeaks }}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Apport hydrique total:</span>
            <strong class="text-gray-800">{{ day.hydricIntakes.reduce((sum, h) => sum + h.quantity, 0) }} ml</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
