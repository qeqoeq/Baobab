import type {
  EvaluationResponse,
  NetworkAccessLevel,
  QuestionCategory,
} from '../types'

export const TRUST_WEIGHT = 1.8
export const EMOTIONAL_SECURITY_WEIGHT = 1.5
export const RECIPROCITY_WEIGHT = 1.3
export const UNDERSTANDING_WEIGHT = 1.3
export const FUN_WEIGHT = 1.0

export const GLOBAL_SCORE_WEIGHT_SUM =
  TRUST_WEIGHT +
  EMOTIONAL_SECURITY_WEIGHT +
  RECIPROCITY_WEIGHT +
  UNDERSTANDING_WEIGHT +
  FUN_WEIGHT

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function calculateDimensionScore(
  responses: EvaluationResponse[],
  category: QuestionCategory,
): number {
  const categoryResponses = responses.filter((r) => r.category === category)
  if (categoryResponses.length === 0) return 0

  const weightedSum = categoryResponses.reduce(
    (sum, r) => sum + r.score * r.weight,
    0,
  )
  const totalWeight = categoryResponses.reduce((sum, r) => sum + r.weight, 0)
  if (totalWeight <= 0) return 0

  return clamp(weightedSum / totalWeight, 0, 100)
}

export function calculateGlobalScore(
  dimensionScores: Record<QuestionCategory, number>,
): number {
  const weighted100 =
    dimensionScores.trust * TRUST_WEIGHT +
    dimensionScores.emotional_security * EMOTIONAL_SECURITY_WEIGHT +
    dimensionScores.reciprocity * RECIPROCITY_WEIGHT +
    dimensionScores.understanding * UNDERSTANDING_WEIGHT +
    dimensionScores.fun * FUN_WEIGHT

  const normalized100 = weighted100 / GLOBAL_SCORE_WEIGHT_SUM
  return clamp(normalized100 / 10, 0, 10)
}

export function calculateMutualScore(scoreA: number, scoreB: number): number {
  const a = clamp(scoreA, 0, 10)
  const b = clamp(scoreB, 0, 10)
  if (a + b === 0) return 0
  return clamp((2 * (a * b)) / (a + b), 0, 10)
}

export function getNetworkAccessLevel(mutualScore: number): NetworkAccessLevel {
  const score = clamp(mutualScore, 0, 10)
  if (score < 4.0) return 0
  if (score < 6.0) return 1
  if (score < 7.5) return 2
  return 3
}

/*
Unit tests (quick examples):

1) calculateDimensionScore
const responses: EvaluationResponse[] = [
  { question_id: 'q1', category: 'trust', score: 100, weight: 2 },
  { question_id: 'q2', category: 'trust', score: 50, weight: 1 },
]
// (100*2 + 50*1) / 3 = 83.333...
console.assert(Math.round(calculateDimensionScore(responses, 'trust')) === 83)

2) calculateGlobalScore
const dimensions = {
  trust: 80,
  reciprocity: 70,
  emotional_security: 90,
  understanding: 60,
  fun: 50,
}
// expected around 7.29 / 10
console.assert(calculateGlobalScore(dimensions) > 7.2)
console.assert(calculateGlobalScore(dimensions) < 7.4)

3) calculateMutualScore
// harmonic mean of 8 and 4 => 5.333...
console.assert(calculateMutualScore(8, 4) > 5.3)
console.assert(calculateMutualScore(8, 4) < 5.4)

4) getNetworkAccessLevel
console.assert(getNetworkAccessLevel(3.9) === 0)
console.assert(getNetworkAccessLevel(4.0) === 1)
console.assert(getNetworkAccessLevel(6.0) === 2)
console.assert(getNetworkAccessLevel(7.5) === 3)
*/
