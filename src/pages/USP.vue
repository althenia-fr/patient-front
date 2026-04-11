<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { saveResult } from '@/utils/questionnaireResults'
import apiClient from '@/services/core/apiClient'
import {STORAGE_KEYS} from "@/types/api.types.ts";

const router = useRouter()

type Screen = 'accueil' | 'partie-i' | 'partie-ii-a' | 'partie-ii-b' | 'partie-ii-c' | 'partie-iii' | 'results'

interface USPData {
  date: string
  effort: {
    q1: number | null
    q2: number | null
    q3: number | null
  }
  hyper: {
    q1: number | null
    q2: number | null
    q3: number | null
    q4: number | null
    q5: number | null
    q6: number | null
    q7: number | null
  }
  dysurie: {
    q1: number | null
    q2: number | null
    q3: number | null
  }
}

interface Scores {
  effort: number
  hyper: number
  dysurie: number
  total: number
}

const currentScreen = ref<Screen>('accueil')
const data = ref<USPData>({
  date: '',
  effort: { q1: null, q2: null, q3: null },
  hyper: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null },
  dysurie: { q1: null, q2: null, q3: null },
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const introText = `Avant de commencer à remplir le questionnaire,
merci d'inscrire la date du jour : … / … / ��…

Les questions suivantes portent sur l'intensité et la fréquence des symptômes urinaires
que vous avez eus au cours des 4 dernières semaines. Pour répondre aux questions
suivantes, il vous suffit de cocher la case qui correspond le mieux à votre situation.
Il n'y a pas de « bonnes » ou de « mauvaises » réponses. Si vous ne savez pas très bien
comment répondre, choisissez la réponse la plus proche de votre situation.`

const partieIQuestions = [
  {
    id: 'q1',
    text: 'Lors d\'efforts physiques importants (sport, grosse toux)',
    options: ['Jamais', 'Moins d\'une fois/semaine', 'Plusieurs fois/semaine', 'Plusieurs fois/jour'],
  },
  {
    id: 'q2',
    text: 'Lors d\'efforts physiques modérés (escaliers)',
    options: ['Jamais', 'Moins d\'une fois/semaine', 'Plusieurs fois/semaine', 'Plusieurs fois/jour'],
  },
  {
    id: 'q3',
    text: 'Lors d\'efforts physiques légers (marche, changement de position)',
    options: ['Jamais', 'Moins d\'une fois/semaine', 'Plusieurs fois/semaine', 'Plusieurs fois/jour'],
  },
]

const partieIIQuestions = [
  {
    id: 'q1',
    text: 'Combien de fois avez-vous dû vous précipiter aux toilettes pour uriner en raison d\'un besoin urgent ?',
    options: ['Jamais', 'Moins d\'une fois par semaine', 'Plusieurs fois par semaine', 'Plusieurs fois par jour'],
  },
  {
    id: 'q2',
    text: 'Quand vous êtes pris par un besoin urgent d\'uriner, combien de minutes en moyenne pouvez-vous vous retenir ?',
    options: ['Plus de 15 minutes', 'De 6 à 15 minutes', 'De 1 à 5 minutes', 'Moins de 1 minute'],
  },
  {
    id: 'q3',
    text: 'Combien de fois avez-vous eu une fuite d\'urine précédée d\'un besoin urgent d\'uriner que vous n\'avez pas pu contrôler ?',
    options: ['Jamais', 'Moins d\'une fois par semaine', 'Plusieurs fois par semaine', 'Plusieurs fois par jour'],
  },
  {
    id: 'q4',
    text: 'Dans ces circonstances, quel type de fuites avez-vous ?',
    options: ['Pas de fuites dans cette circonstance', 'Quelques gouttes', 'Fuites en petites quantités', 'Fuites inondantes'],
  },
  {
    id: 'q5',
    text: 'Pendant la journée, quel est le temps habituel espaçant deux mictions ?',
    options: ['2 heures ou plus', 'Entre 1 heure et 2 heures', 'Entre 30 minutes et 1 heure', 'Moins de 30 minutes'],
  },
  {
    id: 'q6',
    text: 'Combien de fois en moyenne avez-vous été réveillé(e) la nuit par un besoin d\'uriner ?',
    options: ['0 ou 1 fois', '2 fois', '3 ou 4 fois', 'Plus de 4 fois'],
  },
  {
    id: 'q7',
    text: 'Combien de fois avez-vous eu une fuite d\'urine en dormant ou vous ��tes-vous réveillé(e) mouillé(e) ?',
    options: ['Jamais', 'Moins d\'une fois par semaine', 'Plusieurs fois par semaine', 'Plusieurs fois par jour'],
  },
]

const partieIIIQuestions = [
  {
    id: 'q1',
    text: 'Décrivez votre miction habituelle',
    options: ['Miction normale et rapide', 'Difficile à débuter puis normale', 'Début facile mais longue à terminer', 'Très lente du début à la fin'],
  },
  {
    id: 'q2',
    text: 'Décrivez le jet urinaire',
    options: ['Miction normale et rapide', 'Difficile à débuter puis normale', 'Début facile mais longue à terminer', 'Très lente du début à la fin'],
  },
  {
    id: 'q3',
    text: 'Décrivez la manière dont s\'effectue la miction',
    options: ['Miction normale et rapide', 'Difficile à débuter puis normale', 'Début facile mais longue �� terminer', 'Très lente du début à la fin'],
  },
]

const canStartQuestionnaire = computed(() => true)

const allAnswersProvided = computed(() => {
  const e = data.value.effort
  const h = data.value.hyper
  const d = data.value.dysurie
  return (
    e.q1 !== null && e.q2 !== null && e.q3 !== null &&
    h.q1 !== null && h.q2 !== null && h.q3 !== null && h.q4 !== null &&
    h.q5 !== null && h.q6 !== null && h.q7 !== null &&
    d.q1 !== null && d.q2 !== null && d.q3 !== null
  )
})

const calculateScores = (): Scores => {
  const e = data.value.effort
  const h = data.value.hyper
  const d = data.value.dysurie

  const effort = (e.q1 ?? 0) + (e.q2 ?? 0) + (e.q3 ?? 0)
  const hyper = (h.q1 ?? 0) + (h.q2 ?? 0) + (h.q3 ?? 0) + (h.q4 ?? 0) + (h.q5 ?? 0) + (h.q6 ?? 0) + (h.q7 ?? 0)
  const dysurie = (d.q1 ?? 0) + (d.q2 ?? 0) + (d.q3 ?? 0)
  const total = effort + hyper + dysurie

  return { effort, hyper, dysurie, total }
}

const scores = computed(() => calculateScores())

const goToScreen = (screen: Screen) => {
  errorMessage.value = ''
  successMessage.value = ''
  currentScreen.value = screen
}

const goNext = () => {
  const order: Screen[] = ['accueil', 'partie-i', 'partie-ii-a', 'partie-ii-b', 'partie-ii-c', 'partie-iii', 'results']
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
  const order: Screen[] = ['accueil', 'partie-i', 'partie-ii-a', 'partie-ii-b', 'partie-ii-c', 'partie-iii', 'results']
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
      formType: 'USP',
      date: data.value.date,
      answers: {
        effort: data.value.effort,
        hyper: data.value.hyper,
        dysurie: data.value.dysurie,
      },
      scores: scores.value,
    }

    saveResult('USP', payload)

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


const updateAnswer = (section: 'effort' | 'hyper' | 'dysurie', questionId: string, value: number) => {
  data.value[section][questionId as keyof typeof data.value[section]] = value
}

const getAnswer = (section: 'effort' | 'hyper' | 'dysurie', questionId: string): number | null => {
  return data.value[section][questionId as keyof typeof data.value[section]]
}
</script>

<template>
  <div class="mx-auto max-w-md pb-24">
    <section class="px-4 py-4" style="margin-bottom: -1px; padding-bottom: 1px">
      <!-- Accueil Screen -->
      <div v-if="currentScreen === 'accueil'" class="space-y-4">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h1 class="text-2xl font-extrabold mb-3">Questionnaire USP</h1>
          <p class="text-sm font-semibold mb-2">Urinary Symptom Profile</p>
          <p class="text-sm text-gray-600 leading-relaxed">
            Les questions suivantes portent sur l'intensité et la
            fréquence des symptômes urinaires que vous avez eus au
            cours des 4 dernières semaines.
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            <br />
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            Pour répondre aux questions suivantes, il vous suffit de
            cocher la case qui correspond le mieux à votre
            situation.
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            <br />
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            Il n'y a pas de « bonnes » ou de « mauvaises » réponses.
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            <br />
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            Si vous ne savez pas très bien comment répondre,
            choisissez la réponse la plus proche de votre situation.
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

      <!-- Partie I — Incontinence à l'effort -->
      <div v-if="currentScreen === 'partie-i'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Partie I — Incontinence à l'effort</h2>

        <div v-for="question in partieIQuestions" :key="question.id" class="space-y-2 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-sm text-gray-800">{{ question.text }}</h3>
          <div class="space-y-1">
            <label v-for="(option, valIdx) in question.options" :key="valIdx" class="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="radio"
                :name="question.id"
                :value="valIdx"
                :checked="getAnswer('effort', question.id) === valIdx"
                @change="updateAnswer('effort', question.id, valIdx)"
                class="w-4 h-4"
              />
              <span class="text-xs text-gray-700">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Partie II-A — Hyperactivité vésicale (Q1-3) -->
      <div v-if="currentScreen === 'partie-ii-a'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Partie II — Hyperactivité vésicale</h2>
        <p class="text-xs text-gray-600">Questions 1 à 3</p>

        <div v-for="question in partieIIQuestions.slice(0, 3)" :key="question.id" class="space-y-2 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-sm text-gray-800">{{ question.text }}</h3>
          <div class="space-y-1">
            <label v-for="(option, valIdx) in question.options" :key="valIdx" class="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="radio"
                :name="`ii-${question.id}`"
                :value="valIdx"
                :checked="getAnswer('hyper', question.id) === valIdx"
                @change="updateAnswer('hyper', question.id, valIdx)"
                class="w-4 h-4"
              />
              <span class="text-xs text-gray-700">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Partie II-B — Hyperactivité vésicale (Q4-6) -->
      <div v-if="currentScreen === 'partie-ii-b'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Partie II — Hyperactivité vésicale</h2>
        <p class="text-xs text-gray-600">Questions 4 à 6</p>

        <div v-for="question in partieIIQuestions.slice(3, 6)" :key="question.id" class="space-y-2 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-sm text-gray-800">{{ question.text }}</h3>
          <div class="space-y-1">
            <label v-for="(option, valIdx) in question.options" :key="valIdx" class="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="radio"
                :name="`ii-${question.id}`"
                :value="valIdx"
                :checked="getAnswer('hyper', question.id) === valIdx"
                @change="updateAnswer('hyper', question.id, valIdx)"
                class="w-4 h-4"
              />
              <span class="text-xs text-gray-700">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Partie II-C — Hyperactivité vésicale (Q7) -->
      <div v-if="currentScreen === 'partie-ii-c'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Partie II — Hyperactivité vésicale</h2>
        <p class="text-xs text-gray-600">Question 7</p>

        <div v-for="question in partieIIQuestions.slice(6)" :key="question.id" class="space-y-2 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-sm text-gray-800">{{ question.text }}</h3>
          <div class="space-y-1">
            <label v-for="(option, valIdx) in question.options" :key="valIdx" class="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="radio"
                :name="`ii-${question.id}`"
                :value="valIdx"
                :checked="getAnswer('hyper', question.id) === valIdx"
                @change="updateAnswer('hyper', question.id, valIdx)"
                class="w-4 h-4"
              />
              <span class="text-xs text-gray-700">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Partie III — Dysurie -->
      <div v-if="currentScreen === 'partie-iii'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Partie III — Dysurie</h2>

        <div v-for="question in partieIIIQuestions" :key="question.id" class="space-y-2 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-sm text-gray-800">{{ question.text }}</h3>
          <div class="space-y-1">
            <label v-for="(option, valIdx) in question.options" :key="valIdx" class="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="radio"
                :name="`iii-${question.id}`"
                :value="valIdx"
                :checked="getAnswer('dysurie', question.id) === valIdx"
                @change="updateAnswer('dysurie', question.id, valIdx)"
                class="w-4 h-4"
              />
              <span class="text-xs text-gray-700">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Results & Submission Screen -->
      <div v-if="currentScreen === 'results'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Résultats</h2>

        <div v-if="errorMessage" class="rounded-lg bg-red-50 border border-red-200 p-3">
          <p class="text-xs text-red-800">{{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="rounded-lg bg-green-50 border border-green-200 p-3">
          <p class="text-xs text-green-800">{{ successMessage }}</p>
        </div>

        <div class="space-y-2">
          <div class="rounded-lg border border-gray-100 bg-white p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="font-semibold text-xs text-gray-800">Incontinence à l'effort</span>
              <span class="text-sm font-bold text-brand-primary">{{ scores.effort }} / 9</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-brand-primary h-1.5 rounded-full" :style="{ width: (scores.effort / 9) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="rounded-lg border border-gray-100 bg-white p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="font-semibold text-xs text-gray-800">Hyperactivité vésicale</span>
              <span class="text-sm font-bold text-brand-primary">{{ scores.hyper }} / 21</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-brand-primary h-1.5 rounded-full" :style="{ width: (scores.hyper / 21) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="rounded-lg border border-gray-100 bg-white p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="font-semibold text-xs text-gray-800">Dysurie</span>
              <span class="text-sm font-bold text-brand-primary">{{ scores.dysurie }} / 9</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-brand-primary h-1.5 rounded-full" :style="{ width: (scores.dysurie / 9) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="rounded-lg bg-brand-primary/10 border border-brand-primary/20 p-3 mt-2">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-xs text-gray-800">Total USP</span>
              <span class="text-lg font-bold text-brand-primary">{{ scores.total }} / 39</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Sticky navigation buttons -->
  <div v-if="currentScreen !== 'accueil'" class="sticky bottom-0 left-0 right-0 mx-auto max-w-md px-4 py-3 z-40">
    <div class="flex gap-2">
      <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-2 text-sm transition hover:bg-gray-200">
        Précédent
      </button>
      <button
        v-if="currentScreen !== 'results'"
        @click="goNext"
        class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-2 text-sm transition"
      >
        Suivant
      </button>
      <button
        v-if="currentScreen === 'results'"
        @click="submitQuestionnaire"
        :disabled="loading || !allAnswersProvided"
        class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {{ loading ? 'Envoi...' : 'Envoyer' }}
      </button>
    </div>
  </div>
</template>
