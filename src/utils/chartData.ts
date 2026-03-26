import { getResults, type QuestionnaireResult } from './questionnaireResults'

export interface ChartDataPoint {
  week: number
  usp?: number
  qualiveen?: number
  pgi?: number
  satisfaction?: number
  evolutionData?: EvolutionMetrics
}

export interface EvolutionMetrics {
  urgences: number
  nuit: number
  fuites: number
  douleurMiction: number
  douleurHorsMiction: number
  etatProtection: number
  evolutionProtection: number
}

// Conversion des états protection et évolution en valeurs 0-7
export function normalizeProtectionEtat(etat: string | null): number {
  if (!etat) return 0
  switch (etat) {
    case 'Sèche':
      return 0
    case 'Humide':
      return 3
    case 'Saturée':
      return 7
    default:
      return 0
  }
}

export function normalizeEvolution(evolution: string | null): number {
  if (!evolution) return 0
  switch (evolution) {
    case 'Diminution':
      return 0
    case 'Stable':
      return 3
    case 'Augmentation':
      return 7
    default:
      return 0
  }
}

// Normaliser les données Evolution Thérapeutique sur échelle 0-7
export function normalizeEvaluationValue(value: number | null, max: number = 7): number {
  if (value === null) return 0
  return Math.min(7, (value / max) * 7)
}

// Extraire les métriques Evolution Thérapeutique
export function getEvolutionMetrics(data: Record<string, any>): EvolutionMetrics {
  return {
    urgences: normalizeEvaluationValue(data.urgenturies?.nombre),
    nuit: normalizeEvaluationValue(data.mictions_nocturnes?.nombre),
    fuites: normalizeEvaluationValue(data.fuites_urinaires?.nombre),
    douleurMiction: normalizeEvaluationValue(data.douleur?.miction_eva),
    douleurHorsMiction: normalizeEvaluationValue(data.douleur?.hors_miction_eva),
    etatProtection: normalizeProtectionEtat(data.protections?.etat),
    evolutionProtection: normalizeEvolution(data.protections?.evolution),
  }
}

// Grouper les résultats par semaine pour le graphique
export function getChartDataByWeek(providedResults?: QuestionnaireResult[]): ChartDataPoint[] {
  const results = providedResults || getResults()
  const weekMap = new Map<number, ChartDataPoint>()

  // Initialiser les semaines avec des résultats
  results.forEach((result) => {
    if (!weekMap.has(result.week)) {
      weekMap.set(result.week, { week: result.week })
    }

    const dataPoint = weekMap.get(result.week)!

    switch (result.questionnaireName) {
      case 'USP':
        // Calculer le score normalisé 0-7
        const uspScore = result.data.scores?.total
        if (uspScore) {
          dataPoint.usp = (uspScore / 39) * 7
        }
        break
      case 'Qualiveen':
        // Score Qualiveen est sur 0-4, normaliser à 0-7
        const qualiveenScore = result.data.scores?.total
        if (qualiveenScore) {
          dataPoint.qualiveen = (qualiveenScore / 4) * 7
        }
        break
      case 'PG-I':
        // PG-I score 0-6, normaliser à 0-7
        const pgiScore = result.data.pgiScore
        if (pgiScore !== undefined) {
          dataPoint.pgi = pgiScore
        }
        break
      case 'Satisfaction':
        // Satisfaction score 0-6, normaliser à 0-7
        const satisfactionScore = result.data.satisfactionScore
        if (satisfactionScore !== undefined) {
          dataPoint.satisfaction = satisfactionScore
        } else if (result.data.satisfaction !== undefined) {
          // Fallback: si satisfactionScore n'existe pas, calculer à partir de l'index
          dataPoint.satisfaction = 6 - result.data.satisfaction
        }
        break
      case 'Evolution Thérapeutique':
        // Extraire les métriques Evolution
        dataPoint.evolutionData = getEvolutionMetrics(result.data)
        break
    }
  })

  // Trier par semaine
  return Array.from(weekMap.values()).sort((a, b) => a.week - b.week)
}
