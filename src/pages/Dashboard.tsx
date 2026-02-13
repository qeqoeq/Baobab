import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        navigate('/login')
      }
    }
    getUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <span className="text-xl font-bold text-primary">Baobab</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl">🌱</span>
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-primary">
            Bienvenue sur Baobab
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Votre espace relationnel arrive bientôt...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Connecté en tant que <strong>{user.email}</strong>
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/contacts"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
            >
              📋 Mes relations
            </Link>
            <Link
              to="/add-contact"
              className="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              ➕ Ajouter un contact
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
