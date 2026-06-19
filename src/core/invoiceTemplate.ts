import type { InvoiceData } from './invoice';
import { formatPrice } from './booking';
import { toEasternArabic } from './utils';

/** Off-screen RTL invoice DOM — captured by html2canvas for correct Arabic shaping. */
export function buildInvoiceElement(data: InvoiceData): HTMLDivElement {
  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const root = document.createElement('div');
  root.dir = 'rtl';
  root.lang = 'ar';
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:794px',
    'background:#ffffff',
    'font-family:Tajawal,sans-serif',
    'color:#3E4A2E',
    'box-sizing:border-box',
  ].join(';');

  root.innerHTML = `
    <div style="background:#3E4A2E;color:#FBF7F2;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:800;">تسامي الوطنية</h1>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">فاتورة ضريبية مبسّطة</p>
      <p style="margin:6px 0 0;font-size:12px;opacity:0.75;">التاريخ: ${today}</p>
    </div>
    <div style="padding:24px 32px;">
      <p style="text-align:left;direction:ltr;font-size:13px;font-weight:700;margin:0 0 20px;">
        رقم الطلب: <span dir="ltr">${data.bookingId}</span>
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <thead>
          <tr style="background:#C4A97D;color:#fff;">
            <th style="padding:10px 12px;text-align:right;border:1px solid #E5DDD3;">البيان</th>
            <th style="padding:10px 12px;text-align:right;border:1px solid #E5DDD3;">التفاصيل</th>
          </tr>
        </thead>
        <tbody>
          ${row('نوع الخدمة', data.serviceType)}
          ${row('مدة الخدمة', `${toEasternArabic(data.serviceHours)} ساعات`)}
          ${row('التاريخ', data.dateFormatted)}
          ${row('الوقت', data.timeSlotLabel)}
          ${row('العنوان', data.address)}
        </tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#3E4A2E;color:#fff;">
            <th style="padding:10px 12px;text-align:right;border:1px solid #E5DDD3;">البند</th>
            <th style="padding:10px 12px;text-align:left;border:1px solid #E5DDD3;">المبلغ (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          ${row('قيمة الخدمة', formatPrice(data.subtotal), true)}
          ${row('ضريبة القيمة المضافة (١٥٪)', formatPrice(data.vat), true)}
          ${row('الإجمالي شامل الضريبة', formatPrice(data.total), true, true)}
        </tbody>
      </table>
      <p style="margin-top:28px;text-align:center;font-size:11px;color:#5C6B44;">
        شكراً لاختياركم تسامي الوطنية — هذه فاتورة إلكترونية صادرة من النظام.
      </p>
    </div>
  `;

  return root;
}

function row(label: string, value: string, amountCol = false, bold = false): string {
  const weight = bold ? 'font-weight:800;' : '';
  const align = amountCol ? 'text-align:left;direction:ltr;' : 'text-align:right;';
  return `
    <tr style="background:#FBF7F2;">
      <td style="padding:10px 12px;border:1px solid #E5DDD3;font-weight:700;">${label}</td>
      <td style="padding:10px 12px;border:1px solid #E5DDD3;${align}${weight}">${value}</td>
    </tr>
  `;
}
