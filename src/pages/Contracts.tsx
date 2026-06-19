import React, { useState } from 'react';
import { Briefcase, Building2, UserCheck, Wind, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak } from '../core/utils';
import { PageHeader, Toast } from '../components/ui';
import { ContractQuoteModal } from '../components/ContractQuoteModal';
import { submitContractQuote } from '../core/contracts';

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
  const { i18n } = useTranslation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const handleSubmit = async (data: {
    companyName: string;
    phone: string;
    requiredService: string;
  }) => {
    if (!selectedPackage) return;
    await submitContractQuote({
      packageType: selectedPackage,
      ...data,
    });
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title="عقود الشركات"
        onSpeak={e => handleSpeak(e, 'عقود الشركات')}
      />

      <div className="flex-1 p-5 overflow-y-auto pb-12">
        <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6">
          نوفر باقات تعاقد مرنة تناسب جميع القطاعات والمؤسسات بأعلى معايير الجودة والالتزام.
          اختر الباقة المناسبة ليتم التواصل معك فوراً.
        </p>

        <div className="flex flex-col gap-4">
          {packages.map(pkg => (
            <div
              key={pkg.title}
              className="bg-bg-card border border-border/50 rounded-[24px] p-5 shadow-card hover:shadow-[var(--shadow-card-hover)] interactive-card"
            >
              <div className="flex gap-4 items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${pkg.iconBg} ${pkg.iconFg}`}>
                  {pkg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary mb-1 flex items-center gap-2">
                    {pkg.title}
                    <button
                      onClick={e => handleSpeak(e, pkg.title)}
                      aria-label="استمع"
                      className="btn-speak"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                  </h3>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed">{pkg.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackage(pkg.title)}
                className="w-full mt-4 bg-bg-primary border border-border/60 text-text-primary font-bold py-3 rounded-xl text-sm transition-all duration-300 hover:bg-accent hover:text-white hover:border-transparent hover:shadow-[var(--shadow-accent)] active:scale-95"
              >
                طلب عرض سعر
              </button>
            </div>
          ))}
        </div>
      </div>

      <ContractQuoteModal
        open={!!selectedPackage}
        packageTitle={selectedPackage ?? ''}
        onClose={() => setSelectedPackage(null)}
        onSubmit={handleSubmit}
        speakLang={i18n.language}
      />

      {showSuccess && (
        <Toast
          message="تم إرسال طلب عرض السعر! سيتواصل معك فريقنا قريباً."
          variant="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
