import { cn } from '@bobby/ui';

/**
 * The wordmark: a monogram "B" in an ornamental frame beside the two-line
 * name, matching the templates. Drawn as SVG rather than an image so it stays
 * crisp at every size and inherits colour from the surrounding theme.
 *
 * TODO-BEFORE-LAUNCH: replace with the client's official vector logo.
 */
export function Logo({
  className,
  tone = 'maroon',
  showTagline = true,
}: {
  className?: string;
  tone?: 'maroon' | 'cream';
  showTagline?: boolean;
}) {
  const ink = tone === 'cream' ? 'text-cream' : 'text-maroon';
  const accent = tone === 'cream' ? 'text-gold' : 'text-gold-muted';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 48 48"
        className={cn('size-10 shrink-0', accent)}
        aria-hidden="true"
        fill="none"
      >
        {/* Ornamental octagon frame */}
        <path
          d="M15 2h18l13 13v18L33 46H15L2 33V15L15 2z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M16.5 6h15l10.5 10.5v15L31.5 42h-15L6 31.5v-15L16.5 6z"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.55"
        />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          className={cn('font-display', ink)}
          fill="currentColor"
          style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)' }}
        >
          B
        </text>
      </svg>

      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-xl font-semibold tracking-[0.14em]', ink)}>
          BOBBY
        </span>
        <span className={cn('font-display text-sm font-medium tracking-[0.26em]', ink)}>
          ELEGANCE
        </span>
        {showTagline && (
          <span className={cn('mt-0.5 text-[0.5rem] tracking-[0.3em]', accent)}>
            — ETHNIC WEAR —
          </span>
        )}
      </span>
    </span>
  );
}
