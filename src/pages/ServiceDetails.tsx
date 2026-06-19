import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Star, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toEasternArabic, speak } from '../core/utils';
import { PageHeader } from '../components/ui';
import { calculatePricing, formatPrice, saveBookingDraft, clearSubmitState } from '../core/booking';

export default function ServiceDetails() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [hours, setHours] = useState(2);

  const pricing = calculatePricing(hours);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title="تفاصيل الخدمة"
        onSpeak={e => handleSpeak(e, 'تفاصيل الخدمة')}
      />

      <div className="flex-1 p-5 overflow-y-auto">

        {/* Service Info Card */}
        <div className="bg-bg-card rounded-[24px] shadow-card p-6 mb-6 border border-border/50 relative overflow-hidden">
          <div className="absolute -top-4 -end-4 w-20 h-20 rounded-full bg-accent/8 blur-2xl pointer-events-none" />
          <h2 className="text-2xl font-black text-text-primary mb-3 flex items-center gap-2">
            تنظيف منزلي شامل
            <button onClick={(e) => handleSpeak(e, 'تنظيف منزلي شامل')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-5 font-medium">
            نقدم خدمة تنظيف احترافية تشمل جميع الغرف، المطابخ، والحمامات.
            نستخدم مواد تنظيف آمنة ومعقمات عالية الجودة لضمان بيئة صحية لك ولعائلتك.
          </p>
          <div className="flex items-center gap-4 text-sm text-text-primary font-bold bg-bg-primary p-3 rounded-2xl border border-border/60">
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span>٤.٨ تقييم</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2 flex-1 justify-center">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>ضمان الجودة</span>
            </div>
          </div>
        </div>

        {/* Hours Stepper */}
        <div className="mb-6 px-1">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            مدة الخدمة (بالساعات)
            <button onClick={(e) => handleSpeak(e, 'مدة الخدمة')} aria-label="استمع" className="btn-speak ms-auto">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h3>
          <div className="flex items-center justify-between bg-bg-card p-3 rounded-2xl shadow-sm border border-border/60">
            <button
              onClick={() => setHours(h => Math.max(1, h - 1))}
              className="w-12 h-12 rounded-xl bg-bg-primary border border-border flex items-center justify-center text-xl font-bold text-text-primary hover:bg-border transition-all duration-300 active:scale-95 outline-none"
            >−</button>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-text-primary">{toEasternArabic(hours)}</span>
              <span className="text-xs text-text-secondary font-bold">ساعات</span>
            </div>
            <button
              onClick={() => setHours(h => Math.min(12, h + 1))}
              className="w-12 h-12 rounded-xl bg-text-primary text-bg-primary flex items-center justify-center text-xl font-bold hover:bg-text-secondary transition-all duration-300 active:scale-95 shadow-md outline-none"
            >+</button>
          </div>
        </div>

        {/* Price Estimate — VAT-inclusive, matches Confirm checkout */}
        <div className="bg-accent/10 border border-accent/25 rounded-[24px] p-5 mb-8 relative overflow-hidden">
          <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center text-text-primary mb-3">
            <div>
              <span className="block text-sm font-bold mb-1">السعر التقديري</span>
              <span className="text-xs text-text-primary/70 font-medium">شامل ضريبة القيمة المضافة (١٥٪)</span>
            </div>
            <div className="text-end">
              <span className="text-4xl font-black text-accent">{formatPrice(pricing.total)}</span>
              <span className="text-sm font-bold ms-1">ر.س</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-text-secondary font-medium pt-3 border-t border-accent/20">
            <span>قيمة الخدمة: {formatPrice(pricing.subtotal)} ر.س</span>
            <span>الضريبة: {formatPrice(pricing.vat)} ر.س</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 bg-bg-card border-t border-border shadow-[var(--shadow-bottom-bar)]">
        <button
          onClick={() => {
            clearSubmitState();
            saveBookingDraft({
              serviceType: 'تنظيف منزلي شامل',
              serviceHours: hours,
            });
            navigate('/booking');
          }}
          className="btn-accent w-full text-lg py-4"
        >
          متابعة الحجز
        </button>
      </div>
    </div>
  );
}
