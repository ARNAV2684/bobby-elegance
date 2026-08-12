import { describe, expect, it } from 'vitest';
import {
  MoneyError,
  addPaise,
  discountPercent,
  formatPaise,
  multiplyPaise,
  paiseToRupees,
  percentOfPaise,
  rupeesToPaise,
} from './money';
import { calculateTotals, evaluateCoupon, gstRateForUnitPrice, includedGstPaise } from './cart';
import type { CartLine, Coupon } from './types';

const line = (unitPricePaise: number, quantity = 1): CartLine => ({
  variantId: `v-${unitPricePaise}-${quantity}`,
  productId: 'p1',
  slug: 'test',
  title: 'Test',
  size: 'M',
  colour: 'Maroon',
  imageUrl: '/x.jpg',
  imageAlt: 'x',
  unitPricePaise,
  compareAtPaise: null,
  quantity,
  lineTotalPaise: unitPricePaise * quantity,
  availableStock: 50,
  inStock: true,
});

describe('money', () => {
  it('converts rupees to paise without float drift', () => {
    expect(rupeesToPaise(6995)).toBe(699500);
    expect(rupeesToPaise(0.1)).toBe(10);
    expect(rupeesToPaise(19.99)).toBe(1999);
  });

  it('survives the classic 0.1 + 0.2 float trap', () => {
    // In rupee floats this is 0.30000000000000004. In paise it is exactly 30.
    expect(addPaise(rupeesToPaise(0.1), rupeesToPaise(0.2))).toBe(30);
    expect(paiseToRupees(addPaise(rupeesToPaise(0.1), rupeesToPaise(0.2)))).toBe(0.3);
  });

  it('rejects non-integer paise', () => {
    expect(() => addPaise(10.5)).toThrow(MoneyError);
    expect(() => multiplyPaise(10.5, 2)).toThrow(MoneyError);
  });

  it('rejects negative and fractional quantities', () => {
    expect(() => multiplyPaise(1000, -1)).toThrow(MoneyError);
    expect(() => multiplyPaise(1000, 1.5)).toThrow(MoneyError);
  });

  it('formats with Indian digit grouping', () => {
    // Lakh grouping, not the western 1,234,567.
    expect(formatPaise(123456700)).toBe('₹12,34,567');
    expect(formatPaise(699500)).toBe('₹6,995');
  });

  it('shows paise only when the amount has them', () => {
    expect(formatPaise(699500)).toBe('₹6,995');
    expect(formatPaise(699550)).toBe('₹6,995.50');
  });

  it('computes discount percentages', () => {
    expect(discountPercent(699500, 999500)).toBe(30);
    expect(discountPercent(999500, 999500)).toBe(0);
    expect(discountPercent(999500, 0)).toBe(0);
  });

  it('rounds percentages to the nearest paisa', () => {
    expect(percentOfPaise(99999, 10)).toBe(10000);
  });
});

describe('GST', () => {
  it('bands by per-piece price', () => {
    expect(gstRateForUnitPrice(99900)).toBe(5); // ₹999  -> 5%
    expect(gstRateForUnitPrice(100000)).toBe(12); // ₹1000 -> 12%
    expect(gstRateForUnitPrice(699500)).toBe(12);
  });

  it('extracts tax already included in the price', () => {
    // ₹1,120 inclusive at 12% contains ₹120 of GST.
    expect(includedGstPaise(112000, 12)).toBe(12000);
    // ₹1,050 inclusive at 5% contains ₹50.
    expect(includedGstPaise(105000, 5)).toBe(5000);
  });
});

describe('cart totals', () => {
  it('sums lines and counts items', () => {
    const t = calculateTotals([line(699500, 2), line(499500)]);
    expect(t.subtotalPaise).toBe(699500 * 2 + 499500);
    expect(t.itemCount).toBe(3);
  });

  it('charges flat shipping below the free threshold', () => {
    const t = calculateTotals([line(99900)]);
    expect(t.shippingPaise).toBe(9900);
    expect(t.totalPaise).toBe(99900 + 9900);
  });

  it('ships free at or above the threshold', () => {
    const t = calculateTotals([line(199900)]);
    expect(t.shippingPaise).toBe(0);
    expect(t.freeShippingRemainingPaise).toBe(0);
  });

  it('reports how far the customer is from free shipping', () => {
    const t = calculateTotals([line(150000)]);
    expect(t.freeShippingRemainingPaise).toBe(49900);
  });

  it('reinstates shipping when a coupon drops the order under the threshold', () => {
    // ₹2,100 qualifies for free shipping; a ₹500 coupon takes it to ₹1,600.
    const t = calculateTotals([line(210000)], {
      coupon: { code: 'X', description: '', discountPaise: 50000 },
    });
    expect(t.shippingPaise).toBe(9900);
    expect(t.totalPaise).toBe(210000 - 50000 + 9900);
  });

  it('adds the COD fee', () => {
    const t = calculateTotals([line(250000)], { paymentMethod: 'COD' });
    expect(t.shippingPaise).toBe(5000);
  });

  it('never lets a discount exceed the subtotal', () => {
    const t = calculateTotals([line(50000)], {
      coupon: { code: 'BIG', description: '', discountPaise: 999999 },
    });
    expect(t.discountPaise).toBe(50000);
    expect(t.totalPaise).toBeGreaterThanOrEqual(0);
  });

  it('charges nothing to ship an empty cart', () => {
    const t = calculateTotals([]);
    expect(t.shippingPaise).toBe(0);
    expect(t.totalPaise).toBe(0);
    expect(t.itemCount).toBe(0);
  });

  it('reports tax as included, not added on top', () => {
    const t = calculateTotals([line(112000)]);
    expect(t.taxPaise).toBe(12000);
    // The customer pays the sticker price plus shipping — tax is NOT added.
    expect(t.totalPaise).toBe(112000 + 9900);
  });
});

describe('coupons', () => {
  const base: Coupon = {
    id: 'c1',
    code: 'FESTIVE10',
    description: '10% off',
    type: 'PERCENT',
    value: 10,
    minOrderPaise: 100000,
    maxDiscountPaise: null,
    usageLimit: null,
    usedCount: 0,
    startsAt: '2020-01-01T00:00:00.000Z',
    expiresAt: null,
    isActive: true,
  };

  it('applies a valid percentage coupon', () => {
    const r = evaluateCoupon(base, 200000);
    expect(r.ok).toBe(true);
    expect(r.applied?.discountPaise).toBe(20000);
  });

  it('caps a percentage discount at maxDiscount', () => {
    const r = evaluateCoupon({ ...base, maxDiscountPaise: 15000 }, 200000);
    expect(r.applied?.discountPaise).toBe(15000);
  });

  it('rejects below the minimum order value', () => {
    const r = evaluateCoupon(base, 50000);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('more to use this coupon');
  });

  it('rejects an expired coupon', () => {
    const r = evaluateCoupon({ ...base, expiresAt: '2021-01-01T00:00:00.000Z' }, 200000);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('This coupon has expired.');
  });

  it('rejects an exhausted coupon', () => {
    const r = evaluateCoupon({ ...base, usageLimit: 5, usedCount: 5 }, 200000);
    expect(r.ok).toBe(false);
  });

  it('rejects an unknown code', () => {
    const r = evaluateCoupon(null, 200000);
    expect(r.ok).toBe(false);
    expect(r.applied).toBeNull();
  });
});
