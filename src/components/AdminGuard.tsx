import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, Copy, Volume2, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { checkIsAdmin } from '../core/admin';
import { speak } from '../core/utils';
import { useAuth } from '../contexts/AuthContext';
import { PageSkeleton } from '../components/ui';

interface AdminGuardProps {
  children: React.ReactNode;
}

type GuardState = 'loading' | 'authorized' | 'denied';

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { ready, settling, user, verified } = useAuth();
  const [state, setState] = useState<GuardState>('loading');
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || settling) return;

    let mounted = true;

    (async () => {
      if (!user || !verified) {
        if (mounted) {
          setUid(user?.uid ?? null);
          setState('denied');
        }
        return;
      }

      setUid(user.uid);
      try {
        const allowed = await checkIsAdmin(user.uid, user.email);
        if (mounted) setState(allowed ? 'authorized' : 'denied');
      } catch {
        if (mounted) setState('denied');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [ready, settling, user, verified]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  if (!ready || settling || state === 'loading') {
    return <PageSkeleton />;
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card rounded-[28px] p-8 max-w-sm w-full shadow-card border border-danger/20">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8 text-danger" />
          </div>

          <h1 className="text-xl font-black text-text-primary mb-2 flex items-center justify-center gap-2">
            وصول مرفوض
            <button onClick={e => handleSpeak(e, 'وصول مرفوض')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h1>
          <p className="text-sm text-text-secondary font-medium mb-5 leading-relaxed">
            هذه المنطقة مخصصة للمسؤولين المصرّح لهم فقط. يجب تسجيل الدخول بحساب Google أو
            رقم جوال، ثم إضافة مستند في مجموعة{' '}
            <strong className="text-text-primary">admins</strong>{' '}
            بالحقل <code className="text-xs bg-bg-primary px-1 rounded">role: admin</code>.
          </p>

          {uid && (
            <div className="bg-bg-primary border border-border/60 rounded-xl p-4 mb-5 text-start">
              <span className="text-[10px] font-bold text-text-secondary block mb-1">معرّفك الحالي</span>
              <div className="flex items-center gap-2">
                <code dir="ltr" className="text-[11px] text-text-primary font-bold break-all flex-1">
                  {uid}
                </code>
                <button
                  onClick={() => navigator.clipboard?.writeText(uid)}
                  className="p-2 rounded-lg border border-border/60 hover:bg-border transition-all duration-300 active:scale-95 shrink-0"
                  aria-label="نسخ المعرّف"
                >
                  <Copy className="w-4 h-4 text-accent" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/login', { state: { from: '/admin' } })}
              className="btn-accent w-full py-3.5 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3.5 flex items-center justify-center gap-2 border border-border/60 rounded-xl font-bold text-text-primary hover:bg-bg-primary transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
