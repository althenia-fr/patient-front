<script setup lang="ts">
import { ref, computed } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { saveResult } from '@/utils/questionnaireResults.ts'
import apiClient from '@/services/apiClient.ts'
import {formConfig} from "@/data/form.data.ts";

import {wrapLocalStorage} from "@/services/storage.service.ts";
import {msgModal} from "@/utils/modals/msg-modal.ts";
import {STORAGE_KEYS} from "@/types/api.types.ts";
import {currentWeek} from "@/services/agenda.service.ts";
const {user,protocol} = wrapLocalStorage()

const router = useRouter()
const route = useRoute()

const formType = route.path.substring(1);
const questions = formConfig[formType].questions;
const title = formConfig[formType].title
const introduction = formConfig[formType].introduction

interface QuestionnaireData {
  answers: [],
  questions: []
}

const screenOrder = []
screenOrder.push('accueil')
for(let i=0;i<questions.length;i++)
{
  let question = questions[i]
  screenOrder.push(question.id)
}
screenOrder.push('results')


const qIdx = ref(0)
const currentScreen = ref(screenOrder[0])

const data = ref<QuestionnaireData>({
  answers: [],
  questions: questions,
})

const loading = ref(false)

const allAnswersProvided = computed(() => {
  const ans = data.value.answers

  for(let i=0;i<ans.length;i++) if(ans[i]==null) return false

  return true;

})

const goToScreen = (screen: string) => {

  currentScreen.value = screen

  for(let i=0;i<screenOrder.length;i++)
  {
    let screenIter = screenOrder[i]
    if(screenIter===screen) qIdx.value = i-1
  }

  //if(currentScreen.value.startsWith('q')) qIdx.value = +currentScreen.value.substr(1) - 1
}

const goPrev = () => {
  const idx = screenOrder.indexOf(currentScreen.value)
  if (idx > 0) goToScreen(screenOrder[idx - 1])
}

const goStart = () => {
  goToScreen(screenOrder[1])
}

const goNext = () => {
  const idx = screenOrder.indexOf(currentScreen.value)
  if (idx < screenOrder.length - 1) goToScreen(screenOrder[idx + 1])
}


const submitQuestionnaire = async () => {
  if (!allAnswersProvided.value) return

  loading.value = true

  try {
    const patientId = user.value.uid
    const pecid = protocol.value?.pecid

    const payload = {
      patientId: patientId,
      formType: formType,
      week: currentWeek.value,
      pecid: pecid,
      answers: data.value.answers,
      questions: data.value.questions,
    }

    saveResult(formType, payload)

    msgModal.show('Veuillez patienter', 'Sauvegarde en cours...', null,null);
    const response = await apiClient.post('/patient/survey/add', payload)

    let formSubmissions = response.data || []

    // Enregistrement dans le localStorage avec un timestamp d'expiration
    const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 heures en millisecondes
    localStorage.setItem(STORAGE_KEYS.STIMEO_FORMS, JSON.stringify({
      data: formSubmissions,
      expiry: Date.now() + CACHE_TTL
    }))

    msgModal.show('Succès', 'Questionnaire envoyé avec succès !', 'OK', function(){msgModal.defaultClose();router.push({ name: 'home' }) });

    /*
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1500)*/

  } catch (error: any) {
    msgModal.show('Erreur', "Réssayer ou contacter l'aide si le système persiste", 'OK', msgModal.defaultClose,null,null,true);
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
              @click="goStart"
              class="w-full rounded-full bg-brand-primary text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Commencer
          </button>
        </div>

      </div>

      <!-- Questions Screen -->
      <div v-if="currentScreen!=='accueil' && currentScreen!='results'" class="space-y-6">
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
      <div v-if="currentScreen === 'results'" class="space-y-4">
        <h2 class="text-lg font-extrabold">Vérifier avant envoi</h2>

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
      <button @click="goPrev" class="flex-1 rounded-full bg-gray-100 text-gray-800 font-semibold px-3 py-3 text-sm transition hover:bg-gray-200">
        Précédent
      </button>
      <button
        v-if="currentScreen !== screenOrder[screenOrder.length-1]"
        @click="goNext"
        class="flex-1 rounded-full bg-brand-primary text-white font-semibold px-3 py-3 text-sm transition"
      >
        Suivant
      </button>
      <button
        v-if="currentScreen === screenOrder[screenOrder.length-1]"
        @click="submitQuestionnaire"
        :disabled="loading || !allAnswersProvided"
        class="flex-1 rounded-full bg-brand-primary text-white font-semibold px-3 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {{ loading ? 'Envoi...' : 'Envoyer' }}
      </button>
    </div>
  </div>
</template>
