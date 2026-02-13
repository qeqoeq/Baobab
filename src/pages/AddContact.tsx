import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AddContact() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationshipType, setRelationshipType] = useState('Ami')
  const [lastContactDate, setLastContactDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('contacts').insert({
      user_id: user.id,
      name,
      email: email || null,
      phone: phone || null,
      relationship_type: relationshipType,
      last_contact_date: lastContactDate || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/contacts')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-primary transition-colors"
        >
          ← Retour au tableau de bord
        </Link>

        <div className="text-center mt-4 mb-8">
          <span className="text-3xl">🌳</span>
          <h1 className="mt-2 text-2xl font-bold text-primary">Ajouter un contact</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom Nom"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@exemple.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Type de relation
            </label>
            <select
              id="relationship"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white"
            >
              <option value="Famille">Famille</option>
              <option value="Ami">Ami</option>
              <option value="Collègue">Collègue</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="lastContact" className="block text-sm font-medium text-gray-700 mb-1">
              Date dernier contact
            </label>
            <input
              id="lastContact"
              type="date"
              value={lastContactDate}
              onChange={(e) => setLastContactDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ajout en cours...' : 'Ajouter contact'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddContact
