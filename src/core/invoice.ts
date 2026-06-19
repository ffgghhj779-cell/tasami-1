import { jsPDF } from 'jspdf';
import type { LastBookingSnapshot } from './booking';
import type { UserBookingRow } from '../hooks/useUserBookings';
import { calculatePricing } from './booking';
import { renderInvoiceCanvas } from './invoiceCanvas';

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
  customerName?: string;
  customerPhone?: string;
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
    customerName: snapshot.customerName,
    customerPhone: snapshot.customerPhone,
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
    customerName: row.customerName !== '—' ? row.customerName : undefined,
    customerPhone: row.phone !== '—' ? row.phone : undefined,
  };
}

/** PDF via Canvas 2D + Amiri font — reliable Arabic rendering on all devices. */
export async function downloadInvoicePdf(data: InvoiceData): Promise<void> {
  const canvas = await renderInvoiceCanvas(data);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const renderH = Math.min(imgH, pageH);

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, renderH, undefined, 'SLOW');
  doc.save(`Tasami-Invoice-${data.bookingId}.pdf`);
}
