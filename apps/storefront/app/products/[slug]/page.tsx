import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getRepository } from '@bobby/db';
import { BRAND, formatPaise, paiseToRupees } from '@bobby/shared';
import { Container, SectionHeading } from '@bobby/ui';
import { ProductDetail } from '@/components/product/product-detail';
import { ProductCard } from '@/components/product/product-card';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { items } = await getRepository().listProducts({}, 'newest', 1, 200);
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getRepository().getProductBySlug(slug);
  if (!product) return { title: 'Not found' };

  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];

  return {
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.title,
      description: product.summary,
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();

  const product = await repo.getProductBySlug(slug);
  if (!product || product.status !== 'ACTIVE') notFound();

  const [related, category] = await Promise.all([
    repo.getRelatedProducts(slug, 4),
    repo.getCategoryBySlug(product.categorySlug),
  ]);

  const inStock = product.variants.some((v) => v.stock > 0);
  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];

  /**
   * Product structured data. This is what produces the price, availability and
   * image in a Google result — worth far more than any on-page SEO tweak for
   * a shop.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.summary,
    image: image ? [image.url] : [],
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: BRAND.name },
    material: product.fabric,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: paiseToRupees(product.basePricePaise).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND.name },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: category?.name ?? 'Collections',
        item: `/collections/${product.categorySlug}`,
      },
      { '@type': 'ListItem', position: 3, name: product.title },
    ],
  };

  return (
    <div className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Container wide>
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="text-muted flex flex-wrap items-center gap-2 text-xs">
            <li>
              <Link href="/" className="hover:text-maroon">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/collections/${product.categorySlug}`} className="hover:text-maroon">
                {category?.name ?? 'Collection'}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <ProductDetail product={product} />

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-24">
            <SectionHeading
              id="related"
              title="You may also like"
              eyebrow="More from the collection"
              className="mb-10"
            />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </div>
  );
}
