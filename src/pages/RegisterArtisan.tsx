import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Volume2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { speak, toEasternArabic } from '../core/utils';
import { requireVerifiedUser } from '../core/auth';
import { db } from '../core/firebase';
import { PageHeader, Toast } from '../components/ui';

const SPECIALTIES = [
  'صيانة تكييف',
  'تنظيف شامل',
  'نظافة واجهات',
  'تعقيم',
] as const;

const CITIES = ['الرياض', 'جدة', 'الدمام'] as const;

interface FormState {
  name: string;
  specialty: string;
  city: string;
  phone: string;
  experienceYears: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  specialty: SPECIALTIES[0],
  city: CITIES[0],
  phone: '',
  experienceYears: '',
};

export default function RegisterArtisan() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      setError('يرجى إدخال الاسم الأول.');
      return;
    }
    if (!form.phone.trim()) {
      setError('يرجى إدخال رقم الجوال.');
      return;
    }
    const years = parseInt(form.experienceYears, 10);
    if (!years || years < 1 || years > 50) {
      setError('يرجى إدخال سنوات خبرة صحيحة (١–٥٠).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const user = requireVerifiedUser();

      await setDoc(doc(db, 'artisans', user.uid), {
        userId: user.uid,
        name: form.name.trim(),
        specialty: form.specialty,
        city: form.city,
        phone: form.phone.trim(),
        experienceYears: years,
        contactEmail: user.email ?? '',
        authPhone: user.phoneNumber ?? '',
        displayName: user.displayName ?? '',
        status: 'pending',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setShowSuccess(true);
      setForm(INITIAL_FORM);
    } catch {
      setError('تعذّر إرسال الطلب. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title="انضم كحرفي"
        onSpeak={e => handleSpeak(e, 'انضم كحرفي')}
      />

      <div className="flex-1 p-5 pb-12">
        <div className="bg-bg-card p-6 rounded-[24px] shadow-card border border-border/50 text-center mb-6">
          <div className="w-24 h-24 bg-bg-primary border-2 border-dashed border-border rounded-full mx-auto mb-4 flex items-center justify-center text-text-secondary relative overflow-hidden hover:border-accent transition-colors duration-300">
            <Camera className="w-8 h-8" />
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" disabled />
          </div>
          <h2 className="font-bold text-text-primary">الصورة الشخصية</h2>
          <p className="text-xs text-text-secondary mt-1">قريباً — رفع الصورة بعد الموافقة</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 text-danger text-xs font-bold bg-danger/8 border border-danger/20 rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">الاسم الأول</label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="الاسم الأول"
              disabled={submitting}
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">التخصص الأساسي</label>
            <select
              value={form.specialty}
              onChange={e => updateField('specialty', e.target.value)}
              disabled={submitting}
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent appearance-none transition-all duration-300 disabled:opacity-60"
            >
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">مدينة العمل</label>
            <select
              value={form.city}
              onChange={e => updateField('city', e.target.value)}
              disabled={submitting}
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent appearance-none transition-all duration-300 disabled:opacity-60"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">رقم الجوال</label>
            <input
              dir="ltr"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder="+966 5X XXX XXXX"
              disabled={submitting}
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent text-end placeholder:text-end transition-all duration-300 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">سنوات الخبرة</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              value={form.experienceYears}
              onChange={e => updateField('experienceYears', e.target.value)}
              placeholder="أدخل عدد السنوات"
              disabled={submitting}
              className="w-full bg-bg-card border border-border/60 rounded-xl py-3.5 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      <div className="p-5 bg-bg-card border-t border-border shadow-[var(--shadow-bottom-bar)]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-accent w-full text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          إرسال طلب التسجيل
        </button>
      </div>

      {showSuccess && (
        <Toast
          message={`تم إرسال طلبك بنجاح! سيتم مراجعته خلال ${toEasternArabic(48)} ساعة.`}
          variant="success"
          onClose={() => {
            setShowSuccess(false);
            navigate('/home');
          }}
        />
      )}
    </div>
  );
}
