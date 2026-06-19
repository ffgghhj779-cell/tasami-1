import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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

/** Client-side admin gate — mirrors Firestore `admins/{uid}` with role === 'admin'. */
export async function checkIsAdmin(uid: string | null | undefined): Promise<boolean> {
  if (!uid) return false;

  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}
