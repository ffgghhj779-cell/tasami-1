import type { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from './firebase';

/** True when signed in via Google or Phone — anonymous is never allowed. */
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

/** Call on app/login mount to complete a mobile Google redirect flow. */
export async function resolveGoogleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}

export function mapGoogleAuthError(code?: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'النطاق غير مصرّح به. أضف نطاق Vercel في Firebase → Authentication → Authorized domains.';
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
