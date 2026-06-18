import React, { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Navigation,
  Home,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import {
  RIYADH_CENTER,
  TIME_SLOTS,
  formatArabicDate,
  formatCoordinates,
  getMinBookingDate,
  loadBookingDraft,
  saveBookingDraft,
} from '../core/booking';
import type { BookingMapHandle } from '../components/booking/BookingMap';

// Leaflet map — lazy-loaded on /booking only
const BookingMap = lazy(() => import('../components/booking/BookingMap'));

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-bg-primary flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-border border-t-accent animate-spin" />
      <span className="text-xs font-bold text-text-secondary">جاري تحميل الخريطة…</span>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  onSpeak,
}: {
  icon: React.ReactNode;
  title: string;
  onSpeak: (e: React.MouseEvent) => void;
}) {
  return (
    <h2 className="font-bold text-base text-text-primary mb-3 flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="flex-1">{title}</span>
      <button onClick={onSpeak} aria-label="استمع" className="btn-speak shrink-0">
        <Volume2 className="w-4 h-4 text-text-secondary" />
      </button>
    </h2>
  );
}

export default function Booking() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const mapRef = useRef<BookingMapHandle>(null);

  const [longitude, setLongitude] = useState(() => loadBookingDraft()?.longitude ?? RIYADH_CENTER.longitude);
  const [latitude, setLatitude] = useState(() => loadBookingDraft()?.latitude ?? RIYADH_CENTER.latitude);
  const [zoom, setZoom] = useState(RIYADH_CENTER.zoom);

  const [addressLine, setAddressLine] = useState(() => loadBookingDraft()?.addressLine ?? '');
  const [unitDetails, setUnitDetails] = useState(() => loadBookingDraft()?.unitDetails ?? '');
  const [date, setDate] = useState(() => loadBookingDraft()?.date ?? '');
  const [time, setTime] = useState<string>(() => loadBookingDraft()?.timeSlotId ?? TIME_SLOTS[0].id);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const handleLocationChange = useCallback((lng: number, lat: number, z: number) => {
    setLongitude(lng);
    setLatitude(lat);
    setZoom(z);
    setError('');
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { longitude: lng, latitude: lat } = pos.coords;
        setLongitude(lng);
        setLatitude(lat);
        setZoom(15);
        mapRef.current?.flyTo(lng, lat, 15);
        setLocating(false);
      },
      () => {
        setError('تعذّر الوصول لموقعك — حرّك الخريطة يدوياً');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleContinue = () => {
    if (!addressLine.trim()) {
      setError('يرجى إدخال اسم الحي أو الشارع');
      return;
    }
    if (!date) {
      setError('يرجى اختيار تاريخ الخدمة');
      return;
    }

    const slot = TIME_SLOTS.find(s => s.id === time);
    saveBookingDraft({
      longitude,
      latitude,
      addressLine: addressLine.trim(),
      unitDetails: unitDetails.trim(),
      date,
      timeSlotId: time,
      timeSlotLabel: slot?.label ?? '',
    });
    navigate('/confirm');
  };

  const selectedSlot = TIME_SLOTS.find(s => s.id === time);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* Header */}
      <div className="bg-text-primary px-4 pt-12 pb-5 rounded-b-[32px] shadow-[var(--shadow-header)] sticky top-0 z-20 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95"
          aria-label="رجوع"
        >
          {i18n.dir() === 'rtl'
            ? <ChevronRight className="w-5 h-5 text-white" />
            : <ChevronLeft className="w-5 h-5 text-white" />}
        </button>
        <div className="flex-1 text-center">
          <p className="text-accent/80 text-[10px] font-bold tracking-widest mb-0.5">
            الخطوة {toEasternArabic(2)} من {toEasternArabic(3)}
          </p>
          <h1 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            الموعد والعنوان
            <button
              onClick={e => handleSpeak(e, 'الموعد والعنوان')}
              aria-label="استمع"
              className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-accent" />
            </button>
          </h1>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-28 space-y-5">

          {/* ── Map Pin-Drop Card ── */}
          <section className="glass-card rounded-[28px] p-4 shadow-card">
            <SectionHeading
              icon={<MapPin className="w-4 h-4 text-accent" />}
              title="موقع الخدمة"
              onSpeak={e => handleSpeak(e, 'موقع الخدمة، حرّك الخريطة لتحديد الموقع')}
            />

            <div className="relative rounded-[20px] overflow-hidden border border-border/60 shadow-sm h-56 mb-3">
              <Suspense fallback={<MapSkeleton />}>
                <BookingMap
                  ref={mapRef}
                  longitude={longitude}
                  latitude={latitude}
                  zoom={zoom}
                  onLocationChange={handleLocationChange}
                />
              </Suspense>

              {/* Geolocate FAB — logical end (right in RTL) */}
              <button
                onClick={handleGeolocate}
                disabled={locating}
                className="absolute bottom-3 end-3 z-20 flex items-center gap-1.5 bg-bg-card/90 backdrop-blur-md border border-border/60 text-text-primary text-[11px] font-bold px-3 py-2 rounded-xl shadow-card hover:bg-bg-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 active:scale-95 disabled:opacity-60"
                aria-label="تحديد موقعي الحالي"
              >
                <Navigation className={`w-3.5 h-3.5 text-accent ${locating ? 'animate-pulse' : ''}`} />
                {locating ? 'جاري التحديد…' : 'موقعي'}
              </button>
            </div>

            {/* Coordinates — Eastern Arabic */}
            <p className="text-[11px] text-text-secondary font-medium text-center mb-4">
              {formatCoordinates(latitude, longitude)}
            </p>

            {/* Address fields — strict logical properties */}
            <div className="space-y-3">
              <div>
                <label htmlFor="address-line" className="text-xs font-bold text-text-primary mb-1.5 block">
                  الحي / الشارع <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    id="address-line"
                    type="text"
                    value={addressLine}
                    onChange={e => { setAddressLine(e.target.value); setError(''); }}
                    placeholder="مثال: حي النرجس، شارع الأمير سلطان"
                    className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-3.5 ps-11 pe-4 text-sm font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/40 transition-all duration-300"
                  />
                  <Home className="absolute start-3.5 top-3.5 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="unit-details" className="text-xs font-bold text-text-primary mb-1.5 block">
                  تفاصيل إضافية <span className="text-text-secondary font-medium">(اختياري)</span>
                </label>
                <input
                  id="unit-details"
                  type="text"
                  value={unitDetails}
                  onChange={e => setUnitDetails(e.target.value)}
                  placeholder="رقم المبنى، الطابق، الشقة"
                  className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-3.5 px-4 text-sm font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/40 transition-all duration-300"
                />
              </div>
            </div>
          </section>

          {/* ── Date & Time Card ── */}
          <section className="glass-card rounded-[28px] p-4 shadow-card">

            {/* Date */}
            <SectionHeading
              icon={<Calendar className="w-4 h-4 text-accent" />}
              title="تاريخ الخدمة"
              onSpeak={e => handleSpeak(e, 'تاريخ الخدمة')}
            />
            <input
              id="booking-date"
              type="date"
              value={date}
              min={getMinBookingDate()}
              onChange={e => { setDate(e.target.value); setError(''); }}
              className="w-full bg-bg-card/80 border border-border/60 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent/70 text-text-primary font-bold transition-all duration-300 mb-1"
            />
            {date && (
              <p className="text-xs text-accent font-bold mb-5 mt-1.5 text-end">
                {formatArabicDate(date)}
              </p>
            )}
            {!date && <div className="mb-5" />}

            {/* Time slots */}
            <SectionHeading
              icon={<Clock className="w-4 h-4 text-accent" />}
              title="وقت الخدمة"
              onSpeak={e => handleSpeak(e, 'وقت الخدمة')}
            />
            <div className="grid grid-cols-2 gap-2.5">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setTime(slot.id)}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-95 ${
                    time === slot.id
                      ? 'bg-accent border-accent text-white shadow-[var(--shadow-accent)] -translate-y-0.5'
                      : 'bg-bg-card/80 border-border/60 text-text-secondary hover:bg-bg-primary hover:border-accent/40'
                  }`}
                  aria-pressed={time === slot.id}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </section>

          {/* Validation error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-danger/8 border border-danger/25 rounded-2xl p-4 text-danger"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 max-w-md w-full p-4 bg-bg-card/85 backdrop-blur-md border-t border-border/60 shadow-[var(--shadow-bottom-bar)] z-20">
        {selectedSlot && date && addressLine.trim() && (
          <p className="text-[11px] text-text-secondary font-medium text-center mb-2.5">
            {formatArabicDate(date)} · {selectedSlot.label}
          </p>
        )}
        <button
          type="button"
          onClick={handleContinue}
          className="btn-accent w-full text-lg py-4 hover:-translate-y-0.5"
        >
          التالي — مراجعة الطلب
        </button>
      </div>
    </div>
  );
}
