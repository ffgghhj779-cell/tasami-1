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
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { formatArabicDate, formatPrice } from '../core/booking';
import { formatBookingIdDisplay } from '../core/bookings';
import type { BookingStatus } from '../core/admin';

export interface AdminBookingRow {
  docId: string;
  bookingId: string;
  bookingIdDisplay: string;
  serviceType: string;
  date: string;
  dateFormatted: string;
  timeSlotLabel: string;
  total: number;
  totalFormatted: string;
  status: BookingStatus;
}

function mapDoc(id: string, data: Record<string, unknown>): AdminBookingRow {
  const schedule = data.schedule as { date?: string; timeSlotLabel?: string } | undefined;
  const pricing = data.pricing as { total?: number } | undefined;
  const date = schedule?.date ?? '';
  const total = pricing?.total ?? 0;

  return {
    docId: id,
    bookingId: (data.bookingId as string) ?? '',
    bookingIdDisplay: formatBookingIdDisplay((data.bookingId as string) ?? ''),
    serviceType: (data.serviceType as string) ?? '—',
    date,
    dateFormatted: date ? formatArabicDate(date) : '—',
    timeSlotLabel: schedule?.timeSlotLabel ?? '—',
    total,
    totalFormatted: formatPrice(total),
    status: (data.status as BookingStatus) ?? 'pending',
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
