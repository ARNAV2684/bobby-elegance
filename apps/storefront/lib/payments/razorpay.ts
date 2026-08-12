import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyResult,
  WebhookResult,
} from './provider';

const API = 'https://api.razorpay.com/v1';

/**
 * Razorpay.
 *
 * Activated by setting, in `.env`:
 *
 *   PAYMENT_PROVIDER=razorpay
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
 *   RAZORPAY_KEY_SECRET=xxxxxxxx
 *   RAZORPAY_WEBHOOK_SECRET=xxxxxxxx
 *
 * Nothing else in the codebase changes. Get the keys from the Razorpay
 * dashboard (Settings -> API Keys) and the webhook secret from
 * Settings -> Webhooks.
 *
 * The REST API is called directly rather than through the `razorpay` npm
 * package: there are three endpoints, the package pulls in a dependency tree we
 * would otherwise not need, and this keeps the signature verification visible
 * rather than hidden behind a helper.
 */
export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay';
  readonly isLive: boolean;

  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

    if (!this.keyId || !this.keySecret) {
      throw new Error(
        'PAYMENT_PROVIDER=razorpay requires NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }

    // Razorpay test keys are prefixed rzp_test_; live keys rzp_live_.
    this.isLive = this.keyId.startsWith('rzp_live_');
  }

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader() },
      body: JSON.stringify({
        amount: input.amountPaise, // Razorpay takes paise — same unit we store.
        currency: 'INR',
        receipt: input.receipt,
        notes: { email: input.customerEmail, phone: input.customerPhone, ...input.notes },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Razorpay order creation failed (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { id: string; amount: number };
    return {
      providerOrderId: data.id,
      amountPaise: data.amount,
      currency: 'INR',
      publicKey: this.keyId,
    };
  }

  /**
   * Verify the browser callback.
   *
   * Razorpay signs `order_id|payment_id` with the key secret. This proves the
   * callback came from Razorpay — but it is NOT sufficient on its own to mark
   * an order paid, because a user can close the tab before the callback fires.
   * The webhook is the authoritative signal; this is the fast path for showing
   * a confirmation screen.
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyResult> {
    const expected = createHmac('sha256', this.keySecret)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest('hex');

    return { valid: safeEqual(expected, input.signature) };
  }

  /**
   * Verify a webhook.
   *
   * The signature is an HMAC of the RAW request body. It must be computed
   * before any JSON parsing and re-serialising — round-tripping through
   * JSON.parse changes key order and whitespace, which changes the hash and
   * makes every webhook fail verification. This is the single most common way
   * to get this integration wrong.
   */
  async verifyWebhook(rawBody: string, signature: string): Promise<WebhookResult> {
    if (!this.webhookSecret) {
      return {
        valid: false,
        event: null,
        providerPaymentId: null,
        providerOrderId: null,
        amountPaise: null,
        reason: 'RAZORPAY_WEBHOOK_SECRET is not set',
      };
    }

    const expected = createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');

    if (!safeEqual(expected, signature)) {
      return {
        valid: false,
        event: null,
        providerPaymentId: null,
        providerOrderId: null,
        amountPaise: null,
        reason: 'Signature mismatch',
      };
    }

    const parsed = JSON.parse(rawBody) as {
      event?: string;
      payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } };
    };
    const entity = parsed.payload?.payment?.entity;

    return {
      valid: true,
      event: parsed.event ?? null,
      providerPaymentId: entity?.id ?? null,
      providerOrderId: entity?.order_id ?? null,
      amountPaise: entity?.amount ?? null,
    };
  }

  async refund(providerPaymentId: string, amountPaise?: number) {
    const res = await fetch(`${API}/payments/${providerPaymentId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader() },
      body: JSON.stringify(amountPaise ? { amount: amountPaise } : {}),
    });

    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { id: string };
    return { ok: true, refundId: data.id };
  }
}

/** Constant-time compare, so a mismatch cannot be found by timing the response. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
