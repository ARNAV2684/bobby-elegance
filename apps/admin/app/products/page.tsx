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
        <div className="border-line bg-card overflow-x-auto border">
          <table className="w-full text-sm">
            <caption className="sr-only">Product catalogue</caption>
            <thead>
              <tr className="border-line border-b text-left">
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Product
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Category
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Fabric
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                  Price
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3 text-right">
                  Stock
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  Status
                </th>
                <th scope="col" className="label-caps text-muted px-4 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {items.map((product) => {
                const stock = product.variants.reduce((n, v) => n + v.stock, 0);
                const image = product.images.find((i) => i.isPrimary) ?? product.images[0];

                return (
                  <tr key={product.id} className="hover:bg-cream-panel/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="aspect-2/3 bg-cream-panel relative w-10 shrink-0 overflow-hidden">
                          {image && (
                            <Image
                              src={image.url}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-ink truncate text-xs">{product.title}</p>
                          <p className="text-muted text-[0.625rem]">
                            {product.variants.length}{' '}
                            {pluralise(product.variants.length, 'variant')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-ink-soft px-4 py-3 text-xs">
                      {categoryName(product.categorySlug)}
                    </td>
                    <td className="text-ink-soft px-4 py-3 text-xs">{product.fabric}</td>
                    <td className="text-ink px-4 py-3 text-right text-xs tabular-nums">
                      {formatPaise(product.basePricePaise)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          stock === 0
                            ? 'text-danger text-xs tabular-nums'
                            : stock <= 10
                              ? 'text-warning text-xs tabular-nums'
                              : 'text-ink text-xs tabular-nums'
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
                        className="text-muted hover:text-maroon transition-colors"
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

        <p className="text-muted mt-3 text-xs">
          Stock is edited from the <strong className="text-ink">Inventory</strong> page. Full
          product create/edit forms are the next piece of admin work — see TODO-BEFORE-LAUNCH.md.
        </p>
      </div>
    </>
  );
}
