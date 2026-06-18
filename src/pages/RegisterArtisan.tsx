import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Camera, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak } from '../core/utils';

export default function RegisterArtisan() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* Header */}
      <div className="bg-text-primary px-4 pt-12 pb-6 rounded-b-[32px] shadow-[var(--shadow-header)] sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95">
          {i18n.dir() === 'rtl' ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
        </button>
        <h1 className="text-xl font-bold flex-1 text-center truncate text-white flex items-center justify-center gap-2">
          انضم كحرفي
          <button onClick={(e) => handleSpeak(e, 'انضم كحرفي')} aria-label="استمع" className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95">
            <Volume2 className="w-4 h-4 text-accent" />
          </button>
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-12">

        {/* Profile Photo Upload */}
        <div className="bg-bg-card p-6 rounded-[24px] shadow-card border border-border/50 text-center mb-6">
          <div className="w-24 h-24 bg-bg-primary border-2 border-dashed border-border rounded-full mx-auto mb-4 flex items-center justify-center text-text-secondary relative overflow-hidden hover:border-accent transition-colors duration-300">
            <Camera className="w-8 h-8" />
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <h2 className="font-bold text-text-primary">الصورة الشخصية</h2>
          <p className="text-xs text-text-secondary mt-1">يجب أن تكون واضحة ورسمية</p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Name */}
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">الاسم الأول</label>
            <input
              type="text"
              placeholder="الاسم الأول"
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">التخصص الأساسي</label>
            <select className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent appearance-none transition-all duration-300">
              <option>صيانة تكييف</option>
              <option>تنظيف شامل</option>
              <option>نظافة واجهات</option>
              <option>تعقيم</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">مدينة العمل</label>
            <select className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent appearance-none transition-all duration-300">
              <option>الرياض</option>
              <option>جدة</option>
              <option>الدمام</option>
            </select>
          </div>

          {/* Phone — FIXED: removed physical text-right/rtl:text-left/rtl:placeholder:text-left → use dir + text-end (logical) */}
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">رقم الجوال</label>
            <input
              dir="ltr"
              type="tel"
              placeholder="+966 5X XXX XXXX"
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent text-end placeholder:text-end transition-all duration-300"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">سنوات الخبرة</label>
            <input
              type="number"
              placeholder="أدخل عدد السنوات"
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 bg-bg-card border-t border-border shadow-[var(--shadow-bottom-bar)]">
        <button className="btn-accent w-full text-lg py-4">
          إرسال طلب التسجيل
        </button>
      </div>
    </div>
  );
}
