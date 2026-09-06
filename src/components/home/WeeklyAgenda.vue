<template>

  <!-- Agenda de la semaine -->
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-800">Agenda de la semaine</h2>
    </div>

    <div class="mt-3 space-y-2">
      <!-- API-driven agenda forms -->
      <div v-if="globalState.protocol?.agenda && currentWeekForms.length > 0" class="space-y-2">
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
      <p v-else-if="!globalState.protocol?.agenda" class="text-sm text-gray-500">
        Vous n'êtes pas connecté
      </p>
      <!-- No items message -->
      <p v-else class="text-sm text-gray-500">
        Aucun agenda cette semaine
      </p>
    </div>
  </div>


</template>
<script setup lang="ts">
import {globalState} from "@/composables/useGlobalTimer.ts";
import {formIdToDisplayName, formIdToRouteName} from "@/types/protocol.types.ts";
import {RouterLink} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {currentWeek, protocolApi} from "@/services/protocol.service.ts";
import apiClient from "@/services/core/apiClient.ts";

const completedForms = ref<string[]>([])

const currentWeekForms = computed(() => {

  let res = protocolApi.getCurrentWeekForms(currentWeek.value)

  // Automatically hide forms that have already been submitted this week
  return res.filter((form: string) => {
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


const fetchCompletedForms = async () => {
  try {
    const userStr = localStorage.getItem('alth_user') || '{}'
    const user = JSON.parse(userStr)
    const patientId = user.uid || null

    const response = await apiClient.get('/formSubmission/list', {
      params: { patientId }
    })
    const formSubmissions = response.data || []

    const currentWeekFormSubmissions = Array.isArray(formSubmissions)
        ? formSubmissions.find((w: any) => String(w.weekNumber) === String(currentWeek.value))
        : null

    if (currentWeekFormSubmissions && currentWeekFormSubmissions.forms) {
      completedForms.value = currentWeekFormSubmissions.forms
          .filter((f: any) => f.submissions && f.submissions.length > 0)
          .map((f: any) => String(f.formType).toUpperCase())
    } else {
      completedForms.value = []
    }
  } catch (e) {
    console.error('Failed to fetch completed forms', e)
  }
}


onMounted(() => {
  fetchCompletedForms()
})

</script>
