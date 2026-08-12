import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@bobby/db';
import { getPaymentProvider } from '@/lib/payments';

const bodySchema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(4).max(20),
  outcome: z.enum(['success', 'failure']),
  // Present only when a real gateway hands back a signed callback.
  providerOrderId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  signature: z.string().optional(),
});

/**
 * Settle a payment.
 *
 * This is the single place an order transitions from PENDING to PAID, and it
 * is the integration point for a real gateway.
 *
 * On the **mock** provider it simply applies the outcome the demo payment
 * screen asked for, so the whole flow is exercisable with no account.
 *
 * On **Razorpay** the callback is signature-verified before anything is
 * written. Note that even then this is the *fast path* used to move the
 * shopper to a confirmation screen — the authoritative signal is the
 * `payment.captured` webhook, because shoppers close tabs before callbacks
 * fire. When that webhook handler is built it must be idempotent, so an order
 * already marked PAID here is left alone rather than double-processed.
 *
 * A failed payment releases the stock the checkout reserved. Without this, an
 * abandoned card payment would hold inventory indefinitely.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment payload' }, { status: 400 });
  }

  const { orderNumber, outcome, providerOrderId, providerPaymentId, signature } = parsed.data;

  const repo = getRepository();
  const order = await repo.getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Idempotency: a re-submitted or replayed confirmation must not re-run any
  // of this. Report the existing state instead of mutating again.
  if (order.status !== 'PENDING') {
    return NextResponse.json({ ok: true, status: order.status, alreadySettled: true });
  }

  const provider = getPaymentProvider();

  // With a real gateway, an unverified callback is discarded outright.
  if (provider.name !== 'mock' && outcome === 'success') {
    if (!providerOrderId || !providerPaymentId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }

    const verification = await provider.verifyPayment({
      providerOrderId,
      providerPaymentId,
      signature,
    });

    if (!verification.valid) {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
    }
  }

  if (outcome === 'failure') {
    // Release the reserved stock before cancelling, or the inventory is lost.
    for (const item of order.items) {
      await repo.adjustStock(item.variantId, item.quantity);
    }
    await repo.updateOrderStatus(orderNumber, 'CANCELLED');
    return NextResponse.json({ ok: true, status: 'CANCELLED' });
  }

  await repo.updateOrderStatus(orderNumber, 'PAID');
  return NextResponse.json({ ok: true, status: 'PAID' });
}
