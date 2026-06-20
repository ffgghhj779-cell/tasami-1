import type { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { clearGoogleRedirectPending } from './authBootstrap';

/** True when signed in via Google, Phone, or Email — anonymous is never allowed. */
export function isVerifiedUser(user: User | null | undefined): boolean {
  return !!user && !user.isAnonymous;
}

export function requireVerifiedUser(): User {
  const user = auth.currentUser;
  if (!isVerifiedUser(user)) {
    throw new Error('يجب تسجيل الدخول لإتمام هذه العملية.');
  }
  return user!;
}

export async function signOutUser(): Promise<void> {
  clearGoogleRedirectPending();
  await signOut(auth);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** In-app browsers (WhatsApp, Facebook, etc.) break Google popup auth. */
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|Snapchat|TikTok|Bytedance|Temu|wv\)|; wv\)|WebView/i.test(ua);
}

/** True when running as installed PWA — popup OAuth often fails here. */
export function isStandalonePwa(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Redirect only where popup reliably fails — not all Android Chrome. */
export function needsGoogleRedirect(): boolean {
  if (isInAppBrowser()) return true;
  if (isStandalonePwa()) return true;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** @deprecated Use needsGoogleRedirect for Google; kept for auth settle timing. */
export function isMobileAuthContext(): boolean {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches
      && window.innerWidth < 1024)
  );
}

async function signInWithGoogleRedirect(): Promise<'redirect'> {
  sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, String(Date.now()));
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (err) {
    clearGoogleRedirectPending();
    throw err;
  }
  return 'redirect';
}

export async function signInWithGoogle(): Promise<'popup' | 'redirect'> {
  if (needsGoogleRedirect()) {
    return signInWithGoogleRedirect();
  }

  clearGoogleRedirectPending();
  try {
    await signInWithPopup(auth, googleProvider);
    return 'popup';
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (
      code === 'auth/popup-blocked'
      || code === 'auth/cancelled-popup-request'
      || code === 'auth/internal-error'
      || code === 'auth/web-storage-unsupported'
    ) {
      return signInWithGoogleRedirect();
    }
    throw err;
  }
}

/** Completed by AuthProvider via bootstrapAuth — do not call elsewhere. */
export async function resolveGoogleRedirectResult(): Promise<User | null> {
  const { waitForAuthUser } = await import('./authSession');
  return waitForAuthUser();
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export function mapGoogleAuthError(code?: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'النطاق غير مصرّح به. أضف tasami-14845.web.app في Firebase → Authorized domains.';
    case 'auth/popup-blocked':
      return 'المتصفح حجب النافذة. جرّب مرة أخرى أو افتح الموقع في Chrome/Safari.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    case 'auth/operation-not-allowed':
      return 'تسجيل Google غير مفعّل في Firebase Console.';
    case 'auth/network-request-failed':
      return 'تحقق من الاتصال بالإنترنت وحاول مجدداً.';
    case 'auth/web-storage-unsupported':
      return 'التخزين محجوب. أغلق التصفّح الخاص أو افتح الموقع في Chrome/Safari.';
    case 'auth/internal-error':
      return 'خطأ في المتصفح. افتح tasami-14845.web.app في Chrome أو Safari (ليس من داخل تطبيق).';
    case 'auth/operation-not-supported-in-this-environment':
      return 'هذا المتصفح لا يدعم Google. افتح الرابط في Chrome أو Safari مباشرة.';
    case 'auth/account-exists-with-different-credential':
      return 'هذا البريد مسجّل بطريقة أخرى. جرّب البريد/الجوال أو حساب Google مختلف.';
    default:
      return 'تعذّر تسجيل الدخول عبر Google. افتح الموقع في Chrome أو Safari وحاول مجدداً.';
  }
}

export function mapPhoneAuthError(code?: string): string {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'رقم الجوال غير صالح. استخدم صيغة مصرية (010…) أو سعودية (05…).';
    case 'auth/too-many-requests':
      return 'طلبات كثيرة. انتظر قليلاً أو جرّب Google أو البريد الإلكتروني.';
    case 'auth/quota-exceeded':
      return 'تم استنفاد حد الرسائل اليومي. فعّل الفوترة في Firebase أو استخدم Google/البريد.';
    case 'auth/captcha-check-failed':
      return 'فشل التحقق الأمني (reCAPTCHA). أكمل مربع «أنا لست روبوتاً» ثم حاول مجدداً.';
    case 'auth/missing-phone-number':
      return 'رقم الجوال مطلوب بصيغة دولية (+20… أو +966…).';
    case 'auth/operation-not-allowed':
      return 'تسجيل الجوال غير مفعّل لهذه الدولة. فعّل الفوترة (Blaze) في Firebase أو استخدم Google/البريد.';
    default:
      return 'تعذّر إرسال رمز التحقق. أكمل reCAPTCHA أو جرّب Google/البريد.';
  }
}

export function mapEmailAuthError(code?: string, mode: 'login' | 'register' = 'login'): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'البريد مسجّل مسبقاً. اختر «تسجيل الدخول» بدلاً من إنشاء حساب.';
    case 'auth/invalid-email':
      return 'أدخل بريداً إلكترونياً صحيحاً.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة (6 أحرف على الأقل).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return mode === 'login'
        ? 'البريد أو كلمة المرور غير صحيحة. إن لم يكن لديك حساب، اختر «إنشاء حساب» أعلاه.'
        : 'تعذّر إنشاء الحساب. تحقق من البريد وكلمة المرور.';
    case 'auth/operation-not-allowed':
      return 'تسجيل البريد/كلمة المرور غير مفعّل. فعّله في Firebase Console → Sign-in method → Email/Password.';
    default:
      return mode === 'register'
        ? 'تعذّر إنشاء الحساب. حاول مجدداً.'
        : 'تعذّر تسجيل الدخول بالبريد. حاول مجدداً.';
  }
}
