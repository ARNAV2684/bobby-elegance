import type { Paise } from '@bobby/shared';

/**
 * Payment provider contract.
 *
 * Checkout talks only to this interface. Adding Razorpay — or Stripe alongside
 * it for international cards — means writing one file that implements these
 * four methods and registering it in `index.ts`. No page, form or route handler
 * changes.
 *
 * The methods mirror the shape every gateway actually uses:
 *   createOrder  -> gateway-side order, returns an id the client SDK opens with
 *   verifyPayment -> HMAC check on the callback the browser hands back
 *   verifyWebhook -> HMAC check on the server-to-server notification
 *   refund       -> full or partial reversal
 */

export interface CreateOrderInput {
  amountPaise: Paise;
  /** Our own order number, echoed back by the gateway for reconciliation. */
  receipt: string;
  customerEmail: string;
  customerPhone: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  /** The gateway's order id. */
  providerOrderId: string;
  amountPaise: Paise;
  currency: 'INR';
  /** Publishable key the browser needs to open the checkout widget. */
  publicKey: string | null;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
}

export interface WebhookResult {
  valid: boolean;
  event: string | null;
  providerPaymentId: string | null;
  providerOrderId: string | null;
  amountPaise: Paise | null;
  reason?: string;
}

export interface PaymentProvider {
  /** Identifier stored on the Payment row. */
  readonly name: string;
  /** False when running on mock credentials — the UI uses this to show a banner. */
  readonly isLive: boolean;

  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyResult>;
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookResult>;
  refund(providerPaymentId: string, amountPaise?: Paise): Promise<{ ok: boolean; refundId?: string }>;
}
