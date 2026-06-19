import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { isVerifiedUser } from '../core/auth';
import { subscribeAuth, waitForAuthUser } from '../core/authSession';

interface AuthContextValue {
  ready: boolean;
  user: User | null;
  verified: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  user: null,
  verified: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | undefined;

    waitForAuthUser()
      .then(initialUser => {
        if (!mounted) return;
        setUser(initialUser);
        setReady(true);
        unsub = subscribeAuth(nextUser => {
          if (mounted) setUser(nextUser);
        });
      })
      .catch(() => {
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
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
