import { saveResult } from './questionnaireResults'
import { saveOnboarding, getOnboarding } from './onboarding'
import { seedDemoMictionnelData } from './demoMictionnelData'

export function seedDemoQuestionnaireResults() {
  const onb = getOnboarding()
  const protocolDuration = onb?.protocolDuration || 26
  const startWeek = onb?.evaluationEvolutionStartWeek || 4

  // Clear existing results to start fresh
  localStorage.removeItem('questionnaire_results')

  const startDate = onb?.protocolStartDate ? new Date(onb.protocolStartDate) : new Date('2024-01-15')

  // Generate results for each week based on protocol agenda
  for (let week = 1; week <= protocolDuration; week++) {
    // Week 1: USP + Qualiveen
    if (week === 1) {
      const uspDate = new Date(startDate)
      uspDate.setDate(uspDate.getDate() + (week - 1) * 7 + 2)
      saveResult('USP', {
        date: uspDate.toLocaleDateString('fr-FR'),
        effort: { q1: 2, q2: 3, q3: 2 },
        hyper: { q1: 1, q2: 2, q3: 3, q4: 2, q5: 1, q6: 2, q7: 1 },
        dysurie: { q1: 2, q2: 1, q3: 2 },
        scores: { total: 24 },
      }, week)

      const qualiveenDate = new Date(startDate)
      qualiveenDate.setDate(qualiveenDate.getDate() + (week - 1) * 7 + 2)
      saveResult('Qualiveen', {
        date: qualiveenDate.toLocaleDateString('fr-FR'),
        answers: { q1: 2, q2: 2, q3: 1, q4: 2, q5: 2, q6: 1, q7: 3, q8: 2 },
        scores: { gene: 2.0, craintes: 1.5, vecu: 1.5, contraintes: 2.5, total: 1.88 },
      }, week)
    }

    // Weeks 4, 8, 12, 16, 20, 24: Satisfaction + PG-I
    if ([4, 8, 12, 16, 20, 24].includes(week)) {
      const satisfactionDate = new Date(startDate)
      satisfactionDate.setDate(satisfactionDate.getDate() + (week - 1) * 7 + 2)
      const satisfactionIndex = week <= 8 ? 3 : week <= 16 ? 2 : 1
      saveResult('Satisfaction', {
        date: satisfactionDate.toLocaleDateString('fr-FR'),
        satisfaction: satisfactionIndex,
        satisfactionScore: 6 - satisfactionIndex,
      }, week)

      const pgiDate = new Date(startDate)
      pgiDate.setDate(pgiDate.getDate() + (week - 1) * 7 + 3)
      const pgiIndex = week <= 8 ? 2 : week <= 16 ? 1 : 0
      saveResult('PG-I', {
        date: pgiDate.toLocaleDateString('fr-FR'),
        pgi_i: pgiIndex,
        pgiScore: 6 - pgiIndex,
      }, week)
    }

    // Evolution Thérapeutique: Based on frequency and start week
    const evaluationFrequency = onb?.evaluationEvolutionFrequency || 'Hebdomadaire'
    let evaluationWeeks: number[] = []

    if (evaluationFrequency === 'Hebdomadaire') {
      evaluationWeeks = Array.from({ length: protocolDuration - startWeek + 1 }, (_, i) => startWeek + i)
    } else if (evaluationFrequency === 'Bimensuel') {
      for (let w = startWeek; w <= protocolDuration; w += 2) {
        evaluationWeeks.push(w)
      }
    } else if (evaluationFrequency === 'Mensuel') {
      for (let w = startWeek; w <= protocolDuration; w += 4) {
        evaluationWeeks.push(w)
      }
    }

    if (evaluationWeeks.includes(week)) {
      const evolutionDate = new Date(startDate)
      evolutionDate.setDate(evolutionDate.getDate() + (week - 1) * 7 + 1)

      // Simulate improvement over time
      const improvementFactor = Math.max(0, 20 - week) / 20
      const baseUrgenturies = 15
      const baseMictions = 8
      const baseFuites = 6
      const baseDouleur = 7

      saveResult('Evolution Thérapeutique', {
        date: evolutionDate.toLocaleDateString('fr-FR'),
        urgenturies: { nombre: Math.max(0, Math.round(baseUrgenturies * (0.5 + improvementFactor * 0.5))) },
        mictions_nocturnes: { nombre: Math.max(0, Math.round(baseMictions * (0.4 + improvementFactor * 0.6))) },
        fuites_urinaires: { nombre: Math.max(0, Math.round(baseFuites * (0.3 + improvementFactor * 0.7))) },
        douleur: {
          miction_eva: Math.max(0, Math.round(baseDouleur * (0.3 + improvementFactor * 0.7))),
          hors_miction_eva: Math.max(0, Math.round((baseDouleur - 2) * (0.2 + improvementFactor * 0.8))),
        },
        protections: {
          etat: week <= 8 ? 'Saturée' : week <= 16 ? 'Humide' : 'Sèche',
          evolution: week <= 8 ? 'Augmentation' : week <= 16 ? 'Stable' : 'Diminution',
        },
      }, week)
    }

    // Final week (S-1 = 25 for 26-week protocol): USP + Qualiveen + Satisfaction + PG-I
    if (week === protocolDuration - 1) {
      if (!([4, 8, 12, 16, 20, 24].includes(week))) {
        const satisfactionDate = new Date(startDate)
        satisfactionDate.setDate(satisfactionDate.getDate() + (week - 1) * 7 + 2)
        saveResult('Satisfaction', {
          date: satisfactionDate.toLocaleDateString('fr-FR'),
          satisfaction: 0,
          satisfactionScore: 6,
        }, week)

        const pgiDate = new Date(startDate)
        pgiDate.setDate(pgiDate.getDate() + (week - 1) * 7 + 3)
        saveResult('PG-I', {
          date: pgiDate.toLocaleDateString('fr-FR'),
          pgi_i: 0,
          pgiScore: 6,
        }, week)
      }

      const uspDate = new Date(startDate)
      uspDate.setDate(uspDate.getDate() + (week - 1) * 7 + 2)
      saveResult('USP', {
        date: uspDate.toLocaleDateString('fr-FR'),
        effort: { q1: 1, q2: 1, q3: 1 },
        hyper: { q1: 0, q2: 1, q3: 1, q4: 1, q5: 0, q6: 1, q7: 0 },
        dysurie: { q1: 1, q2: 0, q3: 1 },
        scores: { total: 28 },
      }, week)

      const qualiveenDate = new Date(startDate)
      qualiveenDate.setDate(qualiveenDate.getDate() + (week - 1) * 7 + 2)
      saveResult('Qualiveen', {
        date: qualiveenDate.toLocaleDateString('fr-FR'),
        answers: { q1: 0, q2: 1, q3: 0, q4: 1, q5: 1, q6: 0, q7: 1, q8: 1 },
        scores: { gene: 0.5, craintes: 0.5, vecu: 0.5, contraintes: 1.0, total: 0.625 },
      }, week)
    }
  }

  console.log('Demo questionnaire data seeded successfully')
}

export function seedDemoOnboarding() {
  // Ensure we have a 26-week protocol starting from a date 26 weeks ago
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 26 * 7)

  // Calculate sleep device date (Semaine 5)
  const sleepDeviceDate = new Date(startDate)
  sleepDeviceDate.setDate(sleepDeviceDate.getDate() + (5 - 1) * 7)

  const onb = getOnboarding()
  saveOnboarding({
    ...onb,
    protocolDuration: 26,
    protocolStartDate: startDate.toISOString().split('T')[0],
    sessionCount: 1,
    sessionDuration: 20,
    evaluationEvolutionFrequency: 'Hebdomadaire',
    evaluationEvolutionStartWeek: 4,
    deviceSleepDate: sleepDeviceDate.toISOString().split('T')[0],
  })

  console.log('Demo onboarding data seeded successfully')
}

export function seedAllDemoData() {
  seedDemoOnboarding()
  seedDemoQuestionnaireResults()
  seedDemoMictionnelData()
}
