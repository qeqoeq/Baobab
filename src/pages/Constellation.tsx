import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConstellationView from '../components/constellation/ConstellationView'
import AddContactSheet from '../components/ui/AddContactSheet'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import { useContacts } from '../hooks/useContacts'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export default function Constellation() {
  const navigate = useNavigate()
  const { contacts, loading: contactsLoading, refetch } = useContacts()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        navigate('/login', { replace: true })
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      const typedProfile = profileData as Profile

      if (!typedProfile.onboarding_complete) {
        navigate('/onboarding', { replace: true })
        return
      }

      setProfile(typedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    setLoading(true)
    setError(null)
    void loadData()
  }, [loadData])

  useEffect(() => {
    const onFocus = () => {
      refetch()
      void loadData()
    }
    const onVisibility = () => {
      if (!document.hidden) {
        refetch()
        void loadData()
      }
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refetch, loadData])

  const averageScore = useMemo(() => {
    const evaluated = contacts.filter((c) => c.latest_evaluation)
    if (evaluated.length === 0) return 0
    const total = evaluated.reduce(
      (sum, c) => sum + (c.latest_evaluation?.global_score ?? 0),
      0,
    )
    return total / evaluated.length
  }, [contacts])

  if (loading || contactsLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les données. Réessayer ?"
        onRetry={() => {
          setLoading(true)
          setError(null)
          void loadData()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-5 pt-8 pb-28">
      <div className="mx-auto max-w-md h-[calc(100vh-8rem)] flex flex-col">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1B5E20]">Mon Réseau</h1>
            <p className="text-sm text-[#616161]">Constellation</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-2xl shadow-sm">
            {profile?.avatar_emoji ?? '🌳'}
          </div>
        </header>

        <div className="h-[80%] min-h-[420px]">
          {contacts.length === 0 ? (
            <div className="h-full rounded-3xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
              <p className="text-6xl mb-4">🌳</p>
              <p className="text-lg font-semibold text-[#1B5E20] mb-2">
                Ajoute tes premiers contacts pour voir ta constellation grandir 🌳
              </p>
            </div>
          ) : (
            <ConstellationView
              contacts={contacts}
              avatarEmoji={profile?.avatar_emoji ?? '🌳'}
            />
          )}
        </div>

        <p className="mt-3 text-sm text-[#616161] text-center">
          {contacts.length} relation{contacts.length > 1 ? 's' : ''} · Score moyen :{' '}
          {averageScore.toFixed(1)}/10
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#4CAF50] text-white text-3xl leading-none shadow-xl active:scale-95 transition-transform"
        aria-label="Ajouter un contact"
      >
        +
      </button>

      <AddContactSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={() => {
          refetch()
        }}
      />
    </div>
  )
}
