import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import { bootstrapAuth, resetAuthBootstrap } from './authBootstrap';
import { isMobileAuthContext } from './auth';

let authListenerPromise: Promise<User | null> | null = null;

/** Mobile persistence after OAuth redirect can lag behind the first auth event. */
const MOBILE_AUTH_SETTLE_MS = 2500;

export function resetAuthSession(): void {
  authListenerPromise = null;
  resetAuthBootstrap();
}

/**
 * Wait for auth after bootstrap. On mobile, do not resolve `null` immediately —
 * IndexedDB session restore after redirect often arrives milliseconds later.
 */
function waitForAuthUserInternal(): Promise<User | null> {
  return bootstrapAuth().then(
    () =>
      new Promise<User | null>(resolve => {
        const immediate = auth.currentUser;
        if (immediate) {
          resolve(immediate);
          return;
        }

        let settled = false;
        const finish = (user: User | null) => {
          if (settled) return;
          settled = true;
          unsub();
          clearTimeout(timer);
          resolve(user);
        };

        const unsub = onAuthStateChanged(auth, user => {
          if (user) finish(user);
        });

        const mobile = isMobileAuthContext();
        const timer = window.setTimeout(
          () => finish(auth.currentUser),
          mobile ? MOBILE_AUTH_SETTLE_MS : 800,
        );
      }),
  );
}

/**
 * Single app-wide initial auth wait. Must run after bootstrapAuth() so
 * getRedirectResult is consumed exactly once before guards evaluate.
 */
export function waitForAuthUser(): Promise<User | null> {
  if (!authListenerPromise) {
    authListenerPromise = waitForAuthUserInternal();
  }
  return authListenerPromise;
}

/** Re-run bootstrap after bfcache — used by AuthProvider on pageshow. */
export async function refreshAuthAfterPageShow(): Promise<User | null> {
  resetAuthSession();
  return waitForAuthUserInternal();
}

/** Subscribe to ongoing auth changes after initial waitForAuthUser. */
export function subscribeAuth(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getAuthUserSnapshot(): User | null {
  return auth.currentUser;
}
