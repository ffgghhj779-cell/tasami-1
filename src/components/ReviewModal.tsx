import React, { useEffect, useState } from 'react';
import { Star, Volume2, X, Loader2 } from 'lucide-react';
import { speak, toEasternArabic } from '../core/utils';

interface ReviewModalProps {
  open: boolean;
  bookingLabel: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  speakLang?: string;
}

export function ReviewModal({
  open,
  bookingLabel,
  onClose,
  onSubmit,
  speakLang = 'ar',
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setRating(5);
      setComment('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (comment.trim().length < 2) {
      setError('يرجى كتابة تعليق قصير (حرفان على الأقل).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(rating, comment.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر إرسال التقييم.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="glass-card w-full max-w-md rounded-[28px] p-5 shadow-[var(--shadow-header)] border border-border/60 animate-[success-fade-up_0.3s_ease-out_both]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 id="review-modal-title" className="font-black text-text-primary text-lg flex items-center gap-2">
              تقييم الخدمة
              <button
                type="button"
                onClick={e => { e.stopPropagation(); speak('تقييم الخدمة', speakLang); }}
                aria-label="استمع"
                className="btn-speak"
              >
                <Volume2 className="w-4 h-4 text-text-secondary" />
              </button>
            </h2>
            <p className="text-xs text-text-secondary font-medium mt-1">{bookingLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 rounded-full hover:bg-border transition-all duration-200 active:scale-95"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${toEasternArabic(n)} نجوم`}
              className="p-1 transition-transform duration-200 active:scale-90 hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  n <= rating ? 'text-accent fill-accent' : 'text-border'
                }`}
              />
            </button>
          ))}
        </div>

        <label className="text-sm font-bold text-text-primary mb-2 block">تعليقك</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="شاركنا تجربتك مع الخدمة…"
          disabled={submitting}
          className="w-full bg-bg-primary border border-border/60 rounded-xl py-3 px-4 text-text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="text-danger text-xs font-bold mt-2">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-accent w-full mt-4 py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          إرسال التقييم
        </button>
      </div>
    </div>
  );
}
