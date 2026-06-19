import type { User } from 'firebase/auth';
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
