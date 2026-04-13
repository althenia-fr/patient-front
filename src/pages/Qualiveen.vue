<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { saveResult } from '@/utils/questionnaireResults'
import apiClient from '@/services/core/apiClient'
import { getWeekInfo } from '@/utils/protocol'
import {STORAGE_KEYS} from "@/types/api.types.ts";

const router = useRouter()

type Screen = 'accueil' | 'q1-2' | 'q3-4' | 'q5-6' | 'q7-8' | 'results'

interface QuestionnaireData {
  date: string
  answers: {
    q1: number | null
    q2: number | null
    q3: number | null
    q4: number | null
    q5: number | null
    q6: number | null
    q7: number | null
    q8: number | null
  }
}

interface Scores {
  gene: number
  craintes: number
  vecu: number
  contraintes: number
  total: number
}

const currentScreen = ref<Screen>('accueil')
const data = ref<QuestionnaireData>({
  date: '',
  answers: {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
  },
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const introText = `Le Questionnaire SF-QUALIVEEN® permet d'évaluer l'impact de la douleur sur votre qualité de vie et votre gêne fonctionnelle. Ce questionnaire comprend 8 questions qui vous demandent d'évaluer votre ressenti sur une échelle de 0 à 4.

Prenez quelques minutes pour répondre honnêtement à chaque question, en fonction de votre état actuel.`

const questions = [
  {
    id: 'q1',
    text: 'Avez-vous une gêne (douleur, inconfort, sensation d\'inconfort) lors de la marche ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q2',
    text: 'Avez-vous une gêne lors d\'une station debout prolongée ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q3',
    text: 'Avez-vous des craintes ou des peurs liées à votre condition ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q4',
    text: 'Avez-vous des préoccupations concernant votre santé ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q5',
    text: 'Vivez-vous des limitations dans vos activités quotidiennes ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q6',
    text: 'Avez-vous ressenti une diminution de votre qualité de vie ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q7',
    text: 'Vous sentez-vous contraint(e) par votre condition dans votre vie sociale ?',
    options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
  },
  {
    id: 'q8',
    text: 'Avez-vous ressenti une amélioration de votre condition ?',
    options: ['Énormément / Toujours', 'Beaucoup / Souvent', 'Moyennement / De temps en temps', 'Un petit peu / Rarement', 'Pas du tout / Jamais'],
  },
]

const canStartQuestionnaire = computed(() => true)

const allAnswersProvided = computed(() => {
  const ans = data.value.answers
  return ans.q1 !== null && ans.q2 !== null && ans.q3 !== null && ans.q4 !== null &&
         ans.q5 !== null && ans.q6 !== null && ans.q7 !== null && ans.q8 !== null
})

const calculateScores = (): Scores => {
  const ans = data.value.answers
  const gene = (ans.q1! + ans.q2!) / 2
  const craintes = (ans.q3! + ans.q4!) / 2
  const vecu = (ans.q5! + ans.q6!) / 2
  const contraintes = (ans.q7! + ans.q8!) / 2
  const total = (gene + craintes + vecu + contraintes) / 4
  
  return {
    gene: Math.round(gene * 10) / 10,
    craintes: Math.round(craintes * 10) / 10,
    vecu: Math.round(vecu * 10) / 10,
    contraintes: Math.round(contraintes * 10) / 10,
    total: Math.round(total * 10) / 10,
  }
}

const scores = computed(() => calculateScores())

const goToScreen = (screen: Screen) => {
  errorMessage.value = ''
  successMessage.value = ''
  currentScreen.value = screen
}

const goNext = () => {
  const order: Screen[] = ['accueil', 'q1-2', 'q3-4', 'q5-6', 'q7-8', 'results']
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
  const order: Screen[] = ['accueil', 'q1-2', 'q3-4', 'q5-6', 'q7-8', 'results']
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
    const userStr = sessionStorage.getItem(STORAGE_KEYS.ALTH_USER) || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || user.id || null

    const payload = {
      patientId: patientId,
      formType: 'Qualiveen',
      date: data.value.date,
      week: getWeekInfo().current,
      answers: data.value.answers,
      scores: scores.value,
    }

    saveResult('Qualiveen', payload)

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

</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <!-- Accueil Screen -->
    <div v-if="currentScreen === 'accueil'" class="space-y-6">
      <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <h1 class="text-2xl font-extrabold mb-3">Questionnaire SF-QUALIVEEN®</h1>
        <p class="text-sm text-gray-600 leading-relaxed">
          Le Questionnaire SF-QUALIVEEN® permet d'évaluer l'impact
          de la douleur sur votre qualité de vie et votre gêne
          fonctionnelle.
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          <br />
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          Ce questionnaire comprend 8 questions qui vous demandent
          d'évaluer votre ressenti sur une échelle de 0 à 4.
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          <br />
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          Prenez quelques minutes pour répondre honnêtement à chaque
          question, en fonction de votre état actuel.
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

    <!-- Questions 1-2 Screen -->
    <div v-if="currentScreen === 'q1-2'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Questions 1 et 2</h2>
      
      <div v-for="qIdx in [0, 1]" :key="questions[qIdx].id" class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <h3 class="font-semibold text-gray-800">{{ questions[qIdx].text }}</h3>
        <div class="space-y-2">
          <label v-for="(option, valIdx) in questions[qIdx].options" :key="valIdx" class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              :name="questions[qIdx].id"
              :value="valIdx"
              :checked="data.answers[questions[qIdx].id as keyof typeof data.answers] === valIdx"
              @change="data.answers[questions[qIdx].id as keyof typeof data.answers] = valIdx"
              class="w-4 h-4"
            />
            <span class="text-sm text-gray-700">{{ option }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Questions 3-4 Screen -->
    <div v-if="currentScreen === 'q3-4'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Questions 3 et 4</h2>
      
      <div v-for="qIdx in [2, 3]" :key="questions[qIdx].id" class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <h3 class="font-semibold text-gray-800">{{ questions[qIdx].text }}</h3>
        <div class="space-y-2">
          <label v-for="(option, valIdx) in questions[qIdx].options" :key="valIdx" class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              :name="questions[qIdx].id"
              :value="valIdx"
              :checked="data.answers[questions[qIdx].id as keyof typeof data.answers] === valIdx"
              @change="data.answers[questions[qIdx].id as keyof typeof data.answers] = valIdx"
              class="w-4 h-4"
            />
            <span class="text-sm text-gray-700">{{ option }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Questions 5-6 Screen -->
    <div v-if="currentScreen === 'q5-6'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Questions 5 et 6</h2>
      
      <div v-for="qIdx in [4, 5]" :key="questions[qIdx].id" class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <h3 class="font-semibold text-gray-800">{{ questions[qIdx].text }}</h3>
        <div class="space-y-2">
          <label v-for="(option, valIdx) in questions[qIdx].options" :key="valIdx" class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              :name="questions[qIdx].id"
              :value="valIdx"
              :checked="data.answers[questions[qIdx].id as keyof typeof data.answers] === valIdx"
              @change="data.answers[questions[qIdx].id as keyof typeof data.answers] = valIdx"
              class="w-4 h-4"
            />
            <span class="text-sm text-gray-700">{{ option }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 transition">
          Suivant
        </button>
      </div>
    </div>

    <!-- Questions 7-8 Screen -->
    <div v-if="currentScreen === 'q7-8'" class="space-y-6">
      <h2 class="text-xl font-extrabold">Questions 7 et 8</h2>
      
      <div v-for="qIdx in [6, 7]" :key="questions[qIdx].id" class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
        <h3 class="font-semibold text-gray-800">{{ questions[qIdx].text }}</h3>
        <div class="space-y-2">
          <label
            v-for="(option, valIdx) in questions[qIdx].options"
            :key="valIdx"
            class="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              :name="questions[qIdx].id"
              :value="qIdx === 7 ? 4 - valIdx : valIdx"
              :checked="data.answers[questions[qIdx].id as keyof typeof data.answers] === (qIdx === 7 ? 4 - valIdx : valIdx)"
              @change="data.answers[questions[qIdx].id as keyof typeof data.answers] = qIdx === 7 ? 4 - valIdx : valIdx"
              class="w-4 h-4"
            />
            <span class="text-sm text-gray-700">{{ option }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 transition hover:bg-gray-200">
          Précédent
        </button>
        <button @click="goNext" class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 transition">
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
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-gray-800">Score Gêne</span>
            <span class="text-lg font-bold text-brand-primary">{{ scores.gene }}/4</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-brand-primary h-2 rounded-full" :style="{ width: (scores.gene / 4) * 100 + '%' }"></div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-gray-800">Score Craintes</span>
            <span class="text-lg font-bold text-brand-primary">{{ scores.craintes }}/4</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-brand-primary h-2 rounded-full" :style="{ width: (scores.craintes / 4) * 100 + '%' }"></div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-gray-800">Score Vécu</span>
            <span class="text-lg font-bold text-brand-primary">{{ scores.vecu }}/4</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-brand-primary h-2 rounded-full" :style="{ width: (scores.vecu / 4) * 100 + '%' }"></div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-gray-800">Score Contraintes</span>
            <span class="text-lg font-bold text-brand-primary">{{ scores.contraintes }}/4</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-brand-primary h-2 rounded-full" :style="{ width: (scores.contraintes / 4) * 100 + '%' }"></div>
          </div>
        </div>

        <div class="rounded-xl bg-brand-primary/10 border border-brand-primary/20 p-4">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-800">Score Total</span>
            <span class="text-2xl font-bold text-brand-primary">{{ scores.total }}/4</span>
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
