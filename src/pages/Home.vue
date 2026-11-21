<script setup lang="ts">
import { onMounted, ref } from "vue";
import SessionList from "@/components/home/SessionList.vue";
import WeeklyAgenda from "@/components/home/WeeklyAgenda.vue";
import ProtocolProgress from "@/components/home/ProtocolProgress.vue";
import MictionDashboard from "@/components/home/MictionDashboard.vue";
import { wrapLocalStorage } from "@/services/storage.service.ts";

const { user, getForms } = wrapLocalStorage();

const mictionEnabled = ref(user.value?.miction);
const isLoadingForms = ref(true);
const forms = ref<any[]>([]);

const initSurveyForms = async () => {
  isLoadingForms.value = true;
  try {
    forms.value = await getForms();
  } catch (e) {
    console.error("Failed to fetch survey list", e);
  } finally {
    isLoadingForms.value = false;
  }
};

onMounted(() => {
  initSurveyForms();
});
</script>

<template>
  <section class="mx-auto w-full px-4 pt-5 pb-24 sm:max-w-md md:max-w-lg lg:max-w-xl">
    <SessionList />

    <WeeklyAgenda :forms="forms" :is-loading="isLoadingForms" />

    <MictionDashboard v-if="mictionEnabled" :forms="forms" />

    <ProtocolProgress />
  </section>
</template>
