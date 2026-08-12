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
      <aside className="border-line bg-maroon-deep hidden w-56 shrink-0 flex-col border-r lg:flex">
        <div className="border-cream/10 border-b px-5 py-5">
          <p className="font-display text-cream text-lg leading-none tracking-[0.14em]">BOBBY</p>
          <p className="label-caps text-gold mt-1">Admin Portal</p>
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

        <div className="border-cream/10 border-t p-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/70 hover:text-gold flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View storefront
          </a>
          <div className="bg-cream/5 mt-2 rounded-sm px-3 py-2.5">
            <p className="text-cream text-xs">Abdullah Khan</p>
            <p className="label-caps text-gold">Owner</p>
          </div>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <nav
        aria-label="Admin"
        className="border-line bg-maroon-deep fixed inset-x-0 bottom-0 z-50 border-t lg:hidden"
      >
        <ul className="flex">
          {NAV.slice(0, 5).map((item) => (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[0.5625rem] uppercase tracking-wide',
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
