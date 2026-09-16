import axios, { type AxiosInstance } from 'axios'
import {wrapLocalStorage} from "@/services/storage.service.ts";
const {user} = wrapLocalStorage()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  //  'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = user.value?user.value.accessToken:null
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

export default apiClient
