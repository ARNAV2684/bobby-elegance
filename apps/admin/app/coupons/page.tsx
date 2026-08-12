import type { Metadata } from 'next';
import { getRepository } from '@bobby/db';
import { formatDate, formatPaise } from '@bobby/shared';
import { Badge } from '@bobby/ui';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = { title: 'Coupons' };
export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await getRepository().listCoupons();
  const now = Date.now();

  return (
    <>
      <PageHeader title="Coupons" subtitle={`${coupons.length} discount codes`} />

      <div className="p-6">
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">Discount coupons</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="label-caps px-4 py-3 text-muted">Code</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Discount</th>
                <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Min order</th>
                <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Used</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Expires</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt ? Date.parse(coupon.expiresAt) < now : false;
                const exhausted =
                  coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
                const live = coupon.isActive && !expired && !exhausted;

                return (
                  <tr key={coupon.id} className="transition-colors hover:bg-cream-panel/40">
                    <td className="px-4 py-3">
                      <code className="text-xs font-medium text-maroon">{coupon.code}</code>
                      <p className="text-[0.625rem] text-muted">{coupon.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">
                      {coupon.type === 'PERCENT'
                        ? `${coupon.value}%${coupon.maxDiscountPaise ? ` (max ${formatPaise(coupon.maxDiscountPaise)})` : ''}`
                        : formatPaise(coupon.value)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-ink-soft">
                      {formatPaise(coupon.minOrderPaise)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-ink-soft">
                      {coupon.usedCount}
                      {coupon.usageLimit !== null && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="px-4 py-3 text-[0.625rem] text-muted">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={live ? 'success' : 'neutral'}>
                        {live
                          ? 'Live'
                          : expired
                            ? 'Expired'
                            : exhausted
                              ? 'Used up'
                              : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
