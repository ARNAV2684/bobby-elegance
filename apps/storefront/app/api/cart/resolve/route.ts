import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@bobby/db';
import {
  calculateTotals,
  clampQuantity,
  evaluateCoupon,
  type CartLine,
  type ResolvedCart,
} from '@bobby/shared';

const bodySchema = z.object({
  lines: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .max(50),
  couponCode: z.string().trim().toUpperCase().max(32).optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD']).optional(),
});

/**
 * Price a cart.
 *
 * The browser sends variant IDs and quantities — nothing else. Every price,
 * discount, shipping charge and total is computed here from the database. This
 * is the rule that makes the cart tamper-proof: a request that claims a ₹24,995
 * lehenga costs ₹1 is simply ignored, because the client-supplied price is
 * never read.
 *
 * It also re-checks stock on every call, so a cart left open in a tab reflects
 * reality when the shopper returns.
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
      { error: 'Invalid cart payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lines: inputLines, couponCode, paymentMethod } = parsed.data;
  const repo = getRepository();
  const warnings: string[] = [];

  if (inputLines.length === 0) {
    const empty: ResolvedCart = {
      lines: [],
      totals: calculateTotals([]),
      appliedCoupon: null,
      warnings: [],
    };
    return NextResponse.json(empty);
  }

  const variants = await repo.getVariantsByIds(inputLines.map((l) => l.variantId));
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: CartLine[] = [];

  for (const input of inputLines) {
    const variant = byId.get(input.variantId);

    if (!variant) {
      warnings.push('An item in your bag is no longer available and has been removed.');
      continue;
    }

    if (variant.stock <= 0 || !variant.isAvailable) {
      warnings.push(`${variant.product.title} (${variant.size}) has sold out and was removed.`);
      continue;
    }

    const quantity = clampQuantity(input.quantity, variant.stock);
    if (quantity < input.quantity) {
      warnings.push(
        `Only ${variant.stock} left of ${variant.product.title} (${variant.size}) — quantity adjusted.`,
      );
    }

    const primary = variant.product.images.find((i) => i.isPrimary) ?? variant.product.images[0];

    lines.push({
      variantId: variant.id,
      productId: variant.product.id,
      slug: variant.product.slug,
      title: variant.product.title,
      size: variant.size,
      colour: variant.colour,
      imageUrl: primary?.url ?? '/images/placeholder.jpg',
      imageAlt: primary?.alt ?? variant.product.title,
      unitPricePaise: variant.pricePaise,
      compareAtPaise: variant.product.compareAtPaise,
      quantity,
      lineTotalPaise: variant.pricePaise * quantity,
      availableStock: variant.stock,
      inStock: true,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotalPaise, 0);

  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await repo.getCouponByCode(couponCode);
    const result = evaluateCoupon(coupon, subtotal);
    if (result.ok) {
      appliedCoupon = result.applied;
    } else if (result.reason) {
      warnings.push(result.reason);
    }
  }

  const resolved: ResolvedCart = {
    lines,
    totals: calculateTotals(lines, { coupon: appliedCoupon, paymentMethod }),
    appliedCoupon,
    warnings,
  };

  return NextResponse.json(resolved);
}
