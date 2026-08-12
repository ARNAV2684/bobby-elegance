'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { OCCASION_LABELS, formatPaise, pluralise } from '@bobby/shared';
import type { FacetCounts } from '@bobby/db';
import { Button, cn } from '@bobby/ui';

/**
 * Faceted filters.
 *
 * All state lives in the URL rather than component state, so a filtered view is
 * shareable, survives a refresh, and the back button steps through filter
 * changes the way a shopper expects.
 */
export function FilterSidebar({ facets, total }: { facets: FacetCounts; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selected = useCallback(
    (key: string) => new Set(params.get(key)?.split(',').filter(Boolean) ?? []),
    [params],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      const current = new Set(next.get(key)?.split(',').filter(Boolean) ?? []);

      if (current.has(value)) current.delete(value);
      else current.add(value);

      if (current.size) next.set(key, [...current].join(','));
      else next.delete(key);

      // Any filter change resets to page 1 — staying on page 4 of a result set
      // that now has two pages shows an empty grid.
      next.delete('page');

      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = () => router.push(pathname, { scroll: false });

  const activeCount =
    selected('size').size +
    selected('colour').size +
    selected('fabric').size +
    selected('occasion').size +
    (params.get('maxPrice') ? 1 : 0);

  const Group = ({
    title,
    paramKey,
    options,
  }: {
    title: string;
    paramKey: string;
    options: { value: string; label?: string; count: number; hex?: string }[];
  }) => {
    if (options.length === 0) return null;
    const active = selected(paramKey);

    return (
      <fieldset className="border-line border-t py-5">
        <legend className="label-caps text-ink mb-3">{title}</legend>
        <div className={cn('flex', paramKey === 'colour' ? 'flex-wrap gap-2' : 'flex-col gap-2')}>
          {options.map((opt) => {
            const isOn = active.has(opt.value);

            if (paramKey === 'colour') {
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(paramKey, opt.value)}
                  aria-pressed={isOn}
                  title={`${opt.value} (${opt.count})`}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border-2 transition-all',
                    isOn ? 'border-maroon' : 'border-line hover:border-line-strong',
                  )}
                >
                  <span
                    className="size-5 rounded-full border border-black/10"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span className="sr-only">
                    {opt.value}, {opt.count} {pluralise(opt.count, 'item')}
                  </span>
                </button>
              );
            }

            return (
              <label
                key={opt.value}
                className="text-ink-soft hover:text-ink flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(paramKey, opt.value)}
                  className="size-4 accent-[var(--color-maroon)]"
                />
                <span className="flex-1">{opt.label ?? opt.value}</span>
                <span className="text-muted text-xs tabular-nums">{opt.count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  };

  const content = (
    <>
      <div className="flex items-center justify-between pb-4">
        <p className="text-muted text-sm">
          <span className="text-ink font-medium tabular-nums">{total}</span>{' '}
          {total === 1 ? 'product' : 'products'}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-maroon text-xs underline underline-offset-2 hover:no-underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <Group
        title="Size"
        paramKey="size"
        options={facets.sizes.map((s) => ({ value: s.value, count: s.count }))}
      />
      <Group
        title="Colour"
        paramKey="colour"
        options={facets.colours.map((c) => ({ value: c.value, count: c.count, hex: c.hex }))}
      />
      <Group
        title="Occasion"
        paramKey="occasion"
        options={facets.occasions.map((o) => ({
          value: o.value,
          label: OCCASION_LABELS[o.value as keyof typeof OCCASION_LABELS] ?? o.value,
          count: o.count,
        }))}
      />
      <Group
        title="Fabric"
        paramKey="fabric"
        options={facets.fabrics.map((f) => ({ value: f.value, count: f.count }))}
      />

      {/* Price */}
      <fieldset className="border-line border-t py-5">
        <legend className="label-caps text-ink mb-3">Price</legend>
        <div className="flex flex-col gap-2">
          {[5000, 10000, 15000, 30000].map((maxRupees) => {
            const value = String(maxRupees * 100);
            const isOn = params.get('maxPrice') === value;
            return (
              <label
                key={maxRupees}
                className="text-ink-soft hover:text-ink flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="radio"
                  name="maxPrice"
                  checked={isOn}
                  onChange={() => {
                    const next = new URLSearchParams(params.toString());
                    if (isOn) next.delete('maxPrice');
                    else next.set('maxPrice', value);
                    next.delete('page');
                    router.push(`${pathname}?${next.toString()}`, { scroll: false });
                  }}
                  className="size-4 accent-[var(--color-maroon)]"
                />
                Under {formatPaise(maxRupees * 100)}
              </label>
            );
          })}
        </div>
      </fieldset>
    </>
  );

  return (
    <>
      {/* Mobile trigger */}
      <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)} className="lg:hidden">
        <SlidersHorizontal className="size-3.5" />
        Filters{activeCount > 0 && ` (${activeCount})`}
      </Button>

      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 lg:block" aria-label="Product filters">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="bg-ink/40 absolute inset-0"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="bg-cream absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col">
            <div className="border-line flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-display text-maroon text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close filters"
                className="flex size-11 items-center justify-center"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{content}</div>
            <div className="border-line border-t p-4">
              <Button fullWidth onClick={() => setMobileOpen(false)}>
                Show {total} {total === 1 ? 'result' : 'results'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
