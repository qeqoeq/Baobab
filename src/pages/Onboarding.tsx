import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { showSuccessToast } from '../lib/toast'
import type { RelationshipType } from '../types'

type OnboardingStep = 1 | 2 | 3

interface OnboardingFormData {
  displayName: string
  avatarEmoji: string
  relationGoal: string
}

interface OnboardingContact {
  id: string
  name: string
  relationshipType: RelationshipType
}

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

const RELATIONSHIP_OPTIONS: Array<{
  value: RelationshipType
  label: string
  emoji: string
}> = [
  { value: 'best_friend', label: 'Best Friend', emoji: '💎' },
  { value: 'close_friend', label: 'Close Friend', emoji: '🫶' },
  { value: 'friend', label: 'Friend', emoji: '👋' },
  { value: 'family', label: 'Family', emoji: '🏠' },
  { value: 'partner', label: 'Partner', emoji: '❤️' },
  { value: 'colleague', label: 'Colleague', emoji: '💼' },
  { value: 'acquaintance', label: 'Acquaintance', emoji: '🤝' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: '',
    avatarEmoji: '🌳',
    relationGoal: '',
  })
  const [contacts, setContacts] = useState<OnboardingContact[]>([])
  const [contactName, setContactName] = useState('')
  const [contactType, setContactType] = useState<RelationshipType | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const canAddContact =
    contactName.trim().length > 0 && !!contactType && contacts.length < 3

  const canGoNext = useMemo(() => {
    if (step === 1) return formData.displayName.trim().length > 0
    if (step === 2) return formData.avatarEmoji.trim().length > 0
    return contacts.length > 0
  }, [step, formData, contacts.length])

  async function handleNext() {
    if (!canGoNext) return
    if (step < 3) {
      setStep((prev) => (prev < 3 ? ((prev + 1) as OnboardingStep) : prev))
      return
    }
    await completeOnboarding()
  }

  function handleBack() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as OnboardingStep) : prev))
  }

  function addContact() {
    if (!canAddContact || !contactType) return
    const newContact: OnboardingContact = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: contactName.trim(),
      relationshipType: contactType,
    }
    setContacts((prev) => [...prev, newContact])
    setContactName('')
    setContactType(null)
  }

  function removeContact(contactId: string) {
    setContacts((prev) => prev.filter((c) => c.id !== contactId))
  }

  async function completeOnboarding() {
    if (saving || contacts.length === 0) return
    setSaveError(null)
    setSaving(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) throw new Error('Utilisateur non connecté')

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName.trim(),
          avatar_emoji: formData.avatarEmoji,
          onboarding_complete: true,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      const contactsToInsert = contacts.map((contact) => ({
        owner_id: user.id,
        contact_name: contact.name,
        relationship_type: contact.relationshipType,
        target_user_id: null,
        is_on_baobab: false,
      }))

      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(contactsToInsert)

      if (contactsError) throw contactsError

      showSuccessToast('Onboarding terminé ✓')
      navigate('/', { replace: true })
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer l'onboarding",
      )
    } finally {
      setSaving(false)
    }
  }

  function renderSlide() {
    if (step === 1) {
      return (
        <div key="slide-1" className="animate-fade-up text-center">
          <h1 className="text-3xl font-bold text-[#1B5E20] mb-3">
            Comment tu t&apos;appelles ?
          </h1>
          <p className="text-gray-600 text-base mb-10">
            C&apos;est comme ça que tes proches te verront
          </p>

          <input
            type="text"
            value={formData.displayName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, displayName: e.target.value }))
            }
            placeholder="Ton prénom ou surnom"
            className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-base text-center outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition"
          />
        </div>
      )
    }

    if (step === 2) {
      return (
        <div key="slide-2" className="animate-fade-up w-full">
          <button
            onClick={handleBack}
            className="mb-6 text-sm font-medium text-gray-600"
          >
            ← Retour
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1B5E20] mb-3">
              Choisis ton avatar
            </h1>
            <p className="text-gray-600 text-base mb-8">
              Tu pourras le changer plus tard
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {AVATAR_EMOJIS.map((emoji) => {
              const selected = formData.avatarEmoji === emoji
              return (
                <button
                  key={emoji}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, avatarEmoji: emoji }))
                  }
                  className={`h-16 rounded-2xl border bg-white flex items-center justify-center transition-all duration-200 ${
                    selected
                      ? 'border-[#4CAF50] scale-105 shadow-sm'
                      : 'border-gray-200 active:scale-95'
                  }`}
                >
                  <span className="text-[40px] leading-none">{emoji}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div key="slide-3" className="animate-fade-up w-full">
        <button
          onClick={handleBack}
          className="mb-6 text-sm font-medium text-gray-600"
        >
          ← Retour
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1B5E20] mb-3">
            Ajoute tes proches
          </h1>
          <p className="text-gray-600 text-base">
            Commence avec 1 à 3 personnes importantes pour toi
          </p>
        </div>

        {contacts.length > 0 && (
          <div className="space-y-2 mb-4">
            {contacts.map((contact) => {
              const option = RELATIONSHIP_OPTIONS.find(
                (item) => item.value === contact.relationshipType,
              )
              return (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
                >
                  <div className="text-sm text-gray-700">
                    <span className="mr-2">{option?.emoji}</span>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={`Supprimer ${contact.name}`}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nom du contact"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition"
          />

          <div className="overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              {RELATIONSHIP_OPTIONS.map((option) => {
                const selected = contactType === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setContactType(option.value)}
                    className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {option.emoji} {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={addContact}
            disabled={!canAddContact || saving}
            className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
              canAddContact
                ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#4CAF50]/30'
                : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}
          >
            + Ajouter un autre contact
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md min-h-screen px-6 py-10 flex flex-col">
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-[#4CAF50]' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 flex">{renderSlide()}</div>

        <div className="pt-6 space-y-3">
          {step > 1 && step !== 2 && step !== 3 && (
            <button
              onClick={handleBack}
              className="w-full rounded-2xl py-4 text-base font-medium border border-gray-300 text-gray-600"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canGoNext || saving}
            className={`w-full rounded-2xl py-4 text-base font-semibold transition ${
              canGoNext
                ? 'bg-[#4CAF50] text-white active:scale-[0.99]'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < 3 ? 'Suivant →' : saving ? 'Sauvegarde...' : 'Commencer 🌳'}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 shadow-sm">
          {saveError}
        </div>
      )}
    </div>
  )
}
