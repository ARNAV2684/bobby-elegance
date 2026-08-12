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
        <div className="border-line bg-card overflow-x-auto border">
          <table className="w-full text-sm">
            <caption className="sr-only">Customers</caption>
            <thead>
              <tr className="border-line border-b text-left">
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Name
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Contact
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Location
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Since
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                  Orders
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                  Spent
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-cream-panel/40 transition-colors">
                  <td className="text-ink px-4 py-3 text-xs">{customer.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-maroon block text-xs hover:underline"
                    >
                      {customer.email}
                    </a>
                    {customer.phone && (
                      <span className="text-muted text-[0.625rem]">
                        {formatPhone(customer.phone)}
                      </span>
                    )}
                  </td>
                  <td className="text-ink-soft px-4 py-3 text-xs">
                    {customer.addresses[0]
                      ? `${customer.addresses[0].city}, ${customer.addresses[0].state}`
                      : '—'}
                  </td>
                  <td className="text-muted px-4 py-3 text-[0.625rem]">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="text-ink px-4 py-3 text-right text-xs tabular-nums">
                    {customer.orderCount}
                  </td>
                  <td className="text-ink px-4 py-3 text-right text-xs tabular-nums">
                    {formatPaise(customer.totalSpentPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted mt-3 text-xs">
          Customer records are personal data. Access here must be behind staff authentication before
          this portal is deployed anywhere reachable.
        </p>
      </div>
    </>
  );
}
