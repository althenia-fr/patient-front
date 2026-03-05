# ☑️ Checklist d'Export/Import

## Phase 1: Préparation

- [ ] Installer les dépendances manquantes: `npm install chart.js vue-chartjs`
- [ ] Vérifier que `src/router/index.ts` existe dans le 2e projet
- [ ] Créer les dossiers s'ils n'existent pas: `src/pages/`, `src/utils/`, `src/components/`, `src/composables/`

---

## Phase 2: Copier les pages (12 fichiers)

Dans `src/pages/`:

- [ ] Protocols.vue
- [ ] ProtocolDetail.vue
- [ ] ProtocolResults.vue
- [ ] Qualiveen.vue
- [ ] USP.vue
- [ ] PG_I.vue
- [ ] Satisfaction.vue
- [ ] EvaluationEvolution.vue
- [ ] QuestionnaireResults.vue
- [ ] ChartResults.vue
- [ ] MictionnelCalendar.vue
- [ ] MictionnelResults.vue

---

## Phase 3: Copier les utils (14+ fichiers)

Dans `src/utils/`:

**Essentiels:**
- [ ] protocol.ts
- [ ] protocolAgenda.ts
- [ ] sessions.ts
- [ ] measures.ts
- [ ] gamification.ts
- [ ] onboarding.ts
- [ ] questionnaireResults.ts
- [ ] chartData.ts
- [ ] mictionnelStats.ts

**Données de démo:**
- [ ] demoQuestionnaireData.ts
- [ ] demoMictionnelData.ts

**Utilitaires supplémentaires:**
- [ ] auth.ts
- [ ] notifications.ts
- [ ] (copier les autres fichiers `.ts` du dossier `utils/`)

---

## Phase 4: Copier les composants (6 fichiers)

Dans `src/components/`:

- [ ] Timer.vue
- [ ] RewardToast.vue
- [ ] GamificationModal.vue
- [ ] TopBanner.vue
- [ ] ProgressBar.vue
- [ ] Badge.vue

**Optionnels (si utilisés):**
- [ ] BarChart.vue
- [ ] Card.vue
- [ ] Button.vue
- [ ] Carousel.vue
- [ ] ChartLine.vue
- [ ] FeedItem.vue
- [ ] PieChart.vue

---

## Phase 5: Copier le composable (1 fichier)

Dans `src/composables/`:

- [ ] useProtocol.ts

---

## Phase 6: Ajouter les routes

Dans `src/router/index.ts`:

- [ ] Ajouter tous les imports
- [ ] Ajouter les 12 routes au tableau `routes`
- [ ] Sauvegarder le fichier

---

## Phase 7: Vérifier les imports locaux

Pour chaque page Vue copiée, vérifier:

- [ ] Les imports de utils sont corrects: `@/utils/xxx`
- [ ] Les imports de composants sont corrects: `@/components/xxx`
- [ ] Les imports de composables sont corrects: `@/composables/xxx`
- [ ] Les imports de vue-router sont corrects: `vue-router`
- [ ] Les imports de chart.js sont corrects: `chart.js`

---

## Phase 8: Build et test

- [ ] Redémarrer le serveur de dev (ou rebuild)
- [ ] Vérifier qu'il n'y a pas d'erreurs dans la console
- [ ] Tester la route `/protocols` → affiche la liste
- [ ] Tester la route `/protocols/1` → affiche le détail
- [ ] Tester un questionnaire → redirection vers `/questionnaire-results`
- [ ] Vérifier que les résultats s'affichent

---

## Phase 9: Synchronisation localStorage

- [ ] Remplir un questionnaire dans l'app 1
- [ ] Aller dans l'app 2 → voir le même questionnaire sauvegardé
- [ ] Remplir un protocole dans l'app 2
- [ ] Aller dans l'app 1 → voir le même protocole sauvegardé

---

## 📊 Récapitulatif

| Phase | Fichiers | Statut |
|-------|----------|--------|
| Pages | 12 | - [ ] |
| Utils | 14+ | - [ ] |
| Composants | 6+ | - [ ] |
| Composables | 1 | - [ ] |
| Routes | 12 | - [ ] |
| Build/Test | - | - [ ] |
| Sync localStorage | - | - [ ] |

---

## 🔑 Clés localStorage à synchroniser

Vérifier que ces clés existent dans localStorage du 2e projet (après la 1ère utilisation):

```javascript
// Dans la console du navigateur (F12):
localStorage.getItem('questionnaire_results')      // Résultats questionnaires
localStorage.getItem('mictionnel_results')         // Résultats calendrier
localStorage.getItem('onboarding_data')           // Données d'onboarding
localStorage.getItem('protocol_sessions')         // Sessions TENS
localStorage.getItem('gamification_history')      // Points
localStorage.getItem('measures')                  // Mesures de douleur
localStorage.getItem('protocol_start_date')       // Date de début
```

---

## ✅ Tous les fichiers copiés?

Utiliser ce script pour vérifier la structure:

```bash
# Dans le 2e projet:
find src/pages -name "*.vue" | wc -l        # Doit être ≥ 12
find src/utils -name "*.ts" | wc -l         # Doit être ≥ 14
find src/components -name "*.vue" | wc -l   # Doit être ≥ 6
find src/composables -name "*.ts" | wc -l   # Doit être ≥ 1
```

---

**Note**: Si vous avez besoin de copier l'intégralité des fichiers de manière structurée, utilisez [Download Folder](#download-zip:src) pour télécharger les dossiers du projet original.
