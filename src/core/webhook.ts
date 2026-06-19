export interface WebhookPayload {
  bookingId: string;
  customerName: string;
  /** Digits only — Ultramsg / API body */
  phone: string;
  /** +966… — display / E.164 */
  phoneE164: string;
  /** Valid https URL for Make HTTP modules (wa.me deep link) */
  whatsappUrl: string;
  serviceType: string;
  schedule: string;
  totalPrice: number;
}

function stripEnvQuotes(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/**
 * Normalize VITE_MAKE_WEBHOOK_URL — strip quotes, whitespace, trailing slashes.
 * Returns null when missing or not a valid http(s) URL.
 */
export function normalizeWebhookUrl(raw: string | undefined): string | null {
  if (!raw) return null;

  const cleaned = stripEnvQuotes(raw);
  if (!cleaned) return null;

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return null;
  }

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  }

  parsed.hash = '';
  return parsed.href;
}

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWebhookPayload(
  input: Omit<WebhookPayload, 'phoneE164' | 'whatsappUrl'> & { phone: string },
): WebhookPayload {
  const phone = digitsOnly(input.phone);
  return {
    ...input,
    phone,
    phoneE164: phone ? `+${phone}` : '',
    whatsappUrl: phone ? `https://wa.me/${phone}` : '',
  };
}

/** Fire-and-forget POST to Make.com — never throws; skips when URL is unset/invalid. */
export function notifyWebhook(payload: WebhookPayload): void {
  const url = normalizeWebhookUrl(import.meta.env.VITE_MAKE_WEBHOOK_URL);
  if (!url) return;

  void (async () => {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      /* webhook failure must not affect booking flow */
    }
  })();
}
