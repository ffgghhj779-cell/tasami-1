import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { isVerifiedUser } from '../core/auth';
import {
  refreshAuthAfterPageShow,
  subscribeAuth,
  waitForAuthUser,
} from '../core/authSession';

interface AuthContextValue {
  ready: boolean;
  /** True while mobile OAuth redirect session may still be restoring. */
  settling: boolean;
  user: User | null;
  verified: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  settling: true,
  user: null,
  verified: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settling, setSettling] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | undefined;

    const applyUser = (nextUser: User | null) => {
      if (!mounted) return;
      setUser(nextUser);
      setReady(true);
      setSettling(false);
    };

    waitForAuthUser()
      .then(initialUser => {
        if (!mounted) return;
        applyUser(initialUser);
        unsub = subscribeAuth(nextUser => {
          if (mounted) setUser(nextUser);
        });
      })
      .catch(() => {
        if (mounted) {
          setReady(true);
          setSettling(false);
        }
      });

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !mounted) return;
      setSettling(true);
      refreshAuthAfterPageShow()
        .then(applyUser)
        .catch(() => {
          if (mounted) setSettling(false);
        });
    };

    window.addEventListener('pageshow', onPageShow);

    return () => {
      mounted = false;
      unsub?.();
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        settling,
        user,
        verified: isVerifiedUser(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
