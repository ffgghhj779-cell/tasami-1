import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase';
import {
  calculatePricing,
  clearBookingDraft,
  formatArabicDate,
  formatPrice,
  loadBookingDraft,
  saveLastBooking,
  type BookingDraft,
} from './booking';

export interface BookingDocument {
  bookingId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'completed' | 'cancelled';
  serviceType: string;
  serviceHours: number;
  address: {
    line: string;
    unitDetails: string;
    coordinates: { latitude: number; longitude: number };
  };
  schedule: {
    date: string;
    timeSlotId: string;
    timeSlotLabel: string;
  };
  pricing: {
    subtotal: number;
    vat: number;
    total: number;
    currency: 'SAR';
  };
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

export function generateBookingId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${num}`;
}

export function formatBookingIdDisplay(bookingId: string): string {
  const [prefix, digits] = bookingId.split('-');
  if (!digits) return bookingId;
  const eastern = digits.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  return `${prefix}-${eastern}`;
}

function buildFirestoreDoc(
  draft: BookingDraft,
  bookingId: string,
  userId: string,
) {
  const hours = draft.serviceHours ?? 2;
  const pricing = calculatePricing(hours);

  return {
    bookingId,
    userId,
    status: 'confirmed' as const,
    serviceType: draft.serviceType ?? 'تنظيف منزلي شامل',
    serviceHours: hours,
    address: {
      line: draft.addressLine ?? '',
      unitDetails: draft.unitDetails ?? '',
      coordinates: {
        latitude: draft.latitude ?? 24.7136,
        longitude: draft.longitude ?? 46.6753,
      },
    },
    schedule: {
      date: draft.date ?? '',
      timeSlotId: draft.timeSlotId ?? '',
      timeSlotLabel: draft.timeSlotLabel ?? '',
    },
    pricing: {
      subtotal: pricing.subtotal,
      vat: pricing.vat,
      total: pricing.total,
      currency: 'SAR' as const,
    },
  };
}

async function ensureAuthenticatedUser() {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

/**
 * Reads the sessionStorage draft, authenticates anonymously if needed,
 * writes to Firestore `bookings`, saves a success snapshot, and clears the draft.
 */
export async function submitBooking(): Promise<string> {
  const draft = loadBookingDraft();

  if (!draft?.date || !draft?.addressLine) {
    const msg = 'بيانات الحجز غير مكتملة. يرجى العودة وإكمال التفاصيل.';
    window.alert(msg);
    throw new Error(msg);
  }

  try {
    const user = await ensureAuthenticatedUser();
    const bookingId = generateBookingId();
    const docData = buildFirestoreDoc(draft, bookingId, user.uid);

    await addDoc(collection(db, 'bookings'), {
      ...docData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const hours = draft.serviceHours ?? 2;
    const pricing = calculatePricing(hours);
    const address = [draft.addressLine, draft.unitDetails].filter(Boolean).join('، ');

    saveLastBooking({
      bookingId,
      serviceType: docData.serviceType,
      serviceHours: hours,
      date: draft.date,
      dateFormatted: formatArabicDate(draft.date),
      timeSlotLabel: draft.timeSlotLabel ?? '',
      address,
      total: pricing.total,
      totalFormatted: formatPrice(pricing.total),
    });

    clearBookingDraft();
    return bookingId;
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes('بيانات الحجز')
        ? err.message
        : 'تعذّر حفظ الحجز في قاعدة البيانات. تحقق من الاتصال بالإنترنت وحاول مجدداً.';

    window.alert(message);
    throw new Error(message);
  }
}
