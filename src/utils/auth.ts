import { shallowRef } from 'vue'
import router from "@/router";
import {STORAGE_KEYS} from "@/types/api.types.ts";

export const authUser = shallowRef<any | null>(null)


export async function initAuth() {
  // Check real auth first
  const user = localStorage.getItem(STORAGE_KEYS.ALTH_USER)
  if (user) {
    try {
      const data = JSON.parse(user)
      authUser.value = { email: data.email, user_metadata: data }
      return
    } catch (e) { /* ignore */ }
  }
  else router.replace({ name: 'login' })
}


export async function signOut() {
  // Clear mock auth

  // Clear real auth tokens
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.ALTH_USER)
  localStorage.removeItem('protocol_start')

  // Clear auth state
  authUser.value = null
}
