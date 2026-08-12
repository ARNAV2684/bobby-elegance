import { MockPaymentProvider } from './mock';
import { RazorpayProvider } from './razorpay';
import type { PaymentProvider } from './provider';

export type * from './provider';

let instance: PaymentProvider | null = null;

/**
 * Resolve the configured payment provider.
 *
 *   PAYMENT_PROVIDER unset / "mock" -> MockPaymentProvider (default)
 *   PAYMENT_PROVIDER=razorpay       -> RazorpayProvider
 *
 * To add Stripe for international cards later: implement PaymentProvider in
 * `stripe.ts`, add a case here, and route on currency or shipping country at
 * the call site. Checkout itself does not change.
 */
export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;

  const configured = process.env.PAYMENT_PROVIDER?.toLowerCase() ?? 'mock';

  switch (configured) {
    case 'razorpay':
      instance = new RazorpayProvider();
      break;
    case 'mock':
    default:
      instance = new MockPaymentProvider();
      break;
  }

  return instance;
}

/** True when running on the mock gateway — drives the dev banner at checkout. */
export function isMockPayments(): boolean {
  return getPaymentProvider().name === 'mock';
}
