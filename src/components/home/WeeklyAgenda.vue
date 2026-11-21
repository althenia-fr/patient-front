<template>
  <!-- Agenda de la semaine -->
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-800">Questionnaires de la semaine</h2>
    </div>

    <div class="mt-3 space-y-2">
      <!-- API-driven agenda forms -->
      <div v-if="!isLoading && currentWeekForms.length > 0" class="space-y-2">
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
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { formIdToDisplayName, formIdToRouteName } from "@/types/protocol.types.ts";
import { currentWeek, getAgendaForCurrentWeek } from "@/services/agenda.service.ts";

const props = withDefaults(
    defineProps<{
      forms?: any[];
      isLoading?: boolean;
    }>(),
    {
      forms: () => [],
      isLoading: false,
    }
);

const currentWeekForms = computed(() => {
  const agenda = getAgendaForCurrentWeek(currentWeek.value, props.forms);
  return agenda.filter((form: string) => !form.toUpperCase().includes("MICTION"));
});
</script>
