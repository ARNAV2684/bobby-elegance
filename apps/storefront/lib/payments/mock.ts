import { randomUUID } from 'node:crypto';
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyResult,
  WebhookResult,
} from './provider';

/**
 * Mock gateway used in development.
 *
 * It performs no network calls and always succeeds. That makes the whole
 * checkout flow — order creation, payment, confirmation, order history —
 * exercisable end to end with nothing purchased and no keys configured.
 *
 * It deliberately mimics Razorpay's id formats (`order_…`, `pay_…`) so the
 * data written to orders during development has the same shape it will have in
 * production, and nothing downstream needs to special-case it.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';
  readonly isLive = false;

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    return {
      providerOrderId: `order_mock_${randomUUID().replace(/-/g, '').slice(0, 14)}`,
      amountPaise: input.amountPaise,
      currency: 'INR',
      publicKey: null,
    };
  }

  async verifyPayment(_input: VerifyPaymentInput): Promise<VerifyResult> {
    return { valid: true };
  }

  async verifyWebhook(rawBody: string): Promise<WebhookResult> {
    try {
      const parsed = JSON.parse(rawBody) as Record<string, unknown>;
      return {
        valid: true,
        event: typeof parsed.event === 'string' ? parsed.event : 'payment.captured',
        providerPaymentId: `pay_mock_${randomUUID().replace(/-/g, '').slice(0, 14)}`,
        providerOrderId: null,
        amountPaise: null,
      };
    } catch {
      return {
        valid: false,
        event: null,
        providerPaymentId: null,
        providerOrderId: null,
        amountPaise: null,
        reason: 'Body was not valid JSON',
      };
    }
  }

  async refund(_providerPaymentId: string) {
    return { ok: true, refundId: `rfnd_mock_${randomUUID().slice(0, 12)}` };
  }
}
