/**
 * Money.
 *
 * Every monetary amount in this codebase is an integer number of **paise**
 * (1 rupee = 100 paise). There are no floating-point rupees anywhere, ever.
 *
 * Why: 0.1 + 0.2 !== 0.3 in IEEE-754. On a cart of a dozen items with a
 * percentage discount and GST, float drift produces totals that are off by a
 * paisa — and a payment gateway that receives a different amount than the one
 * displayed will reject the order or, worse, charge the wrong sum.
 *
 * Razorpay's API also takes amounts in paise, so this representation is what
 * goes over the wire unchanged.
 */

/** An integer count of paise. `69950` is ₹699.50 */
export type Paise = number;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

function assertPaise(value: number, label = 'amount'): asserts value is Paise {
  if (!Number.isInteger(value)) {
    throw new MoneyError(`${label} must be an integer number of paise, received ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`${label} exceeds the safe integer range: ${value}`);
  }
}

/** Convert whole/fractional rupees to paise. Rounds half away from zero. */
export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isFinite(rupees)) {
    throw new MoneyError(`Cannot convert non-finite value to paise: ${rupees}`);
  }
  return Math.round(rupees * 100);
}

/** Convert paise to a rupee float. For DISPLAY ONLY — never do arithmetic on the result. */
export function paiseToRupees(paise: Paise): number {
  assertPaise(paise);
  return paise / 100;
}

export function addPaise(...amounts: Paise[]): Paise {
  return amounts.reduce<Paise>((sum, a) => {
    assertPaise(a);
    return sum + a;
  }, 0);
}

export function subtractPaise(a: Paise, b: Paise): Paise {
  assertPaise(a);
  assertPaise(b);
  return a - b;
}

export function multiplyPaise(amount: Paise, quantity: number): Paise {
  assertPaise(amount);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new MoneyError(`Quantity must be a non-negative integer, received ${quantity}`);
  }
  return amount * quantity;
}

/**
 * Take a percentage of an amount, rounding to the nearest paisa.
 *
 * Rounds half away from zero so a 10% discount on ₹99.99 is a predictable
 * ₹10.00 rather than depending on float representation.
 */
export function percentOfPaise(amount: Paise, percent: number): Paise {
  assertPaise(amount);
  if (!Number.isFinite(percent) || percent < 0) {
    throw new MoneyError(`Percent must be a non-negative finite number, received ${percent}`);
  }
  return Math.round((amount * percent) / 100);
}

/** Clamp to zero — a discount must never make a line negative. */
export function clampPaise(amount: Paise, min: Paise = 0): Paise {
  assertPaise(amount);
  assertPaise(min, 'minimum');
  return Math.max(amount, min);
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const INR_PRECISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format paise for display, e.g. `699500` -> `₹6,995`.
 *
 * Indian digit grouping (lakh/crore) comes from the `en-IN` locale, so
 * ₹12,34,567 groups correctly rather than the western ₹1,234,567.
 *
 * Whole rupee amounts hide the decimals — matching how the templates price
 * everything (₹6,995 not ₹6,995.00). Amounts with paise show both digits.
 */
export function formatPaise(paise: Paise, opts?: { forcePaise?: boolean }): string {
  assertPaise(paise);
  const rupees = paise / 100;
  if (opts?.forcePaise || paise % 100 !== 0) return INR_PRECISE.format(rupees);
  return INR.format(rupees);
}

/** Format without the currency symbol, for inputs and CSV export. */
export function formatPaiseBare(paise: Paise): string {
  assertPaise(paise);
  return (paise / 100).toFixed(2);
}

/** Percentage saved when comparing a sale price against its struck-through original. */
export function discountPercent(pricePaise: Paise, compareAtPaise: Paise): number {
  assertPaise(pricePaise);
  assertPaise(compareAtPaise);
  if (compareAtPaise <= 0 || compareAtPaise <= pricePaise) return 0;
  return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
}
