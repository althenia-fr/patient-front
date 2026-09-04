<script setup lang="ts">
import { ref, computed } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { saveResult } from '@/utils/questionnaireResults.ts'
import apiClient from '@/services/core/apiClient.ts'
import { getWeekInfo } from '@/utils/protocol.ts'
import {STORAGE_KEYS} from "@/types/api.types.ts";
import {formConfig} from "@/data/form.data.ts";

const router = useRouter()
const route = useRoute()
console.log(route.path)

const formType = route.path.substring(1);
const questions = formConfig[formType].questions;
const title = formConfig[formType].title
const introduction = formConfig[formType].introduction

interface QuestionnaireData {
  answers: []
}

const screenOrder = []
screenOrder.push('accueil')
for(let i=0;i<questions.length;i++) screenOrder.push('q'+(i+1))
screenOrder.push('results')


const qIdx = ref(0)
const currentScreen = ref(screenOrder[0])
console.log('currentScreen:'+currentScreen.value)

const data = ref<QuestionnaireData>({
  answers: []
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const allAnswersProvided = computed(() => {
  const ans = data.value.answers

  for(let i=0;i<ans.length;i++) if(ans[i]==null) return false

  return true;

})

const goToScreen = (screen: string) => {
  errorMessage.value = ''
  successMessage.value = ''
  currentScreen.value = screen
  if(currentScreen.value.startsWith('q')) qIdx.value = +currentScreen.value.substr(1) - 1
}

const goPrev = () => {
  const idx = screenOrder.indexOf(currentScreen.value)
  if (idx > 0) {
    goToScreen(screenOrder[idx - 1])
  }
}

const goNext = () => {
  const idx = screenOrder.indexOf(currentScreen.value)
  if (idx < screenOrder.length - 1) {
    if(currentScreen.value && currentScreen.value.startsWith('q') && data.value.answers[idx-1]==null) return; //1st question is q1 but first answer is answers[0]
    else goToScreen(screenOrder[idx + 1])
  }
}


const submitQuestionnaire = async () => {
  if (!allAnswersProvided.value) return

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.ALTH_USER) || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || user.id || null

    let weekInfo = getWeekInfo()
    let week = weekInfo && weekInfo.current?weekInfo.current:1

    const payload = {
      patientId: patientId,
      formType: formType,
      week: week,
      answers: data.value.answers,
    }

    saveResult(formType, payload)

    const response = await apiClient.post('/formSubmission/add', payload)

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
  <div class="mx-auto max-w-md">
    <section class="px-4 py-4" style="margin-bottom: -1px; padding-bottom: 1px">
      <!-- Accueil Screen -->
      <div v-if="currentScreen === screenOrder[0]" class="space-y-4">
        <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h1 class="text-2xl font-extrabold mb-3">{{title}}</h1>
          <p class="text-sm text-gray-600 leading-relaxed text-justify" v-html="introduction">
          </p>
        </div>

        <div class="pb-24">
          <button
              @click="goNext"
              class="w-full rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Commencer
          </button>
        </div>

      </div>

      <!-- Questions Screen -->
      <div v-if="currentScreen.startsWith('q')" class="space-y-6">
        <h2 class="text-xl font-extrabold">Question {{qIdx+1}} / {{questions.length}}</h2>

        <div class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-soft">
          <h3 class="font-semibold text-gray-800">{{ questions[qIdx].text }}</h3>
          <div class="space-y-2">
            <label v-for="(option, valIdx) in questions[qIdx].options" :key="valIdx" class="flex items-center gap-3 cursor-pointer">
              <input
                  type="radio"
                  :name="'question-' + questions[qIdx].id"
                  :value="valIdx"
                  v-model="data.answers[qIdx]"
                  class="w-4 h-4"
              />
              <span class="text-sm text-gray-700">{{ option }}</span>
            </label>
          </div>
        </div>

      </div>

      <!-- Results & Submission Screen -->
      <div v-if="currentScreen === screenOrder[screenOrder.length-1]" class="space-y-4">
        <h2 class="text-lg font-extrabold">Résultats</h2>

        <div v-if="errorMessage" class="rounded-lg bg-red-50 border border-red-200 p-3">
          <p class="text-xs text-red-800">{{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="rounded-lg bg-green-50 border border-green-200 p-3">
          <p class="text-xs text-green-800">{{ successMessage }}</p>
        </div>

        <div class="space-y-4">

          <div v-for="(question,index) in questions" :key="index" class="rounded-xl border border-gray-100 bg-white p-3">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-800" style="width: 50%">{{ question.short_text }}</span>
              <span class="font-bold text-brand-primary" style="width: 50%; text-align: right">{{ questions[index].options[data.answers[index]] }}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>

  <!-- Sticky navigation buttons -->
  <div v-if="currentScreen !== screenOrder[0]" class="sticky bottom-0 left-0 right-0 mx-auto max-w-md px-4 py-3 z-40 pb-24">
    <div class="flex gap-2">
      <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold py-3 text-sm transition hover:bg-gray-200">
        Précédent
      </button>
      <button
        v-if="currentScreen !== screenOrder[screenOrder.length-1]"
        @click="goNext"
        class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 text-sm transition"
      >
        Suivant
      </button>
      <button
        v-if="currentScreen === screenOrder[screenOrder.length-1]"
        @click="submitQuestionnaire"
        :disabled="loading || !allAnswersProvided"
        class="flex-1 rounded-full bg-brand-primary text-white font-semibold py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {{ loading ? 'Envoi...' : 'Envoyer' }}
      </button>
    </div>
  </div>
</template>
