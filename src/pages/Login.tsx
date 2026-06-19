import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
} from 'firebase/auth';
import { LogIn, Phone, Volume2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth } from '../core/firebase';
import { speak } from '../core/utils';
import { haptic } from '../core/haptics';
import { ButtonShimmer } from '../components/ui';

type PhoneStep = 'input' | 'otp';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default function Login() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const normalizePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('966')) return `+${digits}`;
    if (digits.startsWith('0')) return `+966${digits.slice(1)}`;
    if (digits.startsWith('5')) return `+966${digits}`;
    return raw.startsWith('+') ? raw : `+${digits}`;
  };

  const getRecaptchaVerifier = (): RecaptchaVerifier => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    if (!recaptchaRef.current) throw new Error('Recaptcha container missing');

    const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => setError('انتهت صلاحية التحقق. حاول مجدداً.'),
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home', { replace: true });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user') {
        setError('');
      } else {
        setError('تعذّر تسجيل الدخول عبر Google. حاول مجدداً.');
        haptic('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const normalized = normalizePhone(phone.trim());
    if (!/^\+9665\d{8}$/.test(normalized.replace(/\s/g, ''))) {
      setError('أدخل رقم جوال سعودي صحيح (مثال: 05XXXXXXXX).');
      haptic('error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const verifier = getRecaptchaVerifier();
      confirmationRef.current = await signInWithPhoneNumber(auth, normalized, verifier);
      setPhoneStep('otp');
      haptic('light');
    } catch {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      setError('تعذّر إرسال رمز التحقق. تأكد من تفعيل Phone Auth في Firebase Console.');
      haptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationRef.current || otp.trim().length < 6) {
      setError('أدخل رمز التحقق المكوّن من 6 أرقام.');
      haptic('error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await confirmationRef.current.confirm(otp.trim());
      haptic('success');
      navigate('/home', { replace: true });
    } catch {
      setError('رمز التحقق غير صحيح. حاول مجدداً.');
      haptic('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col p-6 items-center justify-center bg-bg-primary relative overflow-hidden">
      <div className="absolute top-0 start-0 w-full h-1/3 bg-text-primary/[0.06] pointer-events-none" />
      <div className="absolute -bottom-20 -end-20 w-60 h-60 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-bg-card p-8 rounded-[32px] shadow-[var(--shadow-header)] border border-border/50 text-center relative z-10">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <LogIn className="w-8 h-8 text-accent" />
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2">
          تسجيل الدخول / إنشاء حساب
          <button onClick={e => handleSpeak(e, 'تسجيل الدخول أو إنشاء حساب')} aria-label="استمع" className="btn-speak">
            <Volume2 className="w-4 h-4 text-text-secondary" />
          </button>
        </h2>
        <p className="text-sm text-text-secondary mb-6">خطوة واحدة للوصول لخدماتنا</p>

        {error && (
          <div role="alert" className="flex items-center gap-2 text-danger text-xs font-bold mb-4 text-start bg-danger/8 border border-danger/20 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {phoneStep === 'input' ? (
          <>
            <div className="text-start mb-6">
              <label className="text-sm font-bold text-text-primary mb-2 block">رقم الجوال</label>
              <div className="relative">
                <input
                  dir="ltr"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+966 5X XXX XXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full bg-bg-primary border border-border/60 rounded-xl py-3.5 ps-11 pe-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 text-end placeholder:text-end disabled:opacity-60"
                />
                <Phone className="absolute start-3.5 top-4 w-4.5 h-4.5 text-text-secondary" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || !phone.trim()}
              className={`btn-accent w-full py-3.5 mb-6 text-base disabled:opacity-60 flex items-center justify-center ${loading ? 'btn-loading' : ''}`}
            >
              <ButtonShimmer loading={loading}>إرسال رمز التحقق</ButtonShimmer>
            </button>
          </>
        ) : (
          <>
            <div className="text-start mb-6">
              <label className="text-sm font-bold text-text-primary mb-2 block">رمز التحقق (OTP)</label>
              <input
                dir="ltr"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="w-full bg-bg-primary border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-bold tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => { setPhoneStep('input'); setOtp(''); setError(''); }}
                className="text-xs text-accent font-bold mt-2 hover:underline"
              >
                تغيير رقم الجوال
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className={`btn-accent w-full py-3.5 mb-6 text-base disabled:opacity-60 flex items-center justify-center ${loading ? 'btn-loading' : ''}`}
            >
              <ButtonShimmer loading={loading}>تأكيد الرمز</ButtonShimmer>
            </button>
          </>
        )}

        <div ref={recaptchaRef} className="hidden" aria-hidden="true" />

        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary font-medium">أو</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full bg-bg-card border border-border/60 text-text-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-bg-primary shadow-sm spring-tap ui-chrome disabled:opacity-60 ${loading ? 'btn-loading' : ''}`}
        >
          <ButtonShimmer loading={loading}>
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              المتابعة بواسطة Google
            </>
          </ButtonShimmer>
        </button>
      </div>
    </div>
  );
}
