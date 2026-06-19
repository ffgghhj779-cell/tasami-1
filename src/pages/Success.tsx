import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Home,
  Volume2,
  Smartphone,
  Share,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import { formatBookingIdDisplay } from '../core/bookings';
import { DownloadInvoiceButton } from '../components/DownloadInvoiceButton';
import { Confetti } from '../components/Confetti';
import { invoiceFromSnapshot } from '../core/invoice';
import { loadLastBooking } from '../core/booking';
import { haptic } from '../core/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function Success() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const booking = loadLastBooking();

  const [copied, setCopied] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPwa, setShowPwa] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/home', { replace: true });
      return;
    }
    haptic('success');
    if (!isStandalone()) setShowPwa(true);
  }, [booking, navigate]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const handleCopy = () => {
    if (!booking) return;
    navigator.clipboard?.writeText(booking.bookingId).then(() => {
      setCopied(true);
      haptic('light');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setShowPwa(false);
    setInstallEvent(null);
  };

  if (!booking) return null;

  const displayId = formatBookingIdDisplay(booking.bookingId);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-y-auto relative">
      <Confetti />

      <div className="flex-1 flex flex-col items-center p-5 pt-14 pb-8 max-w-md mx-auto w-full">

        {/* Success animation */}
        <div className="success-pop mb-6">
          <div className="success-ring w-28 h-28 bg-success/10 rounded-full flex items-center justify-center border-[6px] border-bg-card shadow-[var(--shadow-card-hover)]">
            <CheckCircle2 className="w-14 h-14 text-success" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="success-fade-up text-2xl font-black text-text-primary mb-2 flex items-center justify-center gap-2 text-center">
          تم تأكيد الحجز!
          <button
            onClick={e => handleSpeak(e, 'تم تأكيد الحجز بنجاح')}
            aria-label="استمع"
            className="btn-speak"
          >
            <Volume2 className="w-5 h-5 text-text-secondary" />
          </button>
        </h1>
        <p
          className="success-fade-up text-text-secondary text-sm font-medium mb-6 px-2 leading-relaxed text-center"
          style={{ animationDelay: '0.1s' }}
        >
          سيصلك الحرفي المختص في الموعد المحدد. احتفظ برقم الطلب للمتابعة.
        </p>

        {/* Booking ID */}
        <div
          className="success-fade-up glass-card rounded-[24px] p-5 w-full mb-4 shadow-card"
          style={{ animationDelay: '0.15s' }}
        >
          <h2 className="text-xs font-bold text-text-secondary mb-3 flex items-center gap-2">
            رقم الطلب
            <button
              onClick={e => handleSpeak(e, `رقم الطلب ${displayId}`)}
              aria-label="استمع"
              className="btn-speak ms-auto"
            >
              <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </h2>
          <div className="flex items-center justify-between gap-3">
            <span dir="ltr" className="font-black text-2xl text-accent tracking-wider">
              #{displayId}
            </span>
            <button
              onClick={handleCopy}
              className="p-3 bg-bg-primary rounded-xl text-accent hover:bg-border transition-all duration-300 border border-border/60 active:scale-95 outline-none shrink-0"
              aria-label="نسخ رقم الطلب"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-success font-bold mt-2 text-end">تم النسخ</p>
          )}
        </div>

        {/* Booking summary */}
        <div
          className="success-fade-up glass-card rounded-[24px] p-5 w-full mb-5 shadow-card space-y-3"
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-1">
            ملخص الطلب
            <button
              onClick={e => handleSpeak(e, 'ملخص الطلب')}
              aria-label="استمع"
              className="btn-speak ms-auto"
            >
              <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </h2>

          <div className="flex items-start gap-3 text-sm">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-text-secondary text-xs block">الخدمة</span>
              <span className="font-bold text-text-primary">
                {booking.serviceType} ({toEasternArabic(booking.serviceHours)} ساعات)
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Calendar className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-text-secondary text-xs block">التاريخ</span>
              <span className="font-bold text-text-primary">{booking.dateFormatted}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-text-secondary text-xs block">الوقت</span>
              <span className="font-bold text-text-primary">{booking.timeSlotLabel}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-text-secondary text-xs block">العنوان</span>
              <span className="font-bold text-text-primary leading-relaxed">{booking.address}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-between items-center">
            <span className="text-text-secondary text-sm font-medium">الإجمالي</span>
            <span className="font-black text-lg text-accent">
              {booking.totalFormatted} <span className="text-sm text-text-primary">ر.س</span>
            </span>
          </div>
        </div>

        {/* PWA Install prompt */}
        {showPwa && (
          <div
            className="success-fade-up w-full mb-5 rounded-[24px] p-5 border border-accent/30 bg-accent/5 shadow-card"
            style={{ animationDelay: '0.25s' }}
          >
            <h2 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent shrink-0" />
              أضف التطبيق لشاشتك الرئيسية
              <button
                onClick={e => handleSpeak(e, 'أضف التطبيق لشاشتك الرئيسية للوصول السريع')}
                aria-label="استمع"
                className="btn-speak ms-auto"
              >
                <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </h2>

            {installEvent ? (
              <button
                onClick={handleInstall}
                className="btn-accent w-full py-3.5 text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                تثبيت التطبيق الآن
              </button>
            ) : isIos() ? (
              <ol className="text-xs text-text-secondary font-medium space-y-2.5 ps-1">
                <li className="flex items-start gap-2">
                  <Share className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>اضغط زر <strong className="text-text-primary">مشاركة</strong> في أسفل المتصفح</span>
                </li>
                <li className="flex items-start gap-2">
                  <Plus className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>اختر <strong className="text-text-primary">إضافة إلى الشاشة الرئيسية</strong></span>
                </li>
              </ol>
            ) : (
              <ol className="text-xs text-text-secondary font-medium space-y-2.5 ps-1">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-black flex items-center justify-center shrink-0">١</span>
                  <span>افتح قائمة المتصفح (النقاط الثلاث)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-black flex items-center justify-center shrink-0">٢</span>
                  <span>اختر <strong className="text-text-primary">تثبيت التطبيق</strong> أو <strong className="text-text-primary">إضافة إلى الشاشة الرئيسية</strong></span>
                </li>
              </ol>
            )}
          </div>
        )}

        {/* Download invoice */}
        <div className="success-fade-up w-full mb-3" style={{ animationDelay: '0.28s' }}>
          <DownloadInvoiceButton data={invoiceFromSnapshot(booking)} />
        </div>

        {/* WhatsApp tracking */}
        <button
          className="success-fade-up w-full bg-[#25D366] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 mb-3 shadow-md hover:opacity-90 transition-all duration-300 active:scale-95"
          style={{ animationDelay: '0.3s' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          تتبع عبر واتساب
        </button>

        <button
          onClick={() => navigate('/home')}
          className="success-fade-up w-full bg-bg-card border border-border/60 text-text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-bg-primary transition-all duration-300 active:scale-95 shadow-sm"
          style={{ animationDelay: '0.35s' }}
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
