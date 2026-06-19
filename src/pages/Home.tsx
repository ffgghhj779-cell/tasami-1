import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Star, ChevronLeft, Volume2, UserCircle, Shield, Menu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { speak } from '../core/utils';
import { useServices } from '../hooks/useServices';
import { useFilteredServices } from '../hooks/useFilteredServices';
import { ServiceIcon, ServiceGridSkeleton } from '../components/ui';
import type { ServiceItem } from '../hooks/useServices';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { services, loading } = useServices();
  const filteredServices = useFilteredServices(services, searchQuery);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const handleServiceClick = (service: ServiceItem) => {
    if (service.route === 'contracts') {
      navigate('/contracts');
    } else {
      navigate(`/service/${service.slug}`);
    }
  };

  const steps = [
    { num: '١', title: t('howSteps.step1Title'), desc: t('howSteps.step1Desc') },
    { num: '٢', title: t('howSteps.step2Title'), desc: t('howSteps.step2Desc') },
    { num: '٣', title: t('howSteps.step3Title'), desc: t('howSteps.step3Desc') },
    { num: '٤', title: t('howSteps.step4Title'), desc: t('howSteps.step4Desc') },
  ];

  const artisans = [
    { id: '1', name: 'أحمد محمد',  specialty: 'خبير صيانة تكييف',  rating: '٤.٩', reviews: '١٢٤' },
    { id: '2', name: 'محمود علي',  specialty: 'فني تنظيف شامل',    rating: '٤.٨', reviews: '٨٩'  },
    { id: '3', name: 'سيد رجب',    specialty: 'صيانة وتأسيس',      rating: '٥.٠', reviews: '٤٢'  },
  ];

  return (
    <div className="pb-24 w-full min-h-screen relative">

      {/* ── Hero / Header ── */}
      <div className="bg-text-primary px-5 pt-12 pb-8 rounded-b-[36px] shadow-[var(--shadow-header)] mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-accent/[0.06] pointer-events-none" />
        <div className="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-black text-bg-primary flex items-center gap-2 tracking-tight">
              {t('app.name')}
              <button
                onClick={(e) => handleSpeak(e, t('app.name'))}
                aria-label={t('common.listen')}
                className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-accent" />
              </button>
            </h1>
            <p className="text-white/70 text-sm mt-1.5 font-medium tracking-wide">{t('app.tagline')}</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 bg-white/[0.08] backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 transition-all duration-300 hover:bg-white/[0.16] hover:scale-105 active:scale-95 shadow-sm"
            aria-label={t('nav.profile')}
          >
            <UserCircle className="w-6 h-6 text-accent" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative z-10 group">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            className="w-full bg-white/[0.10] border border-white/20 rounded-2xl py-3.5 ps-12 pe-5 text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:bg-white/[0.16] backdrop-blur-md shadow-sm transition-opacity duration-150 ease-out font-medium"
          />
          <Search className="absolute start-4 top-4 w-4.5 h-4.5 text-white/55 group-focus-within:text-accent transition-colors duration-300" />
        </div>
      </div>

      {/* ── Service Categories (dynamic from Firestore) ── */}
      <div className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5">
            {t('home.categories')}
            <button onClick={(e) => handleSpeak(e, t('home.categories'))} aria-label={t('common.listen')} className="btn-speak">
              <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </h2>
        </div>

        {loading ? (
          <ServiceGridSkeleton />
        ) : filteredServices.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-6 px-4 bg-bg-card rounded-2xl border border-border/50">
            {t('home.noSearchResults')}
          </p>
        ) : (
          <div className="flex overflow-x-auto gap-3.5 pb-2 snap-x hide-scrollbar">
            {filteredServices.map((s) => (
              <button
                key={s.id}
                onClick={() => handleServiceClick(s)}
                className="group min-w-[118px] bg-bg-card rounded-[20px] p-4 shadow-card hover:shadow-[var(--shadow-card-hover)] border border-border/50 hover:border-accent/40 flex flex-col items-center justify-center gap-3.5 snap-center interactive-card outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className={`w-[52px] h-[52px] rounded-full ${s.iconBg} ${s.iconFg} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <ServiceIcon type={s.icon} />
                </div>
                <span className="text-[12.5px] font-bold text-center text-text-primary leading-snug tracking-wide">{t(s.titleKey)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── How It Works (exactly 4 steps) ── */}
      <div className="px-4 mb-8">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5 mb-4">
          {t('home.howItWorks')}
          <button onClick={(e) => handleSpeak(e, t('home.howItWorks'))} aria-label={t('common.listen')} className="btn-speak">
            <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
          </button>
        </h2>

        <div className="bg-bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-accent/8 blur-2xl pointer-events-none" />
          <div className="absolute top-[52px] start-[38px] bottom-12 w-px bg-border/70 z-0" />
          <div className="flex flex-col gap-7 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-5 group">
                <div className="w-9 h-9 rounded-full bg-accent text-bg-primary font-black text-sm flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(196,169,125,0.35)] border-2 border-accent/20 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <div className="pt-1.5 flex-1">
                  <h3 className="font-bold text-text-primary text-sm tracking-wide">{step.title}</h3>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Rated Artisans (slider) ── */}
      <div className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5">
            {t('home.topArtisans')}
            <button onClick={(e) => handleSpeak(e, t('home.topArtisans'))} aria-label={t('common.listen')} className="btn-speak">
              <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </h2>
          <button className="text-sm text-accent font-bold flex items-center gap-1 hover:underline transition-all duration-200">
            {t('home.viewAll')}
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
          {artisans.map(artisan => (
            <div
              key={artisan.id}
              className="group min-w-[256px] max-w-[256px] bg-bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/30 snap-center shrink-0 interactive-card shadow-card hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-full bg-border overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <div className="w-full h-full bg-gradient-to-tr from-accent/30 to-text-secondary/20 group-hover:from-accent/40 transition-all duration-300" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-bold text-text-primary text-sm truncate tracking-wide">{artisan.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">{artisan.specialty}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    <span className="text-xs font-black text-text-primary">{artisan.rating}</span>
                    <span className="text-[10px] text-text-secondary">({artisan.reviews} {t('home.reviews')})</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/artisan/${artisan.id}`)}
                className="mt-4 w-full py-2.5 bg-bg-primary text-text-primary text-xs font-bold rounded-xl border border-border/60 hover:bg-accent hover:text-white hover:border-transparent hover:shadow-md active:scale-95 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('home.viewProfile')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div className="fixed bottom-0 max-w-md w-full bg-bg-card/80 backdrop-blur-md border-t border-border/60 flex justify-around py-3 px-2 shadow-[var(--shadow-bottom-bar)] z-50 gpu-layer">
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center gap-1 p-2 text-text-secondary hover:text-accent tap-opacity transition-opacity duration-150"
        >
          <UserCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('nav.profile')}</span>
        </button>
        <button
          onClick={() => navigate('/admin')}
          className="flex flex-col items-center gap-1 p-2 text-text-secondary hover:text-accent tap-opacity transition-opacity duration-150"
        >
          <Shield className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('nav.admin')}</span>
        </button>
        <button
          onClick={() => navigate('/register-artisan')}
          className="flex flex-col items-center gap-1 p-2 text-text-secondary hover:text-accent tap-opacity transition-opacity duration-150"
        >
          <UserCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('nav.becomeArtisan')}</span>
        </button>
        <button
          onClick={() => navigate('/how')}
          className="flex flex-col items-center gap-1 p-2 text-text-secondary hover:text-accent tap-opacity transition-opacity duration-150"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('nav.more')}</span>
        </button>
      </div>
    </div>
  );
}
