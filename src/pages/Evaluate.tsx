import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import SwipeStatement from '../components/evaluation/SwipeStatement'
import { useQuestions } from '../hooks/useQuestions'
import { supabase } from '../lib/supabase'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import {
  calculateDimensionScore,
  calculateGlobalScore,
} from '../lib/scoring'
import { showSuccessToast } from '../lib/toast'
import type { Contact, EvaluationResponse, QuestionCategory, RelationQuestion } from '../types'

const CATEGORIES: QuestionCategory[] = [
  'trust',
  'reciprocity',
  'emotional_security',
  'understanding',
  'fun',
]

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  trust: 'Trust',
  reciprocity: 'Reciprocity',
  emotional_security: 'Emotional Security',
  understanding: 'Understanding',
  fun: 'Fun',
}

interface ResultState {
  globalScore: number
  dimensionScores: Record<QuestionCategory, number>
}

function scoreColor(score10: number): string {
  if (score10 < 4) return '#ef4444'
  if (score10 < 6) return '#f59e0b'
  if (score10 < 8) return '#4CAF50'
  return '#d4af37'
}

export default function Evaluate() {
  const navigate = useNavigate()
  const { contactId } = useParams<{ contactId: string }>()
  const {
    loading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
    selectQuestionsForRelation,
  } = useQuestions()

  const [contact, setContact] = useState<Contact | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<RelationQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<EvaluationResponse[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  useEffect(() => {
    let active = true

    async function loadContact() {
      if (!contactId) {
        setError('Contact introuvable')
        return
      }
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) {
        if (active) setError(userError.message)
        return
      }
      if (!user) {
        navigate('/login', { replace: true })
        return
      }

      const { data, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('owner_id', user.id)
        .single()

      if (!active) return
      if (contactError) {
        setError(contactError.message)
        return
      }
      setContact(data as Contact)
    }

    void loadContact()
    return () => {
      active = false
    }
  }, [contactId, navigate])

  useEffect(() => {
    if (!contact || questionsLoading || selectedQuestions.length > 0) return
    const picked = selectQuestionsForRelation(contact.relationship_type)
    setSelectedQuestions(picked)
  }, [contact, questionsLoading, selectQuestionsForRelation, selectedQuestions.length])

  async function finalizeEvaluation(allResponses: EvaluationResponse[]) {
    if (!contact) return
    setSaving(true)
    setError(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Utilisateur non connecté')

      const dimensionScores: Record<QuestionCategory, number> = {
        trust: calculateDimensionScore(allResponses, 'trust'),
        reciprocity: calculateDimensionScore(allResponses, 'reciprocity'),
        emotional_security: calculateDimensionScore(allResponses, 'emotional_security'),
        understanding: calculateDimensionScore(allResponses, 'understanding'),
        fun: calculateDimensionScore(allResponses, 'fun'),
      }

      const globalScore = calculateGlobalScore(dimensionScores)

      const { error: insertError } = await supabase.from('evaluations').insert({
        evaluator_id: user.id,
        contact_id: contact.id,
        scores: {
          responses: allResponses,
        },
        global_score: globalScore,
        trust_score: dimensionScores.trust,
        reciprocity_score: dimensionScores.reciprocity,
        emotional_security_score: dimensionScores.emotional_security,
        understanding_score: dimensionScores.understanding,
        fun_score: dimensionScores.fun,
        created_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      setResult({ globalScore, dimensionScores })
      showSuccessToast('Évaluation sauvegardée ✓')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer l'évaluation",
      )
    } finally {
      setSaving(false)
    }
  }

  function handleResponse(score: number) {
    const question = selectedQuestions[currentIndex]
    if (!question || saving) return

    const nextResponses: EvaluationResponse[] = [
      ...responses,
      {
        question_id: question.id,
        category: question.category,
        score,
        weight: question.weight,
      },
    ]
    setResponses(nextResponses)

    if (currentIndex + 1 < selectedQuestions.length) {
      setCurrentIndex((prev) => prev + 1)
      return
    }

    void finalizeEvaluation(nextResponses)
  }

  const currentQuestion = useMemo(
    () => selectedQuestions[currentIndex] ?? null,
    [selectedQuestions, currentIndex],
  )

  if (error) {
    return <ErrorState message="Impossible de charger les données. Réessayer ?" onRetry={() => window.location.reload()} />
  }

  if (questionsError) {
    return (
      <ErrorState
        message="Impossible de charger les données. Réessayer ?"
        onRetry={() => {
          refetchQuestions()
        }}
      />
    )
  }

  if (result && contact) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] px-5 py-10">
        <div className="mx-auto max-w-md">
          <p className="text-sm text-gray-600 text-center mb-2">
            Ta relation avec {contact.contact_name}
          </p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative rounded-3xl bg-white border border-gray-100 shadow-sm p-6"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="mx-auto mt-10 h-24 w-24 rounded-full bg-[#4CAF50]/20 blur-2xl" />
            </div>

            <div className="relative text-center mb-6">
              <p className="text-6xl font-bold text-[#1B5E20] leading-none">
                {result.globalScore.toFixed(1)}
                <span className="text-2xl text-gray-400 align-top">/10</span>
              </p>
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((category) => {
                const raw100 = result.dimensionScores[category]
                const score10 = raw100 / 10
                const color = scoreColor(score10)
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700">
                        {CATEGORY_LABELS[category]}
                      </span>
                      <span className="font-semibold" style={{ color }}>
                        {score10.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${raw100}%` }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate(`/contact/${contact.id}`)}
              className="w-full rounded-2xl bg-[#4CAF50] py-3.5 text-white font-semibold"
            >
              Retour à la fiche
            </button>
            <button className="w-full rounded-2xl border border-gray-300 py-3.5 text-gray-600 font-medium">
              Inviter {contact.contact_name} à évaluer aussi
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!contact || questionsLoading || !currentQuestion) {
    return <LoadingState />
  }

  return (
    <SwipeStatement
      statement={currentQuestion.statement}
      onResponse={handleResponse}
      questionIndex={currentIndex + 1}
      totalQuestions={selectedQuestions.length}
    />
  )
}
