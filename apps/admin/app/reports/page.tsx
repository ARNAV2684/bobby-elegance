import type { Metadata } from 'next';
import { getRepository } from '@bobby/db';
import { ORDER_STATUS_LABELS, formatPaise, type OrderStatus } from '@bobby/shared';
import { PageHeader, StatCard } from '@/components/page-header';

export const metadata: Metadata = { title: 'Reports' };
export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const repo = getRepository();
  const [stats, allOrders, { items: products }] = await Promise.all([
    repo.getDashboardStats(),
    repo.listOrders({ pageSize: 500 }),
    repo.listProducts({}, 'newest', 1, 500),
  ]);

  const orders = allOrders.items;
  const settled = orders.filter((o) => o.status !== 'CANCELLED');

  const revenue = settled.reduce((s, o) => s + o.totalPaise, 0);
  const averageOrder = settled.length ? Math.round(revenue / settled.length) : 0;
  const codShare = settled.length
    ? Math.round((settled.filter((o) => o.paymentMethod === 'COD').length / settled.length) * 100)
    : 0;

  // Units sold per product, from order history rather than a counter.
  const unitsByProduct = new Map<string, { title: string; units: number; revenuePaise: number }>();
  for (const order of settled) {
    for (const item of order.items) {
      const prev = unitsByProduct.get(item.productSlug);
      unitsByProduct.set(item.productSlug, {
        title: item.titleSnapshot,
        units: (prev?.units ?? 0) + item.quantity,
        revenuePaise: (prev?.revenuePaise ?? 0) + item.lineTotalPaise,
      });
    }
  }
  const topProducts = [...unitsByProduct.values()].sort((a, b) => b.units - a.units).slice(0, 8);

  const byStatus = new Map<OrderStatus, number>();
  for (const order of orders) byStatus.set(order.status, (byStatus.get(order.status) ?? 0) + 1);

  const maxUnits = Math.max(1, ...topProducts.map((p) => p.units));

  return (
    <>
      <PageHeader title="Reports" subtitle="Sales and catalogue summary" />

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total revenue" value={formatPaise(revenue)} hint="Excluding cancelled" />
          <StatCard label="Average order" value={formatPaise(averageOrder)} />
          <StatCard label="Cash on delivery" value={`${codShare}%`} hint="Share of settled orders" />
          <StatCard label="Active products" value={stats.totalProducts} hint={`${products.length} total`} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          {/* Top products */}
          <section aria-labelledby="top" className="border border-line bg-card">
            <h2 id="top" className="border-b border-line px-5 py-4 font-display text-lg text-maroon">
              Best sellers by units
            </h2>
            {topProducts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted">No sales recorded yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {topProducts.map((p) => (
                  <li key={p.title} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-xs text-ink">{p.title}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted">
                        {p.units} · {formatPaise(p.revenuePaise)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${(p.units / maxUnits) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Orders by status */}
          <section aria-labelledby="status" className="border border-line bg-card">
            <h2 id="status" className="border-b border-line px-5 py-4 font-display text-lg text-maroon">
              Orders by status
            </h2>
            <ul className="divide-y divide-line">
              {[...byStatus.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-ink">{ORDER_STATUS_LABELS[status]}</span>
                    <span className="text-xs tabular-nums text-muted">{count}</span>
                  </li>
                ))}
            </ul>
          </section>
        </div>

        <p className="mt-4 text-xs text-muted">
          Figures are computed from the seed order history in this development build. Once real
          orders flow through Postgres these become live numbers with no code change.
        </p>
      </div>
    </>
  );
}
