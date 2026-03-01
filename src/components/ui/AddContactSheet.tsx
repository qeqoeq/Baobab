import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { hapticTap } from '../../lib/feedback'
import { showErrorToast, showSuccessToast } from '../../lib/toast'
import type { RelationshipType } from '../../types'

interface AddContactSheetProps {
  isOpen: boolean
  onClose: () => void
  onAdded?: () => void
}

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

export default function AddContactSheet({
  isOpen,
  onClose,
  onAdded,
}: AddContactSheetProps) {
  const [contactName, setContactName] = useState('')
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAdd = useMemo(
    () => contactName.trim().length > 0 && !!relationshipType && !saving,
    [contactName, relationshipType, saving],
  )

  function closeSheet() {
    if (saving) return
    setContactName('')
    setRelationshipType(null)
    setError(null)
    onClose()
  }

  async function handleAddContact() {
    if (!canAdd || !relationshipType) return
    setSaving(true)
    setError(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Utilisateur non connecté')

      const { error: insertError } = await supabase.from('contacts').insert({
        owner_id: user.id,
        contact_name: contactName.trim(),
        relationship_type: relationshipType,
        target_user_id: null,
        is_on_baobab: false,
        phone_number: null,
      })
      if (insertError) throw insertError

      closeSheet()
      onAdded?.()
      showSuccessToast('Contact ajouté ✓')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible d'ajouter le contact"
      setError(message)
      showErrorToast(message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        onClick={closeSheet}
        className="absolute inset-0 bg-black/45"
        aria-label="Fermer"
      />
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-3xl bg-white p-5 animate-sheet-up">
        <h2 className="text-xl font-bold text-[#1B5E20] mb-4">
          Ajouter un contact
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nom du contact"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition"
          />

          <div className="overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              {RELATIONSHIP_OPTIONS.map((option) => {
                const selected = relationshipType === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      hapticTap()
                      setRelationshipType(option.value)
                    }}
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={closeSheet}
              disabled={saving}
              className="rounded-xl border border-gray-300 py-3 text-gray-600 font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAddContact}
              disabled={!canAdd}
              className={`rounded-xl py-3 font-semibold ${
                canAdd
                  ? 'bg-[#4CAF50] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
