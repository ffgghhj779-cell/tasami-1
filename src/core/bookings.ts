import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase';
import { normalizePhoneForWhatsApp } from './phone';
import {
  calculatePricing,
  clearBookingDraft,
  formatArabicDate,
  formatPrice,
  isBookingAlreadySubmitted,
  loadBookingDraft,
  markBookingSubmitted,
  releaseSubmitLock,
  saveLastBooking,
  type BookingDraft,
} from './booking';
import { notifyMakeWebhook } from './makeWebhook';

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
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `ORD-${suffix}`;
}

export function formatBookingIdDisplay(bookingId: string): string {
  return bookingId.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

function buildFirestoreDoc(
  draft: BookingDraft,
  bookingId: string,
  userId: string,
) {
  const hours = draft.serviceHours ?? 2;
  const pricing = calculatePricing(hours);
  const phone = draft.phoneNormalized ?? normalizePhoneForWhatsApp(draft.phone ?? '');

  return {
    bookingId,
    userId,
    status: 'confirmed' as const,
    serviceType: draft.serviceType ?? 'تنظيف منزلي شامل',
    serviceHours: hours,
    customerName: draft.customerName ?? '',
    phone,
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
 * Caller must acquire the submit lock before invoking (see Confirm.tsx).
 */
export async function submitBooking(): Promise<string> {
  if (isBookingAlreadySubmitted()) {
    throw new Error('تم تأكيد هذا الحجز مسبقاً.');
  }

  const draft = loadBookingDraft();

  if (!draft?.date || !draft?.addressLine) {
    releaseSubmitLock();
    const msg = 'بيانات الحجز غير مكتملة. يرجى العودة وإكمال التفاصيل.';
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

    notifyMakeWebhook({
      bookingId,
      customerName: draft.customerName || user.displayName || '',
      phone: docData.phone || normalizePhoneForWhatsApp(user.phoneNumber ?? ''),
      serviceType: docData.serviceType,
      schedule: `${docData.schedule.date} | ${docData.schedule.timeSlotLabel}`,
      totalPrice: docData.pricing.total,
    });

    const address = [draft.addressLine, draft.unitDetails].filter(Boolean).join('، ');

    saveLastBooking({
      bookingId,
      serviceType: docData.serviceType,
      serviceHours: docData.serviceHours,
      date: draft.date,
      dateFormatted: formatArabicDate(draft.date),
      timeSlotLabel: draft.timeSlotLabel ?? '',
      address,
      total: docData.pricing.total,
      totalFormatted: formatPrice(docData.pricing.total),
    });

    markBookingSubmitted();
    clearBookingDraft();
    return bookingId;
  } catch (err) {
    releaseSubmitLock();
    const message =
      err instanceof Error && (
        err.message.includes('بيانات الحجز') ||
        err.message.includes('تم تأكيد')
      )
        ? err.message
        : 'تعذّر حفظ الحجز في قاعدة البيانات. تحقق من الاتصال بالإنترنت وحاول مجدداً.';

    throw new Error(message);
  }
}
