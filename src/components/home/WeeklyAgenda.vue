<template>
  <!-- Agenda de la semaine -->
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-800">Questionnaires de la semaine</h2>
    </div>

    <div class="mt-3 space-y-2">
      <!-- API-driven agenda forms -->
      <div v-if="initDone && currentWeekForms?.length > 0" class="space-y-2">
        <RouterLink
            v-for="form in currentWeekForms"
            :key="form"
            :to="{ name: formIdToRouteName(form) || 'usp' }"
            class="block rounded-lg bg-cyan-50 p-3 hover:bg-cyan-100 transition cursor-pointer"
        >
          <p class="text-xs text-gray-600">
            <span class="text-gray-600">Complétez le questionnaire </span>
            <span class="font-semibold text-cyan-700">{{ formIdToDisplayName(form) }}</span>
          </p>
        </RouterLink>
      </div>
      <!-- No items message -->
      <p v-else-if="initDone" class="text-sm text-gray-500">
        Pas de questionnaire
      </p>
      <div v-else class="flex justify-center py-4">
        <div style="display: block; margin: auto; width: fit-content"><i class="fas fa-spinner fa-spin text-cyan-600 text-xl"></i></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {formIdToDisplayName, formIdToRouteName} from "@/types/protocol.types.ts";
import {RouterLink} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {currentWeek, getCurrentWeekForms} from "@/services/agenda.service.ts";
import apiClient from "@/services/apiClient.ts";
import {wrapLocalStorage} from "@/services/storage.service.ts";
import {STORAGE_KEYS} from "@/types/api.types.ts";

const {user} = wrapLocalStorage()

const initDone = ref(false)
const completedForms = ref<string[]>([])

const currentWeekForms = computed(() => {
  let res = getCurrentWeekForms(currentWeek.value)

  // Automatically hide forms that have already been submitted this week
  return res.forms?.filter((form: string) => {
    const displayName = formIdToDisplayName(form) || ''
    const upperName = displayName.toUpperCase()

    const isCompleted = completedForms.value.some(completedType => {
      if (upperName.includes('QUALIVEEN') && completedType.includes('QUALIVEEN')) return true
      if (upperName.includes('SATISFACTION') && completedType.includes('SATISFACTION')) return true
      if (upperName.includes('PGI') && completedType.includes('PGI')) return true
      if (upperName.includes('EVOLUTION') && completedType.includes('EVOLUTION') ) return true
      if (upperName.includes('MICTION') && completedType.includes('MICTION')) return true
      if (upperName.includes('USP') && completedType.includes('USP')) return true
      return completedType === upperName
    })

    return !isCompleted
  })
})

const initCompletedForms = async () => {
  try {

    let formSubmissions = []

    // 1. Vérification du cache local
    const cachedData = localStorage.getItem(STORAGE_KEYS.STIMEO_FORMS)
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData)
        // Vérifie si le cache est toujours valide (< 2h)
        if (Date.now() < parsed.expiry) {
          formSubmissions = parsed.data
        }
      } catch (e) {
        console.warn('Erreur de lecture du cache JSON', e)
      }
    }

    // 2. Appel API si aucun cache valide n'est trouvé
    if (!formSubmissions || formSubmissions.length === 0) {
      const response = await apiClient.get('/formSubmission/list')
      formSubmissions = response.data || []

      // Enregistrement dans le localStorage avec un timestamp d'expiration
      const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 heures en millisecondes
      localStorage.setItem(STORAGE_KEYS.STIMEO_FORMS, JSON.stringify({
        data: formSubmissions,
        expiry: Date.now() + CACHE_TTL
      }))
    }

    const currentWeekFormSubmissions = Array.isArray(formSubmissions)
        ? formSubmissions.find((w: any) => String(w.weekNumber) === String(currentWeek.value))
        : null

    let res
    if (currentWeekFormSubmissions && currentWeekFormSubmissions.forms) {
      res = currentWeekFormSubmissions.forms
          .filter((f: any) => f.submissions && f.submissions.length > 0)
          .map((f: any) => String(f.formType).toUpperCase())
    } else {
      res = []
    }

    completedForms.value = res // Assigne le résultat pour déclencher la réactivité de "currentWeekForms"
    initDone.value = true;
    return res;
  } catch (e) {
    console.error('Failed to fetch completed forms', e)
    initDone.value = true // Permet de retirer le spinner même en cas d'erreur réseau
  }
}

onMounted(()=>{
  initCompletedForms();
})
</script>
