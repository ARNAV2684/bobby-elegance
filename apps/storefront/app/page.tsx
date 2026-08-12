import { getRepository } from '@bobby/db';
import { Hero } from '@/components/home/hero';
import {
  CollectionTiles,
  InstagramStrip,
  OccasionGrid,
  ProductRail,
  PromoBand,
  StoryPanel,
  UspStrip,
} from '@/components/home/sections';

/**
 * Home.
 *
 * A Server Component: everything below is fetched and rendered on the server,
 * so the browser receives finished HTML. Revalidating hourly keeps the page
 * cacheable at the CDN edge — which is what makes it fast from anywhere in the
 * world rather than only from India. Admin edits will call revalidateTag() to
 * refresh it immediately rather than waiting for the hour.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const repo = getRepository();

  const [slides, collections, newArrivals, bestsellers] = await Promise.all([
    repo.listHeroSlides(),
    repo.listCollections(),
    repo.listProducts({ collectionSlug: 'new-arrivals' }, 'newest', 1, 5),
    repo.listProducts({}, 'bestselling', 1, 5),
  ]);

  // The four large tiles use the curated collections, in the template's order.
  const featured = collections.filter((c) =>
    ['womens', 'wedding', 'festive', 'luxury'].includes(c.slug),
  );
  const tileOrder = ['womens', 'wedding', 'festive', 'luxury'];
  featured.sort((a, b) => tileOrder.indexOf(a.slug) - tileOrder.indexOf(b.slug));

  return (
    <>
      <Hero slides={slides} />
      <CollectionTiles collections={featured} />
      <StoryPanel />
      <UspStrip />
      <ProductRail
        title="New Arrivals"
        eyebrow="Just landed"
        products={newArrivals.items}
        viewAllHref="/collections/new-arrivals"
        priority
      />
      <PromoBand />
      <OccasionGrid collections={collections} />
      <ProductRail
        title="Bestsellers"
        eyebrow="Loved by our customers"
        products={bestsellers.items}
        viewAllHref="/collections/womens"
      />
      <InstagramStrip products={newArrivals.items} />
    </>
  );
}
