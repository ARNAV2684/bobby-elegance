import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@bobby/ui';

/**
 * Rendered as real links (not buttons) so pages are crawlable, middle-clickable
 * and work without JavaScript.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === 'page' || v === undefined) continue;
      next.set(k, Array.isArray(v) ? v.join(',') : v);
    }
    if (p > 1) next.set('page', String(p));
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Show first, last, current and its neighbours; ellipsis for the rest.
  const pages: (number | 'gap')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== 'gap') pages.push('gap');
  }

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className="flex size-10 items-center justify-center border border-line text-ink transition-colors hover:border-maroon hover:text-maroon"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="flex size-10 items-center justify-center border border-line/50 text-muted/40">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1.5 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex size-10 items-center justify-center border text-sm tabular-nums transition-colors',
              p === page
                ? 'border-maroon bg-maroon text-cream'
                : 'border-line text-ink hover:border-maroon hover:text-maroon',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          rel="next"
          aria-label="Next page"
          className="flex size-10 items-center justify-center border border-line text-ink transition-colors hover:border-maroon hover:text-maroon"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="flex size-10 items-center justify-center border border-line/50 text-muted/40">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
