/** Egyptian local prefixes (with leading 0): 010, 011, 012, 015 */
const EG_LOCAL = ['010', '011', '012', '015'] as const;

/** Egyptian operator codes without leading 0 */
const EG_OPERATOR = ['10', '11', '12', '15'] as const;

/** Saudi international: 966 + 9-digit mobile starting with 5 */
const SAUDI_INTL = /^9665\d{8}$/;

/** Egyptian international: 20 + operator + 8 digits */
const EGYPT_INTL = /^20(10|11|12|15)\d{8}$/;

export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
  /** Digits only, no '+', ready for Ultramsg / WhatsApp APIs. */
  normalized: string;
}

/** Strip spaces, dashes, '+', and any non-digit characters. */
export function cleanPhoneDigits(raw: string): string {
  return raw.replace(/[\s\-+()]/g, '').replace(/\D/g, '');
}

function isEgyptianInput(digits: string): boolean {
  if (digits.startsWith('20')) {
    const body = digits.slice(2);
    return EG_OPERATOR.some(op => body.startsWith(op));
  }
  return EG_LOCAL.some(p => digits.startsWith(p));
}

function isSaudiInput(digits: string): boolean {
  if (digits.startsWith('966')) return digits.length >= 4 && digits[3] === '5';
  if (digits.startsWith('05')) return digits.length === 10;
  return /^5\d{8}$/.test(digits);
}

function normalizeEgyptian(digits: string): string {
  if (EGYPT_INTL.test(digits)) return digits;

  if (digits.startsWith('20')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `20${digits.slice(1)}`;
  }

  if (EG_OPERATOR.some(op => digits.startsWith(op))) {
    return `20${digits}`;
  }

  return digits;
}

function normalizeSaudi(digits: string): string {
  if (SAUDI_INTL.test(digits)) return digits;

  if (digits.startsWith('966')) {
    return digits;
  }

  if (digits.startsWith('05')) {
    return `966${digits.slice(1)}`;
  }

  if (/^5\d{8}$/.test(digits)) {
    return `966${digits}`;
  }

  return digits;
}

/**
 * Auto-detect Egypt (20…) vs Saudi (966…) from user input.
 * Falls back to cleaned digits when no pattern matches.
 */
export function normalizePhoneForWhatsApp(raw: string): string {
  const digits = cleanPhoneDigits(raw);
  if (!digits) return '';

  if (SAUDI_INTL.test(digits) || EGYPT_INTL.test(digits)) {
    return digits;
  }

  // Egyptian before Saudi — "201…" must not be treated as Saudi
  if (isEgyptianInput(digits)) {
    return normalizeEgyptian(digits);
  }

  if (isSaudiInput(digits)) {
    return normalizeSaudi(digits);
  }

  return digits;
}

export function validatePhone(raw: string): PhoneValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: 'رقم الجوال مطلوب', normalized: '' };
  }

  const normalized = normalizePhoneForWhatsApp(trimmed);

  if (!normalized) {
    return { valid: false, error: 'رقم الجوال غير صالح', normalized: '' };
  }

  if (SAUDI_INTL.test(normalized) || EGYPT_INTL.test(normalized)) {
    return { valid: true, normalized };
  }

  // Plausible fallback — cleaned digits that didn't match a strict pattern
  if (normalized.length >= 10 && normalized.length <= 15) {
    return { valid: true, normalized };
  }

  return {
    valid: false,
    error: 'أدخل رقم جوال مصري (010/011/012/015) أو سعودي (05x) صحيح',
    normalized,
  };
}
