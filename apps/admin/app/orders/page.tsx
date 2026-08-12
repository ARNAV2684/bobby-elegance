import type { Metadata } from 'next';
import Link from 'next/link';
import { getRepository } from '@bobby/db';
import {
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatPaise,
  type OrderStatus,
} from '@bobby/shared';
import { Badge, EmptyState, cn } from '@bobby/ui';
import { PageHeader } from '@/components/page-header';
import { TONE } from './status-tone';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

const STATUSES: OrderStatus[] = [
  'PAID',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) as OrderStatus | undefined;
  const search = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  const result = await getRepository().listOrders({ status, search, pageSize: 50 });

  return (
    <>
      <PageHeader title="Orders" subtitle={`${result.total} orders`} />

      <div className="p-6">
        {/* Status filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href="/orders"
            className={cn(
              'border px-3.5 py-2 text-xs tracking-wide uppercase transition-colors',
              !status ? 'border-maroon bg-maroon text-cream' : 'border-line bg-card text-ink hover:border-maroon',
            )}
          >
            All
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/orders?status=${s}`}
              className={cn(
                'border px-3.5 py-2 text-xs tracking-wide uppercase transition-colors',
                status === s
                  ? 'border-maroon bg-maroon text-cream'
                  : 'border-line bg-card text-ink hover:border-maroon',
              )}
            >
              {ORDER_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {result.items.length === 0 ? (
          <div className="border border-line bg-card">
            <EmptyState
              title="No orders here"
              description={status ? `Nothing with status "${ORDER_STATUS_LABELS[status]}".` : 'No orders yet.'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-line bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Orders</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="label-caps px-4 py-3 text-muted">Order</th>
                  <th scope="col" className="label-caps px-4 py-3 text-muted">Placed</th>
                  <th scope="col" className="label-caps px-4 py-3 text-muted">Customer</th>
                  <th scope="col" className="label-caps px-4 py-3 text-muted">Items</th>
                  <th scope="col" className="label-caps px-4 py-3 text-muted">Payment</th>
                  <th scope="col" className="label-caps px-4 py-3 text-muted">Status</th>
                  <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.items.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-cream-panel/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="font-mono text-xs text-maroon hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[0.625rem] text-muted">
                      {formatDateTime(order.placedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-ink">{order.shippingAddress.fullName}</p>
                      <p className="text-[0.625rem] text-muted">
                        {order.shippingAddress.city}, {order.shippingAddress.pincode}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-ink-soft">
                      {order.items.reduce((n, i) => n + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={order.paymentMethod === 'COD' ? 'warning' : 'neutral'}>
                        {order.paymentMethod === 'COD' ? 'COD' : 'Prepaid'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                      {formatPaise(order.totalPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
