import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../core/firebase';
import { resolveGoogleRedirectResult } from '../core/auth';

/** Waits for Google redirect result + first auth state before routing decisions. */
export function useAuthReady(): { ready: boolean; user: User | null } {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        await resolveGoogleRedirectResult();
      } catch {
        /* no pending redirect */
      }

      if (!mounted) return;

      unsub = onAuthStateChanged(auth, nextUser => {
        if (!mounted) return;
        setUser(nextUser);
        setReady(true);
      });
    })();

    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  return { ready, user };
}
