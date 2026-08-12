import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, Circle, MapPin, Package } from 'lucide-react';
import { getRepository } from '@bobby/db';
import {
  BRAND,
  ORDER_STATUS_LABELS,
  ORDER_TIMELINE,
  formatDate,
  formatDateTime,
  formatPaise,
  type OrderStatus,
} from '@bobby/shared';
import { Alert, Badge, Container, Ornament, buttonClasses, cn } from '@bobby/ui';

export const metadata: Metadata = {
  title: 'Track your order',
  robots: { index: false, follow: false },
};

const TONE: Record<OrderStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  PAID: 'info',
  CONFIRMED: 'info',
  PACKED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getRepository().getOrderByNumber(orderNumber);
  if (!order) notFound();

  const cancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const currentStep = ORDER_TIMELINE.indexOf(order.status);

  return (
    <div className="py-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <span className="label-caps text-gold-muted">Order tracking</span>
            <h1 className="font-display text-maroon mt-2 text-3xl tracking-wider">
              {order.orderNumber}
            </h1>
            <Ornament className="mt-3" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Badge tone={TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
              <span className="text-muted text-xs">Placed {formatDate(order.placedAt)}</span>
            </div>
          </div>

          {cancelled ? (
            <Alert tone={order.status === 'CANCELLED' ? 'danger' : 'info'} className="mt-8">
              This order was {order.status === 'CANCELLED' ? 'cancelled' : 'refunded'}. If you did
              not expect this, call us on {BRAND.contact.phoneDisplay}.
            </Alert>
          ) : (
            /* Progress rail */
            <ol className="mt-10 flex items-start justify-between gap-1">
              {ORDER_TIMELINE.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <li key={step} className="relative flex flex-1 flex-col items-center gap-2">
                    {/* Connector to the previous dot */}
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute right-1/2 top-4 h-0.5 w-full',
                          i <= currentStep ? 'bg-success' : 'bg-line',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-colors',
                        done
                          ? 'border-success bg-success text-white'
                          : 'border-line bg-cream text-muted',
                        active && 'ring-success/15 ring-4',
                      )}
                    >
                      {done ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Circle className="size-2 fill-current" aria-hidden="true" />
                      )}
                    </span>
                    <span
                      className={cn(
                        'text-center text-[0.625rem] uppercase leading-tight tracking-wide',
                        done ? 'text-ink' : 'text-muted',
                      )}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Shipment */}
          {order.shipment && (
            <section aria-labelledby="shipment" className="border-line bg-card mt-10 border">
              <h2
                id="shipment"
                className="border-line font-display text-maroon border-b px-6 py-4 text-xl"
              >
                Shipment
              </h2>

              <dl className="grid gap-4 px-6 py-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="label-caps text-muted">Courier</dt>
                  <dd className="text-ink mt-1">{order.shipment.courierName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Tracking number</dt>
                  <dd className="text-ink mt-1 font-mono text-xs">
                    {order.shipment.awbCode ?? 'Assigned once packed'}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Expected</dt>
                  <dd className="text-ink mt-1">
                    {order.shipment.estimatedDelivery
                      ? formatDate(order.shipment.estimatedDelivery)
                      : '—'}
                  </dd>
                </div>
              </dl>

              {order.shipment.events.length > 0 && (
                <ol className="border-line border-t px-6 py-5">
                  {order.shipment.events.map((event, i) => (
                    <li
                      key={`${event.status}-${event.occurredAt}`}
                      className="flex gap-4 pb-5 last:pb-0"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'mt-1 size-2.5 shrink-0 rounded-full',
                            i === 0 ? 'bg-success ring-success/15 ring-4' : 'bg-line-strong',
                          )}
                          aria-hidden="true"
                        />
                        {i < order.shipment!.events.length - 1 && (
                          <span className="bg-line mt-1 w-px flex-1" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className={cn('text-sm', i === 0 ? 'text-ink' : 'text-ink-soft')}>
                          {event.status}
                        </p>
                        <p className="text-muted text-xs">{event.description}</p>
                        <p className="text-muted mt-0.5 text-[0.625rem]">
                          {formatDateTime(event.occurredAt)}
                          {event.location && (
                            <>
                              {' · '}
                              <MapPin className="inline size-2.5" aria-hidden="true" />{' '}
                              {event.location}
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <p className="border-line text-muted border-t px-6 py-3 text-[0.625rem]">
                Tracking data is simulated in this development build. Live Shiprocket tracking
                activates when credentials are configured.
              </p>
            </section>
          )}

          {/* Items */}
          <section aria-labelledby="items" className="border-line bg-card mt-8 border">
            <h2
              id="items"
              className="border-line font-display text-maroon border-b px-6 py-4 text-xl"
            >
              <Package className="mr-2 inline size-4" aria-hidden="true" />
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
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

            <div className="border-line flex justify-between border-t px-6 py-4">
              <span className="text-ink text-sm font-medium">
                Total
                {order.paymentMethod === 'COD' && (
                  <span className="text-muted text-xs"> (pay on delivery)</span>
                )}
              </span>
              <span className="font-display text-maroon text-xl font-semibold">
                {formatPaise(order.totalPaise)}
              </span>
            </div>
          </section>

          <div className="mt-8 text-center">
            <p className="text-muted text-xs">
              Something not right? Call us on{' '}
              <a href={`tel:+91${BRAND.contact.phone}`} className="text-maroon hover:underline">
                {BRAND.contact.phoneDisplay}
              </a>
            </p>
            <Link
              href="/track"
              className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-4' })}
            >
              Track another order
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
