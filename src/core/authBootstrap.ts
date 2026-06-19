import { browserLocalPersistence, getRedirectResult, setPersistence } from 'firebase/auth';
import { auth } from './firebase';

let bootstrapPromise: Promise<void> | null = null;

/** Clears cached bootstrap so bfcache / pageshow can re-run redirect handling. */
export function resetAuthBootstrap(): void {
  bootstrapPromise = null;
}

function isBfcacheRestore(event: Event): boolean {
  return Boolean((event as PageTransitionEvent).persisted);
}

/**
 * Mobile Safari restores OAuth return pages from bfcache without re-running
 * bootstrap — listen globally once and invalidate the cached bootstrap.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', event => {
    if (isBfcacheRestore(event)) {
      resetAuthBootstrap();
    }
  });
}

/**
 * One-time auth bootstrap: persistence + Google redirect result.
 * Firebase allows getRedirectResult() only once per redirect — must be singleton
 * per page load (reset on bfcache via pageshow).
 */
export function bootstrapAuth(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await setPersistence(auth, browserLocalPersistence);
      try {
        await getRedirectResult(auth);
      } catch {
        /* no pending redirect or already consumed */
      }
    })();
  }
  return bootstrapPromise;
}
