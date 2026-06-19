/** Web Vibration API — tactile feedback without blocking the main thread. */

export type HapticPattern = 'light' | 'medium' | 'success' | 'error' | 'confirm';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light:   8,
  medium:  18,
  confirm: [12, 40, 24],
  success: [10, 30, 10, 30, 40],
  error:   [40, 60, 40, 60, 80],
};

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Fire-and-forget haptic pulse — silently skipped when unsupported. */
export function haptic(pattern: HapticPattern = 'light'): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* non-blocking */
  }
}

/** Cancel any in-progress vibration (e.g. on unmount). */
export function hapticCancel(): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(0);
  } catch {
    /* non-blocking */
  }
}
