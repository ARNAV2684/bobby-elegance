import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'gold' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-maroon text-cream hover:bg-maroon-hover active:bg-maroon-deep border border-transparent',
  outline:
    'bg-transparent text-maroon border border-maroon hover:bg-maroon hover:text-cream',
  ghost: 'bg-transparent text-ink hover:bg-cream-panel border border-transparent',
  gold: 'bg-gold text-maroon-deep hover:bg-gold-light border border-transparent font-medium',
  danger: 'bg-danger text-white hover:opacity-90 border border-transparent',
  subtle: 'bg-cream-panel text-ink hover:bg-line border border-transparent',
};

const SIZES: Record<Size, string> = {
  // min-h values keep every control at or above the 44px mobile tap target.
  sm: 'text-xs px-4 py-2 min-h-9 tracking-[0.12em]',
  md: 'text-xs px-7 py-3 min-h-11 tracking-[0.16em]',
  lg: 'text-sm px-9 py-4 min-h-12 tracking-[0.18em]',
};

const BASE =
  'inline-flex items-center justify-center gap-2 uppercase transition-all duration-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-55';

/**
 * The class string behind Button, exported so anchors and Next `<Link>`s can
 * look identical without nesting a link inside a button (invalid HTML, and a
 * screen reader announces it as two overlapping controls).
 */
export function buttonClasses(opts: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  const { variant = 'primary', size = 'md', fullWidth, className } = opts;
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // A loading button stays focusable but is not actionable — disabling it
      // outright would move focus and lose the user's place mid-checkout.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
