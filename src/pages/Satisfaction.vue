<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { saveResult } from '@/utils/questionnaireResults'
import apiClient from '@/services/core/apiClient'
import {STORAGE_KEYS} from "@/types/api.types.ts";

const router = useRouter()

type Screen = 'accueil' | 'question' | 'results'

interface SatisfactionData {
  date: string
  satisfaction: number | null
}

const currentScreen = ref<Screen>('accueil')
const data = ref<SatisfactionData>({
  date: '',
  satisfaction: null,
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const introText = `Merci de remplir ce questionnaire pour évaluer l'évolution de vos troubles urinaires depuis la mise en place de la thérapie par neurostimulation.
Il n'y a pas de bonnes ou mauvaises réponses. Choisissez la réponse qui correspond le mieux à votre situation actuelle.`

const question = `Comment évaluez-vous l'évolution de vos troubles urinaires depuis la mise en place de la thérapie par neurostimulation ?`

const options = [
  'Très grandement améliorés',
  'Grandement améliorés',
  'Légèrement améliorés',
  'Aucun changement',
  'Légèrement aggravés',
  'Grandement aggravés',
  'Très grandement aggravés',
]

const canStartQuestionnaire = computed(() => true)

const answerProvided = computed(() => data.value.satisfaction !== null)

const goToScreen = (screen: Screen) => {
  errorMessage.value = ''
  successMessage.value = ''
  currentScreen.value = screen
}

const goNext = () => {
  const order: Screen[] = ['accueil', 'question', 'results']
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
  const order: Screen[] = ['accueil', 'question', 'results']
  const idx = order.indexOf(currentScreen.value)
  if (idx > 0) {
    goToScreen(order[idx - 1])
  }
}

const submitQuestionnaire = async () => {
  if (!answerProvided.value) return

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const userStr = sessionStorage.getItem(STORAGE_KEYS.ALTH_USER) || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || user.id || null
    const payload = {
      patientId: patientId,
      formType: 'Satisfaction',
      date: data.value.date,
      answers: { satisfaction: data.value.satisfaction },
      scores: { satisfactionScore: getNumericScore(data.value.satisfaction) },
    }

    saveResult('Satisfaction', payload)

    const response = await apiClient.post('/formSubmission/add', payload).catch(() => null)

    successMessage.value = 'Votre réponse a été enregistrée'
    setTimeout(() => {
      router.push({ name: 'questionnaire-results' })
    }, 1500)
  } catch (error: any) {
    errorMessage.value = 'Erreur d\'envoi, veuillez réessayer'
  } finally {
    loading.value = false
  }
}


const getAnswerText = (value: number | null): string => {
  if (value === null) return ''
  return options[value]
}

const getNumericScore = (index: number | null): number => {
  if (index === null) return 0
  return 6 - index
}
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <!-- Accueil Screen -->
    <div v-if="currentScreen === 'accueil'" class="space-y-6">
      <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <p>Questionnaire de satisfaction</p>
        <p class="text-sm text-gray-600 leading-relaxed">
          Merci de remplir ce questionnaire pour évaluer l'évolution
          de vos troubles urinaires depuis la mise en place de la
          thérapie par neurostimulation.
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          <br />
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">Il n'y a pas de bonnes ou mauvaises réponses. </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          <br />
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          Choisissez la réponse qui correspond le mieux à votre
          situation actuelle.
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

    <!-- Question Screen -->
    <div v-if="currentScreen === 'question'" class="space-y-6">
      <div>
        <h2 class="text-lg font-extrabold mb-4">{{ question }}</h2>
      </div>

      <div class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <label v-for="(option, idx) in options" :key="idx" class="flex items-center gap-3 p-3 cursor-pointer transition">
          <input
            type="radio"
            name="satisfaction"
            :value="idx"
            :checked="data.satisfaction === idx"
            @change="data.satisfaction = idx"
            class="w-5 h-5"
          />
          <span class="text-sm text-gray-800 font-medium">{{ option }}</span>
        </label>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" :disabled="!answerProvided" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Résultats
        </button>
      </div>
    </div>

    <!-- Results & Submission Screen -->
    <div v-if="currentScreen === 'results'" class="space-y-6">
      <h2 class="text-lg font-extrabold">Résultats et Validation</h2>

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
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Réponse sélectionnée</p>
              <p class="text-base font-semibold text-gray-800">{{ getAnswerText(data.satisfaction) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-start gap-2">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Date du questionnaire</p>
              <p class="text-base font-semibold text-gray-800">{{ data.date }}</p>
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
          :disabled="loading || !answerProvided"
          class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Envoi...' : 'Envoyer' }}
        </button>
      </div>
    </div>
  </section>
</template>
