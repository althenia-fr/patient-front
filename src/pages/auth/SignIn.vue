<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signIn } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const showPwd = ref(false)
const remember = ref(false)
const error = ref('')
const loading = ref(false)

async function submit(e: Event) {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    await signIn(email.value, password.value, remember.value)
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
  <section class="mx-auto max-w-md px-4 py-8">
  <img
    loading="lazy"
    srcset="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=1600 1600w"
    src="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Ff0fb1518f04a4814bac7aeca947eaee6?width=800"
    alt="STIMEO+"
    class="w-full object-contain mt-5"
    style="aspect-ratio:3.24; min-width:20px; min-height:20px; overflow:hidden;"
  />
  <div class="mt-5" style="height:52px"></div>
  <!-- Onglets Connexion / Inscription -->
  <nav class="mx-auto mb-4 flex w-full max-w-sm rounded-full bg-gray-100 p-1">
    <RouterLink :to="{ name: 'signin' }" class="flex-1 rounded-full py-2 text-center font-semibold"
      :class="route.name==='signin' ? 'bg-brand-primary text-white shadow-soft' : 'text-gray-600'">Connexion</RouterLink>
    <RouterLink :to="{ name: 'signup' }" class="flex-1 rounded-full py-2 text-center font-semibold"
      :class="route.name==='signup' ? 'bg-brand-primary text-white shadow-soft' : 'text-gray-600'">Inscription</RouterLink>
  </nav>

  <!-- Carte de connexion -->
  <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft">
    <h2 class="mb-4 text-center text-2xl font-extrabold">Se connecter</h2>
    <form class="space-y-4" @submit="submit">
      <div>
        <label class="text-sm text-gray-700">Email</label>
        <div class="relative mt-2">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg>
          </span>
          <input v-model="email" class="w-full rounded-xl border border-gray-200 p-3 pl-10" type="email" placeholder="votre@email.fr" required />
        </div>
      </div>
      <div>
        <label class="text-sm text-gray-700">Mot de passe</label>
        <div class="relative mt-2">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input :type="showPwd ? 'text' : 'password'" v-model="password" class="w-full rounded-xl border border-gray-200 p-3 pl-10 pr-10" placeholder="••••••••" required />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" @click="showPwd=!showPwd" aria-label="Afficher le mot de passe">
            <svg v-if="!showPwd" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.4 4.5"/><path d="M1 1l22 22"/></svg>
          </button>
        </div>
      </div>
      <label class="mt-1 flex items-center gap-2 text-sm text-gray-700">
        <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
        <span>Mémoriser ma connexion</span>
      </label>
      <button type="submit" class="btn-primary mt-2 w-full rounded-full py-3" :disabled="loading">{{ loading ? 'Connexion…' : 'Se connecter' }}</button>
      <RouterLink to="/forgot" class="block text-center text-sm text-brand-primary">Mot de passe oublié ?</RouterLink>
      <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
    </form>
  </div>

  <p class="mx-auto mt-6 max-w-sm text-center text-xs text-gray-500">En vous connectant, vous acceptez nos <a href="#" class="text-brand-primary underline">conditions d’utilisation</a> et notre <a href="#" class="text-brand-primary underline">politique de confidentialité</a>.</p>

</section>
</template>
