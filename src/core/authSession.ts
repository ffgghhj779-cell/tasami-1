import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import { bootstrapAuth, resetAuthBootstrap, isGoogleRedirectPending } from './authBootstrap';
import { isMobileAuthContext } from './auth';

let authListenerPromise: Promise<User | null> | null = null;

/** Mobile OAuth redirect — session restore can exceed 6s on slow networks. */
const MOBILE_AUTH_SETTLE_MS = 6000;

export function resetAuthSession(): void {
  authListenerPromise = null;
  resetAuthBootstrap();
}

function waitForAuthAfterBootstrap(redirectUser: User | null): Promise<User | null> {
  if (redirectUser) return Promise.resolve(redirectUser);

  const immediate = auth.currentUser;
  if (immediate) return Promise.resolve(immediate);

  return new Promise<User | null>(resolve => {
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
        const pending = isGoogleRedirectPending();
        const timer = window.setTimeout(
          () => finish(auth.currentUser),
          mobile ? (pending ? 12000 : 6000) : 800,
        );
  });
}

function waitForAuthUserInternal(): Promise<User | null> {
  return bootstrapAuth().then(waitForAuthAfterBootstrap);
}

export function waitForAuthUser(): Promise<User | null> {
  if (!authListenerPromise) {
    authListenerPromise = waitForAuthUserInternal();
  }
  return authListenerPromise;
}

export async function refreshAuthAfterPageShow(): Promise<User | null> {
  resetAuthSession();
  return waitForAuthUserInternal();
}

export function subscribeAuth(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getAuthUserSnapshot(): User | null {
  return auth.currentUser;
}
