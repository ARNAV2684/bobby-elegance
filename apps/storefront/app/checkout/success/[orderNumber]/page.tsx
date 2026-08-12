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
            <span className="bg-success-soft text-success flex size-16 items-center justify-center rounded-full">
              <Check className="size-8" aria-hidden="true" />
            </span>
            <h1 className="font-display text-maroon mt-5 text-3xl sm:text-4xl">
              Thank you
              {order.shippingAddress.fullName
                ? `, ${order.shippingAddress.fullName.split(' ')[0]}`
                : ''}
            </h1>
            <Ornament className="mt-3" />
            <p className="text-ink-soft mt-4 text-sm">
              Your order is confirmed. We have sent the details to{' '}
              <strong className="text-ink">{maskEmail(order.email)}</strong>.
            </p>

            <p className="border-line bg-card mt-6 border px-6 py-3">
              <span className="label-caps text-muted block">Order number</span>
              <span className="font-display text-maroon text-2xl tracking-wider">
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
              <li key={step.title} className="border-line bg-card border p-4 text-center">
                <step.icon
                  className={i === 0 ? 'text-success mx-auto size-5' : 'text-muted mx-auto size-5'}
                  aria-hidden="true"
                />
                <p className="text-ink mt-2 text-sm font-medium">{step.title}</p>
                <p className="text-muted text-xs">{step.body}</p>
              </li>
            ))}
          </ol>

          {/* Order detail */}
          <section aria-labelledby="items-heading" className="border-line bg-card mt-10 border">
            <h2
              id="items-heading"
              className="border-line font-display text-maroon border-b px-6 py-4 text-xl"
            >
              Order details
            </h2>

            <ul className="divide-line divide-y px-6">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="aspect-2/3 bg-cream-panel relative w-16 shrink-0 overflow-hidden"
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
                      className="text-ink hover:text-maroon text-sm"
                    >
                      {item.titleSnapshot}
                    </Link>
                    <p className="text-muted mt-0.5 text-xs">
                      {item.colourSnapshot} · Size {item.sizeSnapshot} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-ink text-sm">{formatPaise(item.lineTotalPaise)}</p>
                </li>
              ))}
            </ul>

            <dl className="border-line space-y-2 border-t px-6 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPaise(order.subtotalPaise)}</dd>
              </div>
              {order.discountPaise > 0 && (
                <div className="text-success flex justify-between">
                  <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                  <dd>−{formatPaise(order.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{order.shippingPaise === 0 ? 'Free' : formatPaise(order.shippingPaise)}</dd>
              </div>
              <div className="border-line flex justify-between border-t pt-2 text-base">
                <dt className="text-ink font-medium">
                  Total{' '}
                  {order.paymentMethod === 'COD' && (
                    <span className="text-muted text-xs">(pay on delivery)</span>
                  )}
                </dt>
                <dd className="font-display text-maroon text-xl font-semibold">
                  {formatPaise(order.totalPaise)}
                </dd>
              </div>
            </dl>

            <div className="border-line grid gap-6 border-t px-6 py-4 text-sm sm:grid-cols-2">
              <div>
                <h3 className="label-caps text-muted">Delivering to</h3>
                <address className="text-ink mt-1.5 text-xs not-italic leading-relaxed">
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
                <p className="text-ink mt-1.5 text-xs">{formatDate(order.placedAt)}</p>
                <h3 className="label-caps text-muted mt-3">Payment</h3>
                <p className="text-ink mt-1.5 text-xs">
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

          <p className="text-muted mt-8 text-center text-xs">
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
