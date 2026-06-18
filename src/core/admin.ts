import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Paste your Firebase Auth UID here after your first anonymous sign-in.
 * Find it in the AdminGuard "access denied" screen or Firebase Console → Authentication.
 * Also update the same UID in firestore.rules → isHardcodedAdmin().
 */
export const HARDCODED_ADMIN_UID = 'Loeyivasx8YGMPfN8NUAFcZVSAJ3';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'completed'
  | 'cancelled';

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'قيد الانتظار',
  confirmed: 'مؤكد',
  assigned:  'تم التعيين',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

/** Client-side admin check: hardcoded UID OR admins/{uid} document with role === 'admin' */
export async function checkIsAdmin(uid: string | null | undefined): Promise<boolean> {
  if (!uid) return false;

  if (
    HARDCODED_ADMIN_UID !== 'PASTE_YOUR_UID_HERE' &&
    uid === HARDCODED_ADMIN_UID
  ) {
    return true;
  }

  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}
