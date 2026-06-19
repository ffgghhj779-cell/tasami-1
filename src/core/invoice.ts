import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LastBookingSnapshot } from './booking';
import type { UserBookingRow } from '../hooks/useUserBookings';
import { calculatePricing, formatPrice } from './booking';
import { toEasternArabic } from './utils';

export interface InvoiceData {
  bookingId: string;
  serviceType: string;
  serviceHours: number;
  dateFormatted: string;
  timeSlotLabel: string;
  address: string;
  subtotal: number;
  vat: number;
  total: number;
}

let fontBase64Cache: string | null = null;

async function loadAmiriFont(): Promise<string> {
  if (fontBase64Cache) return fontBase64Cache;
  const res = await fetch('/fonts/Amiri-Regular.ttf');
  if (!res.ok) throw new Error('تعذّر تحميل خط الفاتورة.');
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  fontBase64Cache = btoa(binary);
  return fontBase64Cache;
}

function registerArabicFont(doc: jsPDF, fontData: string): void {
  doc.addFileToVFS('Amiri-Regular.ttf', fontData);
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri');
  doc.setR2L(true);
}

export function invoiceFromSnapshot(snapshot: LastBookingSnapshot): InvoiceData {
  const pricing = calculatePricing(snapshot.serviceHours);
  return {
    bookingId: snapshot.bookingId,
    serviceType: snapshot.serviceType,
    serviceHours: snapshot.serviceHours,
    dateFormatted: snapshot.dateFormatted,
    timeSlotLabel: snapshot.timeSlotLabel,
    address: snapshot.address,
    subtotal: pricing.subtotal,
    vat: pricing.vat,
    total: snapshot.total,
  };
}

export function invoiceFromBookingRow(row: UserBookingRow): InvoiceData {
  const pricing = calculatePricing(row.serviceHours);
  return {
    bookingId: row.bookingId,
    serviceType: row.serviceType,
    serviceHours: row.serviceHours,
    dateFormatted: row.dateFormatted,
    timeSlotLabel: row.timeSlotLabel,
    address: row.address,
    subtotal: pricing.subtotal,
    vat: pricing.vat,
    total: row.total,
  };
}

export async function downloadInvoicePdf(data: InvoiceData): Promise<void> {
  const fontData = await loadAmiriFont();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  registerArabicFont(doc, fontData);

  const pageW = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header band
  doc.setFillColor(62, 74, 46);
  doc.rect(0, 0, pageW, 38, 'F');
  doc.setTextColor(251, 247, 242);
  doc.setFontSize(22);
  doc.text('تسامي الوطنية', pageW / 2, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.text('فاتورة ضريبية مبسّطة', pageW / 2, 26, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`التاريخ: ${today}`, pageW / 2, 33, { align: 'center' });

  doc.setTextColor(62, 74, 46);
  doc.setFontSize(10);
  doc.text(`رقم الطلب: ${data.bookingId}`, pageW - 14, 48, { align: 'right' });

  autoTable(doc, {
    startY: 54,
    margin: { right: 14, left: 14 },
    head: [['البيان', 'التفاصيل']],
    body: [
      ['نوع الخدمة', data.serviceType],
      ['مدة الخدمة', `${toEasternArabic(data.serviceHours)} ساعات`],
      ['التاريخ', data.dateFormatted],
      ['الوقت', data.timeSlotLabel],
      ['العنوان', data.address],
    ],
    styles: {
      font: 'Amiri',
      fontSize: 10,
      halign: 'right',
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [196, 169, 125],
      textColor: [255, 255, 255],
      fontStyle: 'normal',
    },
    alternateRowStyles: { fillColor: [251, 247, 242] },
    theme: 'grid',
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;

  autoTable(doc, {
    startY: finalY + 8,
    margin: { right: 14, left: 14 },
    head: [['البند', 'المبلغ (ر.س)']],
    body: [
      ['قيمة الخدمة', formatPrice(data.subtotal)],
      ['ضريبة القيمة المضافة (١٥٪)', formatPrice(data.vat)],
      ['الإجمالي شامل الضريبة', formatPrice(data.total)],
    ],
    styles: {
      font: 'Amiri',
      fontSize: 10,
      halign: 'right',
    },
    headStyles: {
      fillColor: [62, 74, 46],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      1: { halign: 'left', fontStyle: 'normal' },
    },
  });

  const footerY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 180;
  doc.setFontSize(8);
  doc.setTextColor(92, 107, 68);
  doc.text(
    'شكراً لاختياركم تسامي الوطنية — هذه فاتورة إلكترونية صادرة من النظام.',
    pageW / 2,
    footerY + 14,
    { align: 'center' },
  );

  doc.save(`Tasami-Invoice-${data.bookingId}.pdf`);
}
