export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  statusCode?: number
  details?: any
}

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/org/signup',
    LOGIN: '/org/login',
    PWDRESET: '/user/pwdreset',
    PWDEDIT: '/user/pwdedit',
    REFRESH_TOKEN: '/user/refresh-token',
  },
  PATIENT: {
    ADD: '/patient/add',
    LIST: '/patient/list',
    DELETE: '/patient/delete',
    VIEW: '/patient/view',
    UPDATE: '/patient/update',
  },
  PEC: {
    CREATE: '/pec/create',
    LIST: '/pec/list',
    PDF_UPLOAD: '/pec/pdfupload',
    SKU_LIST: '/pec/skulist',
    SKU_PROGRAMS: '/pec/skuPrograms',
  },
  MEMBERS: {
    LIST: '/member/all',
    CREATE: '/member/add',
    DELETE: (id?: number) => `/member/delete?uid=${id}`,
    UPDATE: (id: number) => `/member/update?uid=${id}`,
  },
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  ALTH_USER: 'alth_user',
} as const
