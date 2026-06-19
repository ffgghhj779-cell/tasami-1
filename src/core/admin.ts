import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { isBootstrapAdmin } from './adminAccess';

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

/** Client-side admin gate — Firestore `admins/{uid}` or bootstrap allowlist. */
export async function checkIsAdmin(
  uid: string | null | undefined,
  email?: string | null,
): Promise<boolean> {
  if (!uid) return false;
  if (isBootstrapAdmin(uid, email)) return true;

  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}
