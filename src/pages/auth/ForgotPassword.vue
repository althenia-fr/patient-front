<script setup lang="ts">
import { ref } from 'vue'
import { recover } from '@/utils/auth'

const email = ref('')
const sent = ref(false)
const error = ref('')

async function submit(e: Event) {
  e.preventDefault()
  error.value = ''
  try {
    await recover(email.value)
    sent.value = true
  } catch (err: any) {
    error.value = err?.message || 'Échec de l’envoi'
  }
}
</script>
<template>
  <section class="mx-auto max-w-md px-4 py-8">
    <h2 class="mb-4 text-center text-2xl font-extrabold">Mot de passe oublié</h2>
    <form class="space-y-3" @submit="submit">
      <input v-model="email" class="w-full rounded-xl border border-gray-200 p-3" type="email" placeholder="Email" required />
      <button type="submit" class="btn-primary w-full">Envoyer le lien</button>
      <p v-if="sent" class="text-center text-sm text-brand-primary">Lien envoyé, vérifiez votre email.</p>
      <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
    </form>
  </section>
</template>
