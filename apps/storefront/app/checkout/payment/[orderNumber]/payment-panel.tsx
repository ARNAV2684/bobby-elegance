'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, CreditCard, Landmark, Lock, Smartphone, XCircle } from 'lucide-react';
import { formatPaise } from '@bobby/shared';
import { Alert, Button, Field, Input, cn } from '@bobby/ui';

type Method = 'upi' | 'card' | 'netbanking';

const METHODS: { id: Method; label: string; icon: typeof Smartphone; hint: string }[] = [
  { id: 'upi', label: 'UPI', icon: Smartphone, hint: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Card', icon: CreditCard, hint: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark, hint: 'All major Indian banks' },
];

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'];

/**
 * The payment screen.
 *
 * On the mock provider this is a self-contained simulation: it collects
 * nothing real, sends no card data anywhere, and settles the order through
 * /api/payments/confirm. It exists so the demo has a visible payment step
 * rather than jumping from checkout straight to a confirmation page.
 *
 * When Razorpay is configured this component is replaced by opening Razorpay's
 * own hosted widget — at which point no card field ever renders in our DOM and
 * we never touch card data. The fields below are deliberately inert and
 * labelled as such.
 */
export function PaymentPanel({
  orderNumber,
  totalPaise,
  isMock,
}: {
  orderNumber: string;
  totalPaise: number;
  isMock: boolean;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>('upi');
  const [processing, setProcessing] = useState<'pay' | 'fail' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function settle(outcome: 'success' | 'failure') {
    setError(null);
    setProcessing(outcome === 'success' ? 'pay' : 'fail');

    // A beat of latency so the demo reads like a real gateway round-trip.
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, outcome }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Payment could not be processed.');
        setProcessing(null);
        return;
      }

      if (data.status === 'CANCELLED') {
        router.push(`/checkout/payment/${orderNumber}?failed=1`);
        router.refresh();
        return;
      }

      router.push(`/checkout/success/${orderNumber}`);
    } catch {
      setError('We could not reach the payment server. Your card has not been charged.');
      setProcessing(null);
    }
  }

  return (
    <div className="border-line bg-card border">
      {/* Gateway-style header */}
      <div className="border-line bg-cream-panel/50 flex items-center justify-between gap-4 border-b px-5 py-4">
        <div>
          <p className="label-caps text-muted">Paying</p>
          <p className="font-display text-maroon text-2xl font-semibold">
            {formatPaise(totalPaise)}
          </p>
        </div>
        <div className="text-right">
          <p className="label-caps text-muted">Order</p>
          <p className="text-ink font-mono text-xs">{orderNumber}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[180px_1fr]">
        {/* Method rail */}
        <div
          className="border-line flex gap-1 border-b p-2 sm:flex-col sm:border-b-0 sm:border-r"
          role="tablist"
          aria-label="Payment method"
        >
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={method === m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                'flex flex-1 items-center gap-2.5 rounded-sm px-3 py-3 text-left text-sm transition-colors sm:flex-none',
                method === m.id ? 'bg-maroon text-cream' : 'text-ink hover:bg-cream-panel',
              )}
            >
              <m.icon className="size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="block">{m.label}</span>
                <span
                  className={cn(
                    'hidden text-[0.625rem] sm:block',
                    method === m.id ? 'text-cream/70' : 'text-muted',
                  )}
                >
                  {m.hint}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Method form */}
        <div className="p-5">
          {isMock && (
            <Alert tone="info" className="mb-4">
              <strong>Simulated gateway.</strong> These fields are inert — nothing is sent anywhere
              and no card details are collected. Use the buttons below to simulate either outcome.
            </Alert>
          )}

          {method === 'upi' && (
            <Field label="UPI ID" htmlFor="upi" hint="Example: yourname@okhdfcbank">
              <Input id="upi" placeholder="yourname@bank" autoComplete="off" disabled={isMock} />
            </Field>
          )}

          {method === 'card' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Card number" htmlFor="card" className="sm:col-span-2">
                <Input
                  id="card"
                  inputMode="numeric"
                  placeholder="4111 1111 1111 1111"
                  autoComplete="off"
                  disabled={isMock}
                />
              </Field>
              <Field label="Expiry" htmlFor="exp">
                <Input id="exp" placeholder="MM / YY" autoComplete="off" disabled={isMock} />
              </Field>
              <Field label="CVV" htmlFor="cvv">
                <Input id="cvv" placeholder="123" autoComplete="off" disabled={isMock} />
              </Field>
            </div>
          )}

          {method === 'netbanking' && (
            <fieldset>
              <legend className="label-caps text-ink-soft mb-3">Choose your bank</legend>
              <div className="flex flex-col gap-2">
                {BANKS.map((bank) => (
                  <label
                    key={bank}
                    className="text-ink-soft flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <input
                      type="radio"
                      name="bank"
                      defaultChecked={bank === BANKS[0]}
                      className="size-4 accent-[var(--color-maroon)]"
                      disabled={isMock}
                    />
                    {bank}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error && (
            <Alert tone="danger" className="mt-4">
              {error}
            </Alert>
          )}

          <Button
            size="lg"
            fullWidth
            className="mt-5"
            onClick={() => settle('success')}
            loading={processing === 'pay'}
            disabled={processing !== null}
          >
            <Lock className="size-3.5" />
            {processing === 'pay' ? 'Processing…' : `Pay ${formatPaise(totalPaise)}`}
          </Button>

          {isMock && (
            <button
              type="button"
              onClick={() => settle('failure')}
              disabled={processing !== null}
              className="text-muted hover:text-danger mt-3 flex w-full items-center justify-center gap-1.5 text-xs transition-colors disabled:opacity-50"
            >
              <XCircle className="size-3.5" />
              {processing === 'fail' ? 'Cancelling…' : 'Simulate a failed payment'}
            </button>
          )}

          <p className="text-muted mt-4 flex items-center justify-center gap-1.5 text-[0.625rem]">
            <Banknote className="size-3" aria-hidden="true" />
            Secured by {isMock ? 'a simulated gateway' : 'Razorpay'}
          </p>
        </div>
      </div>
    </div>
  );
}
