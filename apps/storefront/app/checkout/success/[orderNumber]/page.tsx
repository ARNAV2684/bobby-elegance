import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, Package, Truck } from 'lucide-react';
import { getRepository } from '@bobby/db';
import { BRAND, formatDate, formatPaise, maskEmail } from '@bobby/shared';
import { Container, Ornament, buttonClasses } from '@bobby/ui';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getRepository().getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="py-14">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Confirmation */}
          <div className="flex flex-col items-center text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-8" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl text-maroon sm:text-4xl">
              Thank you{order.shippingAddress.fullName ? `, ${order.shippingAddress.fullName.split(' ')[0]}` : ''}
            </h1>
            <Ornament className="mt-3" />
            <p className="mt-4 text-sm text-ink-soft">
              Your order is confirmed. We have sent the details to{' '}
              <strong className="text-ink">{maskEmail(order.email)}</strong>.
            </p>

            <p className="mt-6 border border-line bg-card px-6 py-3">
              <span className="label-caps block text-muted">Order number</span>
              <span className="font-display text-2xl tracking-wider text-maroon">
                {order.orderNumber}
              </span>
            </p>
          </div>

          {/* What happens next */}
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Check, title: 'Confirmed', body: 'We have your order' },
              { icon: Package, title: 'Packed', body: 'Ready in 2–3 working days' },
              { icon: Truck, title: 'Shipped', body: 'Tracking sent by SMS' },
            ].map((step, i) => (
              <li key={step.title} className="border border-line bg-card p-4 text-center">
                <step.icon
                  className={i === 0 ? 'mx-auto size-5 text-success' : 'mx-auto size-5 text-muted'}
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm font-medium text-ink">{step.title}</p>
                <p className="text-xs text-muted">{step.body}</p>
              </li>
            ))}
          </ol>

          {/* Order detail */}
          <section aria-labelledby="items-heading" className="mt-10 border border-line bg-card">
            <h2 id="items-heading" className="border-b border-line px-6 py-4 font-display text-xl text-maroon">
              Order details
            </h2>

            <ul className="divide-y divide-line px-6">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative aspect-2/3 w-16 shrink-0 overflow-hidden bg-cream-panel"
                  >
                    <Image
                      src={item.imageUrlSnapshot}
                      alt={item.titleSnapshot}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="text-sm text-ink hover:text-maroon"
                    >
                      {item.titleSnapshot}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.colourSnapshot} · Size {item.sizeSnapshot} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-ink">{formatPaise(item.lineTotalPaise)}</p>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-line px-6 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPaise(order.subtotalPaise)}</dd>
              </div>
              {order.discountPaise > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                  <dd>−{formatPaise(order.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{order.shippingPaise === 0 ? 'Free' : formatPaise(order.shippingPaise)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-medium text-ink">
                  Total {order.paymentMethod === 'COD' && <span className="text-xs text-muted">(pay on delivery)</span>}
                </dt>
                <dd className="font-display text-xl font-semibold text-maroon">
                  {formatPaise(order.totalPaise)}
                </dd>
              </div>
            </dl>

            <div className="grid gap-6 border-t border-line px-6 py-4 text-sm sm:grid-cols-2">
              <div>
                <h3 className="label-caps text-muted">Delivering to</h3>
                <address className="mt-1.5 text-xs leading-relaxed text-ink not-italic">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && (
                    <>
                      <br />
                      {order.shippingAddress.line2}
                    </>
                  )}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.pincode}
                </address>
              </div>
              <div>
                <h3 className="label-caps text-muted">Placed on</h3>
                <p className="mt-1.5 text-xs text-ink">{formatDate(order.placedAt)}</p>
                <h3 className="label-caps mt-3 text-muted">Payment</h3>
                <p className="mt-1.5 text-xs text-ink">
                  {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/track/${order.orderNumber}`}
              className={buttonClasses({ variant: 'primary', size: 'lg' })}
            >
              Track this order
            </Link>
            <Link
              href="/collections/womens"
              className={buttonClasses({ variant: 'outline', size: 'lg' })}
            >
              Continue shopping
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            Questions about your order? Call us on{' '}
            <a href={`tel:+91${BRAND.contact.phone}`} className="text-maroon hover:underline">
              {BRAND.contact.phoneDisplay}
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
