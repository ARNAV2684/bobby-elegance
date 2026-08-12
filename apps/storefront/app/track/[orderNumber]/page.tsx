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
            <h1 className="mt-2 font-display text-3xl tracking-wider text-maroon">
              {order.orderNumber}
            </h1>
            <Ornament className="mt-3" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Badge tone={TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
              <span className="text-xs text-muted">Placed {formatDate(order.placedAt)}</span>
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
                        active && 'ring-4 ring-success/15',
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
                        'text-center text-[0.625rem] leading-tight tracking-wide uppercase',
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
            <section aria-labelledby="shipment" className="mt-10 border border-line bg-card">
              <h2 id="shipment" className="border-b border-line px-6 py-4 font-display text-xl text-maroon">
                Shipment
              </h2>

              <dl className="grid gap-4 px-6 py-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="label-caps text-muted">Courier</dt>
                  <dd className="mt-1 text-ink">{order.shipment.courierName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Tracking number</dt>
                  <dd className="mt-1 font-mono text-xs text-ink">
                    {order.shipment.awbCode ?? 'Assigned once packed'}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Expected</dt>
                  <dd className="mt-1 text-ink">
                    {order.shipment.estimatedDelivery
                      ? formatDate(order.shipment.estimatedDelivery)
                      : '—'}
                  </dd>
                </div>
              </dl>

              {order.shipment.events.length > 0 && (
                <ol className="border-t border-line px-6 py-5">
                  {order.shipment.events.map((event, i) => (
                    <li key={`${event.status}-${event.occurredAt}`} className="flex gap-4 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'mt-1 size-2.5 shrink-0 rounded-full',
                            i === 0 ? 'bg-success ring-4 ring-success/15' : 'bg-line-strong',
                          )}
                          aria-hidden="true"
                        />
                        {i < order.shipment!.events.length - 1 && (
                          <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className={cn('text-sm', i === 0 ? 'text-ink' : 'text-ink-soft')}>
                          {event.status}
                        </p>
                        <p className="text-xs text-muted">{event.description}</p>
                        <p className="mt-0.5 text-[0.625rem] text-muted">
                          {formatDateTime(event.occurredAt)}
                          {event.location && (
                            <>
                              {' · '}
                              <MapPin className="inline size-2.5" aria-hidden="true" /> {event.location}
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <p className="border-t border-line px-6 py-3 text-[0.625rem] text-muted">
                Tracking data is simulated in this development build. Live Shiprocket tracking
                activates when credentials are configured.
              </p>
            </section>
          )}

          {/* Items */}
          <section aria-labelledby="items" className="mt-8 border border-line bg-card">
            <h2 id="items" className="border-b border-line px-6 py-4 font-display text-xl text-maroon">
              <Package className="mr-2 inline size-4" aria-hidden="true" />
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
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
                    <Link href={`/products/${item.productSlug}`} className="text-sm text-ink hover:text-maroon">
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

            <div className="flex justify-between border-t border-line px-6 py-4">
              <span className="text-sm font-medium text-ink">
                Total{order.paymentMethod === 'COD' && <span className="text-xs text-muted"> (pay on delivery)</span>}
              </span>
              <span className="font-display text-xl font-semibold text-maroon">
                {formatPaise(order.totalPaise)}
              </span>
            </div>
          </section>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted">
              Something not right? Call us on{' '}
              <a href={`tel:+91${BRAND.contact.phone}`} className="text-maroon hover:underline">
                {BRAND.contact.phoneDisplay}
              </a>
            </p>
            <Link href="/track" className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-4' })}>
              Track another order
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
