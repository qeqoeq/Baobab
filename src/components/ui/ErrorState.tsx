interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'Impossible de charger les données. Réessayer ?',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 text-center">
      <div className="max-w-sm">
        <p className="text-sm mb-4" style={{ color: '#D32F2F' }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl px-5 py-3 text-white font-semibold"
            style={{ backgroundColor: '#4CAF50' }}
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  )
}
