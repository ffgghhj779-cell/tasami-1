import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { LastBookingSnapshot } from './booking';
import type { UserBookingRow } from '../hooks/useUserBookings';
import { calculatePricing } from './booking';
import { buildInvoiceElement } from './invoiceTemplate';

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

/** Render a hidden RTL HTML invoice via html2canvas → single-page PDF image. */
export async function downloadInvoicePdf(data: InvoiceData): Promise<void> {
  const element = buildInvoiceElement(data);
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;

    doc.addImage(imgData, 'PNG', 0, 0, pageW, Math.min(imgH, pageH));
    doc.save(`Tasami-Invoice-${data.bookingId}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}
