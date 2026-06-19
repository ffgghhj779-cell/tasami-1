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

/**
 * Canvas-first PDF — snapshot entire RTL invoice div as image; no native PDF text.
 */
export async function downloadInvoicePdf(data: InvoiceData): Promise<void> {
  const element = await buildInvoiceElement(data);
  document.body.appendChild(element);

  try {
    // Allow layout + font rasterization before capture
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.offsetWidth,
      height: element.scrollHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.scrollHeight,
    });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const renderH = Math.min(imgH, pageH);

    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, renderH, undefined, 'FAST');
    doc.save(`Tasami-Invoice-${data.bookingId}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}
