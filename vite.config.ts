import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const BACKEND_URL = 'https://shamanic-oneiric-kourtney.ngrok-free.dev'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/user': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/org': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/patient': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/pec': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/protocolAgenda': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/member': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
