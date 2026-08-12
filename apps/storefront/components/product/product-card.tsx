'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { discountPercent, formatPaise, type Product } from '@bobby/shared';
import { Badge, cn } from '@bobby/ui';

/**
 * A product tile.
 *
 * Wishlist state is local for now — there is no accounts backend yet. When auth
 * lands this lifts into a shared context and persists per customer.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  /** Set on the first row so the LCP image is not lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  const [wished, setWished] = useState(false);

  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const hover = product.images[1];

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const soldOut = totalStock === 0;
  const lowStock = !soldOut && totalStock <= 5;

  const off = product.compareAtPaise
    ? discountPercent(product.basePricePaise, product.compareAtPaise)
    : 0;

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-cream-panel">
        <div className="relative aspect-2/3">
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]',
                hover ? 'group-hover:opacity-0' : 'group-hover:scale-105',
                soldOut && 'opacity-60 grayscale',
              )}
            />
          )}

          {/* Second image cross-fades in on hover, showing the alternate colourway. */}
          {hover && !soldOut && (
            <Image
              src={hover.url}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:opacity-100"
            />
          )}
        </div>

        {/* Corner badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut && <Badge tone="neutral">Sold out</Badge>}
          {!soldOut && off > 0 && <Badge tone="maroon">{off}% off</Badge>}
          {!soldOut && product.isNewArrival && off === 0 && <Badge tone="gold">New</Badge>}
          {lowStock && <Badge tone="warning">Only {totalStock} left</Badge>}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setWished((v) => !v)}
        aria-label={wished ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
        aria-pressed={wished}
        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/85 text-ink backdrop-blur-sm transition-colors hover:text-maroon"
      >
        <Heart className={cn('size-4', wished && 'fill-maroon text-maroon')} />
      </button>

      <div className="flex flex-1 flex-col items-center gap-1 px-2 pb-1 pt-3.5 text-center">
        <h3 className="text-sm leading-snug text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-maroon">
            {product.title}
          </Link>
        </h3>

        <p className="text-[0.6875rem] tracking-wide text-muted">{product.fabric}</p>

        <p className="mt-0.5 flex items-baseline justify-center gap-2">
          <span className="font-display text-lg font-semibold text-maroon">
            {formatPaise(product.basePricePaise)}
          </span>
          {product.compareAtPaise && (
            <span className="text-xs text-muted line-through">
              {formatPaise(product.compareAtPaise)}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
