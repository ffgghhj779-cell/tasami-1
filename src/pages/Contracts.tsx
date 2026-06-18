import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Briefcase, Building2, UserCheck, Wind, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak } from '../core/utils';

// FIXED: All Tailwind default colors (amber, purple, sky, rose) replaced with brand palette.
// Each package uses a tint of the brand design tokens only.
const packages = [
  {
    title: 'عقود المحلات التجارية',
    icon: <Briefcase className="w-6 h-6" />,
    desc: 'تجهيز وتنظيف يومي أو أسبوعي للمعارض والمحلات',
    iconBg: 'bg-accent/15',
    iconFg: 'text-accent',
  },
  {
    title: 'عقود الفنادق والضيافة',
    icon: <Building2 className="w-6 h-6" />,
    desc: 'تعقيم كامل للغرف والمرافق العامة بشكل دوري',
    iconBg: 'bg-text-primary/10',
    iconFg: 'text-text-primary',
  },
  {
    title: 'عقد تكييف (٦ أشهر)',
    icon: <Wind className="w-6 h-6" />,
    desc: 'زيارتان للفحص + خصم ٢٥٪ على قطع الغيار',
    iconBg: 'bg-text-secondary/10',
    iconFg: 'text-text-secondary',
  },
  {
    title: 'عقود الشركات',
    icon: <UserCheck className="w-6 h-6" />,
    desc: 'عقود سنوية مخفضة ٤٠٪ لأول ٣ أشهر للشركات',
    iconBg: 'bg-danger/10',
    iconFg: 'text-danger',
  },
];

export default function Contracts() {
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
          عقود الشركات
          <button onClick={(e) => handleSpeak(e, 'عقود الشركات')} aria-label="استمع" className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95">
            <Volume2 className="w-4 h-4 text-accent" />
          </button>
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-12">
        <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6">
          نوفر باقات تعاقد مرنة تناسب جميع القطاعات والمؤسسات بأعلى معايير الجودة والالتزام.
          اختر الباقة المناسبة ليتم التواصل معك فوراً.
        </p>

        <div className="flex flex-col gap-4">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="bg-bg-card border border-border/50 rounded-[24px] p-5 shadow-card hover:shadow-[var(--shadow-card-hover)] interactive-card"
            >
              <div className="flex gap-4 items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${pkg.iconBg} ${pkg.iconFg} transition-transform duration-300`}>
                  {pkg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary mb-1">{pkg.title}</h3>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed">{pkg.desc}</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-bg-primary border border-border/60 text-text-primary font-bold py-3 rounded-xl text-sm transition-all duration-300 hover:bg-accent hover:text-white hover:border-transparent hover:shadow-[var(--shadow-accent)] active:scale-95">
                طلب عرض سعر
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
