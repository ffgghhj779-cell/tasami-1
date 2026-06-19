import type { InvoiceData } from './invoice';
import { formatPrice } from './booking';
import { toEasternArabic } from './utils';

const INVOICE_WIDTH_PX = 794;

async function ensureTajawalLoaded(): Promise<void> {
  try {
    await document.fonts.load('400 16px Tajawal');
    await document.fonts.load('700 16px Tajawal');
    await document.fonts.load('800 28px Tajawal');
  } catch {
    /* font may already be cached from index.html */
  }
  await document.fonts.ready;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  styles: Partial<CSSStyleDeclaration>,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node.style, styles);
  if (text !== undefined) node.textContent = text;
  return node;
}

function rowLine(label: string, value: string, valueLtr = false): HTMLDivElement {
  const row = el('div', {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '10px 12px',
    borderBottom: '1px solid #E5DDD3',
    background: '#FBF7F2',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
  });

  const labelEl = el('span', {
    fontWeight: '700',
    color: '#3E4A2E',
    textAlign: 'right',
    flex: '0 0 40%',
    fontFamily: "'Tajawal', sans-serif",
  }, label);

  const valueEl = el('span', {
    fontWeight: '600',
    color: '#3E4A2E',
    textAlign: valueLtr ? 'left' : 'right',
    direction: valueLtr ? 'ltr' : 'rtl',
    unicodeBidi: 'plaintext',
    flex: '1',
    fontFamily: "'Tajawal', sans-serif",
  }, value);

  row.append(labelEl, valueEl);
  return row;
}

/**
 * Canvas-first invoice DOM — built with text nodes (not innerHTML) for correct Arabic shaping.
 * Positioned off-screen at full opacity so html2canvas captures content faithfully.
 */
export async function buildInvoiceElement(data: InvoiceData): Promise<HTMLDivElement> {
  await ensureTajawalLoaded();

  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const root = el('div', {
    position: 'absolute',
    top: '0',
    left: '-9999px',
    width: `${INVOICE_WIDTH_PX}px`,
    minHeight: '1123px',
    background: '#ffffff',
    color: '#3E4A2E',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
    unicodeBidi: 'embed',
    boxSizing: 'border-box',
    opacity: '1',
    pointerEvents: 'none',
    overflow: 'hidden',
  });
  root.setAttribute('dir', 'rtl');
  root.setAttribute('lang', 'ar');
  root.setAttribute('aria-hidden', 'true');
  root.id = 'tasami-invoice-snapshot';

  const header = el('div', {
    background: '#3E4A2E',
    color: '#FBF7F2',
    padding: '28px 32px',
    textAlign: 'center',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
  });
  header.append(
    el('h1', { margin: '0', fontSize: '28px', fontWeight: '800', fontFamily: "'Tajawal', sans-serif" }, 'تسامي الوطنية'),
    el('p', { margin: '8px 0 0', fontSize: '14px', opacity: '0.9', fontFamily: "'Tajawal', sans-serif" }, 'فاتورة ضريبية مبسّطة'),
    el('p', { margin: '6px 0 0', fontSize: '12px', opacity: '0.75', fontFamily: "'Tajawal', sans-serif" }, `التاريخ: ${today}`),
  );

  const body = el('div', {
    padding: '24px 32px',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
  });

  const orderLine = el('p', {
    fontSize: '13px',
    fontWeight: '700',
    margin: '0 0 20px',
    textAlign: 'right',
    direction: 'rtl',
    fontFamily: "'Tajawal', sans-serif",
  });
  orderLine.append(
    document.createTextNode('رقم الطلب: '),
    (() => {
      const id = el('span', { direction: 'ltr', unicodeBidi: 'embed', fontFamily: "'Tajawal', sans-serif" }, data.bookingId);
      return id;
    })(),
  );

  const sectionTitle = (text: string) =>
    el('div', {
      background: '#C4A97D',
      color: '#fff',
      padding: '10px 12px',
      fontWeight: '700',
      fontSize: '14px',
      textAlign: 'right',
      fontFamily: "'Tajawal', sans-serif",
      direction: 'rtl',
    }, text);

  const detailsBlock = el('div', { marginBottom: '24px', border: '1px solid #E5DDD3', fontFamily: "'Tajawal', sans-serif" });
  detailsBlock.append(sectionTitle('تفاصيل الخدمة'));
  detailsBlock.append(
    rowLine('نوع الخدمة', data.serviceType),
    rowLine('مدة الخدمة', `${toEasternArabic(data.serviceHours)} ساعات`),
    rowLine('التاريخ', data.dateFormatted),
    rowLine('الوقت', data.timeSlotLabel),
    rowLine('العنوان', data.address),
  );

  const pricingBlock = el('div', { border: '1px solid #E5DDD3', fontFamily: "'Tajawal', sans-serif" });
  const priceHeader = el('div', {
    background: '#3E4A2E',
    color: '#fff',
    padding: '10px 12px',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
  });
  priceHeader.append(
    el('span', { fontFamily: "'Tajawal', sans-serif" }, 'البند'),
    el('span', { fontFamily: "'Tajawal', sans-serif" }, 'المبلغ (ر.س)'),
  );
  pricingBlock.append(priceHeader);
  pricingBlock.append(
    rowLine('قيمة الخدمة', formatPrice(data.subtotal), true),
    rowLine('ضريبة القيمة المضافة (١٥٪)', formatPrice(data.vat), true),
    rowLine('الإجمالي شامل الضريبة', formatPrice(data.total), true),
  );

  const footer = el('p', {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#5C6B44',
    lineHeight: '1.6',
    fontFamily: "'Tajawal', sans-serif",
    direction: 'rtl',
  }, 'شكراً لاختياركم تسامي الوطنية — هذه فاتورة إلكترونية صادرة من النظام.');

  body.append(orderLine, detailsBlock, pricingBlock, footer);
  root.append(header, body);

  return root;
}
