import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@bobby/db';
import {
  addressSchema,
  calculateTotals,
  clampQuantity,
  emailSchema,
  evaluateCoupon,
  generateOrderNumber,
  phoneSchema,
  type CartLine,
  type Order,
  type OrderItem,
} from '@bobby/shared';
import { getPaymentProvider } from '@/lib/payments';

const bodySchema = z.object({
  lines: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(10) }))
    .min(1, 'Your bag is empty')
    .max(50),
  email: emailSchema,
  phone: phoneSchema,
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  couponCode: z.string().trim().toUpperCase().max(32).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Place an order.
 *
 * The sequence deliberately mirrors what production will do:
 *
 *   1. validate the payload
 *   2. re-resolve every line from the database (prices from the client are
 *      never read — the request only carries IDs and quantities)
 *   3. re-check stock, because the cart may have sat open for an hour
 *   4. decrement stock atomically, rolling back if any line fails
 *   5. recompute the total server-side
 *   6. create the gateway order
 *   7. persist our order
 *
 * Step 4 is the one that prevents overselling. `adjustStock` refuses to take
 * stock below zero and reports it, so two shoppers racing for the last piece
 * cannot both succeed.
 *
 * In production, step 7 writes a PENDING order and the `payment.captured`
 * webhook promotes it to PAID. On the mock provider there is no webhook, so
 * the order is marked PAID here to keep the demo flow complete.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check the details you entered.',
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const repo = getRepository();

  // --- 2 & 3: resolve and re-check ----------------------------------------
  const variants = await repo.getVariantsByIds(input.lines.map((l) => l.variantId));
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: CartLine[] = [];
  for (const l of input.lines) {
    const variant = byId.get(l.variantId);
    if (!variant) {
      return NextResponse.json(
        { error: 'An item in your bag is no longer available. Please review your bag.' },
        { status: 409 },
      );
    }
    if (variant.stock < l.quantity) {
      return NextResponse.json(
        {
          error:
            variant.stock === 0
              ? `${variant.product.title} (${variant.size}) has sold out.`
              : `Only ${variant.stock} left of ${variant.product.title} (${variant.size}).`,
        },
        { status: 409 },
      );
    }

    const primary = variant.product.images.find((i) => i.isPrimary) ?? variant.product.images[0];
    const quantity = clampQuantity(l.quantity, variant.stock);

    lines.push({
      variantId: variant.id,
      productId: variant.product.id,
      slug: variant.product.slug,
      title: variant.product.title,
      size: variant.size,
      colour: variant.colour,
      imageUrl: primary?.url ?? '',
      imageAlt: primary?.alt ?? variant.product.title,
      unitPricePaise: variant.pricePaise,
      compareAtPaise: variant.product.compareAtPaise,
      quantity,
      lineTotalPaise: variant.pricePaise * quantity,
      availableStock: variant.stock,
      inStock: true,
    });
  }

  // --- 5: totals, server-side ---------------------------------------------
  const subtotal = lines.reduce((s, l) => s + l.lineTotalPaise, 0);

  let appliedCoupon = null;
  if (input.couponCode) {
    const coupon = await repo.getCouponByCode(input.couponCode);
    const evaluation = evaluateCoupon(coupon, subtotal);
    if (evaluation.ok) appliedCoupon = evaluation.applied;
    // An invalid coupon is not fatal — the order proceeds at full price rather
    // than failing checkout over a discount that expired mid-session.
  }

  const totals = calculateTotals(lines, {
    coupon: appliedCoupon,
    paymentMethod: input.paymentMethod,
  });

  // --- 4: decrement stock, with rollback ----------------------------------
  const decremented: { variantId: string; quantity: number }[] = [];
  for (const line of lines) {
    const result = await repo.adjustStock(line.variantId, -line.quantity);
    if (!result.ok) {
      // Someone took the last one between our check and now. Put back
      // everything already taken so we do not strand inventory.
      for (const d of decremented) await repo.adjustStock(d.variantId, d.quantity);
      return NextResponse.json(
        { error: `${line.title} (${line.size}) just sold out. Please review your bag.` },
        { status: 409 },
      );
    }
    decremented.push({ variantId: line.variantId, quantity: line.quantity });
  }

  try {
    // --- 6: gateway order -------------------------------------------------
    const orderNumber = generateOrderNumber();
    const provider = getPaymentProvider();

    let providerOrderId: string | null = null;
    if (input.paymentMethod === 'RAZORPAY') {
      const gatewayOrder = await provider.createOrder({
        amountPaise: totals.totalPaise,
        receipt: orderNumber,
        customerEmail: input.email,
        customerPhone: input.phone,
      });
      providerOrderId = gatewayOrder.providerOrderId;
    }

    // --- 7: persist -------------------------------------------------------
    const now = new Date().toISOString();

    const items: OrderItem[] = lines.map((l, i) => ({
      id: `${orderNumber}-item-${i + 1}`,
      variantId: l.variantId,
      productSlug: l.slug,
      // Snapshots — editing the product later must not rewrite order history.
      titleSnapshot: l.title,
      sizeSnapshot: l.size,
      colourSnapshot: l.colour,
      imageUrlSnapshot: l.imageUrl,
      unitPricePaise: l.unitPricePaise,
      quantity: l.quantity,
      lineTotalPaise: l.lineTotalPaise,
    }));

    const order: Order = {
      id: `order-${orderNumber}`,
      orderNumber,
      customerId: null,
      email: input.email,
      phone: input.phone,
      items,
      subtotalPaise: totals.subtotalPaise,
      discountPaise: totals.discountPaise,
      shippingPaise: totals.shippingPaise,
      taxPaise: totals.taxPaise,
      totalPaise: totals.totalPaise,
      // COD is confirmed immediately; card orders would sit PENDING until the
      // webhook lands. The mock gateway has no webhook, so it resolves here.
      status: input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PAID',
      paymentMethod: input.paymentMethod,
      couponCode: appliedCoupon?.code ?? null,
      shippingAddress: {
        id: `addr-${orderNumber}`,
        fullName: input.shippingAddress.fullName,
        phone: input.shippingAddress.phone,
        line1: input.shippingAddress.line1,
        line2: input.shippingAddress.line2 || null,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        pincode: input.shippingAddress.pincode,
        country: input.shippingAddress.country,
        isDefault: true,
      },
      shipment: {
        id: `ship-${orderNumber}`,
        awbCode: null,
        courierName: null,
        status: 'Awaiting pickup',
        trackingUrl: null,
        estimatedDelivery: new Date(Date.now() + 5 * 86400_000).toISOString(),
        events: [
          {
            status: 'Order placed',
            description: 'We have received your order',
            location: null,
            occurredAt: now,
          },
        ],
      },
      placedAt: now,
      updatedAt: now,
      notes: input.notes || null,
    };

    await repo.createOrder(order);

    return NextResponse.json({
      ok: true,
      orderNumber,
      totalPaise: totals.totalPaise,
      providerOrderId,
      paymentProvider: provider.name,
    });
  } catch (error) {
    // Anything after the decrement fails: give the stock back.
    for (const d of decremented) await repo.adjustStock(d.variantId, d.quantity);
    console.error('[checkout] order creation failed', error);
    return NextResponse.json(
      { error: 'We could not place your order. No payment was taken — please try again.' },
      { status: 500 },
    );
  }
}
