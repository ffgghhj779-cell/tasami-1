import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { InvoiceData } from '../core/invoice';

interface DownloadInvoiceButtonProps {
  data: InvoiceData;
  className?: string;
  compact?: boolean;
}

export function DownloadInvoiceButton({ data, className = '', compact = false }: DownloadInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { downloadInvoicePdf } = await import('../core/invoice');
      await downloadInvoicePdf(data);
    } catch {
      window.alert('تعذّر إنشاء الفاتورة. حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={
        compact
          ? `text-xs font-bold text-accent flex items-center gap-1.5 hover:underline disabled:opacity-60 ${className}`
          : `w-full bg-bg-card border border-accent/30 text-text-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-accent/5 transition-all duration-300 active:scale-95 disabled:opacity-60 ${className}`
      }
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-accent" />}
      تحميل الفاتورة
    </button>
  );
}
