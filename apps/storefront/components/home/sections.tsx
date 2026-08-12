import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  Gem,
  Globe,
  Headphones,
  MapPin,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  BRAND,
  OCCASION_LABELS,
  STORY,
  TRUST_POINTS,
  USP_STRIP,
  type Category,
  type Product,
} from '@bobby/shared';
import { Container, Ornament, SectionHeading, buttonClasses, cn } from '@bobby/ui';
import { ProductCard } from '@/components/product/product-card';
import { InstagramIcon } from '@/components/layout/social-icons';

const ICONS = {
  award: Award,
  gem: Gem,
  sparkles: Sparkles,
  scissors: Scissors,
  'map-pin': MapPin,
  'shield-check': ShieldCheck,
  'refresh-cw': RefreshCw,
  globe: Globe,
  headphones: Headphones,
} as const;

function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name as keyof typeof ICONS] ?? Gem;
  return <C className={className} aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// Collection tiles
// ---------------------------------------------------------------------------

/** The four large image tiles under the hero. */
export function CollectionTiles({ collections }: { collections: Category[] }) {
  return (
    <section aria-label="Shop by collection" className="py-14">
      <Container wide>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group relative aspect-4/5 overflow-hidden bg-maroon-deep"
            >
              <Image
                src={c.imageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 via-maroon-deep/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-xl leading-tight text-cream">
                  {c.name.replace(' Collection', '')}
                  <span className="block text-sm font-normal tracking-[0.2em] text-cream/80 uppercase">
                    Collection
                  </span>
                </h3>
                <span className="label-caps mt-3 inline-block text-gold transition-transform duration-300 group-hover:translate-x-1">
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Brand story + trust panel
// ---------------------------------------------------------------------------

export function StoryPanel() {
  return (
    <section aria-labelledby="story-heading" className="pb-14">
      <Container wide>
        <div className="grid overflow-hidden rounded-sm border border-line bg-card lg:grid-cols-[1fr_1.15fr_0.9fr]">
          {/* Founder portrait */}
          <div className="relative min-h-72 bg-cream-panel lg:min-h-0">
            <Image
              src="/images/brand/founder.jpg"
              alt={`${BRAND.founder.name}, founder of ${BRAND.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </div>

          {/* Copy */}
          <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
            <span className="label-caps text-gold-muted">{STORY.eyebrow}</span>
            <h2 id="story-heading" className="font-display text-3xl tracking-wide text-maroon">
              {STORY.heading}
            </h2>
            <Ornament className="justify-start" />
            <p className="text-sm leading-relaxed text-ink-soft">{STORY.body}</p>
            <Link
              href={STORY.ctaHref}
              className={buttonClasses({ variant: 'primary', className: 'mt-2 self-start' })}
            >
              {STORY.ctaLabel}
            </Link>
          </div>

          {/* Trust list */}
          <ul className="divide-y divide-line bg-cream-panel/60">
            {TRUST_POINTS.map((point) => (
              <li key={point.subtitle} className="flex items-center gap-3.5 px-6 py-[1.15rem]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold-muted/40 text-gold-muted">
                  <Icon name={point.icon} className="size-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-medium text-ink">{point.title}</span>
                  <span className="block text-xs text-muted">{point.subtitle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// USP strip
// ---------------------------------------------------------------------------

export function UspStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-line bg-cream-panel/40">
      <Container wide>
        <ul className="grid grid-cols-2 divide-line sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
          {USP_STRIP.map((usp) => (
            <li key={usp.title} className="flex items-center gap-3 px-4 py-5">
              <Icon name={usp.icon} className="size-6 shrink-0 text-gold-muted" />
              <span className="leading-tight">
                <span className="block text-[0.6875rem] font-medium tracking-wide text-ink uppercase">
                  {usp.title}
                </span>
                <span className="block text-[0.625rem] text-muted">{usp.subtitle}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Product rail
// ---------------------------------------------------------------------------

export function ProductRail({
  title,
  eyebrow,
  products,
  viewAllHref,
  priority = false,
}: {
  title: string;
  eyebrow?: string;
  products: Product[];
  viewAllHref: string;
  priority?: boolean;
}) {
  if (products.length === 0) return null;

  const headingId = `rail-${viewAllHref.replace(/\W+/g, '-')}`;

  return (
    <section aria-labelledby={headingId} className="py-14">
      <Container wide>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id={headingId}
            eyebrow={eyebrow}
            title={title}
            align="left"
            className="items-start"
            as="h2"
          />
          <Link
            href={viewAllHref}
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
          >
            View all
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid from md up. */}
        <ul className="-mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--spacing-gutter)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-5">
          {products.slice(0, 5).map((product, i) => (
            <li
              key={product.id}
              className="w-[58%] shrink-0 snap-start sm:w-[38%] md:w-auto md:shrink"
            >
              <ProductCard product={product} priority={priority && i < 3} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shop by occasion
// ---------------------------------------------------------------------------

const OCCASION_ICONS: Record<string, string> = {
  wedding: 'M12 3l2.09 4.24 4.68.68-3.39 3.3.8 4.66L12 13.67l-4.18 2.2.8-4.65-3.39-3.3 4.68-.68L12 3z',
  festive: 'M12 2a5 5 0 015 5c0 2.5-2 4-2 6H9c0-2-2-3.5-2-6a5 5 0 015-5zM9 16h6v2H9v-2z',
  eid: 'M16 3a9 9 0 100 18 7 7 0 010-18z',
  party: 'M8 3h8l-1 7a3 3 0 01-6 0L8 3zm4 10v7m-3 0h6',
  daily: 'M12 3l7 5v2H5V8l7-5zm-7 9h14v9H5v-9z',
};

export function OccasionGrid({ collections }: { collections: Category[] }) {
  const occasions = Object.entries(OCCASION_LABELS);

  return (
    <section aria-labelledby="occasion-heading" className="pb-14">
      <Container wide>
        <SectionHeading
          id="occasion-heading"
          title="Shop by Occasion"
          eyebrow="Find the right piece"
          className="mb-8"
        />

        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {occasions.map(([key, label]) => {
            const collection = collections.find((c) =>
              c.slug.startsWith(key === 'party' ? 'party-wear' : key === 'daily' ? 'daily-wear' : key),
            );
            const href = collection ? `/collections/${collection.slug}` : `/collections/womens`;

            return (
              <li key={key}>
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center justify-center gap-3 bg-card px-4 py-8 transition-colors hover:bg-cream-panel/60"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8 text-gold-muted transition-transform duration-300 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  >
                    <path d={OCCASION_ICONS[key] ?? OCCASION_ICONS.daily!} />
                  </svg>
                  <span className="text-center leading-tight">
                    <span className="block text-xs font-medium tracking-[0.14em] text-ink uppercase">
                      {label}
                    </span>
                    <span className="block text-[0.625rem] tracking-wide text-muted uppercase">
                      Collection
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Promo band
// ---------------------------------------------------------------------------

/** The full-width maroon band from w1.jpeg. */
export function PromoBand() {
  return (
    <section className="bg-maroon text-cream">
      <Container wide>
        <div className="grid items-center gap-6 py-8 md:grid-cols-[1.4fr_1fr_1fr_auto] md:gap-4">
          <div>
            <p className="font-display text-2xl leading-tight tracking-wide">
              Celebrate Every Moment
              <span className="block text-gold">In Elegance</span>
            </p>
          </div>

          <Link href="/collections/new-arrivals" className="group md:border-l md:border-cream/15 md:pl-6">
            <span className="block font-display text-lg text-cream">New Arrivals</span>
            <span className="label-caps text-gold transition-transform group-hover:translate-x-1 inline-block">
              Shop now →
            </span>
          </Link>

          <Link href="/collections/wedding" className="group md:border-l md:border-cream/15 md:pl-6">
            <span className="block font-display text-lg text-cream">Wedding Special</span>
            <span className="label-caps text-gold transition-transform group-hover:translate-x-1 inline-block">
              Explore now →
            </span>
          </Link>

          <div className="flex items-center gap-3 md:border-l md:border-cream/15 md:pl-6">
            <span className="font-display text-5xl leading-none text-gold">20</span>
            <span className="text-[0.625rem] leading-tight tracking-[0.16em] text-cream/80 uppercase">
              Years
              <br />
              of Legacy
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Instagram strip
// ---------------------------------------------------------------------------

export function InstagramStrip({ products }: { products: Product[] }) {
  // Placeholder feed: real Instagram embedding needs a Meta app + token, which
  // is a client-side account task. Until then we show recent product imagery.
  const tiles = products.slice(0, 6);

  return (
    <section aria-labelledby="instagram-heading" className="bg-maroon">
      <Container wide>
        <div className="flex flex-col items-center gap-6 py-10 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full border border-gold/40 text-gold">
              <InstagramIcon className="size-5" />
            </span>
            <div>
              <h2 id="instagram-heading" className="text-sm tracking-[0.16em] text-cream uppercase">
                Follow us on Instagram
              </h2>
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gold hover:underline"
              >
                {BRAND.social.instagramHandle}
              </a>
            </div>
          </div>

          <ul className="flex gap-2">
            {tiles.map((p) => (
              <li key={p.id} className="relative size-16 overflow-hidden sm:size-20">
                <Image
                  src={p.images[0]?.url ?? '/images/placeholder.jpg'}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </li>
            ))}
          </ul>

          <a
            href={BRAND.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: 'outline', size: 'sm', className: 'border-gold/50 text-gold hover:bg-gold hover:text-maroon-deep' })}
          >
            View more
          </a>
        </div>
      </Container>
    </section>
  );
}
