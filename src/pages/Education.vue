<script setup lang="ts">
const videos = []
const brands = ['Tensi+', 'Cefar', 'Flowtens', 'Schwa Médico']
</script>

<style scoped>
.spacer-1 {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  height: 200px;
}

.spacer-2 {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  height: 200px;
}

.spacer-3 {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  height: 200px;
}

.spacer-4 {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  height: 200px;
}

@media (max-width: 640px) {
  .spacer-1 {
    height: 15px;
  }

  .spacer-2 {
    height: 15px;
  }

  .spacer-3 {
    height: 15px;
  }

  .spacer-4 {
    height: 15px;
  }
}
</style>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <h2 class="mb-4 text-xl font-bold">Notice utilisateurs</h2>
    <p class="mb-4 text-sm text-gray-500">Découvrez les bases, le placement et l'usage quotidien.</p>
    <div class="rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm font-semibold shadow-soft">Tensi+</div>
    <div class="spacer-1"></div>
    <div class="rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm font-semibold shadow-soft">Cefar</div>
    <div class="spacer-2"></div>
    <div class="rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm font-semibold shadow-soft">Flowtens</div>
    <div class="spacer-3"></div>
    <div class="rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm font-semibold shadow-soft">Schwa Médico</div>
    <div class="spacer-4"></div>
    <div class="mb-6 grid grid-cols-2 gap-3"></div>
    <div class="space-y-4">
      <div v-for="v in videos" :key="v.id" class="rounded-xl border border-gray-100 bg-white p-3 shadow-soft">
        <div class="mb-2 text-sm font-semibold">{{ v.title }}</div>
        <div class="relative w-full overflow-hidden rounded-lg" style="padding-top: 56.25%">
          <iframe :src="v.src" :title="v.title" class="absolute inset-0 h-full w-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
