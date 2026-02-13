import { Link } from 'react-router-dom'

function CheckInSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <span className="text-6xl">✅</span>
        <h1 className="mt-6 text-2xl font-bold text-primary">
          Merci ! Ton check-in a été enregistré
        </h1>
        <p className="mt-3 text-gray-600">
          Continue à prendre soin de tes relations 💚
        </p>
        <Link
          to="/contacts"
          className="mt-8 inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
        >
          Retour à mes relations
        </Link>
      </div>
    </div>
  )
}

export default CheckInSuccess
