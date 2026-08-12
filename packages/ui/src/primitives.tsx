import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

/** Page gutter and max width, matching the template's 980px content column. */
export function Container({
  className,
  wide,
  children,
}: {
  className?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-[var(--spacing-gutter)]',
        wide ? 'max-w-[1280px]' : 'max-w-[1140px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * The gold ornament divider that sits under every section heading in the
 * templates: a hairline rule either side of a small diamond.
 */
export function Ornament({
  className,
  tone = 'gold',
}: {
  className?: string;
  tone?: 'gold' | 'cream';
}) {
  const colour = tone === 'gold' ? 'bg-gold-muted' : 'bg-cream/50';
  return (
    <span className={cn('flex items-center justify-center gap-2', className)} aria-hidden="true">
      <span className={cn('h-px w-10', colour)} />
      <span className={cn('size-1.5 rotate-45', colour)} />
      <span className={cn('h-px w-10', colour)} />
    </span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'ink',
  className,
  as: Tag = 'h2',
}: {
  /** Applied to the heading element so a section can aria-labelledby it. */
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
  tone?: 'ink' | 'cream';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span className={cn('label-caps', tone === 'cream' ? 'text-gold' : 'text-gold-muted')}>
          {eyebrow}
        </span>
      )}
      <Tag
        id={id}
        className={cn(
          'font-display text-3xl tracking-wide sm:text-4xl',
          tone === 'cream' ? 'text-cream' : 'text-maroon',
        )}
      >
        {title}
      </Tag>
      <Ornament tone={tone === 'cream' ? 'cream' : 'gold'} />
      {subtitle && (
        <p
          className={cn(
            'max-w-xl text-sm leading-relaxed',
            tone === 'cream' ? 'text-cream/75' : 'text-muted',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------

const FIELD_BASE =
  'w-full rounded-sm border bg-card px-4 py-3 text-sm text-ink transition-colors ' +
  'placeholder:text-muted/70 focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon/15 ' +
  'disabled:cursor-not-allowed disabled:bg-cream-panel/60';

export interface FieldProps {
  label?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
}

/** Wraps a control with its label, hint and error, and wires up aria-describedby. */
export function Field({
  label,
  error,
  hint,
  required,
  htmlFor,
  className,
  children,
}: FieldProps & { htmlFor?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label-caps text-ink-soft">
          {label}
          {required && (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-muted text-xs">{hint}</p>}
      {error && (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        FIELD_BASE,
        invalid && 'border-danger focus:border-danger focus:ring-danger/15',
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE, 'min-h-32 resize-y', invalid && 'border-danger', className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        FIELD_BASE,
        'cursor-pointer appearance-none pr-10',
        invalid && 'border-danger',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'maroon' | 'info';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-cream-panel text-ink-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  gold: 'bg-gold/20 text-[#7a5c25]',
  maroon: 'bg-maroon text-cream',
  info: 'bg-[#e8eef6] text-info',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'label-caps inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem]',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-line/60 animate-pulse rounded-sm', className)} aria-hidden="true" />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'border-maroon inline-block size-5 animate-spin rounded-full border-2 border-t-transparent',
        className,
      )}
    />
  );
}

export function Alert({
  tone = 'info',
  title,
  className,
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  const tones = {
    info: 'border-info/30 bg-[#e8eef6] text-info',
    success: 'border-success/30 bg-success-soft text-success',
    warning: 'border-warning/30 bg-warning-soft text-warning',
    danger: 'border-danger/30 bg-danger-soft text-danger',
  } as const;

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('rounded-sm border px-4 py-3 text-sm', tones[tone], className)}
    >
      {title && <p className="mb-0.5 font-medium">{title}</p>}
      {children}
    </div>
  );
}

/** A dismissible-free empty state used across listings. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-20 text-center', className)}>
      {icon && <div className="text-gold-muted">{icon}</div>}
      <h3 className="font-display text-maroon text-2xl">{title}</h3>
      {description && <p className="text-muted max-w-md text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-line border-0 border-t', className)} {...props} />;
}
