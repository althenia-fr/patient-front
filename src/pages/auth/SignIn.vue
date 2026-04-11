<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/services/auth.service'
import { authUser } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const mobile = ref('')
const year = ref('')
const month = ref('')
const day = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  if (authUser.value) {
    router.replace('/home')
  }
})

async function submit(e: Event) {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    await authApi.login({
      mobile: mobile.value,
      year: year.value,
      month: month.value,
      day: day.value,
      app:'patient'
    })
    const redirect = (route.query.redirect as string) || '/home'
    router.replace(redirect)
  } catch (err: any) {
    error.value = err?.message || 'Échec de connexion'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section class="mx-auto max-w-sm px-4 py-8">
    <img
      loading="lazy"
       src="/stimeoplus_logo.png"
      alt=""
      class="w-full object-cover mt-5"
      style="aspect-ratio:2.51; min-width:20px; min-height:20px; overflow:hidden;"
    />

  <!-- Carte de connexion -->
  <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
    <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Se connecter</h2>
    <form class="space-y-5" @submit="submit">
      <div>
        <label class="block mb-1 text-sm font-medium text-gray-600">Numéro de mobile</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i class="fa-solid fa-phone"></i>
          </span>
          <input v-model="mobile" class="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 pl-11 focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all shadow-sm" type="tel" placeholder="06 00 00 00 00" required />
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium text-gray-600">Date de naissance</label>
        <div class="grid grid-cols-3 gap-3">
          <input v-model="day" class="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all shadow-sm" type="text" placeholder="JJ" maxlength="2" required />
          <input v-model="month" class="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all shadow-sm" type="text" placeholder="MM" maxlength="2" required />
          <input v-model="year" class="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all shadow-sm" type="text" placeholder="AAAA" maxlength="4" required />
        </div>
      </div>

      <button type="submit" class="btn-primary mt-4 w-full rounded-2xl py-4 text-lg font-semibold shadow-md active:scale-[0.98] transition-transform" :disabled="loading">
        {{ loading ? 'Connexion…' : 'Continuer' }}
      </button>

      <p v-if="error" class="mt-4 text-center text-sm font-medium text-red-500 animate-pulse">{{ error }}</p>
    </form>
  </div>

  <p class="mx-auto mt-10 max-w-sm text-center text-xs text-gray-400">
    En vous connectant, vous acceptez nos <a href="#" class="text-brand-secondary hover:underline">conditions d’utilisation</a> et notre <a href="#" class="text-brand-secondary hover:underline">politique de confidentialité</a>.
  </p>
</section>
</template>
