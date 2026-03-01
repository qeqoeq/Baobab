import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  relationship_type: string
  last_contact_date: string | null
  created_at: string
}

interface Temperature {
  color: string
  emoji: string
  label: string
}

function calculateTemperature(lastContactDate: string | null): Temperature {
  if (!lastContactDate) {
    return { color: 'gray', emoji: '⚪', label: 'Inconnu' }
  }

  const now = new Date()
  const lastContact = new Date(lastContactDate)
  const diffTime = now.getTime() - lastContact.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return { color: 'green', emoji: '🟢', label: 'Chaud' }
  } else if (diffDays < 30) {
    return { color: 'yellow', emoji: '🟡', label: 'Tiède' }
  } else if (diffDays < 90) {
    return { color: 'orange', emoji: '🟠', label: 'Froid' }
  } else {
    return { color: 'red', emoji: '🔴', label: 'Glacé' }
  }
}

function getDaysAgo(lastContactDate: string | null): string {
  if (!lastContactDate) return 'Jamais contacté'
  const now = new Date()
  const lastContact = new Date(lastContactDate)
  const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Il y a 1 jour'
  return `Il y a ${diffDays} jours`
}

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setContacts(data)
      setLoading(false)
    }
    fetchContacts()
  }, [])

  return (
    <div className="min-h-screen bg-secondary">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🌳</span>
              <span className="text-xl font-bold text-primary">Baobab</span>
            </Link>
          </div>
          <Link
            to="/add-contact"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            ➕ Ajouter un contact
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8">
          Mes Relations
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🌱</span>
            <p className="mt-4 text-lg text-gray-600">
              Commencez par ajouter votre premier contact
            </p>
            <Link
              to="/add-contact"
              className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
            >
              ➕ Ajouter un contact
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => {
              const temp = calculateTemperature(contact.last_contact_date)
              return (
                <div
                  key={contact.id}
                  className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{temp.emoji}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {contact.name}
                        </h3>
                        <span className="inline-block mt-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {contact.relationship_type}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {temp.label}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-gray-500 space-y-1">
                    <p>📅 {getDaysAgo(contact.last_contact_date)}</p>
                    {contact.email && <p>✉️ {contact.email}</p>}
                    {contact.phone && <p>📞 {contact.phone}</p>}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="w-full text-sm text-primary border border-primary px-3 py-2 rounded-lg font-medium opacity-70"
                    >
                      ✨ Constellation (bientôt)
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Contacts
