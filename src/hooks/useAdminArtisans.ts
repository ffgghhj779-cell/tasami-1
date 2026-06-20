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
import {
  ARTISAN_STATUS_LABELS,
  ARTISAN_STATUS_NEXT,
  type ArtisanApplicationStatus,
} from '../core/artisanApplications';

export interface AdminArtisanRow {
  docId: string;
  userId: string;
  name: string;
  specialty: string;
  city: string;
  phone: string;
  phoneWhatsApp: string;
  contactEmail: string;
  authPhone: string;
  displayName: string;
  experienceYears: number;
  status: ArtisanApplicationStatus;
  adminNotes: string;
  createdAtMs: number;
  createdAtFormatted: string;
  updatedAtMs: number;
  updatedAtFormatted: string;
  raw: Record<string, unknown>;
  exportText: string;
}

const VALID: ArtisanApplicationStatus[] = ['pending', 'approved', 'rejected', 'on_hold'];

function parseStatus(raw: unknown): ArtisanApplicationStatus {
  return VALID.includes(raw as ArtisanApplicationStatus)
    ? (raw as ArtisanApplicationStatus)
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

function buildExportText(row: Omit<AdminArtisanRow, 'raw' | 'exportText'>): string {
  return [
    '═══ تسامي الوطنية — طلب انضمام حرفي ═══',
    `الاسم: ${row.name}`,
    `التخصص: ${row.specialty}`,
    `المدينة: ${row.city}`,
    `الجوال (النموذج): ${row.phone}`,
    `واتساب: ${row.phoneWhatsApp}`,
    `البريد: ${row.contactEmail}`,
    `جوال الحساب: ${row.authPhone}`,
    `اسم الحساب: ${row.displayName}`,
    `سنوات الخبرة: ${row.experienceYears}`,
    `الحالة: ${ARTISAN_STATUS_LABELS[row.status]}`,
    `UID: ${row.userId}`,
    `تاريخ الطلب: ${row.createdAtFormatted}`,
    `آخر تحديث: ${row.updatedAtFormatted}`,
    row.adminNotes ? `ملاحظات الإدارة: ${row.adminNotes}` : '',
  ].filter(Boolean).join('\n');
}

function mapDoc(docId: string, data: Record<string, unknown>): AdminArtisanRow {
  const phone = (data.phone as string) || '';
  const createdAtMs = toMs(data.createdAt);
  const updatedAtMs = toMs(data.updatedAt);

  const base = {
    docId,
    userId: (data.userId as string) || docId,
    name: (data.name as string) || '—',
    specialty: (data.specialty as string) || '—',
    city: (data.city as string) || '—',
    phone: phone || '—',
    phoneWhatsApp: phone ? phone.replace(/\D/g, '') : '—',
    contactEmail: (data.contactEmail as string) || '—',
    authPhone: (data.authPhone as string) || '—',
    displayName: (data.displayName as string) || '—',
    experienceYears: (data.experienceYears as number) ?? 0,
    status: parseStatus(data.status),
    adminNotes: (data.adminNotes as string) || '',
    createdAtMs,
    createdAtFormatted: formatTs(createdAtMs),
    updatedAtMs,
    updatedAtFormatted: formatTs(updatedAtMs),
  };

  const raw = serializeRaw(data);
  return { ...base, raw, exportText: buildExportText(base) };
}

export function useAdminArtisans() {
  const [applications, setApplications] = useState<AdminArtisanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');

    const q = query(collection(db, 'artisans'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setApplications(snapshot.docs.map(d => mapDoc(d.id, d.data() as Record<string, unknown>)));
        setLastUpdated(new Date());
        setLoading(false);
      },
      err => {
        setError('تعذّر تحميل طلبات الحرفيين.');
        setLoading(false);
        console.error('[AdminArtisans]', err);
      },
    );

    return () => unsubscribe();
  }, [refreshKey]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'artisans'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setApplications(snap.docs.map(d => mapDoc(d.id, d.data() as Record<string, unknown>)));
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('فشل التحديث اليدوي.');
    } finally {
      setLoading(false);
    }
  }, []);

  const advanceStatus = useCallback(async (row: AdminArtisanRow) => {
    const next = ARTISAN_STATUS_NEXT[row.status];
    if (!next) return;
    await updateDoc(doc(db, 'artisans', row.docId), {
      status: next,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
    });
  }, []);

  const setStatus = useCallback(async (row: AdminArtisanRow, status: ArtisanApplicationStatus) => {
    await updateDoc(doc(db, 'artisans', row.docId), {
      status,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
    });
  }, []);

  const saveNotes = useCallback(async (row: AdminArtisanRow, adminNotes: string) => {
    await updateDoc(doc(db, 'artisans', row.docId), {
      adminNotes: adminNotes.trim(),
      updatedAt: serverTimestamp(),
    });
  }, []);

  return {
    applications,
    loading,
    error,
    lastUpdated,
    refresh,
    advanceStatus,
    setStatus,
    saveNotes,
  };
}
