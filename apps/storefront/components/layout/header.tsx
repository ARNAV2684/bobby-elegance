'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { MAIN_NAV } from '@bobby/shared';
import { Container, cn } from '@bobby/ui';
import { useCart } from '@/lib/cart-context';
import { AnnouncementBar } from './announcement-bar';
import { Logo } from './logo';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Any navigation closes every overlay — otherwise the mobile menu stays open
  // over the page the user just chose.
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Lock body scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMobileOpen(false);
      setSearchOpen(false);
      setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery('');
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <div className="border-b border-line bg-card/95 backdrop-blur-sm">
        <Container wide>
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Mobile: menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-2 flex size-11 items-center justify-center text-ink lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </button>

            <Link href="/" aria-label="Bobby Elegance — home" className="shrink-0">
              <Logo />
            </Link>

            {/* Desktop navigation */}
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {MAIN_NAV.map((item) => (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => item.children && setOpenMenu(item.href)}
                    onMouseLeave={() => item.children && setOpenMenu(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'label-caps flex items-center gap-1 py-2 transition-colors hover:text-maroon',
                        isActive(item.href) ? 'text-maroon' : 'text-ink-soft',
                      )}
                      aria-haspopup={item.children ? 'true' : undefined}
                      aria-expanded={item.children ? openMenu === item.href : undefined}
                    >
                      {item.label}
                      {item.children && <ChevronDown className="size-3" aria-hidden="true" />}
                      {isActive(item.href) && (
                        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-maroon" />
                      )}
                    </Link>

                    {item.children && openMenu === item.href && (
                      <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-2">
                        <ul className="animate-fade-up rounded-sm border border-line bg-card p-2 shadow-lg shadow-maroon/5">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block rounded-sm px-3 py-2.5 transition-colors hover:bg-cream-panel"
                              >
                                <span className="block text-sm text-ink">{child.label}</span>
                                {child.description && (
                                  <span className="block text-xs text-muted">
                                    {child.description}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Utility icons */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="flex size-11 items-center justify-center text-ink transition-colors hover:text-maroon"
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search className="size-[18px]" />
              </button>

              <Link
                href="/account/wishlist"
                className="hidden size-11 items-center justify-center text-ink transition-colors hover:text-maroon sm:flex"
                aria-label="Wishlist"
              >
                <Heart className="size-[18px]" />
              </Link>

              <Link
                href="/account"
                className="hidden size-11 items-center justify-center text-ink transition-colors hover:text-maroon sm:flex"
                aria-label="Account"
              >
                <User className="size-[18px]" />
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="relative flex size-11 items-center justify-center text-ink transition-colors hover:text-maroon"
                aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
              >
                <ShoppingBag className="size-[18px]" />
                <span
                  className={cn(
                    'absolute right-1 top-1.5 flex size-4 items-center justify-center rounded-full text-[0.5625rem] font-medium tabular-nums',
                    itemCount > 0 ? 'bg-maroon text-cream' : 'bg-line text-ink-soft',
                  )}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              </button>
            </div>
          </div>
        </Container>

        {/* Search bar */}
        {searchOpen && (
          <div className="animate-fade-up border-t border-line bg-cream">
            <Container wide>
              <form onSubmit={submitSearch} className="flex items-center gap-3 py-4" role="search">
                <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for anarkali, lehenga, sharara…"
                  aria-label="Search products"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-muted hover:text-ink"
                  aria-label="Close search"
                >
                  <X className="size-4" />
                </button>
              </form>
            </Container>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo showTagline={false} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-11 items-center justify-center text-ink"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-4">
              <ul className="flex flex-col">
                {MAIN_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-4 py-3.5 text-sm tracking-wide uppercase transition-colors',
                        isActive(item.href) ? 'text-maroon' : 'text-ink',
                      )}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <ul className="mb-2 ml-4 border-l border-line">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-4 py-2.5 text-sm text-muted transition-colors hover:text-maroon"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-4 border-t border-line px-5 py-4">
              <Link href="/account" className="flex items-center gap-2 text-sm text-ink">
                <User className="size-4" /> Account
              </Link>
              <Link href="/account/wishlist" className="flex items-center gap-2 text-sm text-ink">
                <Heart className="size-4" /> Wishlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
