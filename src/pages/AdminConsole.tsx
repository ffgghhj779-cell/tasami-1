import React, { useMemo, useState } from 'react';
import {
  Volume2,
  RefreshCw,
  Search,
  Filter,
  ClipboardList,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowLeftRight,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Copy,
  ExternalLink,
  FileJson,
  Hammer,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import { PageHeader, BookingListSkeleton } from '../components/ui';
import { STATUS_LABELS, type BookingStatus } from '../core/admin';
import {
  ARTISAN_STATUS_LABELS,
  artisanStatusActionLabel,
  type ArtisanApplicationStatus,
} from '../core/artisanApplications';
import { useAdminBookings, type AdminBookingRow } from '../hooks/useAdminBookings';
import { useAdminArtisans, type AdminArtisanRow } from '../hooks/useAdminArtisans';

type AdminTab = 'bookings' | 'artisans';
type StatusFilter = 'all' | BookingStatus;
type ArtisanStatusFilter = 'all' | ArtisanApplicationStatus;

function SectionHeading({
  title,
  onSpeak,
}: {
  title: string;
  onSpeak: (e: React.MouseEvent) => void;
}) {
  return (
    <h2 className="font-bold text-base text-text-primary flex items-center gap-2 mb-4">
      <span className="flex-1">{title}</span>
      <button onClick={onSpeak} aria-label="استمع" className="btn-speak shrink-0">
        <Volume2 className="w-4 h-4 text-text-secondary" />
      </button>
    </h2>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    pending:   'bg-accent/15 text-accent border-accent/30',
    confirmed: 'bg-success/10 text-success border-success/25',
    assigned:  'bg-text-primary/10 text-text-primary border-text-primary/20',
    completed: 'bg-border text-text-secondary border-border',
    cancelled: 'bg-danger/10 text-danger border-danger/25',
  };

  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function DetailField({
  label,
  value,
  ltr = false,
  mono = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  mono?: boolean;
}) {
  const copy = () => {
    if (value && value !== '—') void navigator.clipboard?.writeText(value);
  };

  return (
    <div className="min-w-0">
      <span className="text-text-secondary font-medium block text-[10px] mb-0.5">{label}</span>
      <div className="flex items-start gap-1.5">
        <span
          dir={ltr ? 'ltr' : 'rtl'}
          className={`font-bold text-text-primary text-xs break-all flex-1 ${mono ? 'font-mono text-[11px]' : ''}`}
        >
          {value || '—'}
        </span>
        {value && value !== '—' && (
          <button
            type="button"
            onClick={copy}
            className="p-1 rounded-md border border-border/50 hover:bg-bg-primary shrink-0"
            aria-label={`نسخ ${label}`}
          >
            <Copy className="w-3 h-3 text-accent" />
          </button>
        )}
      </div>
    </div>
  );
}

function AdminBookingCard({
  row,
  toggling,
  onToggle,
}: {
  row: AdminBookingRow;
  toggling: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-bg-card/80 border-2 border-accent/20 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 bg-accent/5 border-b border-accent/15">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span dir="ltr" className="text-xs font-black text-accent tracking-wider">
            #{row.bookingIdDisplay}
          </span>
          <StatusBadge status={row.status} />
        </div>
        <p className="text-base font-black text-text-primary">{row.serviceType}</p>
        <p className="text-sm font-bold text-text-primary mt-2">
          {row.customerName}
        </p>
        <p dir="ltr" className="text-xs text-text-secondary font-mono mt-0.5">
          {row.phone} · {row.contactEmail}
        </p>
      </div>

      <div className="px-4 pb-4 space-y-4 pt-4">
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(row.exportText)}
            className="w-full py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-bold flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            نسخ كل بيانات الطلب
          </button>

          {(row.customerName === '—' || row.phone === '—') && (
            <p className="text-[10px] text-danger font-bold bg-danger/8 border border-danger/20 rounded-lg p-2">
              تنبيه: بعض بيانات العميل غير مسجّلة — قد يكون حجزاً قديماً قبل تفعيل الحقول الإلزامية.
            </p>
          )}

          <div>
            <h3 className="text-xs font-black text-accent mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              بيانات العميل (شخصية)
            </h3>
            <div className="grid grid-cols-1 gap-3 bg-bg-primary/50 rounded-xl p-3 border border-border/30">
              <DetailField label="الاسم الكامل" value={row.customerName} />
              <DetailField label="رقم الجوال" value={row.phone} ltr mono />
              <DetailField label="واتساب (أرقام فقط)" value={row.phoneWhatsApp} ltr mono />
              <DetailField label="البريد الإلكتروني" value={row.contactEmail} ltr />
              <DetailField label="رقم الهوية / الإقامة" value={row.nationalId} ltr mono />
              <DetailField label="معرّف المستخدم Firebase (UID)" value={row.userId} ltr mono />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-accent mb-2 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              تفاصيل الطلب والحالة
            </h3>
            <div className="grid grid-cols-1 gap-3 bg-bg-primary/50 rounded-xl p-3 border border-border/30">
              <DetailField label="رقم الطلب (ORD)" value={row.bookingId} ltr mono />
              <DetailField label="معرّف المستند Firestore" value={row.docId} ltr mono />
              <DetailField label="حالة الحجز" value={STATUS_LABELS[row.status]} />
              <DetailField label="نوع الخدمة" value={row.serviceType} />
              <DetailField label="مدة الخدمة" value={`${toEasternArabic(row.serviceHours)} ساعات`} />
              <DetailField label="تاريخ الخدمة" value={`${row.dateFormatted} (${row.date})`} />
              <DetailField label="الفترة الزمنية" value={row.timeSlotLabel} />
              <DetailField label="معرّف الفترة" value={row.timeSlotId} ltr mono />
              <DetailField label="الحرفي المعيّن" value={row.assignedArtisanId || '—'} ltr mono />
              <DetailField label="تاريخ إنشاء الحجز" value={row.createdAtFormatted} />
              <DetailField label="آخر تحديث" value={row.updatedAtFormatted} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-accent mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              العنوان والموقع
            </h3>
            <div className="grid grid-cols-1 gap-3 bg-bg-primary/50 rounded-xl p-3 border border-border/30">
              <DetailField label="العنوان" value={row.addressLine} />
              <DetailField label="تفاصيل (شقة / دور / مبنى)" value={row.addressUnit} />
              <DetailField label="العنوان الكامل" value={row.addressFull} />
              <DetailField label="خط العرض (Latitude)" value={String(row.latitude)} ltr mono />
              <DetailField label="خط الطول (Longitude)" value={String(row.longitude)} ltr mono />
              {row.mapsUrl ? (
                <a
                  href={row.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  فتح على Google Maps
                </a>
              ) : (
                <DetailField label="رابط الخريطة" value="—" />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-accent mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              التسعير والفاتورة
            </h3>
            <div className="grid grid-cols-1 gap-3 bg-bg-primary/50 rounded-xl p-3 border border-border/30">
              <DetailField label="قيمة الخدمة (قبل الضريبة)" value={`${row.subtotalFormatted} ${row.currency}`} />
              <DetailField label="ضريبة القيمة المضافة ١٥٪" value={`${row.vatFormatted} ${row.currency}`} />
              <DetailField label="الإجمالي شامل الضريبة" value={`${row.totalFormatted} ${row.currency}`} />
              <DetailField label="العملة" value={row.currency} ltr />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-accent mb-2 flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5" />
              البيانات الخام (Firestore)
            </h3>
            <pre
              dir="ltr"
              className="text-[10px] font-mono bg-bg-primary border border-border/40 rounded-xl p-3 overflow-x-auto max-h-48 text-text-primary whitespace-pre-wrap break-all"
            >
              {JSON.stringify(row.raw, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(JSON.stringify(row.raw, null, 2))}
              className="mt-2 text-[10px] font-bold text-accent flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              نسخ JSON
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {row.phoneWhatsApp && row.phoneWhatsApp !== '—' && (
              <a
                href={`https://wa.me/${row.phoneWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] py-2.5 rounded-xl border border-success/30 bg-success/8 text-success text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                واتساب العميل
              </a>
            )}
            {row.contactEmail && row.contactEmail !== '—' && (
              <a
                href={`mailto:${row.contactEmail}`}
                className="flex-1 min-w-[120px] py-2.5 rounded-xl border border-accent/30 bg-accent/8 text-accent text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                بريد العميل
              </a>
            )}
          </div>

          {(row.status === 'confirmed' || row.status === 'assigned' || row.status === 'completed') && (
            <button
              onClick={onToggle}
              disabled={toggling}
              className="w-full py-2.5 rounded-xl border border-border/60 text-xs font-bold text-text-primary flex items-center justify-center gap-2 hover:bg-accent hover:text-white hover:border-transparent transition-all duration-300 active:scale-95 disabled:opacity-60"
            >
              {toggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowLeftRight className="w-3.5 h-3.5" />
              )}
              {row.status === 'completed' ? 'إعادة إلى مؤكد' : 'تحديد كمكتمل'}
            </button>
          )}
        </div>
    </div>
  );
}

function ArtisanStatusBadge({ status }: { status: ArtisanApplicationStatus }) {
  const styles: Record<ArtisanApplicationStatus, string> = {
    pending: 'bg-accent/15 text-accent border-accent/30',
    approved: 'bg-success/10 text-success border-success/25',
    rejected: 'bg-danger/10 text-danger border-danger/25',
    on_hold: 'bg-text-primary/10 text-text-primary border-text-primary/20',
  };
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {ARTISAN_STATUS_LABELS[status]}
    </span>
  );
}

function AdminArtisanCard({
  row,
  busy,
  onAdvance,
  onHold,
  onSaveNotes,
}: {
  row: AdminArtisanRow;
  busy: boolean;
  onAdvance: () => void;
  onSaveNotes: (notes: string) => void;
  onHold: () => void;
}) {
  const [notes, setNotes] = useState(row.adminNotes);

  return (
    <div className="bg-bg-card/80 border-2 border-accent/20 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 bg-accent/5 border-b border-accent/15">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span dir="ltr" className="text-xs font-black text-accent tracking-wider">
            #{row.docId.slice(0, 8).toUpperCase()}
          </span>
          <ArtisanStatusBadge status={row.status} />
        </div>
        <p className="text-base font-black text-text-primary">{row.name}</p>
        <p className="text-sm font-bold text-text-primary mt-1">{row.specialty}</p>
        <p className="text-xs text-text-secondary mt-1">{row.city} · {toEasternArabic(row.experienceYears)} سنوات خبرة</p>
      </div>

      <div className="px-4 pb-4 space-y-4 pt-4">
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(row.exportText)}
          className="w-full py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-bold flex items-center justify-center gap-2"
        >
          <Copy className="w-3.5 h-3.5" />
          نسخ كل بيانات الطلب
        </button>

        <div className="grid grid-cols-1 gap-3 bg-bg-primary/50 rounded-xl p-3 border border-border/30">
          <DetailField label="الاسم" value={row.name} />
          <DetailField label="التخصص" value={row.specialty} />
          <DetailField label="المدينة" value={row.city} />
          <DetailField label="سنوات الخبرة" value={String(row.experienceYears)} />
          <DetailField label="جوال (النموذج)" value={row.phone} ltr mono />
          <DetailField label="واتساب" value={row.phoneWhatsApp} ltr mono />
          <DetailField label="البريد" value={row.contactEmail} ltr />
          <DetailField label="جوال الحساب" value={row.authPhone} ltr mono />
          <DetailField label="اسم الحساب" value={row.displayName} />
          <DetailField label="UID" value={row.userId} ltr mono />
          <DetailField label="تاريخ الطلب" value={row.createdAtFormatted} />
          <DetailField label="آخر تحديث" value={row.updatedAtFormatted} />
        </div>

        <div>
          <label className="text-xs font-black text-accent mb-2 block">ملاحظات الإدارة (متابعة داخلية)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-bg-primary border border-border/60 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/70"
            placeholder="ملاحظات المراجعة…"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => onSaveNotes(notes)}
            className="mt-2 text-[10px] font-bold text-accent"
          >
            حفظ الملاحظات
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {row.phoneWhatsApp && row.phoneWhatsApp !== '—' && (
            <a
              href={`https://wa.me/${row.phoneWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] py-2.5 rounded-xl border border-success/30 bg-success/8 text-success text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              واتساب
            </a>
          )}
          {row.contactEmail && row.contactEmail !== '—' && (
            <a
              href={`mailto:${row.contactEmail}`}
              className="flex-1 min-w-[120px] py-2.5 rounded-xl border border-accent/30 bg-accent/8 text-accent text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              بريد
            </a>
          )}
        </div>

        <div className="flex gap-2">
          {(row.status === 'pending' || row.status === 'on_hold') && (
            <button
              type="button"
              disabled={busy}
              onClick={onHold}
              className="flex-1 py-2.5 rounded-xl border border-border/60 text-xs font-bold text-text-secondary hover:bg-bg-primary disabled:opacity-60"
            >
              تعليق
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onAdvance}
            className="flex-[2] py-2.5 rounded-xl border border-border/60 text-xs font-bold text-text-primary flex items-center justify-center gap-2 hover:bg-accent hover:text-white hover:border-transparent transition-all disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
            {artisanStatusActionLabel(row.status)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminConsole() {
  const { i18n } = useTranslation();
  const { bookings, loading: bookingsLoading, error: bookingsError, lastUpdated: bookingsUpdated, refresh: refreshBookings, toggleStatus } = useAdminBookings();
  const { applications, loading: artisansLoading, error: artisansError, lastUpdated: artisansUpdated, refresh: refreshArtisans, advanceStatus, setStatus, saveNotes } = useAdminArtisans();

  const [tab, setTab] = useState<AdminTab>('bookings');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [artisanStatusFilter, setArtisanStatusFilter] = useState<ArtisanStatusFilter>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [artisanBusyId, setArtisanBusyId] = useState<string | null>(null);

  const loading = tab === 'bookings' ? bookingsLoading : artisansLoading;
  const error = tab === 'bookings' ? bookingsError : artisansError;
  const lastUpdated = tab === 'bookings' ? bookingsUpdated : artisansUpdated;
  const refresh = tab === 'bookings' ? refreshBookings : refreshArtisans;

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const bookingStats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed' || b.status === 'assigned').length,
  }), [bookings]);

  const artisanStats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
  }), [applications]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        b.bookingId.toLowerCase().includes(q) ||
        b.serviceType.includes(q) ||
        b.dateFormatted.includes(q) ||
        b.customerName.includes(q) ||
        b.phone.includes(q) ||
        b.contactEmail.toLowerCase().includes(q) ||
        b.nationalId.includes(q) ||
        b.addressFull.includes(q) ||
        b.userId.toLowerCase().includes(q) ||
        b.docId.toLowerCase().includes(q) ||
        b.timeSlotId.includes(q)
      );
    });
  }, [bookings, statusFilter, dateFilter, search]);

  const filteredArtisans = useMemo(() => {
    return applications.filter(a => {
      if (artisanStatusFilter !== 'all' && a.status !== artisanStatusFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        a.name.includes(q) ||
        a.specialty.includes(q) ||
        a.city.includes(q) ||
        a.phone.includes(q) ||
        a.contactEmail.toLowerCase().includes(q) ||
        a.userId.toLowerCase().includes(q) ||
        a.displayName.includes(q)
      );
    });
  }, [applications, artisanStatusFilter, search]);

  const handleToggle = async (docId: string) => {
    const row = bookings.find(b => b.docId === docId);
    if (!row) return;
    setTogglingId(docId);
    try {
      await toggleStatus(row);
    } catch {
      window.alert('تعذّر تحديث حالة الحجز.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleArtisanAdvance = async (docId: string) => {
    const row = applications.find(a => a.docId === docId);
    if (!row) return;
    setArtisanBusyId(docId);
    try {
      await advanceStatus(row);
    } catch {
      window.alert('تعذّر تحديث حالة الطلب.');
    } finally {
      setArtisanBusyId(null);
    }
  };

  const handleArtisanHold = async (docId: string) => {
    const row = applications.find(a => a.docId === docId);
    if (!row) return;
    setArtisanBusyId(docId);
    try {
      await setStatus(row, 'on_hold');
    } catch {
      window.alert('تعذّر تعليق الطلب.');
    } finally {
      setArtisanBusyId(null);
    }
  };

  const handleArtisanNotes = async (docId: string, notes: string) => {
    const row = applications.find(a => a.docId === docId);
    if (!row) return;
    setArtisanBusyId(docId);
    try {
      await saveNotes(row, notes);
    } catch {
      window.alert('تعذّر حفظ الملاحظات.');
    } finally {
      setArtisanBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title="لوحة الإدارة"
        onSpeak={e => handleSpeak(e, 'لوحة الإدارة')}
        backTo="/home"
        action={
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95 disabled:opacity-50 shrink-0"
            aria-label="تحديث"
          >
            <RefreshCw className={`w-5 h-5 text-accent ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
        footer={
          <>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setTab('bookings'); setSearch(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 ${tab === 'bookings' ? 'bg-accent text-white' : 'bg-white/10 text-white/80'}`}
              >
                <ClipboardList className="w-4 h-4" />
                الحجوزات
              </button>
              <button
                type="button"
                onClick={() => { setTab('artisans'); setSearch(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 ${tab === 'artisans' ? 'bg-accent text-white' : 'bg-white/10 text-white/80'}`}
              >
                <Hammer className="w-4 h-4" />
                طلبات الحرفيين
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
            {tab === 'bookings' ? (
            [
              { label: 'إجمالي الحجوزات', value: bookingStats.total, icon: ClipboardList },
              { label: 'قيد الانتظار', value: bookingStats.pending, icon: Clock },
              { label: 'مؤكدة', value: bookingStats.confirmed, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center"
              >
                <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
                <span className="block text-[10px] text-white/70 font-bold mb-0.5">{label}</span>
                <span className="text-xl font-black text-white">{toEasternArabic(value)}</span>
              </div>
            ))
            ) : (
            [
              { label: 'إجمالي الطلبات', value: artisanStats.total, icon: Users },
              { label: 'قيد المراجعة', value: artisanStats.pending, icon: Clock },
              { label: 'مقبولة', value: artisanStats.approved, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center"
              >
                <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
                <span className="block text-[10px] text-white/70 font-bold mb-0.5">{label}</span>
                <span className="text-xl font-black text-white">{toEasternArabic(value)}</span>
              </div>
            ))
            )}
          </div>
          </>
        }
      />

      <div className="flex-1 p-4 pb-10 space-y-4">
        <section className="glass-card rounded-[24px] p-4 shadow-card">
          <SectionHeading
            title="بحث وتصفية"
            onSpeak={e => handleSpeak(e, 'بحث وتصفية الحجوزات')}
          />

          <div className="relative mb-3">
            <Search className="absolute start-3.5 top-3.5 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'bookings' ? 'ابحث برقم الطلب، الاسم، الجوال، البريد…' : 'ابحث بالاسم، التخصص، المدينة، الجوال…'}
              className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-3 ps-10 pe-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/70 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-text-secondary mb-1.5 flex items-center gap-1">
                <Filter className="w-3 h-3" /> الحالة
              </label>
              {tab === 'bookings' ? (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/70"
              >
                <option value="all">الكل</option>
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="assigned">تم التعيين</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
              ) : (
              <select
                value={artisanStatusFilter}
                onChange={e => setArtisanStatusFilter(e.target.value as ArtisanStatusFilter)}
                className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/70"
              >
                <option value="all">الكل</option>
                <option value="pending">قيد المراجعة</option>
                <option value="on_hold">معلّق</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض</option>
              </select>
              )}
            </div>
            {tab === 'bookings' ? (
            <div>
              <label className="text-[10px] font-bold text-text-secondary mb-1.5 block">التاريخ</label>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/70"
              />
            </div>
            ) : (
            <div className="flex items-end">
              <p className="text-[10px] text-text-secondary font-medium pb-3">
                طلبات «انضم كحرفي» تظهر هنا فور الإرسال
              </p>
            </div>
            )}
          </div>

          {lastUpdated && (
            <p className="text-[10px] text-text-secondary font-medium mt-3 text-end">
              آخر تحديث: {toEasternArabic(lastUpdated.getHours())}:{toEasternArabic(String(lastUpdated.getMinutes()).padStart(2, '0'))}
            </p>
          )}
        </section>

        <section className="glass-card rounded-[24px] p-4 shadow-card">
          <SectionHeading
            title={tab === 'bookings' ? 'سجل الحجوزات' : 'طلبات انضمام الحرفيين'}
            onSpeak={e => handleSpeak(e, tab === 'bookings' ? 'سجل الحجوزات' : 'طلبات انضمام الحرفيين')}
          />

          {error && (
            <p className="text-danger text-sm font-bold mb-4 text-center">{error}</p>
          )}

          {loading && (tab === 'bookings' ? bookings.length === 0 : applications.length === 0) ? (
            <BookingListSkeleton count={4} />
          ) : tab === 'bookings' ? (
            filteredBookings.length === 0 ? (
            <p className="text-center text-sm font-bold text-text-secondary py-10">
              لا توجد حجوزات مطابقة
            </p>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map(row => (
                <AdminBookingCard
                  key={row.docId}
                  row={row}
                  toggling={togglingId === row.docId}
                  onToggle={() => handleToggle(row.docId)}
                />
              ))}
            </div>
          )
          ) : filteredArtisans.length === 0 ? (
            <p className="text-center text-sm font-bold text-text-secondary py-10">
              لا توجد طلبات حرفيين مطابقة
            </p>
          ) : (
            <div className="space-y-3">
              {filteredArtisans.map(row => (
                <AdminArtisanCard
                  key={row.docId}
                  row={row}
                  busy={artisanBusyId === row.docId}
                  onAdvance={() => handleArtisanAdvance(row.docId)}
                  onHold={() => handleArtisanHold(row.docId)}
                  onSaveNotes={notes => handleArtisanNotes(row.docId, notes)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
