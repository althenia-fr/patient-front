<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (name: string) => router.push({ name })
</script>

<template>
  <section class="mx-auto grid min-h-svh max-w-md gap-4 px-4 py-6 overflow-hidden sm:pt-6">

    <div class="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-card">

      <img loading="lazy" src="/theresa.png" alt="" style="width: 150px; margin:auto"/>

      <div style="max-height: 80px; margin: auto;width: fit-content; margin-top: 20px;margin-bottom: 20px; text-align: center">
        <h1 class="text-xl font-semibold text-brand-600">Installez l'App sur votre mobile</h1>
      </div>

      <div class="div-btn text-brand-600 text-center">
        <div @click="go('chrome')" style="padding: 35px">
          <img width="70" height="70" style="margin: auto" src="/chrome.png" />
          <br/>
          <span>Instructions<br/>Chrome</span>
        </div>
      </div>

      <div class="div-btn text-brand-600 text-center">
        <div @click="go('safari')" style="padding: 35px">
          <img width="70" height="70" style="margin: auto" src="/safari.png" />
          <br/>
          <span>Instructions<br/>Safari</span>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>

.div-btn{
  width: 50%;
  float: left;
}

.btn{
  min-width: 115px;
}

.shadow-card{
  height: fit-content;
}

</style>
