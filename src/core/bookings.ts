import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { requireVerifiedUser } from './auth';
import { normalizePhoneForWhatsApp, validatePhone } from './phone';
import { validateEmail, validateFullName, validateNationalId } from './validation';
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
    customerName: draft.customerName?.trim() ?? '',
    contactEmail: draft.contactEmail?.trim() ?? '',
    nationalId: draft.nationalId?.trim() ?? '',
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

function assertBookingProfile(draft: BookingDraft): void {
  const nameCheck = validateFullName(draft.customerName ?? '');
  if (!nameCheck.valid) throw new Error(nameCheck.error ?? 'الاسم الكامل مطلوب');

  const emailCheck = validateEmail(draft.contactEmail ?? '');
  if (!emailCheck.valid) throw new Error(emailCheck.error ?? 'البريد الإلكتروني مطلوب');

  const idCheck = validateNationalId(draft.nationalId ?? '');
  if (!idCheck.valid) throw new Error(idCheck.error ?? 'رقم الهوية غير صالح');

  const phoneCheck = validatePhone(draft.phone ?? '');
  if (!phoneCheck.valid) throw new Error(phoneCheck.error ?? 'رقم الجوال غير صالح');
}

/**
 * Reads the sessionStorage draft, requires Google/Phone auth,
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
    const user = requireVerifiedUser();
    assertBookingProfile(draft);
    const bookingId = generateBookingId();
    const docData = buildFirestoreDoc(draft, bookingId, user.uid);

    await addDoc(collection(db, 'bookings'), {
      ...docData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    notifyMakeWebhook({
      bookingId,
      customerName: docData.customerName || user.displayName || '',
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
