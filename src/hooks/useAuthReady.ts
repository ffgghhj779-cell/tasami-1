import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../core/firebase';
import { bootstrapAuth } from '../core/authBootstrap';

/** @deprecated Use useAuth() from AuthContext instead. */
export function useAuthReady(): { ready: boolean; user: User | null } {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | undefined;

    bootstrapAuth().then(() => {
      if (!mounted) return;
      unsub = onAuthStateChanged(auth, nextUser => {
        if (!mounted) return;
        setUser(nextUser);
        setReady(true);
      });
    });

    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  return { ready, user };
}
