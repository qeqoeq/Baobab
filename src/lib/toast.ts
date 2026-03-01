type ToastKind = 'success' | 'error'

interface ToastPayload {
  message: string
  kind: ToastKind
  durationMs?: number
}

const EVENT_NAME = 'baobab:toast'

export function showToast(payload: ToastPayload): void {
  window.dispatchEvent(new CustomEvent<ToastPayload>(EVENT_NAME, { detail: payload }))
}

export function showSuccessToast(message: string, durationMs = 3000): void {
  showToast({ message, kind: 'success', durationMs })
}

export function showErrorToast(message: string, durationMs = 3000): void {
  showToast({ message, kind: 'error', durationMs })
}

export function toastEventName(): string {
  return EVENT_NAME
}
