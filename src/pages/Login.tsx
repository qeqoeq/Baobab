import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl">🌳</span>
          <h1 className="mt-2 text-2xl font-bold text-primary">Connexion</h1>
        </div>

        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <p className="text-gray-600">
            Pas de compte ?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Inscription
            </Link>
          </p>
          <p>
            <a href="#" className="text-gray-500 hover:text-primary hover:underline transition-colors">
              Mot de passe oublié ?
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
