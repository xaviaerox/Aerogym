/**
 * Utility for Web Haptics API (navigator.vibrate) to provide tactile feedback
 * during gym workouts on mobile devices.
 */

export function isHapticsSupported(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
}

export function vibrateSuccess(): void {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate(35);
    } catch {}
  }
}

export function vibrateWarning(): void {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate([40, 50, 40]);
    } catch {}
  }
}

export function vibrateTimerAlert(): void {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate([80, 50, 80, 50, 120]);
    } catch {}
  }
}
