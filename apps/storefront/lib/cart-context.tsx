'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { calculateTotals, type CartLineInput, type ResolvedCart } from '@bobby/shared';

const STORAGE_KEY = 'bobby-cart-v1';

/**
 * Cart state.
 *
 * The browser persists ONLY variant IDs and quantities. Prices, discounts and
 * totals always come back from `/api/cart/resolve`, so nothing a user edits in
 * devtools can change what an order costs.
 *
 * Production note: this uses localStorage, which is right for a client-rendered
 * cart in development. When accounts land, guests move to a signed HTTP-only
 * cookie and logged-in shoppers to a `carts` table — see DEVELOPMENT.md.
 */

interface CartContextValue {
  lines: CartLineInput[];
  resolved: ResolvedCart;
  isLoading: boolean;
  isOpen: boolean;
  couponCode: string | null;
  itemCount: number;
  addItem: (variantId: string, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const EMPTY: ResolvedCart = {
  lines: [],
  totals: calculateTotals([]),
  appliedCoupon: null,
  warnings: [],
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): { lines: CartLineInput[]; couponCode: string | null } {
  if (typeof window === 'undefined') return { lines: [], couponCode: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], couponCode: null };
    const parsed = JSON.parse(raw) as { lines?: unknown; couponCode?: unknown };

    // Anything malformed is discarded rather than trusted — this value is
    // user-writable and a bad shape here would crash the header on every page.
    const lines = Array.isArray(parsed.lines)
      ? parsed.lines.filter(
          (l): l is CartLineInput =>
            typeof l === 'object' &&
            l !== null &&
            typeof (l as CartLineInput).variantId === 'string' &&
            Number.isInteger((l as CartLineInput).quantity),
        )
      : [];

    return {
      lines,
      couponCode: typeof parsed.couponCode === 'string' ? parsed.couponCode : null,
    };
  } catch {
    return { lines: [], couponCode: null };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLineInput[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedCart>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Guards against an older in-flight resolve overwriting a newer result.
  const requestSeq = useRef(0);

  useEffect(() => {
    const stored = readStored();
    setLines(stored.lines);
    setCouponCode(stored.couponCode);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, couponCode }));
    } catch {
      // Private browsing or a full quota — the cart still works for this session.
    }
  }, [lines, couponCode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (lines.length === 0) {
      setResolved({ ...EMPTY, appliedCoupon: null });
      return;
    }

    const seq = ++requestSeq.current;
    const controller = new AbortController();
    setIsLoading(true);

    fetch('/api/cart/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, couponCode: couponCode ?? undefined }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('resolve failed'))))
      .then((data: ResolvedCart) => {
        if (seq !== requestSeq.current) return;
        setResolved(data);

        // The server may have dropped sold-out lines or trimmed quantities.
        // Mirror that back into local state so the two stay in step.
        const serverIds = new Set(data.lines.map((l) => l.variantId));
        setLines((prev) => {
          const next = prev
            .filter((l) => serverIds.has(l.variantId))
            .map((l) => {
              const match = data.lines.find((sl) => sl.variantId === l.variantId);
              return match ? { ...l, quantity: match.quantity } : l;
            });
          const changed =
            next.length !== prev.length ||
            next.some((l, i) => l.quantity !== prev[i]?.quantity);
          return changed ? next : prev;
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (seq === requestSeq.current) setResolved(EMPTY);
      })
      .finally(() => {
        if (seq === requestSeq.current) setIsLoading(false);
      });

    return () => controller.abort();
  }, [lines, couponCode, hydrated]);

  const addItem = useCallback((variantId: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variantId);
      if (existing) {
        return prev.map((l) =>
          l.variantId === variantId ? { ...l, quantity: Math.min(10, l.quantity + quantity) } : l,
        );
      }
      return [...prev, { variantId, quantity: Math.min(10, quantity) }];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.variantId !== variantId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(10, quantity) } : l)),
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCode(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      resolved,
      isLoading,
      isOpen,
      couponCode,
      itemCount: resolved.totals.itemCount,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      applyCoupon: (code: string) => setCouponCode(code.trim().toUpperCase() || null),
      removeCoupon: () => setCouponCode(null),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [lines, resolved, isLoading, isOpen, couponCode, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
