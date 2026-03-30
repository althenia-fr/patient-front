import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import Home from '@/pages/Home.vue'
import Welcome from '@/pages/Welcome.vue'
import Protocols from '@/pages/Protocols.vue'
import ProtocolDetail from '@/pages/ProtocolDetail.vue'
import Profile from '@/pages/Profile.vue'
import FAQ from '@/pages/FAQ.vue'
import Support from '@/pages/Support.vue'
import Notifications from '@/pages/Notifications.vue'
import Education from '@/pages/Education.vue'
import Providers from '@/pages/Providers.vue'
import SignIn from '@/pages/auth/SignIn.vue'
import SignUp from '@/pages/auth/SignUp.vue'
import ForgotPassword from '@/pages/auth/ForgotPassword.vue'
import Consent from '@/pages/auth/Consent.vue'
import Qualiveen from '@/pages/Qualiveen.vue'
import USP from '@/pages/USP.vue'
import PGI from '@/pages/PG_I.vue'
import Satisfaction from '@/pages/Satisfaction.vue'
import EvaluationEvolution from '@/pages/EvaluationEvolution.vue'
import QuestionnaireResults from '@/pages/QuestionnaireResults.vue'
import ChartResults from '@/pages/ChartResults.vue'
import MictionnelCalendar from '@/pages/MictionnelCalendar.vue'
import MictionnelResults from '@/pages/MictionnelResults.vue'
import ProtocolResults from '@/pages/ProtocolResults.vue'

const ResetPassword = () => import('../pages/ResetPassword.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'welcome', component: Welcome, meta: { layout: 'auth' } },
  { path: '/home', name: 'home', component: Home, meta: { requiresAuth: true } },
  { path: '/protocols', name: 'protocols', component: Protocols, meta: { requiresAuth: true } },
  { path: '/protocols/:id', name: 'protocol-detail', component: ProtocolDetail, meta: { requiresAuth: true } },
  { path: '/protocols-results', name: 'protocol-results', component: ProtocolResults, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/education', name: 'education', component: Education },
  { path: '/qualiveen', name: 'qualiveen', component: Qualiveen, meta: { requiresAuth: true } },
  { path: '/usp', name: 'usp', component: USP, meta: { requiresAuth: true } },
  { path: '/pgi_i', name: 'pgi_i', component: PGI, meta: { requiresAuth: true } },
  { path: '/satisfaction', name: 'satisfaction', component: Satisfaction, meta: { requiresAuth: true } },
  { path: '/evaluation-evolution', name: 'evaluation_evolution', component: EvaluationEvolution, meta: { requiresAuth: true } },
  { path: '/questionnaire-results', name: 'questionnaire-results', component: QuestionnaireResults, meta: { requiresAuth: true } },
  { path: '/chart-results', name: 'chart-results', component: ChartResults, meta: { requiresAuth: true } },
  { path: '/mictionnel', name: 'mictionnel', component: MictionnelCalendar, meta: { requiresAuth: true } },
  { path: '/mictionnel-results', name: 'mictionnel-results', component: MictionnelResults, meta: { requiresAuth: true } },
  { path: '/providers', name: 'providers', component: Providers, meta: { requiresAuth: true } },
  { path: '/support', name: 'support', component: Support },
  { path: '/notifications', name: 'notifications', component: Notifications, meta: { requiresAuth: true } },
  { path: '/faq', name: 'faq', component: FAQ },
  // Auth pages
  { path: '/signin', name: 'signin', component: SignIn, meta: { layout: 'auth' } },
  { path: '/signup', name: 'signup', component: SignUp, meta: { layout: 'auth' } },
  { path: '/forgot', name: 'forgot', component: ForgotPassword, meta: { layout: 'auth' } },
  { path: '/consent', name: 'consent', component: Consent, meta: { layout: 'auth' } },
  { path: '/reset-password', name: 'reset-password', component: ResetPassword, meta: { layout: 'auth', title: 'Nouveau mot de passe' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

import { authUser } from '@/utils/auth'

router.beforeEach((to, _from, next) => {
  if (to.meta && (to.meta as any).requiresAuth && !authUser.value) {
    next({ name: 'signin', query: { redirect: to.fullPath } })
    return
  }
  if (to.name === 'welcome' && authUser.value) {
    next({ name: 'home' })
    return
  }
  // Redirect authenticated users away from reset password page
  if (to.name === 'reset-password' && authUser.value) {
    next({ name: 'home' })
    return
  }
  next()
})

export default router
