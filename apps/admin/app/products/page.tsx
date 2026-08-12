import type { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { getRepository } from '@bobby/db';
import { formatPaise, pluralise } from '@bobby/shared';
import { Badge } from '@bobby/ui';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = { title: 'Products' };
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const repo = getRepository();
  const [{ items }, categories] = await Promise.all([
    repo.listProducts({}, 'name-asc', 1, 500),
    repo.listCategories(),
  ]);

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <PageHeader title="Products" subtitle={`${items.length} products in the catalogue`} />

      <div className="p-6">
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">Product catalogue</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="label-caps px-4 py-3 text-muted">Product</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Category</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Fabric</th>
                <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Price</th>
                <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Stock</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted">Status</th>
                <th scope="col" className="label-caps px-4 py-3 text-muted"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((product) => {
                const stock = product.variants.reduce((n, v) => n + v.stock, 0);
                const image = product.images.find((i) => i.isPrimary) ?? product.images[0];

                return (
                  <tr key={product.id} className="transition-colors hover:bg-cream-panel/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-2/3 w-10 shrink-0 overflow-hidden bg-cream-panel">
                          {image && (
                            <Image src={image.url} alt="" fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-ink">{product.title}</p>
                          <p className="text-[0.625rem] text-muted">
                            {product.variants.length}{' '}
                            {pluralise(product.variants.length, 'variant')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {categoryName(product.categorySlug)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{product.fabric}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                      {formatPaise(product.basePricePaise)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          stock === 0
                            ? 'text-xs tabular-nums text-danger'
                            : stock <= 10
                              ? 'text-xs tabular-nums text-warning'
                              : 'text-xs tabular-nums text-ink'
                        }
                      >
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={product.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {product.status}
                        </Badge>
                        {product.isNewArrival && <Badge tone="gold">New</Badge>}
                        {product.isBestseller && <Badge tone="info">Bestseller</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`http://localhost:3000/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${product.title} on the storefront`}
                        className="text-muted transition-colors hover:text-maroon"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          Stock is edited from the <strong className="text-ink">Inventory</strong> page. Full
          product create/edit forms are the next piece of admin work — see TODO-BEFORE-LAUNCH.md.
        </p>
      </div>
    </>
  );
}
