import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, CheckCircle, MessageCircle, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak } from '../core/utils';

export default function ArtisanPortfolio() {
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
          الملف الشخصي للحرفي
          <button onClick={(e) => handleSpeak(e, 'الملف الشخصي للحرفي')} aria-label="استمع" className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95">
            <Volume2 className="w-4 h-4 text-accent" />
          </button>
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-12">

        {/* Profile Card — FIXED: bg-slate-200 → bg-border */}
        <div className="bg-bg-card border border-border/50 rounded-[24px] p-6 shadow-card mb-6 text-center relative overflow-hidden">
          <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-accent/8 blur-2xl pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-border mx-auto mb-4 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-accent/30 to-text-secondary/20" />
            <div className="absolute -bottom-1 -end-1 bg-success text-white p-1 rounded-full border-2 border-bg-card">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text-primary flex items-center justify-center gap-2">
            أحمد محمد
            <button onClick={(e) => handleSpeak(e, 'أحمد محمد، خبير صيانة تكييف')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h2>
          <p className="text-text-secondary text-sm mt-1">خبير صيانة تكييف</p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-text-primary font-bold">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>٤.٩</span>
              </div>
              <span className="text-[10px] text-text-secondary mt-0.5">التقييم</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-text-primary font-bold text-sm">١٢٤</span>
              <span className="text-[10px] text-text-secondary mt-0.5">المراجعات</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-text-primary font-bold text-sm">٨</span>
              <span className="text-[10px] text-text-secondary mt-0.5">سنوات خبرة</span>
            </div>
          </div>
        </div>

        {/* Gallery — FIXED: bg-slate-100 → bg-bg-primary; removed developer "(تم حجب الوجوه)" note */}
        <div className="mb-8">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            معرض الأعمال
            <button onClick={(e) => handleSpeak(e, 'معرض الأعمال')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="aspect-square bg-bg-primary rounded-xl border border-border/60 relative overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-text-primary/8 to-accent/8" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            أحدث المراجعات
            <button onClick={(e) => handleSpeak(e, 'أحدث المراجعات')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h3>
          <div className="bg-bg-card border border-border/50 rounded-[20px] p-4 shadow-sm mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-text-primary">م. عبدالله</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                ))}
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">شغل ممتاز ومواعيد دقيقة. أنصح بالتعامل معه بشدة.</p>
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div className="p-5 bg-bg-card border-t border-border shadow-[var(--shadow-bottom-bar)]">
        <button className="w-full bg-[#25D366] text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all duration-300 shadow-md active:scale-95">
          <MessageCircle className="w-6 h-6" />
          تواصل عبر واتساب
        </button>
      </div>
    </div>
  );
}
