import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase';

export interface ReviewDocument {
  bookingDocId: string;
  bookingId: string;
  userId: string;
  artisanId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export interface ReviewRecord {
  id: string;
  bookingDocId: string;
  bookingId: string;
  userId: string;
  artisanId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAtMs: number;
}

async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function submitReview(input: {
  bookingDocId: string;
  bookingId: string;
  artisanId: string;
  rating: number;
  comment: string;
  userName?: string;
}): Promise<void> {
  const user = await ensureAuth();

  const existing = await getDocs(
    query(
      collection(db, 'reviews'),
      where('bookingDocId', '==', input.bookingDocId),
      where('userId', '==', user.uid),
    ),
  );
  if (!existing.empty) {
    throw new Error('لقد قيّمت هذا الحجز مسبقاً.');
  }

  await addDoc(collection(db, 'reviews'), {
    bookingDocId: input.bookingDocId,
    bookingId: input.bookingId,
    userId: user.uid,
    artisanId: input.artisanId,
    rating: input.rating,
    comment: input.comment.trim(),
    userName: input.userName?.trim() || 'عميل',
    createdAt: serverTimestamp(),
  } satisfies Omit<ReviewDocument, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> });
}

export async function fetchReviewsForArtisan(artisanId: string): Promise<ReviewRecord[]> {
  const snap = await getDocs(
    query(collection(db, 'reviews'), where('artisanId', '==', artisanId)),
  );

  return snap.docs
    .map(d => {
      const data = d.data();
      const createdAt = data.createdAt;
      return {
        id: d.id,
        bookingDocId: (data.bookingDocId as string) ?? '',
        bookingId: (data.bookingId as string) ?? '',
        userId: (data.userId as string) ?? '',
        artisanId: (data.artisanId as string) ?? '',
        rating: (data.rating as number) ?? 5,
        comment: (data.comment as string) ?? '',
        userName: (data.userName as string) ?? 'عميل',
        createdAtMs:
          createdAt && typeof createdAt === 'object' && 'toMillis' in createdAt
            ? (createdAt as { toMillis: () => number }).toMillis()
            : 0,
      };
    })
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export async function fetchReviewedBookingIds(userId: string): Promise<Set<string>> {
  const snap = await getDocs(
    query(collection(db, 'reviews'), where('userId', '==', userId)),
  );
  return new Set(snap.docs.map(d => (d.data().bookingDocId as string) ?? ''));
}

export function averageRating(reviews: ReviewRecord[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
