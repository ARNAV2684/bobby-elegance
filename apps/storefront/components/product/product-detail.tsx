'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Minus, Plus, Ruler, ShoppingBag, Truck } from 'lucide-react';
import {
  SIZES,
  discountPercent,
  formatPaise,
  type Product,
  type Size,
} from '@bobby/shared';
import { Alert, Badge, Button, cn } from '@bobby/ui';
import { useCart } from '@/lib/cart-context';

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();

  const colours = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of product.variants) if (!seen.has(v.colour)) seen.set(v.colour, v.colourHex);
    return [...seen.entries()].map(([name, hex]) => ({ name, hex }));
  }, [product.variants]);

  const [colour, setColour] = useState(colours[0]?.name ?? '');
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Sizes offered for the chosen colour, in the canonical order rather than
  // whatever order the variants happen to be stored in.
  const sizesForColour = useMemo(() => {
    const forColour = product.variants.filter((v) => v.colour === colour);
    return SIZES.filter((s) => forColour.some((v) => v.size === s)).map((s) => {
      const variant = forColour.find((v) => v.size === s)!;
      return { size: s, stock: variant.stock, variantId: variant.id };
    });
  }, [product.variants, colour]);

  const selected = sizesForColour.find((s) => s.size === size);
  const off = product.compareAtPaise
    ? discountPercent(product.basePricePaise, product.compareAtPaise)
    : 0;

  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);
  const soldOut = totalStock === 0;

  function handleAdd() {
    if (!size || !selected) {
      setError('Please choose a size.');
      return;
    }
    if (selected.stock <= 0) {
      setError('That size is sold out.');
      return;
    }
    setError(null);
    addItem(selected.variantId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  const images = product.images;
  const active = images[imageIndex] ?? images[0];

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row">
        {images.length > 1 && (
          <ul className="flex gap-3 sm:flex-col" aria-label="Product images">
            {images.map((img, i) => (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === imageIndex}
                  className={cn(
                    'relative block aspect-2/3 w-16 overflow-hidden border-2 transition-colors',
                    i === imageIndex ? 'border-maroon' : 'border-transparent hover:border-line-strong',
                  )}
                >
                  <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative aspect-2/3 flex-1 overflow-hidden bg-cream-panel">
          {active && (
            <Image
              src={active.url}
              alt={active.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          )}
          {off > 0 && (
            <div className="absolute left-4 top-4">
              <Badge tone="maroon">{off}% off</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Buy box */}
      <div className="flex flex-col">
        <p className="label-caps text-gold-muted">{product.workType}</p>

        <h1 className="mt-2 font-display text-3xl leading-tight text-maroon sm:text-4xl">
          {product.title}
        </h1>

        <p className="mt-3 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-3xl font-semibold text-maroon">
            {formatPaise(product.basePricePaise)}
          </span>
          {product.compareAtPaise && (
            <>
              <span className="text-lg text-muted line-through">
                {formatPaise(product.compareAtPaise)}
              </span>
              <span className="text-sm font-medium text-success">Save {off}%</span>
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

        <p className="mt-5 text-sm leading-relaxed text-ink-soft">{product.summary}</p>

        {/* Colour */}
        {colours.length > 1 && (
          <fieldset className="mt-7">
            <legend className="label-caps mb-3 text-ink">
              Colour: <span className="text-muted">{colour}</span>
            </legend>
            <div className="flex gap-2.5">
              {colours.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setColour(c.name);
                    setSize(null);
                    // Jump the gallery to that colourway's photo.
                    const idx = product.images.findIndex((img) => img.alt.includes(c.name));
                    if (idx >= 0) setImageIndex(idx);
                  }}
                  aria-pressed={colour === c.name}
                  title={c.name}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2 transition-all',
                    colour === c.name ? 'border-maroon' : 'border-line hover:border-line-strong',
                  )}
                >
                  <span
                    className="size-6 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="sr-only">{c.name}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Size */}
        <fieldset className="mt-6">
          <legend className="label-caps mb-3 flex w-full items-center justify-between text-ink">
            <span>Size {size && <span className="text-muted">: {size}</span>}</span>
            <a
              href="/size-guide"
              className="flex items-center gap-1 text-[0.625rem] text-maroon normal-case hover:underline"
            >
              <Ruler className="size-3" />
              Size guide
            </a>
          </legend>

          <div className="flex flex-wrap gap-2">
            {sizesForColour.map(({ size: s, stock }) => {
              const out = stock <= 0;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setSize(s);
                    setQuantity(1);
                    setError(null);
                  }}
                  aria-pressed={size === s}
                  className={cn(
                    'min-w-14 border px-3.5 py-2.5 text-xs tracking-wide transition-all',
                    size === s
                      ? 'border-maroon bg-maroon text-cream'
                      : 'border-line text-ink hover:border-maroon',
                    // A sold-out size stays visible but struck through — hiding it
                    // makes shoppers think we never stocked it.
                    out &&
                      'cursor-not-allowed border-line/60 text-muted/50 line-through hover:border-line/60',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {selected && selected.stock > 0 && selected.stock <= 3 && (
            <p className="mt-2.5 text-xs text-warning">
              Only {selected.stock} left in {colour}, size {selected.size}
            </p>
          )}
        </fieldset>

        {/* Quantity + add */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex size-11 items-center justify-center text-ink hover:bg-cream-panel disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, selected?.stock ?? 10, q + 1))}
              disabled={!selected || quantity >= Math.min(10, selected.stock)}
              aria-label="Increase quantity"
              className="flex size-11 items-center justify-center text-ink hover:bg-cream-panel disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <Button
            size="lg"
            onClick={handleAdd}
            disabled={soldOut}
            className="min-w-52 flex-1"
          >
            {added ? (
              <>
                <Check className="size-4" /> Added to bag
              </>
            ) : soldOut ? (
              'Sold out'
            ) : (
              <>
                <ShoppingBag className="size-4" /> Add to bag
              </>
            )}
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        {soldOut && (
          <Alert tone="warning" className="mt-4">
            This piece is sold out online. Call us on 75060 00091 — our Mira Road stores may
            still have it.
          </Alert>
        )}

        {/* Delivery promise */}
        <div className="mt-7 flex items-start gap-3 border-y border-line py-4">
          <Truck className="mt-0.5 size-4 shrink-0 text-gold-muted" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-ink-soft">
            Free shipping on orders over ₹1,999 · Cash on delivery available
            <br />
            <span className="text-muted">Dispatched in 2–3 working days from Mira Road</span>
          </p>
        </div>

        {/* Details */}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="label-caps text-muted">Fabric</dt>
            <dd className="mt-0.5 text-ink">{product.fabric}</dd>
          </div>
          <div>
            <dt className="label-caps text-muted">Work</dt>
            <dd className="mt-0.5 text-ink">{product.workType}</dd>
          </div>
        </dl>

        <details className="mt-6 border-t border-line pt-4" open>
          <summary className="label-caps cursor-pointer text-ink">Description</summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{product.description}</p>
        </details>

        <details className="mt-3 border-t border-line pt-4">
          <summary className="label-caps cursor-pointer text-ink">Care instructions</summary>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-ink-soft">
            {product.careInstructions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
