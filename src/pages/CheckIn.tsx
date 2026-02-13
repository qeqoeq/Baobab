import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Contact {
  id: string
  name: string
}

const STEPS = 3

function getScoreEmoji(score: number): { emoji: string; label: string } {
  if (score <= 3) return { emoji: '😟', label: 'Difficile' }
  if (score <= 6) return { emoji: '😐', label: 'Neutre' }
  return { emoji: '😊', label: 'Géniale' }
}

function CheckIn() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Réponses
  const [q1Score, setQ1Score] = useState(5)
  const [q2Answer, setQ2Answer] = useState<string | null>(null)
  const [q3Text, setQ3Text] = useState('')

  useEffect(() => {
    const fetchContact = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('id', id)
        .single()

      if (data) {
        setContact(data)
      }
      setLoading(false)
    }
    fetchContact()
  }, [id])

  const handleSubmit = async () => {
    if (!q2Answer) {
      setError('Réponds à la question 2 avant de valider.')
      return
    }
    setError(null)
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Utilisateur non connecté')
      setSubmitting(false)
      return
    }

    // Cherche une relationship existante ou en crée une
    let relationshipId: string

    const { data: existing } = await supabase
      .from('relationships')
      .select('id')
      .eq('user_a_id', user.id)
      .eq('contact_id', id)
      .single()

    if (existing) {
      relationshipId = existing.id
    } else {
      const { data: newRel, error: relError } = await supabase
        .from('relationships')
        .insert({ user_a_id: user.id, contact_id: id })
        .select('id')
        .single()

      if (relError || !newRel) {
        setError(relError?.message || 'Erreur lors de la création de la relation')
        setSubmitting(false)
        return
      }
      relationshipId = newRel.id
    }

    const { error: insertError } = await supabase.from('check_ins').insert({
      relationship_id: relationshipId,
      user_id: user.id,
      q1_score: q1Score,
      q2_answer: q2Answer,
      q3_text: q3Text || null,
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
    } else {
      navigate('/checkin-success')
    }
  }

  const canGoNext = (): boolean => {
    if (step === 1) return true
    if (step === 2) return q2Answer !== null
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
        <div className="text-center">
          <span className="text-5xl">❓</span>
          <p className="mt-4 text-lg text-gray-600">Contact introuvable</p>
        </div>
      </div>
    )
  }

  const scoreInfo = getScoreEmoji(q1Score)

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        {/* En-tête */}
        <div className="text-center mb-6">
          <span className="text-3xl">🌳</span>
          <h1 className="mt-2 text-xl font-bold text-primary">
            Check-in avec {contact.name}
          </h1>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mb-6">
          Question {step}/{STEPS}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* QUESTION 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              1. Comment te sens-tu dans cette relation ?
            </h2>
            <div className="text-center">
              <span className="text-5xl">{scoreInfo.emoji}</span>
              <p className="mt-2 text-sm font-medium text-gray-500">{scoreInfo.label}</p>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={1}
                max={10}
                value={q1Score}
                onChange={(e) => setQ1Score(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span className="text-lg font-bold text-primary">{q1Score}</span>
                <span>10</span>
              </div>
            </div>
          </div>
        )}

        {/* QUESTION 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              2. Cette relation te semble-t-elle équilibrée ?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'oui', emoji: '✅', label: 'Oui' },
                { value: 'non', emoji: '❌', label: 'Non' },
                { value: 'pas_sur', emoji: '🤔', label: 'Pas sûr(e)' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setQ2Answer(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    q2Answer === option.value
                      ? 'border-primary bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QUESTION 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              3. Qu'est-ce qui pourrait l'améliorer ?
            </h2>
            <div>
              <textarea
                value={q3Text}
                onChange={(e) => setQ3Text(e.target.value)}
                maxLength={280}
                rows={4}
                placeholder="Partage tes réflexions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {q3Text.length}/280
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              ← Précédent
            </button>
          )}
          {step < STEPS ? (
            <button
              onClick={() => canGoNext() && setStep(step + 1)}
              disabled={!canGoNext()}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi...' : 'Valider mon check-in'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckIn
