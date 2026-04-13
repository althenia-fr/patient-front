import { STORAGE_KEYS } from '@/types/api.types'

/**
 * Clears all authentication state from localStorage.
 * Called by apiClient when a token refresh fails, before redirecting to login.
 */
export function clearAuthState(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.ALTH_USER)
}
