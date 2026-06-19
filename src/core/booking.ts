import { toEasternArabic } from './utils';

export interface BookingDraft {
  serviceType?: string;
  serviceHours?: number;
  longitude?: number;
  latitude?: number;
  addressLine?: string;
  unitDetails?: string;
  date?: string;
  timeSlotId?: string;
  timeSlotLabel?: string;
}

/** Snapshot persisted after successful Firestore submit — consumed by /success */
export interface LastBookingSnapshot {
  bookingId: string;
  serviceType: string;
  serviceHours: number;
  date: string;
  dateFormatted: string;
  timeSlotLabel: string;
  address: string;
  total: number;
  totalFormatted: string;
}

export interface BookingPricing {
  subtotal: number;
  vat: number;
  total: number;
}

export const BASE_HOURLY_RATE = 45;
export const VAT_RATE = 0.15;

const STORAGE_KEY = 'tasami_booking_draft';
const LAST_BOOKING_KEY = 'tasami_last_booking';
const SUBMIT_LOCK_KEY = 'tasami_booking_submit_lock';
const SUBMIT_DONE_KEY = 'tasami_booking_submit_done';

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const RIYADH_CENTER = {
  longitude: 46.6753,
  latitude: 24.7136,
  zoom: 13,
};

export const TIME_SLOTS = [
  { id: '08-10', label: '٠٨:٠٠ ص – ١٠:٠٠ ص' },
  { id: '10-12', label: '١٠:٠٠ ص – ١٢:٠٠ م' },
  { id: '13-15', label: '٠١:٠٠ م – ٠٣:٠٠ م' },
  { id: '15-17', label: '٠٣:٠٠ م – ٠٥:٠٠ م' },
] as const;

export function formatArabicDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${toEasternArabic(d)} ${AR_MONTHS[m - 1]} ${toEasternArabic(y)}`;
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${toEasternArabic(lat.toFixed(4))}° ، ${toEasternArabic(lng.toFixed(4))}°`;
}

export function getMinBookingDate(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculatePricing(hours = 2, baseRate = BASE_HOURLY_RATE): BookingPricing {
  const subtotal = hours * baseRate;
  const vat = Math.round(subtotal * VAT_RATE * 10) / 10;
  const total = Math.round((subtotal + vat) * 10) / 10;
  return { subtotal, vat, total };
}

/** VAT-inclusive total — single source of truth for all price displays. */
export function getTotalWithVat(hours = 2): number {
  return calculatePricing(hours).total;
}

export function formatPrice(amount: number): string {
  return toEasternArabic(Number.isInteger(amount) ? amount : amount.toFixed(1));
}

export function saveBookingDraft(partial: BookingDraft): void {
  try {
    const merged = { ...loadBookingDraft(), ...partial };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* quota / private mode — non-blocking */
  }
}

export function loadBookingDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* non-blocking */
  }
}

export function saveLastBooking(snapshot: LastBookingSnapshot): void {
  try {
    sessionStorage.setItem(LAST_BOOKING_KEY, JSON.stringify(snapshot));
  } catch {
    /* non-blocking */
  }
}

export function loadLastBooking(): LastBookingSnapshot | null {
  try {
    const raw = sessionStorage.getItem(LAST_BOOKING_KEY);
    return raw ? (JSON.parse(raw) as LastBookingSnapshot) : null;
  } catch {
    return null;
  }
}

/** Idempotency — prevent duplicate Firestore writes on double-click / back-nav. */
export function isBookingAlreadySubmitted(): boolean {
  try {
    return sessionStorage.getItem(SUBMIT_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

export function acquireSubmitLock(): boolean {
  try {
    if (sessionStorage.getItem(SUBMIT_DONE_KEY) === '1') return false;
    if (sessionStorage.getItem(SUBMIT_LOCK_KEY) === '1') return false;
    sessionStorage.setItem(SUBMIT_LOCK_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export function releaseSubmitLock(): void {
  try {
    sessionStorage.removeItem(SUBMIT_LOCK_KEY);
  } catch {
    /* non-blocking */
  }
}

export function markBookingSubmitted(): void {
  try {
    sessionStorage.setItem(SUBMIT_DONE_KEY, '1');
    sessionStorage.removeItem(SUBMIT_LOCK_KEY);
  } catch {
    /* non-blocking */
  }
}

export function clearSubmitState(): void {
  try {
    sessionStorage.removeItem(SUBMIT_DONE_KEY);
    sessionStorage.removeItem(SUBMIT_LOCK_KEY);
  } catch {
    /* non-blocking */
  }
}
