'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search } from 'lucide-react';
import { BRAND } from '@bobby/shared';
import { Alert, Button, Container, Field, Input, Ornament } from '@bobby/ui';

export default function TrackLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = orderNumber.trim().toUpperCase();

    if (!/^BE[0-9A-Z]{6,12}$/.test(value)) {
      setError('Order numbers look like BE2A4F9KXM — check your confirmation email.');
      return;
    }

    setError(null);
    setChecking(true);

    const res = await fetch(`/api/orders/${value}/exists`);
    if (res.ok) {
      router.push(`/track/${value}`);
    } else {
      setError('We could not find that order number. Check it and try again.');
      setChecking(false);
    }
  }

  return (
    <div className="py-16">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="flex flex-col items-center text-center">
            <span className="border-gold-muted/40 text-gold-muted flex size-14 items-center justify-center rounded-full border">
              <Package className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-display text-maroon mt-5 text-3xl">Track your order</h1>
            <Ornament className="mt-3" />
            <p className="text-muted mt-4 text-sm">
              Enter the order number from your confirmation email.
            </p>
          </div>

          <form onSubmit={submit} noValidate className="mt-8">
            <Field label="Order number" error={error} htmlFor="orderNumber">
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value.toUpperCase());
                  setError(null);
                }}
                invalid={!!error}
                placeholder="BE2A4F9KXM"
                autoComplete="off"
                className="text-center font-mono tracking-widest"
              />
            </Field>

            <Button type="submit" size="lg" fullWidth loading={checking} className="mt-4">
              <Search className="size-4" />
              Track order
            </Button>
          </form>

          <Alert tone="info" className="mt-8">
            Demo order numbers you can try: <code>BE7K3M9QX2</code> (delivered),{' '}
            <code>BE4TP82NRH</code> (shipped), <code>BE2XW5JD7F</code> (packed).
          </Alert>

          <p className="text-muted mt-6 text-center text-xs">
            Lost your order number? Call us on{' '}
            <a href={`tel:+91${BRAND.contact.phone}`} className="text-maroon hover:underline">
              {BRAND.contact.phoneDisplay}
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
