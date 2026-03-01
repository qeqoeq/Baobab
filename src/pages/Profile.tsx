import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import { useContacts } from '../hooks/useContacts'
import { supabase } from '../lib/supabase'
import { showSuccessToast } from '../lib/toast'
import type { Profile as ProfileType } from '../types'

const AVATAR_EMOJIS = [
  '🌳',
  '🦁',
  '🌊',
  '🔥',
  '⭐',
  '🎯',
  '💎',
  '🌸',
  '🎵',
  '🚀',
  '🌙',
  '🦋',
  '🎨',
  '🏔️',
  '🌻',
  '🧠',
  '💫',
  '🎪',
  '🐉',
  '🌈',
] as const

export default function Profile() {
  const navigate = useNavigate()
  const { contacts, loading: contactsLoading } = useContacts()

  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [mutualCount, setMutualCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('🌳')
  const [saving, setSaving] = useState(false)

  async function loadProfile() {
    setLoading(true)
    setError(null)
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

      let mutual = 0
      const { count, error: mutualError } = await supabase
        .from('mutual_scores')
        .select('*', { count: 'exact', head: true })
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('is_mutual', true)

      if (!mutualError) mutual = count ?? 0

      const typedProfile = profileData as ProfileType
      setProfile(typedProfile)
      setEditName(typedProfile.display_name)
      setEditEmoji(typedProfile.avatar_emoji || '🌳')
      setMutualCount(mutual)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [navigate])

  const evaluatedCount = useMemo(
    () => contacts.filter((c) => c.latest_evaluation).length,
    [contacts],
  )
  const avgScore = useMemo(() => {
    const evaluated = contacts.filter((c) => c.latest_evaluation)
    if (evaluated.length === 0) return 0
    const total = evaluated.reduce(
      (sum, c) => sum + (c.latest_evaluation?.global_score ?? 0),
      0,
    )
    return total / evaluated.length
  }, [contacts])

  function openEdit() {
    if (!profile) return
    setEditName(profile.display_name)
    setEditEmoji(profile.avatar_emoji || '🌳')
    setIsEditOpen(true)
  }

  async function saveProfile() {
    if (!profile || !editName.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: editName.trim(),
          avatar_emoji: editEmoji,
        })
        .eq('id', profile.id)
      if (updateError) throw updateError

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              display_name: editName.trim(),
              avatar_emoji: editEmoji,
            }
          : prev,
      )
      setIsEditOpen(false)
      showSuccessToast('Profil mis à jour ✓')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Impossible de sauvegarder le profil',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    const ok = window.confirm('Se déconnecter maintenant ?')
    if (!ok) return
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (loading || contactsLoading) {
    return <LoadingState />
  }

  if (error && !profile) {
    return (
      <ErrorState
        message="Impossible de charger les données. Réessayer ?"
        onRetry={() => {
          void loadProfile()
        }}
      />
    )
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : '-'

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-5 py-8 pb-28">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-[#4CAF50] text-white text-[44px] flex items-center justify-center shadow-sm">
            {profile?.avatar_emoji ?? '🌳'}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-[#1B5E20]">
            {profile?.display_name ?? 'Utilisateur'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Membre depuis {memberSince}</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <StatCard value={`${contacts.length}`} label="relations" />
          <StatCard value={`${evaluatedCount}`} label="évaluées" />
          <StatCard value={`${mutualCount}`} label="mutuelles" />
          <StatCard value={`${avgScore.toFixed(1)}/10`} label="score moyen" />
        </section>

        {/* Edit section */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 mb-4">
          <button
            onClick={openEdit}
            className="w-full rounded-xl border border-[#4CAF50]/40 py-3 text-[#1B5E20] font-semibold"
          >
            Modifier mon profil
          </button>
        </section>

        {/* Actions */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <button
            onClick={handleSignOut}
            className="w-full rounded-xl border border-red-200 py-3 text-red-600 font-semibold"
          >
            Se déconnecter
          </button>
        </section>

        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => !saving && setIsEditOpen(false)}
            aria-label="Fermer"
          />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-3xl bg-white p-5 animate-sheet-up">
            <h2 className="text-xl font-bold text-[#1B5E20] mb-4">
              Modifier mon profil
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ton prénom ou surnom"
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition"
              />

              <div className="grid grid-cols-5 gap-2">
                {AVATAR_EMOJIS.map((emoji) => {
                  const selected = editEmoji === emoji
                  return (
                    <button
                      key={emoji}
                      onClick={() => setEditEmoji(emoji)}
                      className={`h-12 rounded-xl border flex items-center justify-center text-2xl ${
                        selected
                          ? 'border-[#4CAF50] bg-[#E8F5E9]'
                          : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 py-3 text-gray-600 font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveProfile}
                  disabled={!editName.trim() || saving}
                  className={`rounded-xl py-3 font-semibold ${
                    editName.trim() && !saving
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
      <p className="text-2xl font-bold text-[#1B5E20]">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
