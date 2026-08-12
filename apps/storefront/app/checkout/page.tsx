'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Banknote, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { INDIAN_STATES, formatPaise } from '@bobby/shared';
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Field,
  Input,
  SectionHeading,
  Select,
  Textarea,
  buttonClasses,
  cn,
} from '@bobby/ui';
import { useCart } from '@/lib/cart-context';

type PaymentMethod = 'RAZORPAY' | 'COD';

interface FormState {
  email: string;
  phone: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  phone: '',
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: 'Maharashtra',
  pincode: '',
  notes: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, resolved, couponCode, clear } = useCart();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [method, setMethod] = useState<PaymentMethod>('RAZORPAY');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // COD adds a handling fee, so totals must be recomputed when the method
  // changes. Re-resolving through the server keeps one source of truth.
  const [codTotals, setCodTotals] = useState<typeof resolved.totals | null>(null);

  useEffect(() => {
    if (method !== 'COD' || lines.length === 0) {
      setCodTotals(null);
      return;
    }
    const controller = new AbortController();
    fetch('/api/cart/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, couponCode: couponCode ?? undefined, paymentMethod: 'COD' }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => setCodTotals(d.totals))
      .catch(() => setCodTotals(null));
    return () => controller.abort();
  }, [method, lines, couponCode]);

  const totals = method === 'COD' && codTotals ? codTotals : resolved.totals;

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(form.phone.replace(/[\s\-()]/g, '')))
      next.phone = 'Enter a valid 10-digit Indian mobile number';
    if (form.fullName.trim().length < 2) next.fullName = 'Enter the full name';
    if (form.line1.trim().length < 5) next.line1 = 'Enter the flat, building and street';
    if (form.city.trim().length < 2) next.city = 'Enter the city';
    if (!/^[1-9]\d{5}$/.test(form.pincode)) next.pincode = 'Enter a valid 6-digit PIN code';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines,
          email: form.email,
          phone: form.phone,
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: 'India',
          },
          paymentMethod: method,
          couponCode: couponCode ?? '',
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      // With a real gateway this is where the Razorpay checkout widget opens.
      // On the mock provider the order is already settled, so go straight to
      // confirmation.
      clear();
      router.push(`/checkout/success/${data.orderNumber}`);
    } catch {
      setSubmitError('We could not reach the server. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <Container wide>
        <div className="py-16">
          <EmptyState
            icon={<ShoppingBag className="size-12" />}
            title="Nothing to check out"
            description="Your bag is empty."
            action={
              <Link href="/collections/womens" className={buttonClasses({ variant: 'primary' })}>
                Start shopping
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  return (
    <div className="py-12">
      <Container wide>
        <SectionHeading title="Checkout" eyebrow="Almost there" className="mb-10" as="h1" />

        <Alert tone="info" className="mb-8">
          <strong>Development mode.</strong> No payment gateway is connected, so no card details
          are collected and no money moves. Placing an order here creates a real order record you
          can view in the admin portal and track. Adding Razorpay is a matter of setting keys in{' '}
          <code>.env</code> — no code changes.
        </Alert>

        <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-8">
            {/* Contact */}
            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="font-display text-2xl text-maroon">
                1. Contact
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Email" required error={errors.email} htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    invalid={!!errors.email}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Mobile" required error={errors.phone} htmlFor="phone" hint="For delivery updates">
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    invalid={!!errors.phone}
                    placeholder="98200 12345"
                  />
                </Field>
              </div>
            </section>

            {/* Address */}
            <section aria-labelledby="address-heading">
              <h2 id="address-heading" className="font-display text-2xl text-maroon">
                2. Delivery address
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required error={errors.fullName} htmlFor="fullName" className="sm:col-span-2">
                  <Input
                    id="fullName"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={set('fullName')}
                    invalid={!!errors.fullName}
                  />
                </Field>
                <Field
                  label="Flat, building, street"
                  required
                  error={errors.line1}
                  htmlFor="line1"
                  className="sm:col-span-2"
                >
                  <Input
                    id="line1"
                    autoComplete="address-line1"
                    value={form.line1}
                    onChange={set('line1')}
                    invalid={!!errors.line1}
                  />
                </Field>
                <Field label="Area, landmark" htmlFor="line2" className="sm:col-span-2">
                  <Input
                    id="line2"
                    autoComplete="address-line2"
                    value={form.line2}
                    onChange={set('line2')}
                  />
                </Field>
                <Field label="City" required error={errors.city} htmlFor="city">
                  <Input
                    id="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={set('city')}
                    invalid={!!errors.city}
                  />
                </Field>
                <Field label="PIN code" required error={errors.pincode} htmlFor="pincode">
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={form.pincode}
                    onChange={set('pincode')}
                    invalid={!!errors.pincode}
                  />
                </Field>
                <Field label="State" required htmlFor="state" className="sm:col-span-2">
                  <Select id="state" value={form.state} onChange={set('state')} autoComplete="address-level1">
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Order notes" htmlFor="notes" className="sm:col-span-2" hint="Optional">
                  <Textarea id="notes" value={form.notes} onChange={set('notes')} rows={3} />
                </Field>
              </div>
            </section>

            {/* Payment */}
            <section aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="font-display text-2xl text-maroon">
                3. Payment
              </h2>
              <fieldset className="mt-4 flex flex-col gap-3">
                <legend className="sr-only">Payment method</legend>

                {(
                  [
                    {
                      value: 'RAZORPAY' as const,
                      icon: CreditCard,
                      title: 'Pay online',
                      body: 'UPI, cards, net banking and wallets',
                      note: 'Razorpay — connects when keys are added',
                    },
                    {
                      value: 'COD' as const,
                      icon: Banknote,
                      title: 'Cash on delivery',
                      body: 'Pay the courier when your order arrives',
                      note: `₹50 handling fee`,
                    },
                  ]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3.5 border p-4 transition-colors',
                      method === opt.value
                        ? 'border-maroon bg-cream-panel/40'
                        : 'border-line hover:border-line-strong',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={method === opt.value}
                      onChange={() => setMethod(opt.value)}
                      className="mt-1 size-4 accent-[var(--color-maroon)]"
                    />
                    <opt.icon className="mt-0.5 size-5 shrink-0 text-gold-muted" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-ink">{opt.title}</span>
                      <span className="block text-xs text-muted">{opt.body}</span>
                      <span className="mt-0.5 block text-[0.625rem] text-muted/80">{opt.note}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </section>
          </div>

          {/* Summary */}
          <aside aria-label="Order summary" className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-line bg-card p-6">
              <h2 className="font-display text-xl text-maroon">Your order</h2>

              <ul className="mt-4 divide-y divide-line border-y border-line">
                {resolved.lines.map((line) => (
                  <li key={line.variantId} className="flex gap-3 py-3">
                    <div className="relative aspect-2/3 w-14 shrink-0 overflow-hidden bg-cream-panel">
                      <Image src={line.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-maroon text-[0.625rem] text-cream tabular-nums">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-ink">{line.title}</p>
                      <p className="text-[0.625rem] text-muted">
                        {line.colour} · {line.size}
                      </p>
                    </div>
                    <p className="text-xs text-ink">{formatPaise(line.lineTotalPaise)}</p>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatPaise(totals.subtotalPaise)}</dd>
                </div>
                {totals.discountPaise > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Discount</dt>
                    <dd>−{formatPaise(totals.discountPaise)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">
                    Shipping{method === 'COD' ? ' + COD fee' : ''}
                  </dt>
                  <dd>
                    {totals.shippingPaise === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPaise(totals.shippingPaise)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3">
                  <dt className="text-base font-medium text-ink">Total</dt>
                  <dd className="font-display text-2xl font-semibold text-maroon">
                    {formatPaise(totals.totalPaise)}
                  </dd>
                </div>
              </dl>
              <p className="mt-1 text-[0.625rem] text-muted">
                Inclusive of {formatPaise(totals.taxPaise)} GST
              </p>

              {submitError && (
                <Alert tone="danger" className="mt-4">
                  {submitError}
                </Alert>
              )}

              <Button type="submit" size="lg" fullWidth loading={submitting} className="mt-5">
                <Lock className="size-3.5" />
                {submitting ? 'Placing order…' : `Place order · ${formatPaise(totals.totalPaise)}`}
              </Button>

              <p className="mt-3 text-center text-[0.625rem] leading-relaxed text-muted">
                By placing this order you agree to our{' '}
                <Link href="/policies/terms" className="text-maroon underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/policies/returns" className="text-maroon underline">
                  Returns Policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </form>
      </Container>
    </div>
  );
}
