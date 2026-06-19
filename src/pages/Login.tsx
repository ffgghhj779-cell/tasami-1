import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { LogIn, Volume2, AlertCircle, Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth } from '../core/firebase';
import { isVerifiedUser } from '../core/auth';
import {
  isMobileAuthContext,
  mapEmailAuthError,
  mapGoogleAuthError,
  mapPhoneAuthError,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from '../core/auth';
import { formatPhoneForFirebaseAuth, validatePhone } from '../core/phone';
import { speak } from '../core/utils';
import { haptic } from '../core/haptics';
import { useAuth } from '../contexts/AuthContext';
import { ButtonShimmer } from '../components/ui';
import { PageSkeleton } from '../components/ui';

type AuthMode = 'phone' | 'email';
type PhoneStep = 'input' | 'otp';
type EmailMode = 'login' | 'register';
type CountryCode = 'EG' | 'SA';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/home';
  const { i18n } = useTranslation();
  const { ready, settling, verified } = useAuth();

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const [authMode, setAuthMode] = useState<AuthMode>('phone');
  const [country, setCountry] = useState<CountryCode>('EG');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [emailMode, setEmailMode] = useState<EmailMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && !settling && verified) {
      navigate(returnTo, { replace: true });
    }
  }, [ready, settling, verified, navigate, returnTo]);

  useEffect(() => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
  }, [country, authMode, phoneStep]);

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

  const getRecaptchaVerifier = async (): Promise<RecaptchaVerifier> => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    if (!recaptchaRef.current) throw new Error('Recaptcha container missing');

    const mobile = isMobileAuthContext();
    const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
      size: mobile ? 'normal' : 'invisible',
      callback: () => {},
      'expired-callback': () => {
        recaptchaVerifierRef.current?.clear();
        recaptchaVerifierRef.current = null;
        setError('انتهت صلاحية التحقق. أعد تحميل الصفحة.');
      },
    });
    await verifier.render();
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const mode = await signInWithGoogle();
      if (mode === 'popup' && isVerifiedUser(auth.currentUser)) {
        haptic('success');
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      const message = mapGoogleAuthError((err as { code?: string }).code);
      if (message) {
        setError(message);
        haptic('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const phoneCheck = validatePhone(phone.trim());
    if (!phoneCheck.valid) {
      setError(phoneCheck.error ?? 'رقم الجوال غير صالح');
      haptic('error');
      return;
    }

    const e164 = formatPhoneForFirebaseAuth(phone.trim(), country);
    if (!e164) {
      setError('أدخل رقم جوال مصري (010…) أو سعودي (05…) صحيح');
      haptic('error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const verifier = await getRecaptchaVerifier();
      confirmationRef.current = await signInWithPhoneNumber(auth, e164, verifier);
      setPhoneStep('otp');
      haptic('light');
    } catch (err) {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      setError(mapPhoneAuthError((err as { code?: string }).code));
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
      navigate(returnTo, { replace: true });
    } catch {
      setError('رمز التحقق غير صحيح. حاول مجدداً.');
      haptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور.');
      haptic('error');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      haptic('error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (emailMode === 'register') {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      haptic('success');
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(mapEmailAuthError((err as { code?: string }).code, emailMode));
      haptic('error');
    } finally {
      setLoading(false);
    }
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setPhoneStep('input');
    setOtp('');
  };

  if (!ready || settling) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-6 items-center justify-center bg-bg-primary relative">
      <div className="absolute top-0 start-0 w-full h-1/3 bg-text-primary/[0.06] pointer-events-none" />
      <div className="absolute -bottom-20 -end-20 w-60 h-60 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-bg-card p-8 rounded-[32px] shadow-[var(--shadow-header)] border border-border/50 text-center relative z-10 my-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <LogIn className="w-8 h-8 text-accent" />
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2">
          تسجيل الدخول / إنشاء حساب
          <button onClick={e => handleSpeak(e, 'تسجيل الدخول أو إنشاء حساب')} aria-label="استمع" className="btn-speak">
            <Volume2 className="w-4 h-4 text-text-secondary" />
          </button>
        </h2>
        <p className="text-sm text-text-secondary mb-4">خطوة واحدة للوصول لخدماتنا</p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-bg-primary rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => switchAuthMode('phone')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'phone' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary'}`}
          >
            جوال
          </button>
          <button
            type="button"
            onClick={() => switchAuthMode('email')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'email' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary'}`}
          >
            بريد إلكتروني
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 text-danger text-xs font-bold mb-4 text-start bg-danger/8 border border-danger/20 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {authMode === 'phone' ? (
          phoneStep === 'input' ? (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setCountry('EG'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${country === 'EG' ? 'border-accent bg-accent/10 text-accent' : 'border-border/60 text-text-secondary'}`}
                >
                  🇪🇬 مصر (+20)
                </button>
                <button
                  type="button"
                  onClick={() => { setCountry('SA'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${country === 'SA' ? 'border-accent bg-accent/10 text-accent' : 'border-border/60 text-text-secondary'}`}
                >
                  🇸🇦 السعودية (+966)
                </button>
              </div>

              <div className="text-start mb-4">
                <label className="text-sm font-bold text-text-primary mb-2 block">رقم الجوال</label>
                <div className="flex gap-2 items-stretch" dir="ltr">
                  <span className="flex items-center px-3 bg-bg-primary border border-border/60 rounded-xl text-xs font-bold text-text-secondary shrink-0">
                    {country === 'EG' ? '+20' : '+966'}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={country === 'EG' ? '10xxxxxxxx' : '5xxxxxxxx'}
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setError(''); }}
                      disabled={loading}
                      className="w-full bg-bg-primary border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 disabled:opacity-60"
                    />
                  </div>
                </div>
                {phone.trim() && formatPhoneForFirebaseAuth(phone.trim(), country) && (
                  <p className="text-[10px] text-accent font-bold mt-1.5" dir="ltr">
                    سيُرسل إلى: {formatPhoneForFirebaseAuth(phone.trim(), country)}
                  </p>
                )}
                <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">
                  {country === 'EG'
                    ? 'مصر: 010 / 011 / 012 / 015'
                    : 'السعودية: 05x'}
                </p>
              </div>

              {/* Visible reCAPTCHA on mobile — required for Phone Auth */}
              <div
                ref={recaptchaRef}
                className={isMobileAuthContext()
                  ? 'mb-4 flex justify-center min-h-[78px]'
                  : 'mb-0 h-px w-px opacity-0 overflow-hidden'}
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !phone.trim()}
                className={`btn-accent w-full py-3.5 mb-4 text-base disabled:opacity-60 flex items-center justify-center ${loading ? 'btn-loading' : ''}`}
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
                className={`btn-accent w-full py-3.5 mb-4 text-base disabled:opacity-60 flex items-center justify-center ${loading ? 'btn-loading' : ''}`}
              >
                <ButtonShimmer loading={loading}>تأكيد الرمز</ButtonShimmer>
              </button>
            </>
          )
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setEmailMode('login'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${emailMode === 'login' ? 'border-accent bg-accent/10 text-accent' : 'border-border/60 text-text-secondary'}`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => { setEmailMode('register'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${emailMode === 'register' ? 'border-accent bg-accent/10 text-accent' : 'border-border/60 text-text-secondary'}`}
              >
                إنشاء حساب
              </button>
            </div>

            <div className="text-start mb-4">
              <label className="text-sm font-bold text-text-primary mb-2 block">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  dir="ltr"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full bg-bg-primary border border-border/60 rounded-xl py-3.5 ps-11 pe-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 disabled:opacity-60"
                />
                <Mail className="absolute start-3.5 top-3.5 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
            </div>

            <div className="text-start mb-6">
              <label className="text-sm font-bold text-text-primary mb-2 block">كلمة المرور</label>
              <div className="relative">
                <input
                  dir="ltr"
                  type="password"
                  autoComplete={emailMode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full bg-bg-primary border border-border/60 rounded-xl py-3.5 ps-11 pe-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 disabled:opacity-60"
                />
                <Lock className="absolute start-3.5 top-3.5 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleEmailSubmit}
              disabled={loading || !email.trim() || !password}
              className={`btn-accent w-full py-3.5 mb-4 text-base disabled:opacity-60 flex items-center justify-center ${loading ? 'btn-loading' : ''}`}
            >
              <ButtonShimmer loading={loading}>
                {emailMode === 'register' ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </ButtonShimmer>
            </button>
          </>
        )}

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
