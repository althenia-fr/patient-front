<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signUp, signIn } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const consent = ref(false)
const error = ref('')
const loading = ref(false)

async function submit(e: Event) {
  e.preventDefault()
  error.value = ''
  if (password.value !== confirm.value) { error.value = 'Les mots de passe ne correspondent pas'; return }
  if (!consent.value) { error.value = 'Le consentement est requis'; return }
  loading.value = true
  try {
    await signUp(email.value, password.value, { firstName: firstName.value, lastName: lastName.value, consent: true })
    await signIn(email.value, password.value)
    router.push('/home')
  } catch (err: any) {
    error.value = err?.message || 'Échec de l’inscription'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section class="mx-auto max-w-md px-4 py-8">
    <img
      loading="lazy"
      srcset="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3"
      src="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2F7034e75297f34df5a669a4bea13a78d3"
      alt=""
      class="w-full object-cover mt-5"
      style="aspect-ratio:2.51; min-width:20px; min-height:20px; overflow:hidden;"
    />
    <div class="relative mt-5 flex flex-col h-4 sm:h-[200px]"></div>
    <!-- Onglets Connexion / Inscription -->
    <nav class="mx-auto mb-4 flex w-full max-w-sm rounded-full bg-gray-100 p-1">
      <RouterLink :to="{ name: 'signin' }" class="flex-1 rounded-full py-2 text-center font-semibold"
        :class="route.name==='signin' ? 'bg-brand-primary text-white shadow-soft' : 'text-gray-600'">Connexion</RouterLink>
      <RouterLink :to="{ name: 'signup' }" class="flex-1 rounded-full py-2 text-center font-semibold"
        :class="route.name==='signup' ? 'bg-brand-primary text-white shadow-soft' : 'text-gray-600'">Inscription</RouterLink>
    </nav>
    <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft">
      <h2 class="mb-4 text-center text-2xl font-extrabold">Créer un compte</h2>
    <form class="space-y-3" @submit="submit">
      <div class="grid grid-cols-2 gap-3">
        <input v-model="firstName" class="rounded-xl border border-gray-200 p-3" placeholder="Prénom" required />
        <input v-model="lastName" class="rounded-xl border border-gray-200 p-3" placeholder="Nom" required />
      </div>
      <input v-model="email" class="w-full rounded-xl border border-gray-200 p-3" type="email" placeholder="Email" required />
      <input v-model="password" class="w-full rounded-xl border border-gray-200 p-3" type="password" placeholder="Mot de passe" required />
      <input v-model="confirm" class="w-full rounded-xl border border-gray-200 p-3" type="password" placeholder="Confirmer le mot de passe" required />
      <label class="flex w-full items-start gap-3 text-sm">
        <input v-model="consent" type="checkbox" class="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" required />
        <span class="flex-1 whitespace-normal break-words leading-snug">J’accepte que mes données soient utilisées conformément à la réglementation (RGPD, HDS)</span>
      </label>
      <button type="submit" class="btn-primary w-full" :disabled="loading">{{ loading ? 'Création…' : 'S’inscrire' }}</button>
      <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
    </form>
    </div>
    <p class="mt-4 text-center text-sm">Déjà un compte ? <RouterLink to="/signin" class="text-brand-primary">Se connecter</RouterLink></p>
  </section>
</template>
