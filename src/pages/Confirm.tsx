import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  Volume2,
  Shield,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import { PageHeader } from '../components/ui';
import {
  calculatePricing,
  formatArabicDate,
  formatPrice,
  acquireSubmitLock,
  isBookingAlreadySubmitted,
  loadBookingDraft,
} from '../core/booking';
import { submitBooking } from '../core/bookings';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 text-sm">
      <span className="text-text-secondary font-medium shrink-0">{label}</span>
      <span className="text-text-primary font-bold text-end leading-relaxed">{value}</span>
    </div>
  );
}

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

export default function Confirm() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [draft] = useState(() => loadBookingDraft());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const hours = draft?.serviceHours ?? 2;
  const pricing = calculatePricing(hours);
  const serviceLabel = draft?.serviceType
    ? `${draft.serviceType} (${toEasternArabic(hours)} ساعات)`
    : `تنظيف منزلي شامل (${toEasternArabic(hours)} ساعات)`;

  const fullAddress = [draft?.addressLine, draft?.unitDetails].filter(Boolean).join('، ');

  useEffect(() => {
    if (isBookingAlreadySubmitted()) {
      navigate('/success', { replace: true });
      return;
    }
    if (!draft?.date || !draft?.addressLine) {
      navigate('/booking', { replace: true });
    }
  }, [draft, navigate]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const handleConfirm = async () => {
    if (submitting || isBookingAlreadySubmitted()) return;
    if (!acquireSubmitLock()) {
      setSubmitError('جاري معالجة الحجز… يرجى الانتظار.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await submitBooking();
      navigate('/success', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'تعذّر إتمام الحجز. تحقق من الاتصال وحاول مجدداً.';
      setSubmitError(message);
      setSubmitting(false);
    }
  };

  if (!draft?.date || !draft?.addressLine) return null;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title="تأكيد الطلب"
        subtitle={`الخطوة ${toEasternArabic(3)} من ${toEasternArabic(3)}`}
        onSpeak={e => handleSpeak(e, 'تأكيد الطلب')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-32 space-y-4">

          {/* ── Aggregated Summary ── */}
          <section className="glass-card rounded-[28px] p-5 shadow-card relative overflow-hidden">
            <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-accent/8 blur-2xl pointer-events-none" />

            <SectionHeading
              title="ملخص الحجز"
              onSpeak={e => handleSpeak(e, 'ملخص الحجز')}
            />

            <div className="space-y-1 divide-y divide-border/40">
              <div className="flex items-start gap-3 pb-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-text-secondary font-medium block mb-0.5">نوع الخدمة</span>
                  <span className="text-sm font-bold text-text-primary">{serviceLabel}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-text-secondary font-medium block mb-0.5">التاريخ</span>
                  <span className="text-sm font-bold text-text-primary">{formatArabicDate(draft.date!)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-text-secondary font-medium block mb-0.5">الفترة الزمنية</span>
                  <span className="text-sm font-bold text-text-primary">{draft.timeSlotLabel}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-text-secondary font-medium block mb-0.5">العنوان</span>
                  <span className="text-sm font-bold text-text-primary leading-relaxed">{fullAddress}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Price Breakdown ── */}
          <section className="glass-card rounded-[28px] p-5 shadow-card">
            <SectionHeading
              title="تفاصيل الدفع"
              onSpeak={e => handleSpeak(e, 'تفاصيل الدفع')}
            />

            <SummaryRow label="قيمة الخدمة" value={`${formatPrice(pricing.subtotal)} ر.س`} />
            <SummaryRow label="الضريبة (١٥٪)" value={`${formatPrice(pricing.vat)} ر.س`} />

            <div className="mt-4 pt-4 border-t border-border/60 flex justify-between items-center">
              <span className="text-text-primary font-black text-lg">الإجمالي</span>
              <div className="text-end">
                <span className="text-3xl font-black text-accent">{formatPrice(pricing.total)}</span>
                <span className="text-sm font-bold text-text-primary ms-1">ر.س</span>
              </div>
            </div>
          </section>

          {/* ── Insurance Coverage Badge (accent) ── */}
          <section className="glass-card rounded-[28px] p-5 shadow-card border border-accent/25 bg-accent/5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-text-primary mb-1 flex items-center gap-2">
                  تغطية تأمينية شاملة
                  <button
                    onClick={e => handleSpeak(e, 'تغطية تأمينية شاملة على جميع خدماتنا')}
                    aria-label="استمع"
                    className="btn-speak"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                </h3>
                <p className="text-xs font-medium leading-relaxed text-text-secondary">
                  جميع خدماتنا مغطاة بتأمين مسؤولية مهنية كامل — حماية لمنزلك وممتلكاتك طوال فترة التنفيذ.
                </p>
                <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-black text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  مؤمَّن بالكامل
                </span>
              </div>
            </div>
          </section>

          {/* ── 24-Hour Quality Warranty (success) ── */}
          <section className="glass-card rounded-[28px] p-5 shadow-card border border-success/25 bg-success/5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-text-primary mb-1 flex items-center gap-2">
                  ضمان جودة ٢٤ ساعة
                  <button
                    onClick={e => handleSpeak(e, 'ضمان جودة أربع وعشرين ساعة')}
                    aria-label="استمع"
                    className="btn-speak"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                </h3>
                <p className="text-xs font-medium leading-relaxed text-text-secondary">
                  جودة الخدمة مضمونة بالكامل لمدة ٢٤ ساعة. يحق لك طلب إعادة الخدمة مجاناً في حال عدم الرضا التام.
                </p>
              </div>
            </div>
          </section>

          {/* ── Personal Item Safety Warning (danger) ── */}
          <section className="rounded-[28px] p-5 border border-danger/30 bg-danger/8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-danger/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-danger mb-1.5 flex items-center gap-2">
                  تنبيه أمان المقتنيات الشخصية
                  <button
                    onClick={e => handleSpeak(e, 'تنبيه أمان المقتنيات الشخصية')}
                    aria-label="استمع"
                    className="btn-speak"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-danger/70" />
                  </button>
                </h3>
                <p className="text-xs font-bold leading-relaxed text-danger/85">
                  يرجى حفظ المقتنيات الثمينة والمجوهرات والأوراق المهمة في أماكن آمنة ومغلقة
                  قبل وصول فريق العمل. الشركة غير مسؤولة عن أي فقدان للمقتنيات الشخصية.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 max-w-md w-full p-4 bg-bg-card/85 backdrop-blur-md border-t border-border/60 shadow-[var(--shadow-bottom-bar)] z-20">
        {submitError && (
          <div role="alert" className="flex items-center gap-2 text-danger text-xs font-bold mb-2.5 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}
        <p className="text-[11px] text-text-secondary font-medium text-center mb-2.5">
          بالضغط على التأكيد، أنت توافق على الشروط والأحكام
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="btn-accent w-full text-lg py-4 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري تأكيد الحجز…
            </>
          ) : (
            'تأكيد الدفع والحجز'
          )}
        </button>
      </div>
    </div>
  );
}
