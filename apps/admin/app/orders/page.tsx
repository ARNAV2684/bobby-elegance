import type { Metadata } from 'next';
import Link from 'next/link';
import { getRepository } from '@bobby/db';
import { ORDER_STATUS_LABELS, formatDateTime, formatPaise, type OrderStatus } from '@bobby/shared';
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
              'border px-3.5 py-2 text-xs uppercase tracking-wide transition-colors',
              !status
                ? 'border-maroon bg-maroon text-cream'
                : 'border-line bg-card text-ink hover:border-maroon',
            )}
          >
            All
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/orders?status=${s}`}
              className={cn(
                'border px-3.5 py-2 text-xs uppercase tracking-wide transition-colors',
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
          <div className="border-line bg-card border">
            <EmptyState
              title="No orders here"
              description={
                status ? `Nothing with status "${ORDER_STATUS_LABELS[status]}".` : 'No orders yet.'
              }
            />
          </div>
        ) : (
          <div className="border-line bg-card overflow-x-auto border">
            <table className="w-full text-sm">
              <caption className="sr-only">Orders</caption>
              <thead>
                <tr className="border-line border-b text-left">
                  <th scope="col" className="label-caps text-muted px-4 py-3">
                    Order
                  </th>
                  <th scope="col" className="label-caps text-muted px-4 py-3">
                    Placed
                  </th>
                  <th scope="col" className="label-caps text-muted px-4 py-3">
                    Customer
                  </th>
                  <th scope="col" className="label-caps text-muted px-4 py-3">
                    Items
                  </th>
                  <th scope="col" className="label-caps text-muted px-4 py-3">
                    Payment
                  </th>
                  <th scope="col" className="label-caps text-muted px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {result.items.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-panel/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="text-maroon font-mono text-xs hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="text-muted px-4 py-3 text-[0.625rem]">
                      {formatDateTime(order.placedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink text-xs">{order.shippingAddress.fullName}</p>
                      <p className="text-muted text-[0.625rem]">
                        {order.shippingAddress.city}, {order.shippingAddress.pincode}
                      </p>
                    </td>
                    <td className="text-ink-soft px-4 py-3 text-xs tabular-nums">
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
                    <td className="text-ink px-4 py-3 text-right text-xs tabular-nums">
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
