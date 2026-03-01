import { useNavigate } from 'react-router-dom'
import type { ContactWithScore } from '../../hooks/useContacts'
import type { RelationshipType } from '../../types'

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

interface ContactCardProps {
  contact: ContactWithScore
}

export default function ContactCard({ contact }: ContactCardProps) {
  const navigate = useNavigate()
  const meta = RELATIONSHIP_META[contact.relationship_type]
  const score = contact.latest_evaluation?.global_score

  return (
    <div
      onClick={() => navigate(`/contact/${contact.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/contact/${contact.id}`)
        }
      }}
      role="button"
      tabIndex={0}
      className="w-full h-28 rounded-xl bg-white shadow-sm border border-gray-100 p-4 text-left flex items-start justify-between transition-transform active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 truncate">
          <span className="mr-2">{meta.emoji}</span>
          {contact.contact_name}
        </p>
        <span className="mt-2 inline-flex items-center rounded-full bg-[#E8F5E9] px-2.5 py-1 text-xs font-medium text-[#1B5E20]">
          {meta.label}
        </span>
      </div>

      <div className="shrink-0 pl-3 text-right">
        {typeof score === 'number' ? (
          <p className="text-base font-semibold text-[#2E7D32]">
            {score.toFixed(1)}/10
          </p>
        ) : (
          <p className="text-sm font-medium text-gray-400">Non évalué</p>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/evaluate/${contact.id}`)
          }}
          className="mt-2 rounded-lg border border-[#4CAF50]/35 px-2.5 py-1 text-xs font-semibold text-[#1B5E20] hover:bg-[#E8F5E9] transition-colors"
        >
          Évaluer
        </button>
      </div>
    </div>
  )
}
