import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Contact {
  id: string
  name: string
}

interface CheckInRecord {
  id: string
  q1_score: number
  q2_answer: string
  q3_text: string | null
  user_id: string
  created_at: string
}

interface PulseResult {
  score: number
  label: string
  color: string
  bgColor: string
  borderColor: string
}

function calculatePulse(checkIns: CheckInRecord[]): PulseResult | null {
  if (checkIns.length === 0) return null

  const avgScore = checkIns.reduce((sum, ci) => sum + ci.q1_score, 0) / checkIns.length

  // Bonus si au moins 2 check-ins et tous "oui" à Q2
  let bonus = 0
  if (checkIns.length >= 2) {
    const allYes = checkIns.every((ci) => ci.q2_answer === 'oui')
    if (allYes) bonus = 1
  }

  const pulse = Math.min(10, Math.round((avgScore + bonus) * 10) / 10)

  if (pulse <= 3) {
    return { score: pulse, label: 'Fragile', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-400' }
  } else if (pulse <= 6) {
    return { score: pulse, label: 'À améliorer', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-400' }
  } else {
    return { score: pulse, label: 'Solide', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-400' }
  }
}

function getPulseEmoji(score: number): string {
  if (score <= 3) return '🔴'
  if (score <= 6) return '🟡'
  return '🟢'
}

function RelationshipPulse() {
  const { id } = useParams()
  const [contact, setContact] = useState<Contact | null>(null)
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch contact
      const { data: contactData } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('id', id)
        .single()

      if (contactData) {
        setContact(contactData)
      }

      // Fetch check-ins via relationships
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: relationships } = await supabase
          .from('relationships')
          .select('id')
          .eq('user_a_id', user.id)
          .eq('contact_id', id)

        if (relationships && relationships.length > 0) {
          const relIds = relationships.map((r) => r.id)
          const { data: checkInData } = await supabase
            .from('check_ins')
            .select('*')
            .in('relationship_id', relIds)
            .order('created_at', { ascending: false })

          if (checkInData) {
            setCheckIns(checkInData)
          }
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [id])

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

  const pulse = calculatePulse(checkIns)
  const reflections = checkIns.filter((ci) => ci.q3_text)

  return (
    <div className="min-h-screen bg-secondary px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Navigation */}
        <Link
          to="/contacts"
          className="text-sm text-gray-500 hover:text-primary transition-colors"
        >
          ← Retour à mes relations
        </Link>

        {/* Pulse Card */}
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-primary mb-2">
            Pulse avec {contact.name}
          </h1>

          {!pulse ? (
            <div className="py-10">
              <span className="text-5xl">⏳</span>
              <p className="mt-4 text-gray-600">Aucun check-in pour l'instant</p>
              <Link
                to={`/checkin/${contact.id}`}
                className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                Faire un check-in
              </Link>
            </div>
          ) : checkIns.length === 1 ? (
            <div className="py-8">
              {/* Cercle Pulse en attente */}
              <div className={`mx-auto w-48 h-48 rounded-full border-4 ${pulse.borderColor} ${pulse.bgColor} flex flex-col items-center justify-center`}>
                <span className="text-4xl">{getPulseEmoji(pulse.score)}</span>
                <span className={`text-4xl font-bold ${pulse.color}`}>{pulse.score}</span>
                <span className="text-xs text-gray-500">/10</span>
              </div>
              <p className={`mt-4 text-lg font-semibold ${pulse.color}`}>{pulse.label}</p>
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <p className="text-sm text-yellow-700">
                  ⏳ En attente de l'autre personne pour un Pulse complet
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8">
              {/* Cercle Pulse complet */}
              <div className={`mx-auto w-48 h-48 rounded-full border-4 ${pulse.borderColor} ${pulse.bgColor} flex flex-col items-center justify-center shadow-lg`}>
                <span className="text-4xl">{getPulseEmoji(pulse.score)}</span>
                <span className={`text-5xl font-bold ${pulse.color}`}>{pulse.score}</span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
              <p className={`mt-4 text-xl font-semibold ${pulse.color}`}>{pulse.label}</p>
            </div>
          )}
        </div>

        {/* Réflexions */}
        {checkIns.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-bold text-primary mb-4">💭 Vos réflexions</h2>
            {reflections.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune réflexion partagée pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {reflections.map((ci) => (
                  <div
                    key={ci.id}
                    className="bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <p className="text-sm text-gray-700">"{ci.q3_text}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ci.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {checkIns.length < 2 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <p className="text-sm text-yellow-700">
                  ⏳ En attente de l'autre personne
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <Link
            to={`/checkin/${contact.id}`}
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            🔄 Refaire un check-in
          </Link>
          <p className="mt-3 text-xs text-gray-400">
            Vous pouvez refaire un check-in une fois par semaine
          </p>
        </div>
      </div>
    </div>
  )
}

export default RelationshipPulse
