# Guide d'Export/Import - Pages Protocoles et Questionnaires

## 📦 Vue d'ensemble

Ce guide explique comment exporter les pages `/protocols` et toutes ses pages liées d'un projet Builder.io vers un autre, en synchronisant les données via **localStorage**.

### Pages à exporter:
- ✅ `/protocols` (liste des protocoles)
- ✅ `/protocols/:id` (détail & session TENS)
- ✅ `/protocols-results` (résultats des sessions)
- ✅ 5 questionnaires (Qualiveen, USP, PG-I, Satisfaction, Évolution Thérapeutique)
- ✅ `/questionnaire-results` (résultats agrégés)
- ✅ `/chart-results` (graphiques)
- ✅ `/mictionnel` & `/mictionnel-results` (calendrier et résultats)

---

## 🔧 Étape 1: Installer les dépendances

Dans le **2e projet Builder**, s'assurer que `package.json` contient:

```json
{
  "dependencies": {
    "vue": "^3.x",
    "vue-router": "^4.x",
    "chart.js": "^4.x",
    "vue-chartjs": "^5.x"
  }
}
```

Sinon, installer:
```bash
npm install chart.js vue-chartjs
```

---

## 📋 Étape 2: Copier les pages (12 fichiers)

Copier ces fichiers vers `src/pages/` du **2e projet**:

```
src/pages/
├── Protocols.vue                 (liste des protocoles)
├── ProtocolDetail.vue            (détail & session TENS)
├── ProtocolResults.vue           (résultats des sessions)
├── Qualiveen.vue                 (questionnaire)
├── USP.vue                       (questionnaire)
├── PG_I.vue                      (questionnaire)
├── Satisfaction.vue              (questionnaire)
├── EvaluationEvolution.vue       (questionnaire)
├── QuestionnaireResults.vue      (résultats)
├── ChartResults.vue              (graphiques)
├── MictionnelCalendar.vue        (calendrier)
├── MictionnelResults.vue         (résultats calendrier)
```

---

## 🔩 Étape 3: Copier les utils (14 fichiers)

Copier ces fichiers vers `src/utils/` du **2e projet**:

```
src/utils/
├── protocol.ts                   (logique de protocole)
├── protocolAgenda.ts             (agenda du protocole)
├── sessions.ts                   (gestion des sessions)
├── measures.ts                   (mesures de douleur)
├── gamification.ts               (points & historique)
├── onboarding.ts                 (données d'onboarding)
├── questionnaireResults.ts       (résultats questionnaires)
├── chartData.ts                  (données pour graphiques)
├── mictionnelStats.ts            (stats mictionnel)
├── demoQuestionnaireData.ts      (données de démo)
├── demoMictionnelData.ts         (données mictionnel démo)
├── auth.ts                       (authentification)
├── notifications.ts              (notifications)
└── ...autres utilitaires
```

---

## ⚙️ Étape 4: Copier les composants (6 fichiers)

Copier ces fichiers vers `src/components/` du **2e projet**:

```
src/components/
├── Timer.vue                     (minuteur session)
├── RewardToast.vue              (notification récompense)
├── GamificationModal.vue         (modal gamification)
├── TopBanner.vue                (banneau supérieur)
├── ProgressBar.vue              (barre de progression)
└── Badge.vue                    (badges)
```

---

## 🎯 Étape 5: Copier le composable (1 fichier)

Copier vers `src/composables/`:

```
src/composables/
└── useProtocol.ts               (logique du protocole)
```

---

## 🔌 Étape 6: Ajouter les routes

Ouvrir `src/router/index.ts` du **2e projet** et ajouter ces imports:

```typescript
import Protocols from '@/pages/Protocols.vue'
import ProtocolDetail from '@/pages/ProtocolDetail.vue'
import ProtocolResults from '@/pages/ProtocolResults.vue'
import Qualiveen from '@/pages/Qualiveen.vue'
import USP from '@/pages/USP.vue'
import PGI from '@/pages/PG_I.vue'
import Satisfaction from '@/pages/Satisfaction.vue'
import EvaluationEvolution from '@/pages/EvaluationEvolution.vue'
import QuestionnaireResults from '@/pages/QuestionnaireResults.vue'
import ChartResults from '@/pages/ChartResults.vue'
import MictionnelCalendar from '@/pages/MictionnelCalendar.vue'
import MictionnelResults from '@/pages/MictionnelResults.vue'
```

Et ajouter dans le tableau `routes`:

```typescript
const routes: RouteRecordRaw[] = [
  // ... routes existantes ...
  { path: '/protocols', name: 'protocols', component: Protocols, meta: { requiresAuth: true } },
  { path: '/protocols/:id', name: 'protocol-detail', component: ProtocolDetail, meta: { requiresAuth: true } },
  { path: '/protocols-results', name: 'protocol-results', component: ProtocolResults, meta: { requiresAuth: true } },
  { path: '/qualiveen', name: 'qualiveen', component: Qualiveen, meta: { requiresAuth: true } },
  { path: '/usp', name: 'usp', component: USP, meta: { requiresAuth: true } },
  { path: '/pgi_i', name: 'pgi_i', component: PGI, meta: { requiresAuth: true } },
  { path: '/satisfaction', name: 'satisfaction', component: Satisfaction, meta: { requiresAuth: true } },
  { path: '/evaluation-evolution', name: 'evaluation_evolution', component: EvaluationEvolution, meta: { requiresAuth: true } },
  { path: '/questionnaire-results', name: 'questionnaire-results', component: QuestionnaireResults, meta: { requiresAuth: true } },
  { path: '/chart-results', name: 'chart-results', component: ChartResults, meta: { requiresAuth: true } },
  { path: '/mictionnel', name: 'mictionnel', component: MictionnelCalendar, meta: { requiresAuth: true } },
  { path: '/mictionnel-results', name: 'mictionnel-results', component: MictionnelResults, meta: { requiresAuth: true } },
]
```

---

## 💾 Étape 7: Synchronisation localStorage

**Bonne nouvelle**: Les deux apps Builder.io vont automatiquement synchroniser `localStorage` car elles partagent les mêmes clés:

### Clés localStorage synchronisées:
```
- questionnaire_results      (résultats des questionnaires)
- mictionnel_results         (résultats du calendrier)
- onboarding_data           (données d'onboarding)
- protocol_sessions         (sessions TENS)
- gamification_history      (points et historique)
- measures                  (mesures de douleur)
- protocol_start_date       (date de début)
```

### Aucune configuration supplémentaire nécessaire! ✅

Les deux apps vont lire/écrire dans les mêmes clés localStorage automatiquement.

---

## ✅ Vérification post-import

Après avoir copié tous les fichiers:

1. **Build le 2e projet**: `npm run build` ou vérifier que le serveur de dev démarre
2. **Tester les routes**:
   - `/protocols` → affiche la liste
   - `/protocols/1` → détail & session
   - `/questionnaire-results` → résultats
   - `/chart-results` → graphiques
3. **Vérifier la synchro**: Remplir un questionnaire dans l'une des apps → il apparaît dans l'autre

---

## 🚀 Résumé des étapes

```bash
✓ Installer chart.js et vue-chartjs
✓ Copier 12 pages Vue → src/pages/
✓ Copier 14 utils → src/utils/
✓ Copier 6 composants → src/components/
✓ Copier 1 composable → src/composables/
✓ Ajouter routes dans src/router/index.ts
✓ Builder reconnaît automatiquement localStorage partagé
✓ Tester les routes et la synchronisation
```

---

## 🆘 Dépannage

### Erreur: "Cannot find module '@/utils/xxx'"
→ Vérifier que tous les fichiers utils sont copiés

### Erreur: "Cannot find module '@/components/xxx'"
→ Vérifier que tous les composants sont copiés

### Données ne se synchronisent pas
→ Vérifier que les deux apps utilisent le même domaine Builder
→ Vérifier la console du navigateur (F12) pour les erreurs

### Route non trouvée
→ Vérifier que l'import et la route sont ajoutés dans `src/router/index.ts`

---

## 📝 Notes importantes

- **Les deux apps partagent localStorage automatiquement** dans Builder.io
- Pas de configuration API ou webhook nécessaire
- Les données se synchronisent en temps réel entre les deux apps
- Si une app est fermée, les données seront chargées à la réouverture

---

**Besoin d'aide?** Contactez le support Builder.io
