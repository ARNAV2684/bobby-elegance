import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { getRepository } from '@bobby/db';
import { BRAND, formatPaise } from '@bobby/shared';
import { Alert, Container, Ornament } from '@bobby/ui';
import { isMockPayments } from '@/lib/payments';
import { PaymentPanel } from './payment-panel';

export const metadata: Metadata = {
  title: 'Payment',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  const { orderNumber } = await params;
  const { failed } = await searchParams;

  const order = await getRepository().getOrderByNumber(orderNumber);
  if (!order) notFound();

  // Already paid — sending the shopper back to a payment screen would invite a
  // second charge. Bounce to the confirmation instead.
  if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
    redirect(`/checkout/success/${order.orderNumber}`);
  }

  const cancelled = order.status === 'CANCELLED';

  return (
    <div className="py-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <span className="label-caps text-gold-muted">Step 2 of 2</span>
            <h1 className="font-display text-maroon mt-2 text-3xl">Complete your payment</h1>
            <Ornament className="mt-3" />
          </div>

          {(cancelled || failed) && (
            <Alert tone="danger" className="mt-8">
              <strong>That payment did not go through.</strong> Nothing has been charged and the
              items have been returned to stock. You can start a new order from your bag.
            </Alert>
          )}

          {cancelled ? (
            <div className="mt-6 text-center">
              <Link href="/cart" className="text-maroon text-sm underline hover:no-underline">
                Back to your bag
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <PaymentPanel
                orderNumber={order.orderNumber}
                totalPaise={order.totalPaise}
                isMock={isMockPayments()}
              />

              {/* Order summary */}
              <aside aria-label="Order summary" className="border-line bg-card border p-5">
                <h2 className="font-display text-maroon text-lg">Your order</h2>

                <ul className="divide-line border-line mt-4 divide-y border-y">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex gap-3 py-3">
                      <div className="aspect-2/3 bg-cream-panel relative w-12 shrink-0 overflow-hidden">
                        <Image
                          src={item.imageUrlSnapshot}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-ink truncate text-xs">{item.titleSnapshot}</p>
                        <p className="text-muted text-[0.625rem]">
                          {item.colourSnapshot} · {item.sizeSnapshot} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-ink text-xs tabular-nums">
                        {formatPaise(item.lineTotalPaise)}
                      </p>
                    </li>
                  ))}
                </ul>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="tabular-nums">{formatPaise(order.subtotalPaise)}</dd>
                  </div>
                  {order.discountPaise > 0 && (
                    <div className="text-success flex justify-between">
                      <dt>Discount</dt>
                      <dd className="tabular-nums">−{formatPaise(order.discountPaise)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted">Shipping</dt>
                    <dd className="tabular-nums">
                      {order.shippingPaise === 0 ? 'Free' : formatPaise(order.shippingPaise)}
                    </dd>
                  </div>
                  <div className="border-line flex justify-between border-t pt-2">
                    <dt className="text-ink font-medium">Total</dt>
                    <dd className="font-display text-maroon text-xl font-semibold tabular-nums">
                      {formatPaise(order.totalPaise)}
                    </dd>
                  </div>
                </dl>

                <p className="border-line text-muted mt-4 flex items-start gap-2 border-t pt-4 text-[0.625rem] leading-relaxed">
                  <ShieldCheck
                    className="text-gold-muted mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Your order is reserved. If payment fails, the items return to stock
                    automatically and nothing is charged.
                  </span>
                </p>

                <p className="text-muted mt-3 text-center text-[0.625rem]">
                  Trouble paying? Call{' '}
                  <a href={`tel:+91${BRAND.contact.phone}`} className="text-maroon hover:underline">
                    {BRAND.contact.phoneDisplay}
                  </a>
                </p>
              </aside>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
