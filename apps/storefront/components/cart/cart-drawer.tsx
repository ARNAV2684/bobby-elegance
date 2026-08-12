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
      <div className="absolute inset-0 bg-ink/40" onClick={closeCart} aria-hidden="true" />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl text-maroon">
            Your Bag{' '}
            <span className="text-sm text-muted">
              ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="flex size-11 items-center justify-center text-ink hover:text-maroon"
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
              <div className="border-b border-line bg-card px-5 py-3">
                <p className="text-xs text-ink-soft">
                  Add{' '}
                  <strong className="text-maroon">
                    {formatPaise(totals.freeShippingRemainingPaise)}
                  </strong>{' '}
                  more for free shipping
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
            {totals.freeShippingRemainingPaise === 0 && totals.itemCount > 0 && (
              <p className="border-b border-line bg-success-soft px-5 py-2.5 text-xs text-success">
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

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeCart}
                    className="relative aspect-2/3 w-20 shrink-0 overflow-hidden bg-cream-panel"
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
                      className="text-sm text-ink hover:text-maroon"
                    >
                      {line.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {line.colour} · Size {line.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.title}`}
                          className="flex size-8 items-center justify-center text-ink hover:bg-cream-panel"
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
                          className="flex size-8 items-center justify-center text-ink hover:bg-cream-panel disabled:opacity-40"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <span className="text-sm font-medium text-maroon">
                        {formatPaise(line.lineTotalPaise)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(line.variantId)}
                    aria-label={`Remove ${line.title} from bag`}
                    className="self-start p-1 text-muted transition-colors hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line bg-card px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="text-ink">{formatPaise(totals.subtotalPaise)}</dd>
                </div>
                {totals.discountPaise > 0 && (
                  <div className="flex justify-between text-success">
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
                <div className="flex justify-between border-t border-line pt-2 text-base">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd className="font-display text-xl font-semibold text-maroon">
                    {isLoading ? <Spinner className="size-4" /> : formatPaise(totals.totalPaise)}
                  </dd>
                </div>
              </dl>

              <p className="mt-1 text-[0.625rem] text-muted">
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
