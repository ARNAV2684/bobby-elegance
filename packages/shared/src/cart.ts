import {
  addPaise,
  clampPaise,
  multiplyPaise,
  percentOfPaise,
  subtractPaise,
  type Paise,
} from './money';
import type { AppliedCoupon, CartLine, CartTotals, Coupon } from './types';

/**
 * Pricing rules.
 *
 * These live in one place so the storefront, the admin order editor and the
 * (future) payment route all compute an identical total. The server is the only
 * thing that ever runs this — the browser sends variant IDs and quantities and
 * nothing else. A cart that arrives with prices attached is treated as hostile.
 */
export const PRICING = {
  /** Orders at or above this ship free. */
  freeShippingThresholdPaise: 199900 as Paise, // ₹1,999
  /** Flat domestic shipping below the threshold. */
  flatShippingPaise: 9900 as Paise, // ₹99
  /** Cash-on-delivery handling fee. */
  codFeePaise: 5000 as Paise, // ₹50
  /** Max units of a single variant per order — blunt guard against scalping. */
  maxQuantityPerLine: 10,
} as const;

/**
 * GST on apparel in India is banded by the per-piece price:
 *   < ₹1,000  -> 5%
 *   >= ₹1,000 -> 12%
 *
 * Displayed prices are GST-INCLUSIVE, which is the norm for Indian retail and
 * what the templates show. So this figure is extracted from the price for the
 * invoice breakdown — it is NOT added on top at checkout. A customer who sees
 * ₹6,995 pays exactly ₹6,995.
 */
export const GST = {
  lowerRatePercent: 5,
  upperRatePercent: 12,
  bandThresholdPaise: 100000 as Paise, // ₹1,000
} as const;

export function gstRateForUnitPrice(unitPricePaise: Paise): number {
  return unitPricePaise < GST.bandThresholdPaise ? GST.lowerRatePercent : GST.upperRatePercent;
}

/**
 * Extract the GST already baked into a tax-inclusive amount.
 * For an inclusive price P at rate r: tax = P × r / (100 + r).
 */
export function includedGstPaise(inclusiveAmountPaise: Paise, ratePercent: number): Paise {
  return Math.round((inclusiveAmountPaise * ratePercent) / (100 + ratePercent));
}

export interface CouponEvaluation {
  ok: boolean;
  applied: AppliedCoupon | null;
  /** Customer-facing reason when `ok` is false. */
  reason: string | null;
}

/**
 * Validate a coupon against a subtotal and compute its discount.
 * Every failure path returns a reason the UI can show verbatim.
 */
export function evaluateCoupon(
  coupon: Coupon | null | undefined,
  subtotalPaise: Paise,
  now: Date = new Date(),
): CouponEvaluation {
  if (!coupon) {
    return { ok: false, applied: null, reason: 'That coupon code is not valid.' };
  }
  if (!coupon.isActive) {
    return { ok: false, applied: null, reason: 'This coupon is no longer active.' };
  }
  if (new Date(coupon.startsAt) > now) {
    return { ok: false, applied: null, reason: 'This coupon is not active yet.' };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { ok: false, applied: null, reason: 'This coupon has expired.' };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, applied: null, reason: 'This coupon has reached its usage limit.' };
  }
  if (subtotalPaise < coupon.minOrderPaise) {
    const shortfall = subtractPaise(coupon.minOrderPaise, subtotalPaise);
    return {
      ok: false,
      applied: null,
      reason: `Add ₹${Math.ceil(shortfall / 100)} more to use this coupon.`,
    };
  }

  let discount: Paise =
    coupon.type === 'PERCENT'
      ? percentOfPaise(subtotalPaise, coupon.value)
      : (coupon.value as Paise);

  if (coupon.type === 'PERCENT' && coupon.maxDiscountPaise !== null) {
    discount = Math.min(discount, coupon.maxDiscountPaise);
  }

  // A discount can never exceed the subtotal — that would invert the order.
  discount = Math.min(discount, subtotalPaise);

  return {
    ok: true,
    applied: { code: coupon.code, description: coupon.description, discountPaise: discount },
    reason: null,
  };
}

export interface TotalsOptions {
  coupon?: AppliedCoupon | null;
  paymentMethod?: 'RAZORPAY' | 'COD';
  /** Overrides the flat rate when a real Shiprocket quote is available. */
  shippingOverridePaise?: Paise | null;
}

/**
 * The single source of truth for what a cart costs.
 *
 * Order of operations matters and is deliberate:
 *   1. subtotal  — sum of GST-inclusive line totals
 *   2. discount  — applied to the subtotal, never below zero
 *   3. shipping  — free-shipping test runs on the DISCOUNTED subtotal, so a
 *                  coupon that drops you under the threshold does reinstate the
 *                  shipping charge. This is the honest reading and matches what
 *                  Shiprocket will actually bill.
 *   4. COD fee   — folded into shipping so there is one "delivery" line
 *   5. tax       — extracted from the discounted subtotal for display only
 *   6. total     — subtotal − discount + shipping
 */
export function calculateTotals(lines: CartLine[], opts: TotalsOptions = {}): CartTotals {
  const subtotalPaise = lines.reduce<Paise>(
    (sum, line) => addPaise(sum, multiplyPaise(line.unitPricePaise, line.quantity)),
    0,
  );

  const itemCount = lines.reduce((n, line) => n + line.quantity, 0);

  const discountPaise = clampPaise(Math.min(opts.coupon?.discountPaise ?? 0, subtotalPaise));
  const discountedSubtotal = clampPaise(subtractPaise(subtotalPaise, discountPaise));

  let shippingPaise: Paise;
  if (opts.shippingOverridePaise != null) {
    shippingPaise = opts.shippingOverridePaise;
  } else if (itemCount === 0) {
    shippingPaise = 0;
  } else if (discountedSubtotal >= PRICING.freeShippingThresholdPaise) {
    shippingPaise = 0;
  } else {
    shippingPaise = PRICING.flatShippingPaise;
  }

  if (opts.paymentMethod === 'COD' && itemCount > 0) {
    shippingPaise = addPaise(shippingPaise, PRICING.codFeePaise);
  }

  // Tax is informational: it is already inside the line prices.
  const taxPaise = lines.reduce<Paise>((sum, line) => {
    const lineTotal = multiplyPaise(line.unitPricePaise, line.quantity);
    const rate = gstRateForUnitPrice(line.unitPricePaise);
    return addPaise(sum, includedGstPaise(lineTotal, rate));
  }, 0);

  const totalPaise = addPaise(discountedSubtotal, shippingPaise);

  const freeShippingRemainingPaise =
    itemCount === 0 || discountedSubtotal >= PRICING.freeShippingThresholdPaise
      ? 0
      : subtractPaise(PRICING.freeShippingThresholdPaise, discountedSubtotal);

  return {
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise,
    itemCount,
    freeShippingRemainingPaise,
  };
}

/** Clamp a requested quantity to what is actually purchasable. */
export function clampQuantity(requested: number, availableStock: number): number {
  if (!Number.isFinite(requested)) return 1;
  const ceiling = Math.min(PRICING.maxQuantityPerLine, Math.max(availableStock, 0));
  return Math.max(1, Math.min(Math.floor(requested), ceiling));
}
