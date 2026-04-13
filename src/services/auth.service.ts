import apiClient from './core/apiClient'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/types/api.types'
import {logError, prettyPrintErrorMsg} from '@/utils/apiErrorHandler'
import type {
  LoginRequest,
} from '@/types/auth.types'
import { authUser } from '@/utils/auth'
import {type AuthData} from "@/types/auth.types";

export const authApi = {

  async login(data: LoginRequest): Promise<AuthData> {
    try {
      const response = await apiClient.post<AuthData>(API_ENDPOINTS.AUTH.LOGIN, data)


        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
        localStorage.setItem(STORAGE_KEYS.ALTH_USER, JSON.stringify(response.data))
        authUser.value = { email: response.data.email, user_metadata: response.data }

        return response.data

    } catch (error: any) {
      let errorMsg = prettyPrintErrorMsg(error.response)
      logError('Login', errorMsg)
      throw new Error(errorMsg)
    }
  }

}
