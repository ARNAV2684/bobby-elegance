import type {
  Category,
  Coupon,
  Customer,
  HeroSlide,
  Order,
  OrderStatus,
  Product,
  ProductVariant,
  StaffUser,
} from '@bobby/shared';
import { CATEGORIES, COLLECTIONS, COLLECTION_RULES, PRODUCTS } from './seed/catalog';
import { COUPONS, HERO_SLIDES } from './seed/marketing';
import { CUSTOMERS, ORDERS, STAFF } from './seed/orders';
import type {
  DashboardStats,
  FacetCounts,
  Paginated,
  ProductFilters,
  ProductSort,
  Repository,
} from './repository';

/**
 * In-memory implementation backed by the seed data.
 *
 * Mutations (stock adjustments, new orders, status changes) persist for the
 * lifetime of the server process and reset on restart. That is intentional for
 * a development build: the demo always starts from a known, presentable state,
 * and there is no database to install before `pnpm dev` works.
 */
export class MockRepository implements Repository {
  private products: Product[] = structuredClone(PRODUCTS);
  private orders: Order[] = structuredClone(ORDERS);
  private customers: Customer[] = structuredClone(CUSTOMERS);
  private coupons: Coupon[] = structuredClone(COUPONS);

  // -------------------------------------------------------------------------
  // Catalogue
  // -------------------------------------------------------------------------

  private applyFilters(filters: ProductFilters = {}): Product[] {
    let out = this.products.filter((p) => p.status === 'ACTIVE');

    if (filters.categorySlug) {
      out = out.filter((p) => p.categorySlug === filters.categorySlug);
    }

    if (filters.collectionSlug) {
      const rule = COLLECTION_RULES[filters.collectionSlug];
      // An unknown collection slug yields nothing rather than everything —
      // a typo in a URL should 404, not silently show the whole catalogue.
      out = rule ? out.filter(rule) : [];
    }

    if (filters.occasions?.length) {
      out = out.filter((p) => filters.occasions!.some((o) => p.occasions.includes(o as never)));
    }

    if (filters.sizes?.length) {
      out = out.filter((p) =>
        p.variants.some((v) => filters.sizes!.includes(v.size) && v.stock > 0),
      );
    }

    if (filters.colours?.length) {
      out = out.filter((p) => p.variants.some((v) => filters.colours!.includes(v.colour)));
    }

    if (filters.fabrics?.length) {
      out = out.filter((p) => filters.fabrics!.includes(p.fabric));
    }

    if (filters.minPricePaise != null) {
      out = out.filter((p) => p.basePricePaise >= filters.minPricePaise!);
    }

    if (filters.maxPricePaise != null) {
      out = out.filter((p) => p.basePricePaise <= filters.maxPricePaise!);
    }

    if (filters.inStockOnly) {
      out = out.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);
      out = out.filter((p) => {
        const haystack = [
          p.title,
          p.summary,
          p.description,
          p.fabric,
          p.workType,
          p.categorySlug,
          ...p.occasions,
          ...p.variants.map((v) => v.colour),
        ]
          .join(' ')
          .toLowerCase();
        // Every term must appear somewhere — closer to how a real search reads.
        return terms.every((t) => haystack.includes(t));
      });
    }

    return out;
  }

  private sortProducts(items: Product[], sort: ProductSort = 'newest'): Product[] {
    const out = [...items];
    switch (sort) {
      case 'price-asc':
        return out.sort((a, b) => a.basePricePaise - b.basePricePaise);
      case 'price-desc':
        return out.sort((a, b) => b.basePricePaise - a.basePricePaise);
      case 'name-asc':
        return out.sort((a, b) => a.title.localeCompare(b.title));
      case 'bestselling':
        return out.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
      case 'newest':
      default:
        return out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    }
  }

  async listProducts(
    filters: ProductFilters = {},
    sort: ProductSort = 'newest',
    page = 1,
    pageSize = 12,
  ): Promise<Paginated<Product>> {
    const filtered = this.sortProducts(this.applyFilters(filters), sort);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  async getFacets(filters: ProductFilters = {}): Promise<FacetCounts> {
    // Facets are computed WITHOUT the facet-type filters applied, so a shopper
    // who picks "M" still sees how many items exist in L — otherwise every
    // other option would read as zero the moment one is chosen.
    const base = this.applyFilters({
      categorySlug: filters.categorySlug,
      collectionSlug: filters.collectionSlug,
      search: filters.search,
    });

    const count = <T extends string>(values: T[]) => {
      const m = new Map<T, number>();
      for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m.entries()].map(([value, c]) => ({ value, count: c }));
    };

    const sizes = count(
      base.flatMap((p) => [...new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.size))]),
    );

    const colourMap = new Map<string, { hex: string; count: number }>();
    for (const p of base) {
      for (const colour of new Set(p.variants.map((v) => v.colour))) {
        const hex = p.variants.find((v) => v.colour === colour)?.colourHex ?? '#000000';
        const prev = colourMap.get(colour);
        colourMap.set(colour, { hex, count: (prev?.count ?? 0) + 1 });
      }
    }

    const prices = base.map((p) => p.basePricePaise);

    return {
      sizes: sizes.sort((a, b) => b.count - a.count),
      colours: [...colourMap.entries()]
        .map(([value, v]) => ({ value, hex: v.hex, count: v.count }))
        .sort((a, b) => b.count - a.count),
      fabrics: count(base.map((p) => p.fabric)).sort((a, b) => b.count - a.count),
      occasions: count(base.flatMap((p) => p.occasions)).sort((a, b) => b.count - a.count),
      priceRange: {
        minPaise: prices.length ? Math.min(...prices) : 0,
        maxPaise: prices.length ? Math.max(...prices) : 0,
      },
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug) ?? null;
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
    const product = await this.getProductBySlug(slug);
    if (!product) return [];

    // Prefer the same category, then anything sharing an occasion.
    const sameCategory = this.products.filter(
      (p) => p.slug !== slug && p.categorySlug === product.categorySlug && p.status === 'ACTIVE',
    );
    const sharedOccasion = this.products.filter(
      (p) =>
        p.slug !== slug &&
        p.categorySlug !== product.categorySlug &&
        p.status === 'ACTIVE' &&
        p.occasions.some((o) => product.occasions.includes(o)),
    );

    return [...sameCategory, ...sharedOccasion].slice(0, limit);
  }

  async getVariantById(variantId: string) {
    for (const product of this.products) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) return { ...variant, product };
    }
    return null;
  }

  async getVariantsByIds(variantIds: string[]) {
    const wanted = new Set(variantIds);
    const out: (ProductVariant & { product: Product })[] = [];
    for (const product of this.products) {
      for (const variant of product.variants) {
        if (wanted.has(variant.id)) out.push({ ...variant, product });
      }
    }
    return out;
  }

  // -------------------------------------------------------------------------
  // Taxonomy
  // -------------------------------------------------------------------------

  async listCategories(): Promise<Category[]> {
    return [...CATEGORIES].sort((a, b) => a.position - b.position);
  }

  async listCollections(): Promise<Category[]> {
    return [...COLLECTIONS].sort((a, b) => a.position - b.position);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return [...CATEGORIES, ...COLLECTIONS].find((c) => c.slug === slug) ?? null;
  }

  // -------------------------------------------------------------------------
  // Marketing
  // -------------------------------------------------------------------------

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const needle = code.trim().toUpperCase();
    return this.coupons.find((c) => c.code === needle) ?? null;
  }

  async listCoupons(): Promise<Coupon[]> {
    return [...this.coupons];
  }

  async listHeroSlides(): Promise<HeroSlide[]> {
    return HERO_SLIDES.filter((s) => s.isActive).sort((a, b) => a.position - b.position);
  }

  // -------------------------------------------------------------------------
  // Orders
  // -------------------------------------------------------------------------

  async listOrders(
    opts: { status?: OrderStatus; search?: string; page?: number; pageSize?: number } = {},
  ): Promise<Paginated<Order>> {
    let out = [...this.orders];

    if (opts.status) out = out.filter((o) => o.status === opts.status);

    if (opts.search) {
      const q = opts.search.toLowerCase().trim();
      out = out.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.shippingAddress.fullName.toLowerCase().includes(q),
      );
    }

    out.sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt));

    const pageSize = opts.pageSize ?? 20;
    const total = out.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
    const start = (page - 1) * pageSize;

    return { items: out.slice(start, start + pageSize), total, page, pageSize, totalPages };
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.orders.find((o) => o.orderNumber === orderNumber.trim().toUpperCase()) ?? null;
  }

  async getOrdersForCustomer(customerId: string): Promise<Order[]> {
    return this.orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt));
  }

  async createOrder(order: Order): Promise<Order> {
    this.orders.unshift(order);
    return order;
  }

  async updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  // -------------------------------------------------------------------------
  // People
  // -------------------------------------------------------------------------

  async listCustomers(opts: { search?: string } = {}): Promise<Customer[]> {
    if (!opts.search) return [...this.customers];
    const q = opts.search.toLowerCase().trim();
    return this.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q),
    );
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id) ?? null;
  }

  async listStaff(): Promise<StaffUser[]> {
    return [...STAFF];
  }

  // -------------------------------------------------------------------------
  // Inventory
  // -------------------------------------------------------------------------

  /**
   * Adjust stock atomically-in-spirit.
   *
   * The real Postgres implementation runs
   *   UPDATE variants SET stock = stock + $delta WHERE id = $id AND stock + $delta >= 0
   * and checks the affected row count. Here the single-threaded event loop gives
   * us the same guarantee for free, but the guard against going negative is kept
   * so behaviour matches across both drivers.
   */
  async adjustStock(variantId: string, delta: number): Promise<{ ok: boolean; stock: number }> {
    for (const product of this.products) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) continue;

      const next = variant.stock + delta;
      if (next < 0) return { ok: false, stock: variant.stock };

      variant.stock = next;
      variant.isAvailable = next > 0;
      return { ok: true, stock: next };
    }
    return { ok: false, stock: 0 };
  }

  async setVariantAvailability(variantId: string, isAvailable: boolean): Promise<boolean> {
    for (const product of this.products) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        variant.isAvailable = isAvailable;
        return true;
      }
    }
    return false;
  }

  async listLowStock(threshold?: number) {
    const out: (ProductVariant & { productTitle: string })[] = [];
    for (const product of this.products) {
      for (const variant of product.variants) {
        const limit = threshold ?? variant.lowStockThreshold;
        if (variant.stock <= limit) out.push({ ...variant, productTitle: product.title });
      }
    }
    return out.sort((a, b) => a.stock - b.stock);
  }

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const counted = this.orders.filter((o) => o.status !== 'CANCELLED');
    const today = counted.filter((o) => Date.parse(o.placedAt) >= startOfDay);
    const month = counted.filter((o) => Date.parse(o.placedAt) >= startOfMonth);
    const sum = (orders: Order[]) => orders.reduce((s, o) => s + o.totalPaise, 0);

    const lowStock = await this.listLowStock();

    return {
      ordersToday: today.length,
      revenueTodayPaise: sum(today),
      ordersThisMonth: month.length,
      revenueThisMonthPaise: sum(month),
      pendingFulfilment: this.orders.filter((o) =>
        (['PAID', 'CONFIRMED', 'PACKED'] as OrderStatus[]).includes(o.status),
      ).length,
      lowStockCount: lowStock.length,
      totalProducts: this.products.filter((p) => p.status === 'ACTIVE').length,
      totalCustomers: this.customers.length,
    };
  }
}
