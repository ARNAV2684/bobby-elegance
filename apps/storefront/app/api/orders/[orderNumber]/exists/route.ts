import { NextResponse } from 'next/server';
import { getRepository } from '@bobby/db';

/**
 * Existence check for the tracking lookup form.
 *
 * Returns only whether the order number resolves — never any order data. The
 * tracking page itself is unguessable-by-design (order numbers use a 32-char
 * alphabet over 8 positions), but this endpoint would still be the cheapest
 * way to enumerate them, so it is deliberately answer-only.
 *
 * Production hardening: rate-limit by IP, and require a matching email or
 * phone before revealing anything. The schema for that already exists as
 * `trackOrderSchema` in @bobby/shared.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const order = await getRepository().getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({ found: true });
}
