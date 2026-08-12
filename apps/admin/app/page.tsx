import Link from 'next/link';
import { AlertTriangle, ArrowRight, PackageCheck } from 'lucide-react';
import { getRepository } from '@bobby/db';
import { ORDER_STATUS_LABELS, formatDateTime, formatPaise, pluralise } from '@bobby/shared';
import { Alert, Badge, Container, buttonClasses } from '@bobby/ui';
import { PageHeader, StatCard } from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const repo = getRepository();

  const [stats, recentOrders, lowStock] = await Promise.all([
    repo.getDashboardStats(),
    repo.listOrders({ pageSize: 6 }),
    repo.listLowStock(3),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Today at a glance"
        actions={
          <Link href="/orders" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
            View all orders
          </Link>
        }
      />

      <div className="p-6">
        <Alert tone="info" className="mb-6">
          <strong>Development build.</strong> Data comes from the in-memory seed set and resets when
          the server restarts. Changes you make here are real and appear on the storefront
          immediately.
        </Alert>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Orders today"
            value={stats.ordersToday}
            hint={`${formatPaise(stats.revenueTodayPaise)} revenue`}
          />
          <StatCard
            label="This month"
            value={stats.ordersThisMonth}
            hint={`${formatPaise(stats.revenueThisMonthPaise)} revenue`}
          />
          <StatCard
            label="Awaiting fulfilment"
            value={stats.pendingFulfilment}
            hint="Paid, confirmed or packed"
            tone={stats.pendingFulfilment > 0 ? 'warning' : 'default'}
          />
          <StatCard
            label="Low stock"
            value={stats.lowStockCount}
            hint="3 or fewer remaining"
            tone={stats.lowStockCount > 0 ? 'danger' : 'success'}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Recent orders */}
          <section aria-labelledby="recent" className="border-line bg-card border">
            <div className="border-line flex items-center justify-between border-b px-5 py-4">
              <h2 id="recent" className="font-display text-maroon text-xl">
                Recent orders
              </h2>
              <Link
                href="/orders"
                className="text-maroon flex items-center gap-1 text-xs hover:underline"
              >
                All orders <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-line border-b text-left">
                    <th scope="col" className="label-caps text-muted px-5 py-3">
                      Order
                    </th>
                    <th scope="col" className="label-caps text-muted px-5 py-3">
                      Customer
                    </th>
                    <th scope="col" className="label-caps text-muted px-5 py-3">
                      Status
                    </th>
                    <th scope="col" className="label-caps text-muted px-5 py-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-line divide-y">
                  {recentOrders.items.map((order) => (
                    <tr key={order.id} className="hover:bg-cream-panel/40 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="text-maroon font-mono text-xs hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-muted text-[0.625rem]">
                          {formatDateTime(order.placedAt)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-ink text-xs">{order.shippingAddress.fullName}</p>
                        <p className="text-muted text-[0.625rem]">{order.shippingAddress.city}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          tone={
                            order.status === 'DELIVERED'
                              ? 'success'
                              : order.status === 'CANCELLED'
                                ? 'danger'
                                : 'info'
                          }
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="text-ink px-5 py-3 text-right text-xs tabular-nums">
                        {formatPaise(order.totalPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Low stock */}
          <section aria-labelledby="lowstock" className="border-line bg-card border">
            <div className="border-line flex items-center justify-between border-b px-5 py-4">
              <h2
                id="lowstock"
                className="font-display text-maroon flex items-center gap-2 text-xl"
              >
                <AlertTriangle className="text-warning size-4" aria-hidden="true" />
                Needs restocking
              </h2>
              <Link href="/inventory" className="text-maroon text-xs hover:underline">
                Manage
              </Link>
            </div>

            {lowStock.length === 0 ? (
              <p className="text-success flex items-center gap-2 px-5 py-8 text-sm">
                <PackageCheck className="size-4" aria-hidden="true" />
                Everything is well stocked.
              </p>
            ) : (
              <ul className="divide-line divide-y">
                {lowStock.slice(0, 8).map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-ink truncate text-xs">{variant.productTitle}</p>
                      <p className="text-muted text-[0.625rem]">
                        {variant.colour} · {variant.size} · {variant.sku}
                      </p>
                    </div>
                    <Badge tone={variant.stock === 0 ? 'danger' : 'warning'}>
                      {variant.stock === 0 ? 'Sold out' : `${variant.stock} left`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            {lowStock.length > 8 && (
              <p className="border-line text-muted border-t px-5 py-3 text-xs">
                and {lowStock.length - 8} more {pluralise(lowStock.length - 8, 'variant')}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
