import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  durationMs?: number;
}

export function Toast({
  message,
  variant = 'success',
  onClose,
  durationMs = 4500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const isSuccess = variant === 'success';

  return (
    <div
      role="alert"
      className={`fixed bottom-24 inset-x-4 max-w-md mx-auto z-[60] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-[var(--shadow-header)] border animate-[success-fade-up_0.35s_ease-out_both] ${
        isSuccess
          ? 'bg-success/95 text-white border-success/30'
          : 'bg-danger/95 text-white border-danger/30'
      }`}
    >
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
        : <AlertCircle className="w-5 h-5 shrink-0" />}
      <p className="flex-1 text-sm font-bold leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="p-1 rounded-full hover:bg-white/15 transition-all duration-200 active:scale-95 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
