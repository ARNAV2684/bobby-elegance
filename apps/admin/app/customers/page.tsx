import type { Metadata } from 'next';
import { getRepository } from '@bobby/db';
import { formatDate, formatPaise, formatPhone } from '@bobby/shared';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = { title: 'Customers' };
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await getRepository().listCustomers();

  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} customers`} />

      <div className="p-6">
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">Customers</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="label-caps px-4 py-3 text-muted">Name</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Contact</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Location</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Since</th>
                <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Orders</th>
                <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-cream-panel/40">
                  <td className="px-4 py-3 text-xs text-ink">{customer.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${customer.email}`}
                      className="block text-xs text-maroon hover:underline"
                    >
                      {customer.email}
                    </a>
                    {customer.phone && (
                      <span className="text-[0.625rem] text-muted">
                        {formatPhone(customer.phone)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-soft">
                    {customer.addresses[0]
                      ? `${customer.addresses[0].city}, ${customer.addresses[0].state}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-[0.625rem] text-muted">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                    {customer.orderCount}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                    {formatPaise(customer.totalSpentPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          Customer records are personal data. Access here must be behind staff authentication
          before this portal is deployed anywhere reachable.
        </p>
      </div>
    </>
  );
}
