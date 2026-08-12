import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { getRepository, type ProductSort } from '@bobby/db';
import { Container, EmptyState, SectionHeading, buttonClasses } from '@bobby/ui';
import { ProductCard } from '@/components/product/product-card';
import { SortSelect } from '@/components/product/sort-select';
import { Pagination } from '@/components/product/pagination';

export const metadata: Metadata = {
  title: 'Search',
  // A search results page has no stable content worth indexing.
  robots: { index: false, follow: true },
};

type SearchParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = (first(sp.q) ?? '').trim();
  const sort = (first(sp.sort) ?? 'newest') as ProductSort;
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);

  const repo = getRepository();
  const result = query
    ? await repo.listProducts({ search: query }, sort, page, 12)
    : { items: [], total: 0, page: 1, pageSize: 12, totalPages: 1 };

  return (
    <div className="py-12">
      <Container wide>
        <SectionHeading
          eyebrow={
            query ? `${result.total} ${result.total === 1 ? 'result' : 'results'}` : undefined
          }
          title={query ? `Search: ${query}` : 'Search'}
          className="mb-10"
          as="h1"
        />

        {!query ? (
          <EmptyState
            icon={<SearchIcon className="size-10" />}
            title="What are you looking for?"
            description="Search by style, fabric or occasion — try “anarkali”, “silk”, or “wedding”."
            action={
              <Link href="/collections/womens" className={buttonClasses({ variant: 'primary' })}>
                Browse everything
              </Link>
            }
          />
        ) : result.items.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="size-10" />}
            title={`No results for “${query}”`}
            description="Check the spelling, or try a broader term like “lehenga” or “cotton”."
            action={
              <Link href="/collections/womens" className={buttonClasses({ variant: 'primary' })}>
                Browse everything
              </Link>
            }
          />
        ) : (
          <>
            <div className="border-line mb-6 flex items-center justify-end border-b pb-4">
              <SortSelect />
            </div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
              {result.items.map((product, i) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={i < 4} />
                </li>
              ))}
            </ul>

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              basePath="/search"
              searchParams={sp}
            />
          </>
        )}
      </Container>
    </div>
  );
}
