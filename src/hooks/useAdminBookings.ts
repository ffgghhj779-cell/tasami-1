import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { formatArabicDate, formatPrice } from '../core/booking';
import { formatBookingIdDisplay } from '../core/bookings';
import type { BookingStatus } from '../core/admin';

export interface AdminBookingRow {
  docId: string;
  bookingId: string;
  bookingIdDisplay: string;
  userId: string;
  status: BookingStatus;
  serviceType: string;
  serviceHours: number;
  customerName: string;
  contactEmail: string;
  nationalId: string;
  phone: string;
  phoneWhatsApp: string;
  addressLine: string;
  addressUnit: string;
  addressFull: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  date: string;
  dateFormatted: string;
  timeSlotId: string;
  timeSlotLabel: string;
  subtotal: number;
  subtotalFormatted: string;
  vat: number;
  vatFormatted: string;
  total: number;
  totalFormatted: string;
  currency: string;
  assignedArtisanId: string;
  createdAtMs: number;
  createdAtFormatted: string;
  updatedAtMs: number;
  updatedAtFormatted: string;
  /** Full Firestore document for admin export */
  raw: Record<string, unknown>;
  exportText: string;
}

const VALID_STATUSES: BookingStatus[] = [
  'pending', 'confirmed', 'assigned', 'completed', 'cancelled',
];

function parseStatus(raw: unknown): BookingStatus {
  return VALID_STATUSES.includes(raw as BookingStatus)
    ? (raw as BookingStatus)
    : 'pending';
}

function toMs(value: unknown): number {
  if (value && typeof value === 'object' && 'toMillis' in value) {
    return (value as Timestamp).toMillis();
  }
  return 0;
}

function formatTs(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function serializeRaw(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object' && 'toMillis' in val) {
      out[key] = (val as Timestamp).toMillis();
    } else {
      out[key] = val;
    }
  }
  return out;
}

function buildExportText(row: Omit<AdminBookingRow, 'raw' | 'exportText'>): string {
  return [
    '═══ تسامي الوطنية — بيانات الحجز الكاملة ═══',
    '',
    '── العميل ──',
    `الاسم: ${row.customerName}`,
    `الجوال: ${row.phone}`,
    `واتساب: ${row.phoneWhatsApp}`,
    `البريد: ${row.contactEmail}`,
    `الهوية/الإقامة: ${row.nationalId}`,
    `UID: ${row.userId}`,
    '',
    '── الطلب ──',
    `رقم الطلب: ${row.bookingId}`,
    `معرّف المستند: ${row.docId}`,
    `الحالة: ${row.status}`,
    `الخدمة: ${row.serviceType}`,
    `المدة: ${row.serviceHours} ساعات`,
    `التاريخ: ${row.dateFormatted} (${row.date})`,
    `الفترة: ${row.timeSlotLabel} [${row.timeSlotId}]`,
    `تاريخ الإنشاء: ${row.createdAtFormatted}`,
    `آخر تحديث: ${row.updatedAtFormatted}`,
    `الحرفي: ${row.assignedArtisanId || '—'}`,
    '',
    '── العنوان ──',
    `السطر: ${row.addressLine}`,
    `تفاصيل: ${row.addressUnit}`,
    `الإحداثيات: ${row.latitude}, ${row.longitude}`,
    `خرائط: ${row.mapsUrl || '—'}`,
    '',
    '── التسعير ──',
    `قيمة الخدمة: ${row.subtotalFormatted} ${row.currency}`,
    `ضريبة ١٥٪: ${row.vatFormatted} ${row.currency}`,
    `الإجمالي: ${row.totalFormatted} ${row.currency}`,
  ].join('\n');
}

function mapDoc(id: string, data: Record<string, unknown>): AdminBookingRow {
  const schedule = data.schedule as {
    date?: string;
    timeSlotId?: string;
    timeSlotLabel?: string;
  } | undefined;
  const pricing = data.pricing as {
    subtotal?: number;
    vat?: number;
    total?: number;
    currency?: string;
  } | undefined;
  const addressObj = data.address as {
    line?: string;
    unitDetails?: string;
    coordinates?: { latitude?: number; longitude?: number };
  } | undefined;

  const date = schedule?.date ?? '';
  const subtotal = pricing?.subtotal ?? 0;
  const vat = pricing?.vat ?? 0;
  const total = pricing?.total ?? 0;
  const lat = addressObj?.coordinates?.latitude ?? 0;
  const lng = addressObj?.coordinates?.longitude ?? 0;
  const line = addressObj?.line ?? '';
  const unit = addressObj?.unitDetails ?? '';
  const phone = (data.phone as string) ?? '';
  const createdAtMs = toMs(data.createdAt);
  const updatedAtMs = toMs(data.updatedAt);
  const raw = serializeRaw(data);

  const base = {
    docId: id,
    bookingId: (data.bookingId as string) ?? '',
    bookingIdDisplay: formatBookingIdDisplay((data.bookingId as string) ?? ''),
    userId: (data.userId as string) ?? '',
    status: parseStatus(data.status),
    serviceType: (data.serviceType as string) ?? '—',
    serviceHours: (data.serviceHours as number) ?? 2,
    customerName: (data.customerName as string) || '—',
    contactEmail: (data.contactEmail as string) || '—',
    nationalId: (data.nationalId as string) || '—',
    phone: phone || '—',
    phoneWhatsApp: phone ? phone.replace(/\D/g, '') : '—',
    addressLine: line || '—',
    addressUnit: unit || '—',
    addressFull: [line, unit].filter(Boolean).join('، ') || '—',
    latitude: lat,
    longitude: lng,
    mapsUrl: lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '',
    date,
    dateFormatted: date ? formatArabicDate(date) : '—',
    timeSlotId: schedule?.timeSlotId ?? '—',
    timeSlotLabel: schedule?.timeSlotLabel ?? '—',
    subtotal,
    subtotalFormatted: formatPrice(subtotal),
    vat,
    vatFormatted: formatPrice(vat),
    total,
    totalFormatted: formatPrice(total),
    currency: pricing?.currency ?? 'SAR',
    assignedArtisanId: (data.assignedArtisanId as string) ?? '',
    createdAtMs,
    createdAtFormatted: formatTs(createdAtMs),
    updatedAtMs,
    updatedAtFormatted: formatTs(updatedAtMs),
  };

  return {
    ...base,
    raw,
    exportText: buildExportText(base),
  };
}

export function useAdminBookings() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    setError('');

    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const rows = snapshot.docs.map(d =>
          mapDoc(d.id, d.data() as Record<string, unknown>),
        );
        setBookings(rows);
        setLastUpdated(new Date());
        setLoading(false);
      },
      err => {
        setError('تعذّر تحميل الحجوزات. تحقق من صلاحيات الإدارة.');
        setLoading(false);
        console.error('[AdminBookings]', err);
      },
    );

    return () => unsubscribe();
  }, [refreshKey]);

  const manualRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setBookings(snap.docs.map(d => mapDoc(d.id, d.data() as Record<string, unknown>)));
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('فشل التحديث اليدوي.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async (row: AdminBookingRow) => {
    const next: BookingStatus =
      row.status === 'confirmed' || row.status === 'assigned'
        ? 'completed'
        : 'confirmed';

    await updateDoc(doc(db, 'bookings', row.docId), {
      status: next,
      updatedAt: serverTimestamp(),
    });
  }, []);

  return { bookings, loading, error, lastUpdated, refresh: manualRefresh, toggleStatus };
}
