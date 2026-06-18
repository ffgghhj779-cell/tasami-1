import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Phone, Volume2 } from 'lucide-react';
import { speak } from '../core/utils';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, 'ar');
  };

  return (
    <div className="h-screen w-full flex flex-col p-6 items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 start-0 w-full h-1/3 bg-text-primary/[0.06] pointer-events-none" />
      <div className="absolute -bottom-20 -end-20 w-60 h-60 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-bg-card p-8 rounded-[32px] shadow-[var(--shadow-header)] border border-border/50 text-center relative z-10">

        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <LogIn className="w-8 h-8 text-accent" />
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2">
          تسجيل الدخول / إنشاء حساب
          <button onClick={(e) => handleSpeak(e, 'تسجيل الدخول أو إنشاء حساب')} aria-label="استمع" className="btn-speak">
            <Volume2 className="w-4 h-4 text-text-secondary" />
          </button>
        </h2>
        <p className="text-sm text-text-secondary mb-8">خطوة واحدة للوصول لخدماتنا</p>

        <div className="text-start mb-6">
          <label className="text-sm font-bold text-text-primary mb-2 block">رقم الجوال</label>
          <div className="relative">
            <input
              dir="ltr"
              type="tel"
              placeholder="+966 5X XXX XXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-bg-primary border border-border/60 rounded-xl py-3.5 px-4 ps-11 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 text-end placeholder:text-end"
            />
            <Phone className="absolute start-3.5 top-4 w-4.5 h-4.5 text-text-secondary" />
          </div>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="btn-accent w-full py-3.5 mb-6 text-base"
        >
          متابعة
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary font-medium">أو</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* FIXED: removed border-slate-200 / text-slate-700 / hover:bg-slate-50 → brand palette */}
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-bg-card border border-border/60 text-text-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-bg-primary transition-all duration-300 shadow-sm active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          المتابعة بواسطة Google
        </button>
      </div>
    </div>
  );
}
