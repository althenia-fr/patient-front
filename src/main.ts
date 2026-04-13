import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initAuth } from './utils/auth'
import { startScheduler } from './utils/reminders'
import { getDailyCoachMessage } from './utils/coach'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUsers, faHandHoldingMedical, faHouse, faBed, faFileMedical, faGear, faTrashCan, faMagnifyingGlass, faPlus,
  faCirclePlus, faEye, faEyeSlash, faFilePdf, faFile, faPencil, faRightFromBracket, faKitMedical, faChevronRight
} from '@fortawesome/free-solid-svg-icons'

import {
  faUser, faCalendar, faFolder
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faUser, faCalendar, faFolder,

  faUsers, faHandHoldingMedical, faHouse, faBed, faFileMedical, faGear, faTrashCan, faPlus, faMagnifyingGlass,
  faCirclePlus, faEye, faEyeSlash, faFilePdf, faFile, faPencil, faRightFromBracket, faKitMedical, faChevronRight
)

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

initAuth()
startScheduler(() => {
  try { new Notification('Coaching quotidien', { body: getDailyCoachMessage() }) } catch {}
})
const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')
