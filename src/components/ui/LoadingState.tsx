interface LoadingStateProps {
  label?: string
  fullscreen?: boolean
}

export default function LoadingState({
  label = 'Chargement...',
  fullscreen = true,
}: LoadingStateProps) {
  return (
    <div
      className={`${fullscreen ? 'min-h-screen' : 'py-20'} flex items-center justify-center bg-[#FAFAFA]`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-[#4CAF50] border-t-transparent animate-spin" />
        <p className="text-sm" style={{ color: '#616161' }}>
          {label}
        </p>
      </div>
    </div>
  )
}
