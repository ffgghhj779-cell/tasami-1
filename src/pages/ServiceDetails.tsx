import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, ShieldCheck, Star, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toEasternArabic, speak } from '../core/utils';
import { saveBookingDraft } from '../core/booking';

const BASE_PRICE = 45;

export default function ServiceDetails() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [hours, setHours] = useState(2);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const totalPrice = hours * BASE_PRICE;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* Header */}
      <div className="bg-text-primary px-4 pt-12 pb-6 rounded-b-[32px] shadow-[var(--shadow-header)] sticky top-0 z-10 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95"
        >
          {i18n.dir() === 'rtl' ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
        </button>
        <h1 className="text-xl font-bold flex-1 text-center truncate text-white flex items-center justify-center gap-2">
          تفاصيل الخدمة
          <button onClick={(e) => handleSpeak(e, 'تفاصيل الخدمة')} aria-label="استمع" className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95">
            <Volume2 className="w-4 h-4 text-accent" />
          </button>
        </h1>
        <div className="w-9" />
      </div>

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
              {/* FIXED: was text-emerald-600 — now uses brand success color */}
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
              {/* FIXED: Western numeral → Eastern Arabic */}
              <span className="text-3xl font-black text-text-primary">{toEasternArabic(hours)}</span>
              <span className="text-xs text-text-secondary font-bold">ساعات</span>
            </div>
            <button
              onClick={() => setHours(h => Math.min(12, h + 1))}
              className="w-12 h-12 rounded-xl bg-text-primary text-bg-primary flex items-center justify-center text-xl font-bold hover:bg-text-secondary transition-all duration-300 active:scale-95 shadow-md outline-none"
            >+</button>
          </div>
        </div>

        {/* Price Estimate */}
        <div className="bg-accent/10 border border-accent/25 rounded-[24px] p-5 mb-8 relative overflow-hidden">
          <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center text-text-primary">
            <div>
              <span className="block text-sm font-bold mb-1">السعر التقديري</span>
              <span className="text-xs text-text-primary/70 font-medium">شامل ضريبة القيمة المضافة</span>
            </div>
            <div className="text-end">
              {/* FIXED: Western numeral → Eastern Arabic */}
              <span className="text-4xl font-black text-accent">{toEasternArabic(totalPrice)}</span>
              <span className="text-sm font-bold ms-1">ر.س</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 bg-bg-card border-t border-border shadow-[var(--shadow-bottom-bar)]">
        <button
          onClick={() => {
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
