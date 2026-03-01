import { useEffect, useState } from 'react'
import type { Profile } from '../types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(false)
    setError(null)
    setProfile(null)
  }, [])

  return { profile, loading, error }
}
