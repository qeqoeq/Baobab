import type { ContactWithScore } from '../hooks/useContacts'
import type { RelationshipType } from '../types'

export interface ConstellationNodePosition {
  contact: ContactWithScore
  x: number
  y: number
  size: number
  color: string
  opacity: number
}

function relationColor(type: RelationshipType, hasScore: boolean): string {
  if (!hasScore) return '#BDBDBD'

  if (type === 'best_friend' || type === 'close_friend') return '#4CAF50'
  if (type === 'friend') return '#2196F3'
  if (type === 'family') return '#FF9800'
  if (type === 'partner') return '#E91E63'
  if (type === 'colleague') return '#9C27B0'
  return '#9E9E9E'
}

function radiusFactor(score: number | null): number {
  if (score === null) return 0.95
  if (score >= 8) return 0.25
  if (score >= 6) return 0.45
  if (score >= 4) return 0.65
  return 0.8
}

function nodeSize(score: number | null): number {
  if (score === null) return 22
  if (score >= 8) return 48
  if (score >= 6) return 40
  if (score >= 4) return 32
  return 26
}

export function calculatePositions(
  contacts: ContactWithScore[],
  centerX: number,
  centerY: number,
  radius: number,
): ConstellationNodePosition[] {
  const total = contacts.length
  if (total === 0) return []

  return contacts.map((contact, index) => {
    const score = contact.latest_evaluation?.global_score ?? null
    const angle = (index / total) * 2 * Math.PI
    const r = radius * radiusFactor(score)

    const x = centerX + Math.cos(angle) * r
    const y = centerY + Math.sin(angle) * r

    const hasScore = score !== null
    return {
      contact,
      x,
      y,
      size: nodeSize(score),
      color: relationColor(contact.relationship_type, hasScore),
      opacity: hasScore ? 1.0 : 0.5,
    }
  })
}
