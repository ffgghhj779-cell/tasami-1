import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Shield, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isVerifiedUser } from '../core/auth';
import { getAuthUserSnapshot } from '../core/authSession';
import { speak } from '../core/utils';
import { useAuth } from '../contexts/AuthContext';
import { PageSkeleton } from './ui';

interface AuthGuardProps {
  children: React.ReactNode;
}

type GuardState = 'loading' | 'authorized' | 'denied';

/**
 * Blocks anonymous and unauthenticated users.
 * Waits for global AuthProvider bootstrap before any redirect to /login.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { ready, user, verified } = useAuth();
  const [state, setState] = useState<GuardState>('loading');
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!ready) return;

    const effectiveUser = user ?? getAuthUserSnapshot();
    const ok = isVerifiedUser(effectiveUser) || verified;

    if (ok) {
      setState('authorized');
      redirectedRef.current = false;
      return;
    }

    setState('denied');
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      navigate('/login', {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    }
  }, [ready, user, verified, navigate, location.pathname, location.search]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  if (!ready || state === 'loading') {
    return <PageSkeleton />;
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card rounded-[28px] p-8 max-w-sm w-full shadow-card border border-accent/25">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-xl font-black text-text-primary mb-2 flex items-center justify-center gap-2">
            تسجيل الدخول مطلوب
            <button onClick={e => handleSpeak(e, 'تسجيل الدخول مطلوب')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h1>
          <p className="text-sm text-text-secondary font-medium mb-5 leading-relaxed">
            للحجز أو الوصول لحسابك، سجّل الدخول بحساب Google أو رقم الجوال أو البريد الإلكتروني.
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="btn-accent w-full py-3.5 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            الانتقال لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
