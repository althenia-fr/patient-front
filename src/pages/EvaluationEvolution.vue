<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { saveResult } from '@/utils/questionnaireResults'
import apiClient from '@/services/core/apiClient'

const router = useRouter()

type Screen = 'accueil' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'results'

interface EvaluationData {
  date: string
  urgenturies: { nombre: number | null }
  mictions_nocturnes: { nombre: number | null }
  fuites_urinaires: { nombre: number | null }
  douleur: { miction_eva: number | null; hors_miction_eva: number | null }
  protections: { etat: string | null; evolution: string | null }
}

const currentScreen = ref<Screen>('accueil')
const data = ref<EvaluationData>({
  date: '',
  urgenturies: { nombre: null },
  mictions_nocturnes: { nombre: null },
  fuites_urinaires: { nombre: null },
  douleur: { miction_eva: null, hors_miction_eva: null },
  protections: { etat: null, evolution: null },
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const protectionEtatOptions = ['Sèche', 'Humide', 'Saturée']
const protectionEvolutionOptions = ['Diminution', 'Stable', 'Augmentation']

const canStartQuestionnaire = computed(() => true)

const allAnswersProvided = computed(() => {
  return (
    data.value.urgenturies.nombre !== null &&
    data.value.mictions_nocturnes.nombre !== null &&
    data.value.fuites_urinaires.nombre !== null &&
    data.value.douleur.miction_eva !== null &&
    data.value.douleur.hors_miction_eva !== null &&
    data.value.protections.etat !== null &&
    data.value.protections.evolution !== null
  )
})

const goToScreen = (screen: Screen) => {
  errorMessage.value = ''
  successMessage.value = ''
  currentScreen.value = screen
}

const goNext = () => {
  const order: Screen[] = ['accueil', 'q1', 'q2', 'q3', 'q4', 'q5', 'results']
  const idx = order.indexOf(currentScreen.value)
  if (idx < order.length - 1) {
    if (currentScreen.value === 'accueil') {
      data.value.date = getCurrentDate()
    }
    goToScreen(order[idx + 1])
  }
}

const getCurrentDate = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

const goPrev = () => {
  const order: Screen[] = ['accueil', 'q1', 'q2', 'q3', 'q4', 'q5', 'results']
  const idx = order.indexOf(currentScreen.value)
  if (idx > 0) {
    goToScreen(order[idx - 1])
  }
}

const submitQuestionnaire = async () => {
  if (!allAnswersProvided.value) return

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const userStr = sessionStorage.getItem('alth_user') || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || user.id || null
    const payload = {
      patientId: patientId,
      formType: 'Evolution Thérapeutique',
      date: data.value.date,
      answers: {
        urgenturies: data.value.urgenturies,
        mictions_nocturnes: data.value.mictions_nocturnes,
        fuites_urinaires: data.value.fuites_urinaires,
        douleur: data.value.douleur,
        protections: data.value.protections,
      },
    }

    saveResult('Evolution Thérapeutique', payload)

    const response = await apiClient.post('/formSubmission/add', payload).catch(() => null)

    successMessage.value = 'Questionnaire envoyé avec succès !'
    setTimeout(() => {
      router.push({ name: 'questionnaire-results' })
    }, 1500)
  } catch (error: any) {
    errorMessage.value = 'Erreur d\'envoi, veuillez réessayer'
  } finally {
    loading.value = false
  }
}

const formatRangeValue = (value: number | null, max: number): string => {
  if (value === null) return '0'
  return String(value)
}
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <!-- Accueil Screen -->
    <div v-if="currentScreen === 'accueil'" class="space-y-6">
      <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <h1 class="text-2xl font-extrabold mb-3">Évaluation Évolution Thérapeutique</h1>
        <p class="text-sm text-gray-600 leading-relaxed">
          Ce questionnaire permet d'évaluer l'évolution de vos troubles urinaires et l'efficacité de votre traitement.
        </p>
        <p class="text-sm text-gray-600 leading-relaxed mt-3">
          Il comprend 5 questions qui vous permettront de documenter les changements observés.
        </p>
        <p class="text-sm text-gray-600 leading-relaxed mt-3">
          Prenez quelques minutes pour répondre honnêtement à chaque question.
        </p>
      </div>

      <button
        :disabled="!canStartQuestionnaire"
        @click="goNext"
        class="w-full rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Commencer
      </button>
    </div>

    <!-- Question 1: Urgenturies -->
    <div v-if="currentScreen === 'q1'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Question 1 — Urgenturies</h2>

      <div class="space-y-4">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">{{ 'Nombre d\'urgenturies' }}</h3>
          <div class="space-y-4">
            <input
              v-model.number="data.urgenturies.nombre"
              type="range"
              min="0"
              max="20"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">0</span>
              <span class="text-2xl font-bold text-brand-primary">{{ formatRangeValue(data.urgenturies.nombre, 20) }}</span>
              <span class="text-sm text-gray-600">20</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" :disabled="data.urgenturies.nombre === null" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Question 2: Mictions nocturnes -->
    <div v-if="currentScreen === 'q2'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Question 2 — Mictions nocturnes</h2>

      <div class="space-y-4">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">Nombre de mictions nocturnes</h3>
          <div class="space-y-4">
            <input
              v-model.number="data.mictions_nocturnes.nombre"
              type="range"
              min="0"
              max="10"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">0</span>
              <span class="text-2xl font-bold text-brand-primary">{{ formatRangeValue(data.mictions_nocturnes.nombre, 10) }}</span>
              <span class="text-sm text-gray-600">10</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" :disabled="data.mictions_nocturnes.nombre === null" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Question 3: Fuites urinaires -->
    <div v-if="currentScreen === 'q3'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Question 3 — Fuites urinaires</h2>

      <div class="space-y-4">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">Nombre de fuites urinaires</h3>
          <div class="space-y-4">
            <input
              v-model.number="data.fuites_urinaires.nombre"
              type="range"
              min="0"
              max="10"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">0</span>
              <span class="text-2xl font-bold text-brand-primary">{{ formatRangeValue(data.fuites_urinaires.nombre, 10) }}</span>
              <span class="text-sm text-gray-600">10</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" :disabled="data.fuites_urinaires.nombre === null" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Question 4: Douleur -->
    <div v-if="currentScreen === 'q4'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Question 4 — Douleur</h2>

      <div class="space-y-6">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">Douleur pendant la miction</h3>
          <div class="space-y-4">
            <input
              v-model.number="data.douleur.miction_eva"
              type="range"
              min="0"
              max="10"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">0</span>
              <span class="text-2xl font-bold text-brand-primary">{{ formatRangeValue(data.douleur.miction_eva, 10) }}</span>
              <span class="text-sm text-gray-600">10</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">Douleur pelvienne/périnéale hors miction</h3>
          <div class="space-y-4">
            <input
              v-model.number="data.douleur.hors_miction_eva"
              type="range"
              min="0"
              max="10"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">0</span>
              <span class="text-2xl font-bold text-brand-primary">{{ formatRangeValue(data.douleur.hors_miction_eva, 10) }}</span>
              <span class="text-sm text-gray-600">10</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" :disabled="data.douleur.miction_eva === null || data.douleur.hors_miction_eva === null" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Question 5: Protections -->
    <div v-if="currentScreen === 'q5'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Question 5 — Protections</h2>

      <div class="space-y-6">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">État de la protection</h3>
          <div class="space-y-2">
            <label v-for="option in protectionEtatOptions" :key="option" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <input
                type="radio"
                name="protection-etat"
                :value="option"
                :checked="data.protections.etat === option"
                @change="data.protections.etat = option"
                class="w-4 h-4"
              />
              <span class="text-sm text-gray-800">{{ option }}</span>
            </label>
          </div>
        </div>

        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800 mb-4">Évolution par rapport à d'habitude</h3>
          <div class="space-y-2">
            <label v-for="option in protectionEvolutionOptions" :key="option" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <input
                type="radio"
                name="protection-evolution"
                :value="option"
                :checked="data.protections.evolution === option"
                @change="data.protections.evolution = option"
                class="w-4 h-4"
              />
              <span class="text-sm text-gray-800">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" :disabled="data.protections.etat === null || data.protections.evolution === null" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Résultats
        </button>
      </div>
    </div>

    <!-- Results & Submission Screen -->
    <div v-if="currentScreen === 'results'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Résultats et Envoi</h2>

      <div v-if="errorMessage" class="rounded-xl bg-red-50 border border-red-200 p-4">
        <p class="text-sm text-red-800">{{ errorMessage }}</p>
      </div>

      <div v-if="successMessage" class="rounded-xl bg-green-50 border border-green-200 p-4">
        <p class="text-sm text-green-800">{{ successMessage }}</p>
      </div>

      <div class="space-y-4">
        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-start gap-2">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Urgenturies</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.urgenturies.nombre }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-start gap-2">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Mictions nocturnes</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.mictions_nocturnes.nombre }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-start gap-2">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Fuites urinaires</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.fuites_urinaires.nombre }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="space-y-3">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Douleur pendant la miction</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.douleur.miction_eva }}/10</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Douleur hors miction</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.douleur.hors_miction_eva }}/10</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="space-y-3">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">État de la protection</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.protections.etat }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Évolution</p>
              <p class="text-lg font-semibold text-gray-800">{{ data.protections.evolution }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Retour
        </button>
        <button
          @click="submitQuestionnaire"
          :disabled="loading || !allAnswersProvided"
          class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Envoi...' : 'Envoyer' }}
        </button>
      </div>
    </div>
  </section>
</template>
