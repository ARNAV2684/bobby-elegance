'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react';
import { cn } from '@bobby/ui';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/coupons', label: 'Coupons', icon: Tag },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-maroon-deep lg:flex">
        <div className="border-b border-cream/10 px-5 py-5">
          <p className="font-display text-lg leading-none tracking-[0.14em] text-cream">BOBBY</p>
          <p className="label-caps mt-1 text-gold">Admin Portal</p>
        </div>

        <nav aria-label="Admin" className="flex-1 p-3">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-cream/10 text-gold'
                      : 'text-cream/70 hover:bg-cream/5 hover:text-cream',
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-cream/10 p-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-cream/70 transition-colors hover:text-gold"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View storefront
          </a>
          <div className="mt-2 rounded-sm bg-cream/5 px-3 py-2.5">
            <p className="text-xs text-cream">Abdullah Khan</p>
            <p className="label-caps text-gold">Owner</p>
          </div>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-maroon-deep lg:hidden"
      >
        <ul className="flex">
          {NAV.slice(0, 5).map((item) => (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[0.5625rem] tracking-wide uppercase',
                  isActive(item.href) ? 'text-gold' : 'text-cream/60',
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
