<script setup lang="ts">

import SessionList from "@/components/home/SessionList.vue";
import WeeklyAgenda from "@/components/home/WeeklyAgenda.vue";
import ProtocolProgress from "@/components/home/ProtocolProgress.vue";


</script>

<template>
  <section class="mx-auto w-full px-4 pt-5 pb-24 sm:max-w-md md:max-w-lg lg:max-w-xl">

    <SessionList />

    <WeeklyAgenda />

    <ProtocolProgress />

  </section>
</template>
