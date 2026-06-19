import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../core/firebase';
import { formatArabicDate, formatPrice } from '../core/booking';
import { formatBookingIdDisplay } from '../core/bookings';
import { STATUS_LABELS, type BookingStatus } from '../core/admin';

export interface UserBookingRow {
  docId: string;
  bookingId: string;
  bookingIdDisplay: string;
  serviceType: string;
  serviceHours: number;
  date: string;
  dateFormatted: string;
  timeSlotLabel: string;
  address: string;
  customerName: string;
  contactEmail: string;
  nationalId: string;
  phone: string;
  total: number;
  totalFormatted: string;
  status: BookingStatus;
  assignedArtisanId: string;
  createdAtMs: number;
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

function mapDoc(id: string, data: Record<string, unknown>): UserBookingRow {
  const schedule = data.schedule as { date?: string; timeSlotLabel?: string } | undefined;
  const pricing = data.pricing as { total?: number } | undefined;
  const addressObj = data.address as { line?: string; unitDetails?: string } | undefined;
  const date = schedule?.date ?? '';
  const total = pricing?.total ?? 0;
  const addressParts = [addressObj?.line, addressObj?.unitDetails].filter(Boolean);

  return {
    docId: id,
    bookingId: (data.bookingId as string) ?? '',
    bookingIdDisplay: formatBookingIdDisplay((data.bookingId as string) ?? ''),
    serviceType: (data.serviceType as string) ?? '—',
    serviceHours: (data.serviceHours as number) ?? 2,
    date,
    dateFormatted: date ? formatArabicDate(date) : '—',
    timeSlotLabel: schedule?.timeSlotLabel ?? '—',
    address: addressParts.join('، ') || '—',
    customerName: (data.customerName as string) || '—',
    contactEmail: (data.contactEmail as string) || '—',
    nationalId: (data.nationalId as string) || '—',
    phone: (data.phone as string) || '—',
    total,
    totalFormatted: formatPrice(total),
    status: parseStatus(data.status),
    assignedArtisanId: (data.assignedArtisanId as string) ?? '1',
    createdAtMs: toMs(data.createdAt),
  };
}

export function useUserBookings() {
  const [bookings, setBookings] = useState<UserBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubBookings: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, currentUser => {
      unsubBookings?.();
      unsubBookings = undefined;

      if (!mounted) return;
      setUser(currentUser);

      if (!currentUser) {
        setBookings([]);
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid),
      );

      unsubBookings = onSnapshot(
        q,
        snapshot => {
          if (!mounted) return;
          const rows = snapshot.docs
            .map(d => mapDoc(d.id, d.data() as Record<string, unknown>))
            .sort((a, b) => b.createdAtMs - a.createdAtMs);
          setBookings(rows);
          setLoading(false);
        },
        err => {
          if (!mounted) return;
          setError('تعذّر تحميل سجل الحجوزات.');
          setLoading(false);
          console.error('[UserBookings]', err);
        },
      );
    });

    return () => {
      mounted = false;
      unsubAuth();
      unsubBookings?.();
    };
  }, []);

  const upcoming = bookings.filter(
    b => b.status === 'pending' || b.status === 'confirmed' || b.status === 'assigned',
  );
  const past = bookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled',
  );

  return {
    bookings,
    upcoming,
    past,
    loading,
    error,
    user,
    statusLabels: STATUS_LABELS,
  };
}
