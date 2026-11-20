<script setup lang="ts">
import { onMounted, ref } from "vue";
import SessionList from "@/components/home/SessionList.vue";
import WeeklyAgenda from "@/components/home/WeeklyAgenda.vue";
import ProtocolProgress from "@/components/home/ProtocolProgress.vue";
import MictionDashboard from "@/components/home/MictionDashboard.vue";
import { wrapLocalStorage } from "@/services/storage.service.ts";
import apiClient from "@/services/apiClient.ts";
import { STORAGE_KEYS } from "@/types/api.types.ts";

const { user } = wrapLocalStorage();

const mictionEnabled = ref(user.value.miction);
const isLoadingForms = ref(true);
const refreshKey = ref(0);

const initSurveyForms = async () => {
  isLoadingForms.value = true;
  try {
    let formSubmissions = [];

    // 1. Vérification du cache local
    const cachedData = localStorage.getItem(STORAGE_KEYS.STIMEO_FORMS);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Date.now() < parsed.expiry) {
          formSubmissions = parsed.data;
        }
      } catch (e) {
        console.warn("Erreur de lecture du cache JSON", e);
      }
    }

    // 2. Appel API si aucun cache valide n'est trouvé
    if (!formSubmissions || formSubmissions.length === 0) {
      const response = await apiClient.get("/patient/survey/list");
      formSubmissions = response.data || [];

      const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
      localStorage.setItem(
          STORAGE_KEYS.STIMEO_FORMS,
          JSON.stringify({
            data: formSubmissions,
            expiry: Date.now() + CACHE_TTL,
          })
      );
    }
  } catch (e) {
    console.error("Failed to fetch survey list", e);
  } finally {
    isLoadingForms.value = false;
    refreshKey.value++;
  }
};

onMounted(() => {
  initSurveyForms();
});
</script>

<template>
  <section class="mx-auto w-full px-4 pt-5 pb-24 sm:max-w-md md:max-w-lg lg:max-w-xl">
    <SessionList />

    <WeeklyAgenda :refresh-key="refreshKey" :is-loading="isLoadingForms" />

    <MictionDashboard v-if="mictionEnabled" :refresh-key="refreshKey" />

    <ProtocolProgress />
  </section>
</template>
