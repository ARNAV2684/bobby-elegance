import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-line bg-card flex flex-wrap items-end justify-between gap-4 border-b px-6 py-5">
      <div>
        <h1 className="font-display text-maroon text-2xl">{title}</h1>
        {subtitle && <p className="text-muted mt-0.5 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    default: 'text-maroon',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  } as const;

  return (
    <div className="border-line bg-card border p-5">
      <p className="label-caps text-muted">{label}</p>
      <p className={`font-display mt-2 text-3xl font-semibold tabular-nums ${tones[tone]}`}>
        {value}
      </p>
      {hint && <p className="text-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}
