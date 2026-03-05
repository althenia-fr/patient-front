import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initAuth, signUp } from './utils/auth'
import { saveOnboarding } from './utils/onboarding'
import { startScheduler } from './utils/reminders'
import { getDailyCoachMessage } from './utils/coach'

const saved = localStorage.getItem('theme')
if (saved === 'dark') {
  document.documentElement.classList.add('dark')
}

// Disabled SW during debugging to avoid stale cache issues
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(() => {})
//   })
// }

// Initialize test user data
async function initializeTestData() {
  try {
    const testEmail = 'contact@stimeo.care'
    const testPassword = 'toto'
    let users = JSON.parse(localStorage.getItem('mock_users') || '[]')

    // Always update/create test user (to reset data on each load)
    const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === testEmail.toLowerCase())

    if (userIdx >= 0) {
      // Update existing test user
      users[userIdx] = {
        email: testEmail,
        password: testPassword,
        user_metadata: {
          firstName: 'Test',
          lastName: 'User'
        }
      }
    } else {
      // Create new test user
      users.push({
        email: testEmail,
        password: testPassword,
        user_metadata: {
          firstName: 'Test',
          lastName: 'User'
        }
      })
    }

    localStorage.setItem('mock_users', JSON.stringify(users))

    // Initialize protocol data - Always reset to S4 (Week 4)
    // S4 means we started 3 weeks ago
    const protocolStartDate = new Date()
    protocolStartDate.setDate(protocolStartDate.getDate() - 21) // 3 weeks = 21 days before today

    const checkupDate = new Date()
    checkupDate.setDate(checkupDate.getDate() + 70) // 10 weeks remaining = 70 days

    saveOnboarding({
      protocol: {
        specialty: 'UROLOGIE'
      },
      facility: {
        name: 'Centre Hospitalier Universitaire',
        address: '123 Avenue de la République, 75001 Paris',
        doctor: 'Dr. Marie BERNARD'
      },
      device: {
        model: 'TENS-2000',
        serial: 'SN123456'
      },
      protocolStartDate: protocolStartDate.toISOString().split('T')[0],
      protocolDuration: 13,
      sessionCount: 1,
      sessionDuration: 20,
      evaluationEvolutionFrequency: 'Hebdomadaire',
      evaluationEvolutionStartWeek: 4,
      protocolExtension: 0,
      deviceSleepDate: '',
      done: true
    })
  } catch (err) {
    console.error('Test data initialization failed:', err)
  }
}

initializeTestData()
initAuth()
startScheduler(() => {
  try { new Notification('Coaching quotidien', { body: getDailyCoachMessage() }) } catch {}
})
createApp(App).use(router).mount('#app')
