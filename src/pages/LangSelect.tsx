import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';
import { speak } from '../core/utils';

const LANGUAGES = [
  { code: 'ar', flag: '🇸🇦', label: 'العربية',  dir: 'rtl' },
  { code: 'en', flag: '🇬🇧', label: 'English',   dir: 'ltr' },
  { code: 'ur', flag: '🇵🇰', label: 'اردو',      dir: 'rtl' },
  { code: 'tl', flag: '🇵🇭', label: 'Tagalog',   dir: 'ltr' },
];

export default function LangSelect() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleSelect = (lang: string) => {
    i18n.changeLanguage(lang);
    navigate('/home');
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">

      {/* Decorative top-arc */}
      <div className="absolute top-0 start-0 w-full h-[45%] bg-text-primary rounded-b-[80px] opacity-[0.07] pointer-events-none" />
      <div className="absolute top-0 start-0 w-full h-[40%] bg-gradient-to-b from-text-primary/12 to-transparent pointer-events-none" />

      {/* Logo + Tagline */}
      <div className="relative z-10 text-center mb-10 px-6">
        <div className="w-20 h-20 rounded-[28px] bg-accent/15 border border-accent/30 mx-auto mb-5 flex items-center justify-center shadow-[0_8px_32px_rgba(196,169,125,0.20)]">
          <span className="text-4xl select-none">✦</span>
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">تسامي الوطنية</h1>
        <p className="text-text-secondary text-sm font-medium">اختر لغتك المفضلة للمتابعة</p>
        <button
          onClick={() => speak('تسامي الوطنية، اختر لغتك المفضلة', 'ar')}
          aria-label="استمع"
          className="btn-speak mt-3 inline-flex items-center justify-center"
        >
          <Volume2 className="w-4 h-4 text-accent" />
        </button>
      </div>

      {/* Language Cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs px-4 relative z-10">
        {LANGUAGES.map(({ code, flag, label, dir }) => (
          <button
            key={code}
            onClick={() => handleSelect(code)}
            dir={dir}
            className="group aspect-square glass-card rounded-3xl flex flex-col items-center justify-center gap-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(62,74,46,0.10)] hover:border-accent/50 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="text-5xl transition-transform duration-300 group-hover:scale-110 select-none">{flag}</span>
            <span className="font-bold text-text-primary text-sm tracking-wide">{label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
