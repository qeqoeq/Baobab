import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const otpOptions = {
      redirectTo:
        'https://baobab-app-t8bq-fnz6i4xzx-ghr6fpwbxm-1770s-projects.vercel.app/',
    } as unknown as { emailRedirectTo?: string }

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: otpOptions,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl">🌳</span>
          <h1 className="mt-2 text-2xl font-bold text-primary">Connexion</h1>
        </div>

        {success ? (
          <div className="text-center py-4">
            <span className="text-4xl">✉️</span>
            <p className="mt-4 text-lg font-semibold text-primary">Lien envoyé</p>
            <p className="mt-2 text-sm text-gray-600">
              Ouvre l'email envoyé à <strong>{email}</strong> pour te connecter.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi...' : 'Recevoir un magic link'}
          </button>
        </form>
        )}

        <div className="mt-6 text-center text-sm space-y-2">
          <p className="text-gray-600">
            Pas de compte ?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Inscription
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
