export function hapticTap(): void {
  try {
    navigator.vibrate?.(8)
  } catch {
    // no-op
  }
}

export function hapticSuccess(): void {
  try {
    navigator.vibrate?.([12, 20, 18])
  } catch {
    // no-op
  }
}

export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
    master.connect(ctx.destination)

    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.05)
      osc.connect(master)
      osc.start(now + i * 0.05)
      osc.stop(now + 0.3 + i * 0.03)
    })
  } catch {
    // best effort only
  }
}
