import { useEffect, useState } from 'react'
import type { Evaluation } from '../types'

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(false)
    setError(null)
    setEvaluations([])
  }, [])

  return { evaluations, loading, error }
}
