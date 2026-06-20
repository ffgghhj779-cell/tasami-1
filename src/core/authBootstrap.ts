import { getRedirectResult, type User } from 'firebase/auth';
import { auth } from './firebase';

let bootstrapPromise: Promise<User | null> | null = null;

export const GOOGLE_REDIRECT_PENDING_KEY = 'tasami_google_redirect_pending';
export const LAST_AUTH_ERROR_KEY = 'tasami_last_auth_error';

export function isGoogleRedirectPending(): boolean {
  return sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) != null;
}

export function clearGoogleRedirectPending(): void {
  sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY);
}

/** True when user returned from Google OAuth (pending flag from a prior navigation). */
export function isGoogleRedirectReturn(): boolean {
  const raw = sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY);
  if (!raw) return false;
  if (raw === '1') return true;
  const started = Number(raw);
  if (!Number.isFinite(started)) return true;
  return Date.now() - started > 1500;
}

/** Clears cached bootstrap so bfcache / pageshow can re-run redirect handling. */
export function resetAuthBootstrap(): void {
  bootstrapPromise = null;
}

function isBfcacheRestore(event: Event): boolean {
  return Boolean((event as PageTransitionEvent).persisted);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', event => {
    if (isBfcacheRestore(event)) {
      resetAuthBootstrap();
    }
  });
}

/**
 * One-time auth bootstrap: consume Google redirect result.
 * Returns the signed-in user when this page load completes an OAuth redirect.
 */
export function bootstrapAuth(): Promise<User | null> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          clearGoogleRedirectPending();
          return result.user;
        }
        return null;
      } catch (err) {
        const code = (err as { code?: string }).code ?? 'unknown';
        const msg = (err as { message?: string }).message ?? String(err);
        console.error('[bootstrapAuth] getRedirectResult failed', err);
        sessionStorage.setItem(LAST_AUTH_ERROR_KEY, `${code}: ${msg}`);
        clearGoogleRedirectPending();
        return null;
      }
    })();
  }
  return bootstrapPromise;
}
