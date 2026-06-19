import { browserLocalPersistence, getRedirectResult, setPersistence } from 'firebase/auth';
import { auth } from './firebase';

let bootstrapPromise: Promise<void> | null = null;

/**
 * One-time auth bootstrap: persistence + Google redirect result.
 * Firebase allows getRedirectResult() only once per redirect — must be singleton.
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
