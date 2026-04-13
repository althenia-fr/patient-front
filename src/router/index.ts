import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'


import Splash from '@/pages/preinstall/Splash.vue'
import Safari from '@/pages/preinstall/Safari.vue'
import Chrome from '@/pages/preinstall/Chrome.vue'

import Home from '@/pages/Home.vue'
import Protocols from '@/pages/Protocols.vue'
import ProtocolDetail from '@/pages/ProtocolDetail.vue'
import Profile from '@/pages/Profile.vue'
import FAQ from '@/pages/FAQ.vue'
import Support from '@/pages/Support.vue'
import Notifications from '@/pages/Notifications.vue'
import Education from '@/pages/Education.vue'
import Providers from '@/pages/Providers.vue'
import Login from '@/pages/auth/Login.vue'
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
import { authUser } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
    { path: '/', name: 'splash', component: Splash, meta: { requiresAuth: false } },
    { path: '/safari', name: 'safari', component: Safari, meta: { requiresAuth: false } },
    { path: '/chrome', name: 'chrome', component: Chrome, meta: { requiresAuth: false } },
    { path: '/faq', name: 'faq', component: FAQ, meta: { requiresAuth: false } },

    { path: '/login', name: 'login', component: Login, meta: { requiresAuth: false }  },
    { path: '/consent', name: 'consent', component: Consent, meta: { requiresAuth: false }  },

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

    // ALWAYS LASt ROUTE (catchall)
    {path: '/:pathMatch(.*)*',name: 'not-found', component: Splash, meta: { requiresAuth: false } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})


router.beforeEach((to, _from, next) => {

    if (to.meta && (to.meta as any).requiresAuth && !authUser.value) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.name === 'splash' && authUser.value) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
