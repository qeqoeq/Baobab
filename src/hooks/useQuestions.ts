import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { QuestionCategory, RelationQuestion, RelationshipType } from '../types'

const CATEGORIES: QuestionCategory[] = [
  'trust',
  'reciprocity',
  'emotional_security',
  'understanding',
  'fun',
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)] ?? null
}

interface UseQuestionsResult {
  questions: RelationQuestion[]
  loading: boolean
  error: Error | null
  refetch: () => void
  selectQuestionsForRelation: (type: RelationshipType) => RelationQuestion[]
}

export function useQuestions(): UseQuestionsResult {
  const [questions, setQuestions] = useState<RelationQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: queryError } = await supabase
      .from('relation_questions')
      .select('*')
      .order('created_at', { ascending: true })

    if (queryError) {
      setQuestions([])
      setError(queryError)
      setLoading(false)
      return
    }

    setQuestions((data ?? []) as RelationQuestion[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchQuestions()
  }, [fetchQuestions])

  const selectQuestionsForRelation = useCallback(
    (type: RelationshipType): RelationQuestion[] => {
      const eligible = questions.filter(
        (q) =>
          q.applicable_to.includes('all') ||
          q.applicable_to.includes(type),
      )

      if (eligible.length <= 6) return shuffle(eligible)

      const selected: RelationQuestion[] = []
      const selectedIds = new Set<string>()

      // 1) Pick one random question per category.
      for (const category of CATEGORIES) {
        const categoryPool = eligible.filter(
          (q) => q.category === category && !selectedIds.has(q.id),
        )
        const picked = pickRandom(categoryPool)
        if (picked) {
          selected.push(picked)
          selectedIds.add(picked.id)
        }
      }

      // 2) Pick one extra from remaining questions.
      const remaining = eligible.filter((q) => !selectedIds.has(q.id))
      const extra = pickRandom(remaining)
      if (extra) {
        selected.push(extra)
        selectedIds.add(extra.id)
      }

      // Fallback: if some categories were unavailable, fill up to 6.
      if (selected.length < 6) {
        const refillPool = eligible.filter((q) => !selectedIds.has(q.id))
        for (const q of shuffle(refillPool)) {
          selected.push(q)
          selectedIds.add(q.id)
          if (selected.length >= 6) break
        }
      }

      return shuffle(selected).slice(0, 6)
    },
    [questions],
  )

  return { questions, loading, error, refetch: fetchQuestions, selectQuestionsForRelation }
}
