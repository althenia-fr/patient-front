<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/services/api'
import { useFieldValidation } from '@/composables/useFormValidation'
import { validatePasswordStrength, validateMatch } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const token = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const isLoading = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordValidation = useFieldValidation(validatePasswordStrength)
const confirmPasswordValidation = useFieldValidation((v) => validateMatch(password.value, v, 'Les mots de passe'))

const canSubmit = computed(() => {
  return password.value.trim() &&
    confirmPassword.value.trim() &&
    !passwordValidation.error.value &&
    !confirmPasswordValidation.error.value &&
    !isLoading.value
})

onMounted(() => {
  // Extract query parameters
  token.value = (route.query.token as string) || ''
  email.value = (route.query.email as string) || ''

  // Validate required parameters
  if (!token.value || !email.value) {
    console.error('❌ Missing or invalid query parameters')
    error.value = 'Lien de réinitialisation invalide. Veuillez demander un nouveau lien.'
  }
})

async function handleSubmit() {
  if (!canSubmit.value) return

  // Validate fields
  passwordValidation.validate(password.value)
  confirmPasswordValidation.validate(confirmPassword.value)

  if (passwordValidation.error.value || confirmPasswordValidation.error.value) {
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    const response = await authApi.resetPassword({
      email: email.value,
      resetToken: token.value,
      newPassword: password.value,
      confirmPassword: confirmPassword.value
    })

    if (response.success) {
      success.value = true

      setTimeout(() => {
        router.push('/signin')
      }, 2000)
    } else {
      throw new Error(response.message || 'Échec de la réinitialisation du mot de passe')
    }
  } catch (e: any) {

    let errorMessage = e?.message || 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.'

    if (errorMessage.includes('<') && errorMessage.includes('>')) {
      errorMessage = 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.'
    }

    if (errorMessage.length > 200) {
      errorMessage = 'Une erreur est survenue. Veuillez réessayer ou demander un nouveau lien de réinitialisation.'
    }

    error.value = errorMessage
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Ff2976922c6674ae58e827df6ab219826%2Fb5170d6920ee41e48ca941ee67515fec?format=webp&width=800"
          alt="STIMÉO CONNECT" class="h-16 md:h-20 w-auto mb-6 mx-auto" />
        <h1 class="text-2xl font-semibold text-slate-900 mb-2">Nouveau mot de passe</h1>
        <p class="text-sm text-slate-600">Créez un nouveau mot de passe sécurisé pour votre compte</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div class="text-green-600 text-5xl mb-4">✓</div>
        <h3 class="text-lg font-semibold text-green-900 mb-2">Mot de passe réinitialisé avec succès !</h3>
        <p class="text-sm text-green-700">Votre mot de passe a été mis à jour. Vous pouvez maintenant fermer cette page.
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="error && !success" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div class="flex items-start">
          <span class="text-red-600 text-xl mr-3">⚠</span>
          <div>
            <h3 class="text-sm font-medium text-red-900 mb-1">Erreur</h3>
            <p class="text-xs text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div v-if="!success && !error" class="bg-white border border-slate-200 rounded-xl shadow-soft p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Email (read-only) -->
          <div>
            <label class="text-xs text-graybrand">Email</label>
            <input :value="email" type="email" readonly
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 cursor-not-allowed" />
          </div>

          <!-- New Password -->
          <div>
            <label class="text-xs text-graybrand">Nouveau mot de passe <span class="text-red-500">*</span></label>
            <div class="mt-1 relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'"
                @input="passwordValidation.validate(password)" @blur="passwordValidation.validate(password)"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9"
                placeholder="Entrez votre nouveau mot de passe" />
              <button type="button" class="absolute inset-y-0 right-2 my-auto text-xs text-graybrand"
                @click="showPassword = !showPassword" aria-label="Afficher ou masquer le mot de passe">
                👁️
              </button>
            </div>
            <p v-if="passwordValidation.error.value" class="text-xs text-red-500 mt-1">
              {{ passwordValidation.error.value }}
            </p>
            <p class="text-xs text-slate-500 mt-1">Au moins 8 caractères, 1 majuscule et 1 chiffre</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="text-xs text-graybrand">Confirmer le mot de passe <span class="text-red-500">*</span></label>
            <div class="mt-1 relative">
              <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                @input="confirmPasswordValidation.validate(confirmPassword)"
                @blur="confirmPasswordValidation.validate(confirmPassword)"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9"
                placeholder="Confirmez votre nouveau mot de passe" />
              <button type="button" class="absolute inset-y-0 right-2 my-auto text-xs text-graybrand"
                @click="showConfirmPassword = !showConfirmPassword" aria-label="Afficher ou masquer le mot de passe">
                👁️
              </button>
            </div>
            <p v-if="confirmPasswordValidation.error.value" class="text-xs text-red-500 mt-1">
              {{ confirmPasswordValidation.error.value }}
            </p>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="!canSubmit" :class="[
            'w-full rounded-xl px-4 py-2 shadow-soft transition-all mt-6',
            canSubmit ? 'bg-gold text-slate-900 hover:bg-gold/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]">
            <span v-if="isLoading">Réinitialisation en cours...</span>
            <span v-else>Réinitialiser le mot de passe</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
