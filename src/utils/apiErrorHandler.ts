export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

export function getErrorMessage(error: any): string {
  if (error?.error) {
    return error.error
  }

  if (error?.response) {
    const data = error.response.data
    const contentType = error.response.headers?.['content-type']

    if (
      (contentType && contentType.includes('text/html')) ||
      (typeof data === 'string' && data.trim().startsWith('<'))
    ) {
      return 'Le service est temporairement indisponible. Veuillez réessayer plus tard.'
    }

    if (data) {
      if (data.errorCode) return data.errorCode
      if (data.message) return data.message
      if (data.error) return data.error
      if (data.msg) return data.msg

      if (typeof data === 'string') return data
    }
  }

  if (error?.message) {
    return error.message
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

export function getStatusMessage(statusCode: number): string {
  const statusMessages: Record<number, string> = {
    400: 'Requête invalide. Veuillez vérifier vos informations.',
    401: 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.',
    403: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
    404: 'Ressource non trouvée.',
    409: 'Conflit. Cette ressource existe déjà.',
    422: 'Données invalides. Veuillez vérifier les informations saisies.',
    429: 'Trop de tentatives. Veuillez réessayer plus tard.',
    500: 'Erreur serveur. Veuillez réessayer plus tard.',
    502: 'Service temporairement indisponible.',
    503: 'Service en maintenance. Veuillez réessayer plus tard.',
  }

  return statusMessages[statusCode] || `Erreur ${statusCode}. Veuillez réessayer.`
}

export function createApiError(error: any): ApiError {
  const statusCode = error?.response?.status
  const backendMessage = getErrorMessage(error)

  const message = backendMessage !== 'Une erreur est survenue. Veuillez réessayer.'
    ? backendMessage
    : (statusCode ? getStatusMessage(statusCode) : backendMessage)

  return {
    message,
    code: error?.response?.data?.code || error?.code,
    statusCode,
    details: error?.response?.data?.details || error?.details,
  }
}

export function isNetworkError(error: any): boolean {
  return (
    error?.message === 'Network Error' ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  )
}

export function isAuthError(error: any): boolean {
  return error?.response?.status === 401 || error?.response?.status === 403
}

export function isValidationError(error: any): boolean {
  return error?.response?.status === 422 || error?.response?.status === 400
}

export function logError(context: string, error: any): void {
  const apiError = createApiError(error)

  console.error(`[${context}] API Error:`, {
    message: apiError.message,
    code: apiError.code,
    statusCode: apiError.statusCode,
    details: apiError.details,
    originalError: error,
  })
}
