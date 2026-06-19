import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle,
  LogIn,
  LogOut,
  Calendar,
  Clock,
  Sparkles,
  Volume2,
  Package,
  Star,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import { useUserBookings } from '../hooks/useUserBookings';
import type { UserBookingRow } from '../hooks/useUserBookings';
import {
  PageHeader,
  BookingListSkeleton,
  Toast,
} from '../components/ui';
import { ReviewModal } from '../components/ReviewModal';
import { DownloadInvoiceButton } from '../components/DownloadInvoiceButton';
import { invoiceFromBookingRow } from '../core/invoice';
import { submitReview, fetchReviewedBookingIds } from '../core/reviews';
import { signOutUser } from '../core/auth';
import { useAuth } from '../contexts/AuthContext';
import type { BookingStatus } from '../core/admin';

function StatusPill({ status, label }: { status: BookingStatus; label: string }) {
  const styles: Record<BookingStatus, string> = {
    pending:   'bg-accent/15 text-accent border-accent/30',
    confirmed: 'bg-success/10 text-success border-success/25',
    assigned:  'bg-text-primary/10 text-text-primary border-text-primary/20',
    completed: 'bg-border text-text-secondary border-border',
    cancelled: 'bg-danger/10 text-danger border-danger/25',
  };

  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {label}
    </span>
  );
}

const BookingCard = memo(function BookingCard({
  booking,
  statusLabel,
  showReview,
  reviewed,
  onReview,
}: {
  booking: UserBookingRow;
  statusLabel: string;
  showReview: boolean;
  reviewed: boolean;
  onReview: () => void;
}) {
  return (
    <div className="glass-card rounded-[24px] p-4 shadow-card border border-border/40 gpu-layer">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span dir="ltr" className="text-xs font-black text-accent tracking-wider">
            #{booking.bookingIdDisplay}
          </span>
          <p className="text-sm font-bold text-text-primary mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
            {booking.serviceType}
          </p>
        </div>
        <StatusPill status={booking.status} label={statusLabel} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          <span className="font-bold text-text-primary">{booking.dateFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          <span className="font-bold text-text-primary">{booking.timeSlotLabel}</span>
        </div>
        <div className="col-span-2 pt-1 border-t border-border/40 mt-1">
          <span className="text-text-secondary font-medium">الإجمالي: </span>
          <span className="font-black text-accent">{booking.totalFormatted} ر.س</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <DownloadInvoiceButton data={invoiceFromBookingRow(booking)} compact={false} />
        {showReview && !reviewed && (
          <button
            type="button"
            onClick={onReview}
            className="w-full py-2.5 rounded-xl border border-accent/40 text-accent text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-accent/10 tap-scale"
          >
            <Star className="w-3.5 h-3.5" />
            قيّم الخدمة
          </button>
        )}
        {showReview && reviewed && (
          <p className="text-[10px] text-success font-bold text-center">تم إرسال تقييمك ✓</p>
        )}
      </div>
    </div>
  );
});

function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-[24px] p-8 text-center border border-border/40">
      <Package className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
      <p className="text-sm font-bold text-text-secondary">{message}</p>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { verified, user: authUser } = useAuth();
  const { user, upcoming, past, loading, error, statusLabels } = useUserBookings();
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<UserBookingRow | null>(null);
  const [reviewToast, setReviewToast] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      setReviewedIds(new Set());
      return;
    }
    fetchReviewedBookingIds(user.uid)
      .then(setReviewedIds)
      .catch(() => setReviewedIds(new Set()));
  }, [user]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const displayName = user?.displayName
    || (user?.phoneNumber ? user.phoneNumber : null)
    || (user?.isAnonymous ? 'ضيف' : 'مستخدم');

  const handleReviewSubmit = useCallback(async (rating: number, comment: string) => {
    if (!reviewTarget || !user) return;
    await submitReview({
      bookingDocId: reviewTarget.docId,
      bookingId: reviewTarget.bookingId,
      artisanId: reviewTarget.assignedArtisanId,
      rating,
      comment,
      userName: displayName,
    });
    setReviewedIds(prev => new Set(prev).add(reviewTarget.docId));
    setReviewToast(true);
  }, [reviewTarget, user, displayName]);

  const handleCloseReview = useCallback(() => setReviewTarget(null), []);
  const handleCloseToast = useCallback(() => setReviewToast(false), []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOutUser();
      navigate('/login', { replace: true });
    } catch {
      setLoggingOut(false);
    }
  };

  const completed = past.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col pb-8">
      <PageHeader
        title="حسابي"
        onSpeak={e => handleSpeak(e, 'حسابي')}
        backTo="/home"
      />

      <div className="flex-1 p-4 space-y-5">
        <section className="glass-card rounded-[28px] p-5 shadow-card relative overflow-hidden">
          <div className="absolute -top-8 -end-8 w-28 h-28 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center border-2 border-accent/25 shrink-0">
              <UserCircle className="w-9 h-9 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-text-primary text-lg truncate">{displayName}</h2>
              {user ? (
                <p dir="ltr" className="text-[11px] text-text-secondary font-medium truncate mt-0.5">
                  {user.uid.slice(0, 12)}…
                </p>
              ) : (
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  سجّل الدخول لعرض حجوزاتك
                </p>
              )}
            </div>
          </div>
          {!user && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-accent w-full mt-4 py-3 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
          )}
          {(verified || authUser) && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full mt-4 py-3 flex items-center justify-center gap-2 rounded-xl border border-danger/30 text-danger text-sm font-bold hover:bg-danger/8 tap-scale disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'جاري تسجيل الخروج…' : 'تسجيل الخروج'}
            </button>
          )}
        </section>

        {error && (
          <p role="alert" className="text-danger text-sm font-bold text-center">{error}</p>
        )}

        <section>
          <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
            الحجوزات الحالية
            <button onClick={e => handleSpeak(e, 'الحجوزات الحالية')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
            {!loading && user && (
              <span className="text-xs text-text-secondary font-bold ms-auto">
                {toEasternArabic(upcoming.length)}
              </span>
            )}
          </h3>
          {loading ? (
            <BookingListSkeleton count={2} />
          ) : !user ? (
            <EmptyState message="سجّل الدخول لعرض حجوزاتك الحالية" />
          ) : upcoming.length === 0 ? (
            <EmptyState message="لا توجد حجوزات حالية" />
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.docId}>
                  <BookingCard
                    booking={b}
                    statusLabel={statusLabels[b.status]}
                    showReview={false}
                    reviewed={false}
                    onReview={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
            سجل الحجوزات
            <button onClick={e => handleSpeak(e, 'سجل الحجوزات')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
            {!loading && user && (
              <span className="text-xs text-text-secondary font-bold ms-auto">
                {toEasternArabic(past.length)}
              </span>
            )}
          </h3>
          {loading ? (
            <BookingListSkeleton count={2} />
          ) : !user ? (
            <EmptyState message="سجّل الدخول لعرض سجل حجوزاتك" />
          ) : past.length === 0 ? (
            <EmptyState message="لا توجد حجوزات سابقة" />
          ) : (
            <div className="space-y-3">
              {past.map(b => (
                <div key={b.docId}>
                  <BookingCard
                    booking={b}
                    statusLabel={statusLabels[b.status]}
                    showReview={b.status === 'completed'}
                    reviewed={reviewedIds.has(b.docId)}
                    onReview={() => setReviewTarget(b)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {completed.length > 0 && (
          <p className="text-[10px] text-text-secondary font-medium text-center px-2">
            يمكنك تقييم الحجوزات المكتملة ({toEasternArabic(completed.length)}) لمساعدة المجتمع.
          </p>
        )}
      </div>

      <ReviewModal
        open={!!reviewTarget}
        bookingLabel={reviewTarget ? `#${reviewTarget.bookingIdDisplay} — ${reviewTarget.serviceType}` : ''}
        onClose={handleCloseReview}
        onSubmit={handleReviewSubmit}
        speakLang={i18n.language}
      />

      {reviewToast && (
        <Toast
          message="شكراً! تم إرسال تقييمك بنجاح."
          variant="success"
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}
