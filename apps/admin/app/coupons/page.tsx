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
        <div className="border-line bg-card overflow-x-auto border">
          <table className="w-full text-sm">
            <caption className="sr-only">Discount coupons</caption>
            <thead>
              <tr className="border-line border-b text-left">
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Code
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Discount
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                  Min order
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                  Used
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Expires
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt ? Date.parse(coupon.expiresAt) < now : false;
                const exhausted =
                  coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
                const live = coupon.isActive && !expired && !exhausted;

                return (
                  <tr key={coupon.id} className="hover:bg-cream-panel/40 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-maroon text-xs font-medium">{coupon.code}</code>
                      <p className="text-muted text-[0.625rem]">{coupon.description}</p>
                    </td>
                    <td className="text-ink px-4 py-3 text-xs">
                      {coupon.type === 'PERCENT'
                        ? `${coupon.value}%${coupon.maxDiscountPaise ? ` (max ${formatPaise(coupon.maxDiscountPaise)})` : ''}`
                        : formatPaise(coupon.value)}
                    </td>
                    <td className="text-ink-soft px-4 py-3 text-right text-xs tabular-nums">
                      {formatPaise(coupon.minOrderPaise)}
                    </td>
                    <td className="text-ink-soft px-4 py-3 text-right text-xs tabular-nums">
                      {coupon.usedCount}
                      {coupon.usageLimit !== null && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="text-muted px-4 py-3 text-[0.625rem]">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={live ? 'success' : 'neutral'}>
                        {live ? 'Live' : expired ? 'Expired' : exhausted ? 'Used up' : 'Inactive'}
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
