import React, { memo, useEffect, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { speak } from '../core/utils';
import { ButtonShimmer } from './ui';

interface ContractQuoteModalProps {
  open: boolean;
  packageTitle: string;
  onClose: () => void;
  onSubmit: (data: { companyName: string; phone: string; requiredService: string }) => Promise<void>;
  speakLang?: string;
}

export const ContractQuoteModal = memo(function ContractQuoteModal({
  open,
  packageTitle,
  onClose,
  onSubmit,
  speakLang = 'ar',
}: ContractQuoteModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [requiredService, setRequiredService] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setCompanyName('');
      setPhone('');
      setRequiredService('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setError('يرجى إدخال اسم الشركة.');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الجوال.');
      return;
    }
    if (requiredService.trim().length < 5) {
      setError('يرجى وصف الخدمة المطلوبة (٥ أحرف على الأقل).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        companyName: companyName.trim(),
        phone: phone.trim(),
        requiredService: requiredService.trim(),
      });
      onClose();
    } catch {
      setError('تعذّر إرسال الطلب. حاول مجدداً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-sheet glass-modal w-full max-w-md rounded-[28px] p-5 border border-border/60">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-black text-text-primary text-lg flex items-center gap-2">
              طلب عرض سعر
              <button
                type="button"
                onClick={e => { e.stopPropagation(); speak('طلب عرض سعر', speakLang); }}
                aria-label="استمع"
                className="btn-speak"
              >
                <Volume2 className="w-4 h-4 text-text-secondary" />
              </button>
            </h2>
            <p className="text-xs text-accent font-bold mt-1">{packageTitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="p-2 rounded-full hover:bg-border tap-scale">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">اسم الشركة</label>
            <input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              disabled={submitting}
              className="w-full bg-bg-primary border border-border/60 rounded-xl py-3 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">رقم الجوال</label>
            <input
              dir="ltr"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+966 5X XXX XXXX"
              disabled={submitting}
              className="w-full bg-bg-primary border border-border/60 rounded-xl py-3 px-4 text-text-primary font-medium text-end focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-primary mb-2 block">الخدمة المطلوبة</label>
            <textarea
              value={requiredService}
              onChange={e => setRequiredService(e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={submitting}
              placeholder="صفّ احتياجاتك: عدد المواقع، التكرار، المدة…"
              className="w-full bg-bg-primary border border-border/60 rounded-xl py-3 px-4 text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-60"
            />
          </div>
        </div>

        {error && <p role="alert" className="text-danger text-xs font-bold mt-3">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`btn-accent w-full mt-4 py-3.5 flex items-center justify-center ${submitting ? 'btn-loading' : ''}`}
        >
          <ButtonShimmer loading={submitting}>إرسال الطلب</ButtonShimmer>
        </button>
      </div>
    </div>
  );
});
