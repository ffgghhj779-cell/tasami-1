export interface MakeWebhookPayload {
  bookingId: string;
  customerName: string;
  phone: string;
  serviceType: string;
  schedule: string;
  totalPrice: number;
}

/** Fire-and-forget POST to Make.com — never throws; skips when URL is unset. */
export function notifyMakeWebhook(payload: MakeWebhookPayload): void {
  const url = import.meta.env.VITE_MAKE_WEBHOOK_URL?.trim();
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
