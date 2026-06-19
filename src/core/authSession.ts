import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import { bootstrapAuth } from './authBootstrap';

let authListenerPromise: Promise<User | null> | null = null;

/**
 * Single app-wide auth listener. Must run after bootstrapAuth() so
 * getRedirectResult is consumed exactly once before guards evaluate.
 */
export function waitForAuthUser(): Promise<User | null> {
  if (!authListenerPromise) {
    authListenerPromise = bootstrapAuth().then(
      () =>
        new Promise<User | null>(resolve => {
          const current = auth.currentUser;
          if (current) {
            resolve(current);
            return;
          }
          const unsub = onAuthStateChanged(auth, user => {
            unsub();
            resolve(user);
          });
        }),
    );
  }
  return authListenerPromise;
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
