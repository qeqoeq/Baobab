export interface Profile {
  id: string
  display_name: string
  avatar_emoji: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export type RelationshipType =
  | 'best_friend'
  | 'close_friend'
  | 'friend'
  | 'family'
  | 'partner'
  | 'colleague'
  | 'acquaintance'

export interface Contact {
  id: string
  owner_id: string
  target_user_id: string | null
  contact_name: string
  relationship_type: RelationshipType
  phone_number: string | null
  is_on_baobab: boolean
  created_at: string
}

export type QuestionCategory =
  | 'trust'
  | 'reciprocity'
  | 'emotional_security'
  | 'understanding'
  | 'fun'

export interface RelationQuestion {
  id: string
  statement: string
  category: QuestionCategory
  weight: number
  applicable_to: string[]
}

export interface EvaluationResponse {
  question_id: string
  category: QuestionCategory
  score: number
  weight: number
}

export interface Evaluation {
  id: string
  evaluator_id: string
  contact_id: string
  scores: Record<QuestionCategory, number>
  global_score: number
  trust_score: number
  reciprocity_score: number
  emotional_security_score: number
  understanding_score: number
  fun_score: number
  created_at: string
}

export type NetworkAccessLevel = 0 | 1 | 2 | 3

export interface MutualScore {
  id: string
  user_a: string
  user_b: string
  score_a_to_b: number | null
  score_b_to_a: number | null
  mutual_score: number | null
  network_access_level: NetworkAccessLevel
  is_mutual: boolean
  last_updated: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_data: any
  unlocked_at: string
}
