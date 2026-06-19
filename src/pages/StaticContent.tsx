import React from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak } from '../core/utils';
import { PageHeader } from '../components/ui';

function getTitle(pathname: string): string {
  switch (pathname) {
    case '/how':     return 'كيف تعمل تسامي؟';
    case '/terms':   return 'الشروط والأحكام';
    case '/privacy': return 'سياسة الخصوصية';
    default:         return 'معلومات';
  }
}

export default function StaticContent() {
  const location  = useLocation();
  const { i18n }  = useTranslation();
  const title     = getTitle(location.pathname);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  // FIXED: @tailwindcss/typography is NOT installed — removed all prose/prose-slate classes.
  // All content is manually styled with brand tokens.
  const renderContent = () => {
    switch (location.pathname) {
      case '/privacy':
        return (
          <div className="text-text-secondary text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-text-primary text-lg font-bold mb-3">أمان بياناتك أولويتنا</h2>
              <p>
                تلتزم تسامي الوطنية بأعلى معايير الخصوصية. نمنع تخزين بيانات الوجه ونقوم بتطبيق
                طمس محلي على أي صور تحتوي على وجوه قبل رفعها لخوادمنا.
              </p>
            </section>
            <section>
              <h2 className="text-text-primary text-lg font-bold mb-3">استخدام البيانات</h2>
              <p>
                تستخدم بيانات الموقع الجغرافي ورقم الهاتف فقط لغرض تقديم الخدمة وربطك مع الفني
                الأقرب إليك.
              </p>
            </section>
          </div>
        );

      case '/how':
        return (
          <div className="text-text-secondary text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-text-primary text-lg font-bold mb-3">آلية العمل</h2>
              <p className="mb-4">الخطوات بسيطة جداً لطلب الخدمة:</p>
              <ul className="space-y-3 ps-5">
                {[
                  'اختر الخدمة التي تناسبك من القائمة الرئيسية',
                  'حدد تفاصيل العنوان والموقع على الخريطة',
                  'اختر الموعد المناسب',
                  'انقر على تأكيد الحجز',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p>
                سيقوم نظامنا الآلي بتعيين أفضل حرفي متاح وتوجيهه إليك في الموعد المحدد.
              </p>
            </section>
          </div>
        );

      case '/terms':
        return (
          <div className="text-text-secondary text-sm leading-relaxed space-y-6">
            <section>
              <h2 className="text-text-primary text-lg font-bold mb-3">شروط استخدام الخدمة</h2>
              <p>
                باستخدامك لتطبيق تسامي الوطنية، فإنك توافق على الالتزام بالشروط والأحكام المذكورة
                في هذه الصفحة. يحق لنا تحديث هذه الشروط في أي وقت مع إشعارك عبر التطبيق.
              </p>
            </section>
            <section>
              <h2 className="text-text-primary text-lg font-bold mb-3">التزامات المستخدم</h2>
              <p>
                يلتزم المستخدم بتقديم معلومات صحيحة، وتوفير الوصول للموقع في الوقت المحدد،
                والتعامل مع الحرفيين باحترام.
              </p>
            </section>
          </div>
        );

      default:
        return <p className="text-sm text-text-secondary">محتوى الصفحة قيد الإعداد.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title={title}
        onSpeak={e => handleSpeak(e, title)}
      />

      <div className="flex-1 p-6 pb-12">
        <div className="bg-bg-card p-6 rounded-[24px] shadow-card border border-border/50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
