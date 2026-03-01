import { useEffect, useState } from 'react'
import { toastEventName } from '../../lib/toast'
import { hapticSuccess, playNotificationChime } from '../../lib/feedback'

interface ToastState {
  message: string
  kind: 'success' | 'error'
}

export default function ToastHost() {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    let timer: number | undefined
    const eventName = toastEventName()

    const handler = (event: Event) => {
      const custom = event as CustomEvent<{
        message: string
        kind: 'success' | 'error'
        durationMs?: number
      }>
      if (!custom.detail?.message) return

      setToast({ message: custom.detail.message, kind: custom.detail.kind })
      if (custom.detail.kind === 'success') {
        hapticSuccess()
        playNotificationChime()
      }
      window.clearTimeout(timer)
      timer = window.setTimeout(
        () => setToast(null),
        custom.detail.durationMs ?? 3000,
      )
    }

    window.addEventListener(eventName, handler as EventListener)
    return () => {
      window.removeEventListener(eventName, handler as EventListener)
      window.clearTimeout(timer)
    }
  }, [])

  if (!toast) return null

  const isSuccess = toast.kind === 'success'

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md">
      <div
        className="rounded-xl px-4 py-3 text-sm font-medium shadow-lg border"
        style={{
          backgroundColor: isSuccess ? '#E8F5E9' : '#FFEBEE',
          color: isSuccess ? '#1B5E20' : '#D32F2F',
          borderColor: isSuccess ? '#4CAF50' : '#EF9A9A',
        }}
      >
        {toast.message}
      </div>
    </div>
  )
}
