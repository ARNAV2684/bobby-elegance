import type { Metadata } from 'next';
import { getRepository } from '@bobby/db';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from './inventory-table';

export const metadata: Metadata = { title: 'Inventory' };
export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { items } = await getRepository().listProducts({}, 'name-asc', 1, 500);

  const totalVariants = items.reduce((n, p) => n + p.variants.length, 0);
  const outOfStock = items.reduce(
    (n, p) => n + p.variants.filter((v) => v.stock === 0).length,
    0,
  );

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${totalVariants} variants · ${outOfStock} sold out`}
      />
      <InventoryTable products={items} />
    </>
  );
}
