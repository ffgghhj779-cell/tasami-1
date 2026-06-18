import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Volume2,
  RefreshCw,
  Search,
  Filter,
  ClipboardList,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowLeftRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import { STATUS_LABELS, type BookingStatus } from '../core/admin';
import { useAdminBookings } from '../hooks/useAdminBookings';

type StatusFilter = 'all' | BookingStatus;

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

export default function AdminConsole() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { bookings, loading, error, lastUpdated, refresh, toggleStatus } = useAdminBookings();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed' || b.status === 'assigned').length,
  }), [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        b.bookingId.toLowerCase().includes(q) ||
        b.serviceType.includes(q) ||
        b.dateFormatted.includes(q)
      );
    });
  }, [bookings, statusFilter, dateFilter, search]);

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

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-arabic">

      {/* Header */}
      <div className="bg-text-primary px-4 pt-12 pb-5 rounded-b-[32px] shadow-[var(--shadow-header)] sticky top-0 z-20">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95"
            aria-label="رجوع"
          >
            {i18n.dir() === 'rtl'
              ? <ChevronRight className="w-5 h-5 text-white" />
              : <ChevronLeft className="w-5 h-5 text-white" />}
          </button>
          <h1 className="text-lg font-bold text-white flex-1 text-center flex items-center justify-center gap-2">
            لوحة الإدارة
            <button
              onClick={e => handleSpeak(e, 'لوحة الإدارة')}
              aria-label="استمع"
              className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-accent" />
            </button>
          </h1>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
            aria-label="تحديث"
          >
            <RefreshCw className={`w-5 h-5 text-accent ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'إجمالي الحجوزات', value: stats.total, icon: ClipboardList },
            { label: 'قيد الانتظار', value: stats.pending, icon: Clock },
            { label: 'مؤكدة', value: stats.confirmed, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center"
            >
              <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
              <span className="block text-[10px] text-white/70 font-bold mb-0.5">{label}</span>
              <span className="text-xl font-black text-white">{toEasternArabic(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-4">

        {/* Search & Filter */}
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
              placeholder="ابحث برقم الطلب أو الخدمة…"
              className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-3 ps-10 pe-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/70 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-text-secondary mb-1.5 flex items-center gap-1">
                <Filter className="w-3 h-3" /> الحالة
              </label>
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
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-secondary mb-1.5 block">التاريخ</label>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/70"
              />
            </div>
          </div>

          {lastUpdated && (
            <p className="text-[10px] text-text-secondary font-medium mt-3 text-end">
              آخر تحديث: {toEasternArabic(lastUpdated.getHours())}:{toEasternArabic(String(lastUpdated.getMinutes()).padStart(2, '0'))}
            </p>
          )}
        </section>

        {/* Bookings table */}
        <section className="glass-card rounded-[24px] p-4 shadow-card">
          <SectionHeading
            title="سجل الحجوزات"
            onSpeak={e => handleSpeak(e, 'سجل الحجوزات')}
          />

          {error && (
            <p className="text-danger text-sm font-bold mb-4 text-center">{error}</p>
          )}

          {loading && bookings.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <span className="text-sm font-bold text-text-secondary">جاري تحميل الحجوزات…</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm font-bold text-text-secondary py-10">
              لا توجد حجوزات مطابقة
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map(row => (
                <div
                  key={row.docId}
                  className="bg-bg-card/80 border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
                >
                  {/* Row header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span dir="ltr" className="text-xs font-black text-accent tracking-wider">
                        #{row.bookingIdDisplay}
                      </span>
                      <p className="text-sm font-bold text-text-primary mt-0.5">{row.serviceType}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-text-secondary font-medium block">التاريخ</span>
                      <span className="font-bold text-text-primary">{row.dateFormatted}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary font-medium block">الوقت</span>
                      <span className="font-bold text-text-primary">{row.timeSlotLabel}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary font-medium block">الإجمالي</span>
                      <span className="font-black text-accent">{row.totalFormatted} ر.س</span>
                    </div>
                    <div>
                      <span className="text-text-secondary font-medium block">الحالة</span>
                      <span className="font-bold text-text-primary">{STATUS_LABELS[row.status]}</span>
                    </div>
                  </div>

                  {/* Toggle action */}
                  {(row.status === 'confirmed' || row.status === 'assigned' || row.status === 'completed') && (
                    <button
                      onClick={() => handleToggle(row.docId)}
                      disabled={togglingId === row.docId}
                      className="w-full py-2.5 rounded-xl border border-border/60 text-xs font-bold text-text-primary flex items-center justify-center gap-2 hover:bg-accent hover:text-white hover:border-transparent transition-all duration-300 active:scale-95 disabled:opacity-60"
                    >
                      {togglingId === row.docId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      )}
                      {row.status === 'completed' ? 'إعادة إلى مؤكد' : 'تحديد كمكتمل'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
