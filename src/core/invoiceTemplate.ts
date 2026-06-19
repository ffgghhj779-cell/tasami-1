import type { InvoiceData } from './invoice';
import { formatPrice } from './booking';
import { toEasternArabic } from './utils';
import { ensureInvoiceFontsReady, getInvoiceFontCss } from './invoiceFonts';

const INVOICE_WIDTH_PX = 794;

const BASE_TEXT: Partial<CSSStyleDeclaration> = {
  fontFamily: "'Tajawal', 'Amiri', serif",
  fontFeatureSettings: '"liga" 1, "calt" 1',
  WebkitFontSmoothing: 'antialiased',
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  styles: Partial<CSSStyleDeclaration>,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node.style, BASE_TEXT, styles);
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
    direction: 'rtl',
  });

  const labelEl = el('span', {
    fontWeight: '700',
    color: '#3E4A2E',
    textAlign: 'right',
    flex: '0 0 40%',
    direction: 'rtl',
  }, label);

  const valueStyles: Partial<CSSStyleDeclaration> = {
    fontWeight: '600',
    color: '#3E4A2E',
    flex: '1',
  };

  if (valueLtr) {
    Object.assign(valueStyles, {
      textAlign: 'left',
      direction: 'ltr',
      unicodeBidi: 'embed',
    });
  } else {
    Object.assign(valueStyles, {
      textAlign: 'right',
      direction: 'rtl',
    });
  }

  const valueEl = el('span', valueStyles, value);
  row.append(labelEl, valueEl);
  return row;
}

/** In-viewport but clipped — html2canvas needs layout in viewport for Arabic shaping. */
export const INVOICE_CAPTURE_STYLES: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: `${INVOICE_WIDTH_PX}px`,
  minHeight: '1123px',
  zIndex: '2147483646',
  opacity: '1',
  pointerEvents: 'none',
  overflow: 'hidden',
  clipPath: 'inset(100%)',
  clip: 'rect(0, 0, 0, 0)',
};

export async function buildInvoiceElement(data: InvoiceData): Promise<HTMLDivElement> {
  await ensureInvoiceFontsReady();
  const fontCss = await getInvoiceFontCss();

  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const root = el('div', {
    ...INVOICE_CAPTURE_STYLES,
    background: '#ffffff',
    color: '#3E4A2E',
    direction: 'rtl',
    boxSizing: 'border-box',
  });
  root.setAttribute('dir', 'rtl');
  root.setAttribute('lang', 'ar');
  root.setAttribute('aria-hidden', 'true');
  root.id = 'tasami-invoice-snapshot';

  const styleEl = document.createElement('style');
  styleEl.textContent = fontCss;
  root.appendChild(styleEl);

  const header = el('div', {
    background: '#3E4A2E',
    color: '#FBF7F2',
    padding: '28px 32px',
    textAlign: 'center',
    direction: 'rtl',
  });
  header.append(
    el('h1', { margin: '0', fontSize: '28px', fontWeight: '800' }, 'تسامي الوطنية'),
    el('p', { margin: '8px 0 0', fontSize: '14px', opacity: '0.9' }, 'فاتورة ضريبية مبسّطة'),
    el('p', { margin: '6px 0 0', fontSize: '12px', opacity: '0.75' }, `التاريخ: ${today}`),
  );

  const body = el('div', {
    padding: '24px 32px',
    direction: 'rtl',
  });

  const orderLine = el('p', {
    fontSize: '13px',
    fontWeight: '700',
    margin: '0 0 20px',
    textAlign: 'right',
    direction: 'rtl',
  });
  orderLine.append(
    document.createTextNode('رقم الطلب: '),
    el('span', { direction: 'ltr', unicodeBidi: 'embed' }, data.bookingId),
  );

  const sectionTitle = (text: string) =>
    el('div', {
      background: '#C4A97D',
      color: '#fff',
      padding: '10px 12px',
      fontWeight: '700',
      fontSize: '14px',
      textAlign: 'right',
      direction: 'rtl',
    }, text);

  const detailsBlock = el('div', { marginBottom: '24px', border: '1px solid #E5DDD3' });
  detailsBlock.append(sectionTitle('تفاصيل الخدمة'));
  detailsBlock.append(
    rowLine('نوع الخدمة', data.serviceType),
    rowLine('مدة الخدمة', `${toEasternArabic(data.serviceHours)} ساعات`),
    rowLine('التاريخ', data.dateFormatted),
    rowLine('الوقت', data.timeSlotLabel),
    rowLine('العنوان', data.address),
  );

  const pricingBlock = el('div', { border: '1px solid #E5DDD3' });
  const priceHeader = el('div', {
    background: '#3E4A2E',
    color: '#fff',
    padding: '10px 12px',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    direction: 'rtl',
  });
  priceHeader.append(
    el('span', {}, 'البند'),
    el('span', {}, 'المبلغ (ر.س)'),
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
    direction: 'rtl',
  }, 'شكراً لاختياركم تسامي الوطنية — هذه فاتورة إلكترونية صادرة من النظام.');

  body.append(orderLine, detailsBlock, pricingBlock, footer);
  root.append(header, body);

  return root;
}
