'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPaise, PRICING } from '@bobby/shared';
import { Alert, Button, buttonClasses, EmptyState, Spinner } from '@bobby/ui';
import { useCart } from '@/lib/cart-context';

export function CartDrawer() {
  const { isOpen, closeCart, resolved, isLoading, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const { lines, totals } = resolved;
  const freeShippingProgress = Math.min(
    100,
    (totals.subtotalPaise / PRICING.freeShippingThresholdPaise) * 100,
  );

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="bg-ink/40 absolute inset-0" onClick={closeCart} aria-hidden="true" />

      <div className="bg-cream absolute inset-y-0 right-0 flex w-full max-w-md flex-col shadow-2xl">
        <header className="border-line flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-maroon text-xl">
            Your Bag{' '}
            <span className="text-muted text-sm">
              ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="text-ink hover:text-maroon flex size-11 items-center justify-center"
          >
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<ShoppingBag className="size-10" />}
              title="Your bag is empty"
              description="Once you add something you love, it will show up here."
              action={
                <Button onClick={closeCart} variant="primary">
                  Continue shopping
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            {totals.freeShippingRemainingPaise > 0 && (
              <div className="border-line bg-card border-b px-5 py-3">
                <p className="text-ink-soft text-xs">
                  Add{' '}
                  <strong className="text-maroon">
                    {formatPaise(totals.freeShippingRemainingPaise)}
                  </strong>{' '}
                  more for free shipping
                </p>
                <div className="bg-line mt-2 h-1 overflow-hidden rounded-full">
                  <div
                    className="bg-gold h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
            {totals.freeShippingRemainingPaise === 0 && totals.itemCount > 0 && (
              <p className="border-line bg-success-soft text-success border-b px-5 py-2.5 text-xs">
                ✓ Your order ships free
              </p>
            )}

            {resolved.warnings.length > 0 && (
              <div className="px-5 pt-3">
                <Alert tone="warning">
                  <ul className="list-inside list-disc space-y-0.5">
                    {resolved.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </Alert>
              </div>
            )}

            <ul className="divide-line flex-1 divide-y overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeCart}
                    className="aspect-2/3 bg-cream-panel relative w-20 shrink-0 overflow-hidden"
                  >
                    <Image
                      src={line.imageUrl}
                      alt={line.imageAlt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${line.slug}`}
                      onClick={closeCart}
                      className="text-ink hover:text-maroon text-sm"
                    >
                      {line.title}
                    </Link>
                    <p className="text-muted mt-0.5 text-xs">
                      {line.colour} · Size {line.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="border-line flex items-center border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.title}`}
                          className="text-ink hover:bg-cream-panel flex size-8 items-center justify-center"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-xs tabular-nums" aria-live="polite">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                          disabled={line.quantity >= Math.min(10, line.availableStock)}
                          aria-label={`Increase quantity of ${line.title}`}
                          className="text-ink hover:bg-cream-panel flex size-8 items-center justify-center disabled:opacity-40"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <span className="text-maroon text-sm font-medium">
                        {formatPaise(line.lineTotalPaise)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(line.variantId)}
                    aria-label={`Remove ${line.title} from bag`}
                    className="text-muted hover:text-danger self-start p-1 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-line bg-card border-t px-5 py-4">
              <dl className="space-y-1.5 text-sm">
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
                    {totals.shippingPaise === 0 ? 'Free' : formatPaise(totals.shippingPaise)}
                  </dd>
                </div>
                <div className="border-line flex justify-between border-t pt-2 text-base">
                  <dt className="text-ink font-medium">Total</dt>
                  <dd className="font-display text-maroon text-xl font-semibold">
                    {isLoading ? <Spinner className="size-4" /> : formatPaise(totals.totalPaise)}
                  </dd>
                </div>
              </dl>

              <p className="text-muted mt-1 text-[0.625rem]">
                Inclusive of all taxes ({formatPaise(totals.taxPaise)} GST)
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}
                >
                  Proceed to checkout
                </Link>
                <Button fullWidth variant="ghost" onClick={closeCart}>
                  Continue shopping
                </Button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
