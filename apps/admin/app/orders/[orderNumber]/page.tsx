import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getRepository } from '@bobby/db';
import { ORDER_STATUS_LABELS, formatDateTime, formatPaise, formatPhone } from '@bobby/shared';
import { Badge, Container } from '@bobby/ui';
import { PageHeader } from '@/components/page-header';
import { TONE } from '../status-tone';
import { allowedTransitions } from './transitions';
import { StatusControl } from './status-control';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getRepository().getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        subtitle={`Placed ${formatDateTime(order.placedAt)}`}
        actions={<Badge tone={TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>}
      />

      <div className="p-6">
        <Link
          href="/orders"
          className="text-maroon mb-4 inline-flex items-center gap-1.5 text-xs hover:underline"
        >
          <ArrowLeft className="size-3" /> All orders
        </Link>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Items */}
          <section aria-labelledby="items" className="border-line bg-card border">
            <h2
              id="items"
              className="border-line font-display text-maroon border-b px-5 py-4 text-lg"
            >
              Items
            </h2>

            <ul className="divide-line divide-y px-5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="aspect-2/3 bg-cream-panel relative w-14 shrink-0 overflow-hidden">
                    <Image
                      src={item.imageUrlSnapshot}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`http://localhost:3000/products/${item.productSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink hover:text-maroon text-sm"
                    >
                      {item.titleSnapshot}
                    </a>
                    <p className="text-muted text-xs">
                      {item.colourSnapshot} · Size {item.sizeSnapshot}
                    </p>
                    <p className="text-muted text-xs">
                      {formatPaise(item.unitPricePaise)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-ink text-sm tabular-nums">
                    {formatPaise(item.lineTotalPaise)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="border-line space-y-2 border-t px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPaise(order.subtotalPaise)}</dd>
              </div>
              {order.discountPaise > 0 && (
                <div className="text-success flex justify-between">
                  <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                  <dd className="tabular-nums">−{formatPaise(order.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums">
                  {order.shippingPaise === 0 ? 'Free' : formatPaise(order.shippingPaise)}
                </dd>
              </div>
              <div className="text-muted flex justify-between text-xs">
                <dt>GST (included)</dt>
                <dd className="tabular-nums">{formatPaise(order.taxPaise)}</dd>
              </div>
              <div className="border-line flex justify-between border-t pt-2">
                <dt className="text-ink font-medium">Total</dt>
                <dd className="font-display text-maroon text-xl font-semibold tabular-nums">
                  {formatPaise(order.totalPaise)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <StatusControl
              orderNumber={order.orderNumber}
              status={order.status}
              transitions={allowedTransitions(order.status)}
            />

            {/* Customer */}
            <section aria-labelledby="customer" className="border-line bg-card border p-5">
              <h2 id="customer" className="font-display text-maroon text-lg">
                Customer
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="label-caps text-muted">Name</dt>
                  <dd className="text-ink">{order.shippingAddress.fullName}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${order.email}`} className="text-maroon hover:underline">
                      {order.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Phone</dt>
                  <dd>
                    <a href={`tel:+91${order.phone}`} className="text-maroon hover:underline">
                      {formatPhone(order.phone)}
                    </a>
                  </dd>
                </div>
              </dl>
            </section>

            {/* Address */}
            <section aria-labelledby="address" className="border-line bg-card border p-5">
              <h2 id="address" className="font-display text-maroon flex items-center gap-2 text-lg">
                <MapPin className="text-gold-muted size-4" aria-hidden="true" />
                Delivery address
              </h2>
              <address className="text-ink mt-3 text-sm not-italic leading-relaxed">
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
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.pincode}
              </address>
            </section>

            {/* Payment */}
            <section aria-labelledby="payment" className="border-line bg-card border p-5">
              <h2 id="payment" className="font-display text-maroon text-lg">
                Payment
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Method</dt>
                  <dd>
                    <Badge tone={order.paymentMethod === 'COD' ? 'warning' : 'neutral'}>
                      {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Prepaid'}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Amount</dt>
                  <dd className="text-ink tabular-nums">{formatPaise(order.totalPaise)}</dd>
                </div>
              </dl>
            </section>

            {/* Shipment */}
            {order.shipment && (
              <section aria-labelledby="shipment" className="border-line bg-card border p-5">
                <h2 id="shipment" className="font-display text-maroon text-lg">
                  Shipment
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Courier</dt>
                    <dd className="text-ink">{order.shipment.courierName ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">AWB</dt>
                    <dd className="text-ink font-mono text-xs">{order.shipment.awbCode ?? '—'}</dd>
                  </div>
                </dl>
                <a
                  href={`http://localhost:3000/track/${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-maroon mt-3 inline-block text-xs hover:underline"
                >
                  View customer tracking page →
                </a>
              </section>
            )}

            {order.notes && (
              <section className="border-line bg-warning-soft border p-5">
                <h2 className="font-display text-maroon text-lg">Customer note</h2>
                <p className="text-ink-soft mt-2 text-sm">{order.notes}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
