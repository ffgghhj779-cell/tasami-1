import type { InvoiceData } from './invoice';
import { formatPrice } from './booking';
import { toEasternArabic } from './utils';

const W = 794;
const H = 1280;
const SCALE = 3;
const MARGIN = 48;
const CONTENT_W = W - MARGIN * 2;
const DIVIDER_X = MARGIN + CONTENT_W * 0.4;
const LABEL_MAX_W = CONTENT_W * 0.54;
const VALUE_MAX_W = CONTENT_W * 0.36;
const LABEL_X = W - MARGIN - 12;
const VALUE_RTL_X = DIVIDER_X - 14;
const VALUE_LTR_X = MARGIN + 14;
const FONT_URL = '/fonts/Amiri-Regular.ttf';
const FONT_FAMILY = 'TasamiAmiri';

let fontLoadPromise: Promise<void> | null = null;

async function ensureAmiriFont(): Promise<void> {
  if (fontLoadPromise) return fontLoadPromise;

  fontLoadPromise = (async () => {
    if (document.fonts.check(`16px ${FONT_FAMILY}`)) return;
    const face = new FontFace(FONT_FAMILY, `url(${FONT_URL})`, {
      weight: '400',
      style: 'normal',
    });
    await face.load();
    document.fonts.add(face);
    await document.fonts.ready;
  })();

  return fontLoadPromise;
}

function todayAr(): string {
  return new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function countWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  let line = '';
  let lines = 1;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      line = word;
    } else {
      line = test;
    }
  }
  return lines;
}

function wrapRtl(
  ctx: CanvasRenderingContext2D,
  text: string,
  xRight: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/).filter(Boolean);
  let line = '';
  let cy = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, xRight, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, xRight, cy);
    cy += lineHeight;
  }
  return cy;
}

function measureRowHeight(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  valueLtr: boolean,
): number {
  ctx.font = `bold 14px ${FONT_FAMILY}`;
  const labelLines = countWrappedLines(ctx, label, LABEL_MAX_W);
  ctx.font = `14px ${FONT_FAMILY}`;
  const valueLines = valueLtr ? 1 : countWrappedLines(ctx, value, VALUE_MAX_W);
  const lines = Math.max(labelLines, valueLines, 1);
  return Math.max(44, 18 + lines * 22);
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  y: number,
  valueLtr = false,
): number {
  const rowH = measureRowHeight(ctx, label, value, valueLtr);

  ctx.fillStyle = '#FBF7F2';
  ctx.fillRect(MARGIN, y, CONTENT_W, rowH);
  ctx.strokeStyle = '#E5DDD3';
  ctx.strokeRect(MARGIN, y, CONTENT_W, rowH);
  ctx.beginPath();
  ctx.moveTo(DIVIDER_X, y);
  ctx.lineTo(DIVIDER_X, y + rowH);
  ctx.stroke();

  ctx.fillStyle = '#3E4A2E';
  ctx.font = `bold 14px ${FONT_FAMILY}`;
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  const labelLines = countWrappedLines(ctx, label, LABEL_MAX_W);
  if (labelLines > 1) {
    wrapRtl(ctx, label, LABEL_X, y + 22, LABEL_MAX_W, 22);
  } else {
    ctx.fillText(label, LABEL_X, y + 28);
  }

  ctx.font = `14px ${FONT_FAMILY}`;
  ctx.fillStyle = '#2A2A2A';
  const valueY = y + 28;
  if (valueLtr) {
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillText(value, VALUE_LTR_X, valueY);
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
  } else {
    const valueLines = countWrappedLines(ctx, value, VALUE_MAX_W);
    if (valueLines > 1) {
      wrapRtl(ctx, value, VALUE_RTL_X, y + 22, VALUE_MAX_W, 22);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(value, VALUE_RTL_X, valueY);
    }
  }

  return y + rowH;
}

export async function renderInvoiceCanvas(data: InvoiceData): Promise<HTMLCanvasElement> {
  await ensureAmiriFont();

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.scale(SCALE, SCALE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const headerH = 156;
  ctx.fillStyle = '#3E4A2E';
  ctx.fillRect(0, 0, W, headerH);
  ctx.fillStyle = '#FBF7F2';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.font = `bold 32px ${FONT_FAMILY}`;
  ctx.fillText('تسامي الوطنية', W / 2, 56);
  ctx.font = `16px ${FONT_FAMILY}`;
  ctx.fillText('فاتورة ضريبية مبسّطة', W / 2, 92);
  ctx.font = `13px ${FONT_FAMILY}`;
  ctx.fillText(`التاريخ: ${todayAr()}`, W / 2, 122);

  let y = headerH + 28;
  ctx.fillStyle = '#3E4A2E';
  ctx.font = `bold 15px ${FONT_FAMILY}`;
  ctx.textAlign = 'right';
  ctx.fillText(`رقم الطلب: ${data.bookingId}`, LABEL_X, y);
  y += 36;

  if (data.customerName) {
    y = drawRow(ctx, 'اسم العميل', data.customerName, y);
  }
  if (data.customerPhone) {
    y = drawRow(ctx, 'جوال العميل', data.customerPhone, y, true);
  }

  ctx.fillStyle = '#C4A97D';
  ctx.fillRect(MARGIN, y, CONTENT_W, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 15px ${FONT_FAMILY}`;
  ctx.textAlign = 'right';
  ctx.fillText('تفاصيل الخدمة', LABEL_X, y + 25);
  y += 36;

  const hours = data.serviceHours > 0 ? data.serviceHours : 2;
  y = drawRow(ctx, 'نوع الخدمة', data.serviceType || '—', y);
  y = drawRow(ctx, 'مدة الخدمة', `${toEasternArabic(hours)} ساعات`, y);
  y = drawRow(ctx, 'التاريخ', data.dateFormatted || '—', y);
  y = drawRow(ctx, 'الوقت', data.timeSlotLabel || '—', y);
  y = drawRow(ctx, 'العنوان', data.address || '—', y);
  y += 16;

  ctx.fillStyle = '#3E4A2E';
  ctx.fillRect(MARGIN, y, CONTENT_W, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 15px ${FONT_FAMILY}`;
  ctx.fillText('التسعير (ر.س)', LABEL_X, y + 25);
  y += 36;

  y = drawRow(ctx, 'قيمة الخدمة', formatPrice(data.subtotal), y, true);
  y = drawRow(ctx, 'ضريبة القيمة المضافة (١٥٪)', formatPrice(data.vat), y, true);
  y = drawRow(ctx, 'الإجمالي شامل الضريبة', formatPrice(data.total), y, true);
  y += 40;

  ctx.fillStyle = '#5C6B44';
  ctx.font = `13px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  wrapRtl(
    ctx,
    'شكراً لاختياركم تسامي الوطنية — هذه فاتورة إلكترونية صادرة من النظام.',
    W / 2,
    y,
    CONTENT_W - 48,
    24,
  );

  return canvas;
}
