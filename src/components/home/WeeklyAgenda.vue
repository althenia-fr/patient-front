<template>

  <!-- Agenda de la semaine -->
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-800">Agenda de la semaine</h2>
    </div>

    <div class="mt-3 space-y-2">
      <!-- API-driven agenda forms -->
      <div v-if="currentWeekForms?.length > 0" class="space-y-2">
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
      <p v-else class="text-sm text-gray-500">
        Pas d'agenda
      </p>
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
const {user} = wrapLocalStorage()

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

    const patientId = user.value.uid

    const response = await apiClient.get('/formSubmission/list', {
      params: { patientId }
    })
    const formSubmissions = response.data || []

    const currentWeekFormSubmissions = Array.isArray(formSubmissions)
        ? formSubmissions.find((w: any) => String(w.weekNumber) === String(currentWeek.value))
        : null

    if (currentWeekFormSubmissions && currentWeekFormSubmissions.forms) {
      return currentWeekFormSubmissions.forms
          .filter((f: any) => f.submissions && f.submissions.length > 0)
          .map((f: any) => String(f.formType).toUpperCase())
    } else {
      return []
    }
  } catch (e) {
    console.error('Failed to fetch completed forms', e)
  }
}
completedForms.value = await initCompletedForms();


</script>
