import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getRepository, type ProductFilters, type ProductSort } from '@bobby/db';
import { Container, EmptyState, SectionHeading, buttonClasses } from '@bobby/ui';
import { ProductCard } from '@/components/product/product-card';
import { FilterSidebar } from '@/components/product/filter-sidebar';
import { SortSelect } from '@/components/product/sort-select';
import { Pagination } from '@/components/product/pagination';

export const revalidate = 3600;

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const list = (v: string | string[] | undefined): string[] | undefined => {
  const s = first(v);
  const out = s?.split(',').filter(Boolean);
  return out?.length ? out : undefined;
};

export async function generateStaticParams() {
  const repo = getRepository();
  const [categories, collections] = await Promise.all([
    repo.listCategories(),
    repo.listCollections(),
  ]);
  return [...categories, ...collections].map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getRepository().getCategoryBySlug(slug);
  if (!category) return { title: 'Not found' };

  return {
    title: category.name,
    description: category.description,
    openGraph: { title: category.name, description: category.description },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const repo = getRepository();

  const category = await repo.getCategoryBySlug(slug);
  if (!category) notFound();

  // A slug is either a real category or a curated collection; the repository
  // treats them differently, so decide which filter to populate.
  const categories = await repo.listCategories();
  const isCategory = categories.some((c) => c.slug === slug);

  const filters: ProductFilters = {
    ...(isCategory ? { categorySlug: slug } : { collectionSlug: slug }),
    sizes: list(sp.size),
    colours: list(sp.colour),
    fabrics: list(sp.fabric),
    occasions: list(sp.occasion),
    maxPricePaise: first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined,
  };

  const sort = (first(sp.sort) ?? 'newest') as ProductSort;
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);

  const [result, facets] = await Promise.all([
    repo.listProducts(filters, sort, page, 12),
    repo.getFacets(filters),
  ]);

  return (
    <div className="py-10">
      <Container wide>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-muted">
            <li>
              <Link href="/" className="hover:text-maroon">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/collections" className="hover:text-maroon">
                Collections
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink" aria-current="page">
              {category.name}
            </li>
          </ol>
        </nav>

        <SectionHeading
          title={category.name}
          subtitle={category.description}
          className="mb-10"
          as="h1"
        />

        <div className="flex items-start gap-10">
          <FilterSidebar facets={facets} total={result.total} />

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
              <p className="hidden text-sm text-muted lg:block">
                Showing{' '}
                <span className="text-ink tabular-nums">
                  {result.items.length ? (result.page - 1) * result.pageSize + 1 : 0}–
                  {(result.page - 1) * result.pageSize + result.items.length}
                </span>{' '}
                of <span className="text-ink tabular-nums">{result.total}</span>
              </p>
              <div className="lg:hidden">
                <FilterSidebar facets={facets} total={result.total} />
              </div>
              <SortSelect />
            </div>

            {result.items.length === 0 ? (
              <EmptyState
                title="Nothing matches those filters"
                description="Try removing a filter or two — or browse the full collection."
                action={
                  <Link href={`/collections/${slug}`} className={buttonClasses({ variant: 'primary' })}>
                    Clear filters
                  </Link>
                }
              />
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6">
                {result.items.map((product, i) => (
                  <li key={product.id}>
                    <ProductCard product={product} priority={i < 3} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              basePath={`/collections/${slug}`}
              searchParams={sp}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
