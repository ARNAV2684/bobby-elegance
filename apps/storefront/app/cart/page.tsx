'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { formatPaise } from '@bobby/shared';
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Input,
  SectionHeading,
  buttonClasses,
} from '@bobby/ui';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { resolved, isLoading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const { lines, totals, appliedCoupon, warnings } = resolved;

  if (lines.length === 0) {
    return (
      <Container wide>
        <div className="py-16">
          <EmptyState
            icon={<ShoppingBag className="size-12" />}
            title="Your bag is empty"
            description="Twenty years of ethnic wear is waiting. Have a look around."
            action={
              <Link
                href="/collections/womens"
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
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
        <SectionHeading
          title="Your Bag"
          eyebrow={`${totals.itemCount} items`}
          className="mb-10"
          as="h1"
        />

        {warnings.length > 0 && (
          <Alert tone="warning" className="mb-6">
            <ul className="list-inside list-disc space-y-0.5">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Lines */}
          <ul className="divide-line border-line divide-y border-y">
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/products/${line.slug}`}
                  className="aspect-2/3 bg-cream-panel relative w-24 shrink-0 overflow-hidden sm:w-28"
                >
                  <Image
                    src={line.imageUrl}
                    alt={line.imageAlt}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/products/${line.slug}`}
                        className="text-ink hover:text-maroon text-sm"
                      >
                        {line.title}
                      </Link>
                      <p className="text-muted mt-1 text-xs">
                        {line.colour} · Size {line.size}
                      </p>
                      {line.availableStock <= 3 && (
                        <p className="text-warning mt-1 text-xs">Only {line.availableStock} left</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.variantId)}
                      aria-label={`Remove ${line.title}`}
                      className="text-muted hover:text-danger p-1 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="border-line flex items-center border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.title}`}
                        className="hover:bg-cream-panel flex size-9 items-center justify-center"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-9 text-center text-sm tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                        disabled={line.quantity >= Math.min(10, line.availableStock)}
                        aria-label={`Increase quantity of ${line.title}`}
                        className="hover:bg-cream-panel flex size-9 items-center justify-center disabled:opacity-40"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-maroon text-lg font-semibold">
                        {formatPaise(line.lineTotalPaise)}
                      </p>
                      {line.quantity > 1 && (
                        <p className="text-muted text-xs">
                          {formatPaise(line.unitPricePaise)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside aria-label="Order summary" className="lg:sticky lg:top-32 lg:self-start">
            <div className="border-line bg-card border p-6">
              <h2 className="font-display text-maroon text-xl">Order summary</h2>

              {/* Coupon */}
              <div className="border-line mt-5 border-b pb-5">
                {appliedCoupon ? (
                  <div className="bg-success-soft flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="text-success flex items-center gap-2 text-sm">
                      <Tag className="size-3.5" />
                      <strong>{appliedCoupon.code}</strong> applied
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      aria-label="Remove coupon"
                      className="text-success hover:opacity-70"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      applyCoupon(code);
                      setCode('');
                    }}
                    className="flex gap-2"
                  >
                    <label htmlFor="coupon" className="sr-only">
                      Coupon code
                    </label>
                    <Input
                      id="coupon"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1"
                    />
                    <Button type="submit" variant="subtle" disabled={!code.trim()}>
                      Apply
                    </Button>
                  </form>
                )}
                <p className="text-muted mt-2 text-[0.625rem]">
                  Try <code className="text-maroon">WELCOME10</code> or{' '}
                  <code className="text-maroon">FLAT500</code>
                </p>
              </div>

              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="text-ink">{formatPaise(totals.subtotalPaise)}</dd>
                </div>
                {totals.discountPaise > 0 && (
                  <div className="text-success flex justify-between">
                    <dt>Discount</dt>
                    <dd>−{formatPaise(totals.discountPaise)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="text-ink">
                    {totals.shippingPaise === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPaise(totals.shippingPaise)
                    )}
                  </dd>
                </div>
                <div className="border-line flex justify-between border-t pt-3">
                  <dt className="text-ink text-base font-medium">Total</dt>
                  <dd className="font-display text-maroon text-2xl font-semibold">
                    {formatPaise(totals.totalPaise)}
                  </dd>
                </div>
              </dl>

              <p className="text-muted mt-1.5 text-[0.625rem]">
                Inclusive of {formatPaise(totals.taxPaise)} GST
              </p>

              <Link
                href="/checkout"
                className={buttonClasses({
                  variant: 'primary',
                  size: 'lg',
                  fullWidth: true,
                  className: 'mt-5',
                })}
                aria-disabled={isLoading}
              >
                Checkout
              </Link>

              <Link
                href="/collections/womens"
                className={buttonClasses({ variant: 'ghost', fullWidth: true, className: 'mt-2' })}
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
