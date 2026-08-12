'use client';

import { useState, useTransition } from 'react';
import { Check, Upload, X } from 'lucide-react';
import { formatPaise, type Product } from '@bobby/shared';
import { Alert, Badge, Button, Input, Textarea, cn } from '@bobby/ui';
import { bulkUpdateStock, setStock, toggleAvailability } from './actions';

interface Row {
  variantId: string;
  productTitle: string;
  productSlug: string;
  sku: string;
  size: string;
  colour: string;
  pricePaise: number;
  stock: number;
  isAvailable: boolean;
}

function toRows(products: Product[]): Row[] {
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      variantId: v.id,
      productTitle: p.title,
      productSlug: p.slug,
      sku: v.sku,
      size: v.size,
      colour: v.colour,
      pricePaise: v.pricePaise,
      stock: v.stock,
      isAvailable: v.isAvailable,
    })),
  );
}

export function InventoryTable({ products }: { products: Product[] }) {
  const [rows, setRows] = useState<Row[]>(() => toRows(products));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [csv, setCsv] = useState('');
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const visible = rows.filter((r) => {
    if (filter === 'low' && !(r.stock > 0 && r.stock <= 3)) return false;
    if (filter === 'out' && r.stock !== 0) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.productTitle.toLowerCase().includes(q) ||
      r.sku.toLowerCase().includes(q) ||
      r.colour.toLowerCase().includes(q)
    );
  });

  function commitStock(row: Row) {
    const next = Number(draft);
    setEditing(null);

    if (!Number.isInteger(next) || next < 0) {
      setMessage({ tone: 'danger', text: 'Stock must be a whole number, zero or more.' });
      return;
    }
    if (next === row.stock) return;

    startTransition(async () => {
      const result = await setStock(row.variantId, next);
      if (result.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.variantId === row.variantId
              ? { ...r, stock: result.stock ?? next, isAvailable: (result.stock ?? next) > 0 }
              : r,
          ),
        );
        setMessage({ tone: 'success', text: `${row.productTitle} (${row.size}) set to ${next}.` });
      } else {
        setMessage({ tone: 'danger', text: result.error });
      }
    });
  }

  function flipAvailability(row: Row) {
    const next = !row.isAvailable;
    startTransition(async () => {
      const result = await toggleAvailability(row.variantId, next);
      if (result.ok) {
        setRows((prev) =>
          prev.map((r) => (r.variantId === row.variantId ? { ...r, isAvailable: next } : r)),
        );
        setMessage({
          tone: 'success',
          text: `${row.productTitle} (${row.size}) is now ${next ? 'available' : 'hidden'} on the storefront.`,
        });
      } else {
        setMessage({ tone: 'danger', text: result.error });
      }
    });
  }

  function runBulk() {
    setBulkErrors([]);
    startTransition(async () => {
      const result = await bulkUpdateStock(csv);
      if (result.ok) {
        setMessage({ tone: 'success', text: `Updated ${result.updated} variants.` });
        setBulkOpen(false);
        setCsv('');
        // Server state changed under us; reload to resync the table.
        window.location.reload();
      } else {
        setBulkErrors(result.errors);
      }
    });
  }

  return (
    <div className="p-6">
      {message && (
        <Alert tone={message.tone} className="mb-4">
          <span className="flex items-center justify-between gap-3">
            {message.text}
            <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </span>
        </Alert>
      )}

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product, SKU or colour…"
          aria-label="Search inventory"
          className="max-w-xs"
        />

        <div className="flex" role="group" aria-label="Filter by stock level">
          {(
            [
              ['all', 'All'],
              ['low', 'Low stock'],
              ['out', 'Sold out'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                'border px-3.5 py-2.5 text-xs tracking-wide uppercase transition-colors first:rounded-l-sm last:rounded-r-sm',
                filter === value
                  ? 'border-maroon bg-maroon text-cream'
                  : 'border-line bg-card text-ink hover:border-maroon',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={() => setBulkOpen((v) => !v)} className="ml-auto">
          <Upload className="size-3.5" />
          Bulk update
        </Button>
      </div>

      {/* Bulk panel */}
      {bulkOpen && (
        <div className="mb-4 border border-line bg-card p-5">
          <h2 className="font-display text-lg text-maroon">Bulk stock update</h2>
          <p className="mt-1 text-xs text-muted">
            Paste one <code>SKU,stock</code> per line. A header row is fine. Nothing is written
            unless every line is valid.
          </p>

          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={6}
            className="mt-3 font-mono text-xs"
            placeholder={`sku,stock\n${rows[0]?.sku ?? 'BE-EMBROI-DEE-M'},12\n${rows[1]?.sku ?? 'BE-EMBROI-DEE-L'},0`}
            aria-label="CSV stock data"
          />

          {bulkErrors.length > 0 && (
            <Alert tone="danger" className="mt-3">
              <p className="font-medium">Nothing was updated. Fix these first:</p>
              <ul className="mt-1 list-inside list-disc">
                {bulkErrors.slice(0, 8).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              {bulkErrors.length > 8 && <p className="mt-1">…and {bulkErrors.length - 8} more.</p>}
            </Alert>
          )}

          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={runBulk} loading={pending} disabled={!csv.trim()}>
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-line bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Product inventory: {visible.length} variants shown
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="label-caps px-4 py-3 text-muted">Product</th>
              <th scope="col" className="label-caps px-4 py-3 text-muted">SKU</th>
              <th scope="col" className="label-caps px-4 py-3 text-muted">Variant</th>
              <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Price</th>
              <th scope="col" className="label-caps px-4 py-3 text-right text-muted">Stock</th>
              <th scope="col" className="label-caps px-4 py-3 text-muted">Storefront</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                  No variants match that filter.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.variantId} className="transition-colors hover:bg-cream-panel/40">
                  <td className="px-4 py-3">
                    <p className="text-xs text-ink">{row.productTitle}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-[0.625rem] text-muted">{row.sku}</code>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-soft">
                    {row.colour} · {row.size}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                    {formatPaise(row.pricePaise)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === row.variantId ? (
                      <span className="flex items-center justify-end gap-1">
                        <Input
                          autoFocus
                          type="number"
                          min={0}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitStock(row);
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          aria-label={`Stock for ${row.productTitle} ${row.size}`}
                          className="w-20 px-2 py-1 text-right text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => commitStock(row)}
                          aria-label="Save"
                          className="p-1 text-success"
                        >
                          <Check className="size-4" />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(row.variantId);
                          setDraft(String(row.stock));
                        }}
                        className={cn(
                          'min-w-14 rounded-sm px-2 py-1 text-xs tabular-nums transition-colors hover:bg-cream-panel',
                          row.stock === 0
                            ? 'text-danger'
                            : row.stock <= 3
                              ? 'text-warning'
                              : 'text-ink',
                        )}
                        aria-label={`Edit stock for ${row.productTitle} ${row.size}, currently ${row.stock}`}
                      >
                        {row.stock}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => flipAvailability(row)}
                      disabled={pending}
                      className="disabled:opacity-50"
                      aria-label={`${row.isAvailable ? 'Hide' : 'Show'} ${row.productTitle} ${row.size} on the storefront`}
                    >
                      <Badge tone={row.isAvailable ? 'success' : 'neutral'}>
                        {row.isAvailable ? 'Visible' : 'Hidden'}
                      </Badge>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted">
        Showing {visible.length} of {rows.length} variants. Click a stock number to edit it.
      </p>
    </div>
  );
}
