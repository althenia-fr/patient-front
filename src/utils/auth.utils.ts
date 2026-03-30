import { STORAGE_KEYS } from '@/types/api.types'

/**
 * Clears all authentication state from sessionStorage.
 * Called by apiClient when a token refresh fails, before redirecting to login.
 */
export function clearAuthState(): void {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.ALTH_USER)
}
