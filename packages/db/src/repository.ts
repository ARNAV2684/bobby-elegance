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

/**
 * The data-access contract.
 *
 * Every page and route handler talks to this interface and never to a concrete
 * database. Two implementations exist:
 *
 *   MockRepository   — in-memory seed data. The default. Zero configuration,
 *                      no network, no account required. This is what runs today.
 *   PrismaRepository — real Postgres. Activated by setting DATA_DRIVER=prisma
 *                      and DATABASE_URL.
 *
 * Because the contract is identical, switching costs one environment variable.
 * No page, component or handler changes.
 */

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'bestselling';

export interface ProductFilters {
  categorySlug?: string;
  collectionSlug?: string;
  occasions?: string[];
  sizes?: string[];
  colours?: string[];
  fabrics?: string[];
  minPricePaise?: number;
  maxPricePaise?: number;
  search?: string;
  inStockOnly?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** The distinct values present in a result set, for building filter UI. */
export interface FacetCounts {
  sizes: { value: string; count: number }[];
  colours: { value: string; hex: string; count: number }[];
  fabrics: { value: string; count: number }[];
  occasions: { value: string; count: number }[];
  priceRange: { minPaise: number; maxPaise: number };
}

export interface DashboardStats {
  ordersToday: number;
  revenueTodayPaise: number;
  ordersThisMonth: number;
  revenueThisMonthPaise: number;
  pendingFulfilment: number;
  lowStockCount: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface Repository {
  // catalogue
  listProducts(
    filters?: ProductFilters,
    sort?: ProductSort,
    page?: number,
    pageSize?: number,
  ): Promise<Paginated<Product>>;
  getFacets(filters?: ProductFilters): Promise<FacetCounts>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getRelatedProducts(slug: string, limit?: number): Promise<Product[]>;
  getVariantById(variantId: string): Promise<(ProductVariant & { product: Product }) | null>;
  getVariantsByIds(variantIds: string[]): Promise<(ProductVariant & { product: Product })[]>;

  // taxonomy
  listCategories(): Promise<Category[]>;
  listCollections(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;

  // marketing
  getCouponByCode(code: string): Promise<Coupon | null>;
  listCoupons(): Promise<Coupon[]>;
  listHeroSlides(): Promise<HeroSlide[]>;

  // orders
  listOrders(opts?: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Paginated<Order>>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;
  getOrdersForCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: Order): Promise<Order>;
  updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<Order | null>;

  // people
  listCustomers(opts?: { search?: string }): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
  listStaff(): Promise<StaffUser[]>;

  // inventory
  adjustStock(variantId: string, delta: number): Promise<{ ok: boolean; stock: number }>;
  setVariantAvailability(variantId: string, isAvailable: boolean): Promise<boolean>;
  listLowStock(threshold?: number): Promise<(ProductVariant & { productTitle: string })[]>;

  // admin
  getDashboardStats(): Promise<DashboardStats>;
}
