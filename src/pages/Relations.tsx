import { useMemo, useState } from 'react'
import ContactCard from '../components/ui/ContactCard'
import AddContactSheet from '../components/ui/AddContactSheet'
import LoadingState from '../components/ui/LoadingState'
import { useContacts } from '../hooks/useContacts'
import type { RelationshipType } from '../types'

type FilterKey = 'all' | 'best' | 'family' | 'friends' | 'pro'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'best', label: '💎 Best Friends' },
  { key: 'family', label: '🏠 Famille' },
  { key: 'friends', label: '👋 Amis' },
  { key: 'pro', label: '💼 Pro' },
]

function matchesFilter(type: RelationshipType, filter: FilterKey): boolean {
  if (filter === 'all') return true
  if (filter === 'best') return type === 'best_friend'
  if (filter === 'family') return type === 'family'
  if (filter === 'friends') return type === 'friend' || type === 'close_friend'
  return type === 'colleague' || type === 'acquaintance'
}

export default function Relations() {
  const { contacts, loading, error, refetch } = useContacts()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) =>
        matchesFilter(contact.relationship_type, filter),
      ),
    [contacts, filter],
  )

  function openModal() {
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B5E20]">Mes Relations</h1>
          <p className="text-sm text-gray-600 mt-1">
            {contacts.length} relation{contacts.length > 1 ? 's' : ''}
          </p>
        </header>

        <div className="overflow-x-auto pb-2 mb-5">
          <div className="flex gap-2 min-w-max">
            {FILTERS.map((item) => {
              const active = filter === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium border transition ${
                    active
                      ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <LoadingState label="Chargement des relations..." fullscreen={false} />
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-sm mb-4" style={{ color: 'var(--baobab-error)' }}>
              Impossible de charger les données. Réessayer ?
            </p>
            <button
              onClick={refetch}
              className="rounded-xl px-5 py-2.5 text-white font-semibold"
              style={{ backgroundColor: 'var(--baobab-green)' }}
            >
              Réessayer
            </button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center shadow-sm">
            <p className="text-5xl mb-3">🌳</p>
            <p className="text-lg font-semibold text-[#1B5E20] mb-1">
              Ajoute ton premier contact
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Commence à construire ta constellation relationnelle
            </p>
            <button
              onClick={openModal}
              className="rounded-xl bg-[#4CAF50] px-5 py-3 text-white font-semibold"
            >
              Ajouter un contact
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#4CAF50] text-white text-3xl leading-none shadow-xl active:scale-95 transition-transform"
        aria-label="Ajouter un contact"
      >
        +
      </button>

      <AddContactSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        onAdded={() => {
          refetch()
        }}
      />
    </div>
  )
}
