import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import { showErrorToast, showSuccessToast } from '../lib/toast'
import type { Contact, Evaluation, RelationshipType } from '../types'

const RELATIONSHIP_META: Record<
  RelationshipType,
  { emoji: string; label: string }
> = {
  best_friend: { emoji: '💎', label: 'Best Friend' },
  close_friend: { emoji: '🫶', label: 'Close Friend' },
  friend: { emoji: '👋', label: 'Friend' },
  family: { emoji: '🏠', label: 'Family' },
  partner: { emoji: '❤️', label: 'Partner' },
  colleague: { emoji: '💼', label: 'Colleague' },
  acquaintance: { emoji: '🤝', label: 'Acquaintance' },
}

type DimensionRow = {
  key: 'trust' | 'reciprocity' | 'emotional_security' | 'understanding' | 'fun'
  label: string
  raw100: number
}

type MutualInfo = {
  network_access_level: number
  is_mutual: boolean
  score_a_to_b: number | null
  score_b_to_a: number | null
} | null

function scoreColor(score10: number): string {
  if (score10 < 4) return '#ef4444'
  if (score10 < 6) return '#f59e0b'
  if (score10 < 8) return '#4CAF50'
  return '#d4af37'
}

function networkLabel(level: number): string {
  if (level <= 0) {
    return '🔒 Réseau verrouillé — Évaluez mutuellement pour débloquer'
  }
  if (level === 1) return '🔓 Tu vois les noms de ses contacts'
  if (level === 2) return '🔓🔓 Tu vois les profils de ses contacts'
  return '🔓🔓🔓 Accès complet — Tu peux demander des intros'
}

export default function ContactProfile() {
  const navigate = useNavigate()
  const { contactId } = useParams<{ contactId: string }>()

  const [contact, setContact] = useState<Contact | null>(null)
  const [latestEvaluation, setLatestEvaluation] = useState<Evaluation | null>(null)
  const [mutualInfo, setMutualInfo] = useState<MutualInfo>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        if (!contactId) throw new Error('Contact introuvable')

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          navigate('/login', { replace: true })
          return
        }

        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .eq('owner_id', user.id)
          .single()

        if (contactError) throw contactError
        const typedContact = contactData as Contact

        const { data: evalData, error: evalError } = await supabase
          .from('evaluations')
          .select('*')
          .eq('evaluator_id', user.id)
          .eq('contact_id', typedContact.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (evalError) throw evalError

        let mutual: MutualInfo = null
        if (typedContact.target_user_id) {
          const { data: mutualData, error: mutualError } = await supabase
            .from('mutual_scores')
            .select(
              'network_access_level, is_mutual, score_a_to_b, score_b_to_a',
            )
            .or(
              `and(user_a.eq.${user.id},user_b.eq.${typedContact.target_user_id}),and(user_a.eq.${typedContact.target_user_id},user_b.eq.${user.id})`,
            )
            .limit(1)
            .maybeSingle()

          // If table is not ready yet, we keep mutual as null and still render.
          if (!mutualError) {
            mutual = (mutualData as MutualInfo) ?? null
          }
        }

        if (!active) return
        setContact(typedContact)
        setLatestEvaluation((evalData as Evaluation | null) ?? null)
        setMutualInfo(mutual)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error ? err.message : 'Impossible de charger le profil',
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [contactId, navigate])

  const hasEvaluated = !!latestEvaluation
  const isMutual = !!mutualInfo?.is_mutual
  const networkLevel = mutualInfo?.network_access_level ?? 0

  const statusText = useMemo(() => {
    if (!hasEvaluated) return 'Non évalué'
    if (isMutual) return 'Évaluation mutuelle ✓'
    return 'En attente de son évaluation'
  }, [hasEvaluated, isMutual])

  const dimensions: DimensionRow[] = latestEvaluation
    ? [
        { key: 'trust', label: 'Trust', raw100: latestEvaluation.trust_score },
        {
          key: 'reciprocity',
          label: 'Reciprocity',
          raw100: latestEvaluation.reciprocity_score,
        },
        {
          key: 'emotional_security',
          label: 'Emotional Security',
          raw100: latestEvaluation.emotional_security_score,
        },
        {
          key: 'understanding',
          label: 'Understanding',
          raw100: latestEvaluation.understanding_score,
        },
        { key: 'fun', label: 'Fun', raw100: latestEvaluation.fun_score },
      ]
    : []

  async function handleInvite() {
    if (!contact) return
    const link = `${window.location.origin}/evaluate/${contact.id}`
    try {
      await navigator.clipboard.writeText(link)
      showSuccessToast('Lien copié ✓')
    } catch {
      showErrorToast('Impossible de copier le lien')
    }
  }

  async function handleDelete() {
    if (!contact || deleting) return
    const ok = window.confirm(
      `Supprimer ${contact.contact_name} de tes relations ?`,
    )
    if (!ok) return

    setDeleting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id)
        .eq('owner_id', user.id)

      if (deleteError) throw deleteError
      showSuccessToast('Contact supprimé ✓')
      navigate('/relations', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Impossible de supprimer le contact',
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !contact) {
    return (
      <ErrorState
        message="Impossible de charger les données. Réessayer ?"
        onRetry={() => window.location.reload()}
      />
    )
  }

  const relation = RELATIONSHIP_META[contact.relationship_type]
  const globalScore10 = latestEvaluation?.global_score ?? 0
  const circleColor = scoreColor(globalScore10)

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-5 py-8 pb-28">
      <div className="mx-auto max-w-md space-y-4">
        {/* Header */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 text-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-600"
          >
            ←
          </button>
          <p className="text-[60px] leading-none mb-2">{relation.emoji}</p>
          <h1 className="text-3xl font-bold text-[#1B5E20]">
            {contact.contact_name}
          </h1>
          <span className="mt-3 inline-flex rounded-full bg-[#E8F5E9] px-3 py-1.5 text-xs font-semibold text-[#1B5E20]">
            {relation.label}
          </span>
        </div>

        {/* Score */}
        {latestEvaluation && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div
              className="mx-auto mb-5 h-28 w-28 rounded-full flex items-center justify-center border-4"
              style={{ borderColor: circleColor, color: circleColor }}
            >
              <p className="text-3xl font-bold">
                {globalScore10.toFixed(1)}
                <span className="text-base text-gray-400">/10</span>
              </p>
            </div>

            <div className="space-y-3">
              {dimensions.map((d, idx) => {
                const score10 = d.raw100 / 10
                const color = scoreColor(score10)
                return (
                  <motion.div
                    key={d.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700">{d.label}</span>
                      <span className="font-semibold" style={{ color }}>
                        {score10.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, d.raw100))}%` }}
                        transition={{ delay: idx * 0.08, duration: 0.35 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-2">
          {hasEvaluated && (
            <p className="text-sm text-[#1B5E20] font-medium">
              Tu as évalué cette relation ✓
            </p>
          )}
          <p className="text-sm text-gray-700">{statusText}</p>
        </div>

        {/* Network */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-700">
            {networkLabel(networkLevel)}
          </p>
        </div>

        {/* Actions */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
          <button
            onClick={() => navigate(`/evaluate/${contact.id}`)}
            className="w-full rounded-xl bg-[#4CAF50] py-3.5 text-white font-semibold"
          >
            {hasEvaluated ? 'Réévaluer' : 'Évaluer'}
          </button>

          <button
            onClick={handleInvite}
            className="w-full rounded-xl border border-gray-300 py-3.5 text-gray-700 font-medium"
          >
            Inviter à évaluer
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-xl border border-red-200 py-3.5 text-red-600 font-medium disabled:opacity-60"
          >
            {deleting ? 'Suppression...' : 'Supprimer le contact'}
          </button>
        </div>
      </div>

    </div>
  )
}
