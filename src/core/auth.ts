import type { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from './firebase';

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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Mobile browsers block popups — redirect is required for reliable Google sign-in. */
export function isMobileAuthContext(): boolean {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches
      && window.innerWidth < 1024)
  );
}

export async function signInWithGoogle(): Promise<'popup' | 'redirect'> {
  if (isMobileAuthContext()) {
    await signInWithRedirect(auth, googleProvider);
    return 'redirect';
  }
  await signInWithPopup(auth, googleProvider);
  return 'popup';
}

/** Call before auth guards evaluate — completes pending Google redirect. */
export async function resolveGoogleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
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
      return 'النطاق غير مصرّح به. أضف نطاق الاستضافة في Firebase → Authentication → Authorized domains.';
    case 'auth/popup-blocked':
    case 'auth/popup-closed-by-user':
      return '';
    case 'auth/operation-not-allowed':
      return 'تسجيل Google غير مفعّل في Firebase Console.';
    case 'auth/network-request-failed':
      return 'تحقق من الاتصال بالإنترنت وحاول مجدداً.';
    default:
      return 'تعذّر تسجيل الدخول عبر Google. حاول مجدداً.';
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
      return 'فشل التحقق الأمني (reCAPTCHA). أعد تحميل الصفحة وحاول مجدداً.';
    case 'auth/missing-phone-number':
      return 'رقم الجوال مطلوب بصيغة دولية (+20… أو +966…).';
    default:
      return 'تعذّر إرسال رمز التحقق. تحقق من الرقم أو جرّب Google/البريد.';
  }
}

export function mapEmailAuthError(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'البريد مسجّل مسبقاً. سجّل الدخول بدلاً من إنشاء حساب.';
    case 'auth/invalid-email':
      return 'أدخل بريداً إلكترونياً صحيحاً.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة (6 أحرف على الأقل).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'البريد أو كلمة المرور غير صحيحة.';
    case 'auth/operation-not-allowed':
      return 'تسجيل البريد/كلمة المرور غير مفعّل. فعّله في Firebase Console → Sign-in method → Email/Password.';
    default:
      return 'تعذّر تسجيل الدخول بالبريد. حاول مجدداً.';
  }
}
