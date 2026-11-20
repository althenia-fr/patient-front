<template>
  <!-- Agenda de la semaine -->
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-800">Questionnaires de la semaine</h2>
    </div>

    <div class="mt-3 space-y-2">
      <!-- API-driven agenda forms -->
      <div v-if="!isLoading && currentWeekForms?.length > 0" class="space-y-2">
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
      <p v-else-if="!isLoading" class="text-sm text-gray-500">
        Pas de questionnaire
      </p>
      <div v-else class="flex justify-center py-4">
        <div style="display: block; margin: auto; width: fit-content">
          <i class="fas fa-spinner fa-spin text-cyan-600 text-xl"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formIdToDisplayName, formIdToRouteName } from "@/types/protocol.types.ts";
import { RouterLink } from "vue-router";
import { computed, ref, watch } from "vue";
import { currentWeek, getAgendaForCurrentWeek } from "@/services/agenda.service.ts";
import { STORAGE_KEYS } from "@/types/api.types.ts";

const props = withDefaults(
    defineProps<{
      refreshKey?: number;
      isLoading?: boolean;
    }>(),
    {
      refreshKey: 0,
      isLoading: false,
    }
);

const completedForms = ref<string[]>([]);

const loadCompletedFormsFromStorage = () => {
  let formSubmissions = [];
  const cachedData = localStorage.getItem(STORAGE_KEYS.STIMEO_FORMS);

  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      formSubmissions = parsed.data || [];
    } catch (e) {
      console.warn("Erreur de lecture du cache JSON", e);
    }
  }

  const currentWeekFormSubmissions = Array.isArray(formSubmissions)
      ? formSubmissions.find((w: any) => String(w.weekNumber) === String(currentWeek.value))
      : null;

  if (currentWeekFormSubmissions && currentWeekFormSubmissions.forms) {
    completedForms.value = currentWeekFormSubmissions.forms
        .filter((f: any) => f.submissions && f.submissions.length > 0)
        .map((f: any) => String(f.formType).toUpperCase());
  } else {
    completedForms.value = [];
  }
};

watch(
    () => props.refreshKey,
    () => {
      loadCompletedFormsFromStorage();
    },
    { immediate: true }
);

const currentWeekForms = computed(() => {
  // Dépendance explicite pour forcer le recalcul de getAgendaForCurrentWeek après mise à jour du localStorage
  void props.refreshKey;

  const agenda = getAgendaForCurrentWeek(currentWeek.value);

  // Automatically hide forms that have already been submitted this week
  return agenda?.filter((form: string) => {
    const upperName = form.toUpperCase();

    if (upperName.includes("MICTION")) return false; // never displayed in the weekly agenda since there is a dedicated MictionDashboard

    const isCompleted = completedForms.value.some((completedType) => {
      if (upperName.includes("QUALIVEEN") && completedType.includes("QUALIVEEN")) return true;
      if (upperName.includes("SATISFACTION") && completedType.includes("SATISFACTION")) return true;
      if (upperName.includes("PGI") && completedType.includes("PGI")) return true;
      if (upperName.includes("EVOLUTION") && completedType.includes("EVOLUTION")) return true;
      if (upperName.includes("USP") && completedType.includes("USP")) return true;
      return completedType === upperName;
    });

    return !isCompleted;
  });
});
</script>
