import type { Paise } from './money';

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type Occasion = 'wedding' | 'festive' | 'eid' | 'party' | 'daily';

export const OCCASIONS: readonly Occasion[] = [
  'wedding',
  'festive',
  'eid',
  'party',
  'daily',
] as const;

export const OCCASION_LABELS: Record<Occasion, string> = {
  wedding: 'Wedding',
  festive: 'Festive',
  eid: 'Eid',
  party: 'Party Wear',
  daily: 'Daily Wear',
};

/** Indian apparel sizing. Kept as a string union so size charts stay honest. */
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Free Size';

export const SIZES: readonly Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  isPrimary: boolean;
  /** Intrinsic dimensions — required so Next/Image can reserve space and avoid layout shift. */
  width: number;
  height: number;
  /** Attribution for stock imagery. Removed when the real photoshoot lands. */
  credit?: { name: string; url: string; source: string } | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: Size;
  colour: string;
  /** Hex swatch shown in the variant picker. */
  colourHex: string;
  pricePaise: Paise;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Short line used on cards and meta descriptions. */
  summary: string;
  categorySlug: string;
  fabric: string;
  workType: string;
  occasions: Occasion[];
  basePricePaise: Paise;
  compareAtPaise: Paise | null;
  status: ProductStatus;
  isNewArrival: boolean;
  isBestseller: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  careInstructions: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentSlug: string | null;
  imageUrl: string;
  /** Drives the icon rendered on the "Shop by Occasion" grid. */
  icon?: string;
  position: number;
}

// ---------------------------------------------------------------------------
// Cart & orders
// ---------------------------------------------------------------------------

/** What the browser stores. Deliberately holds NO prices — see cart.ts. */
export interface CartLineInput {
  variantId: string;
  quantity: number;
}

/** A cart line after the server has resolved and priced it. */
export interface CartLine {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  size: Size;
  colour: string;
  imageUrl: string;
  imageAlt: string;
  unitPricePaise: Paise;
  compareAtPaise: Paise | null;
  quantity: number;
  lineTotalPaise: Paise;
  /** Stock available right now, so the UI can cap the quantity stepper. */
  availableStock: number;
  inStock: boolean;
}

export interface CartTotals {
  subtotalPaise: Paise;
  discountPaise: Paise;
  shippingPaise: Paise;
  taxPaise: Paise;
  totalPaise: Paise;
  itemCount: number;
  /** How much more to spend to qualify for free shipping. Zero once qualified. */
  freeShippingRemainingPaise: Paise;
}

export interface ResolvedCart {
  lines: CartLine[];
  totals: CartTotals;
  appliedCoupon: AppliedCoupon | null;
  /** Lines dropped because the variant vanished or went out of stock. */
  warnings: string[];
}

export type OrderStatus =
  'PENDING' | 'PAID' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending payment',
  PAID: 'Paid',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

/** The happy path, in order. Used to render the tracking timeline. */
export const ORDER_TIMELINE: readonly OrderStatus[] = [
  'PAID',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
] as const;

export type PaymentMethod = 'RAZORPAY' | 'COD';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  label?: 'Home' | 'Work' | 'Other';
}

export interface OrderItem {
  id: string;
  variantId: string;
  productSlug: string;
  /** Snapshots. Editing a product later must never rewrite order history. */
  titleSnapshot: string;
  sizeSnapshot: Size;
  colourSnapshot: string;
  imageUrlSnapshot: string;
  unitPricePaise: Paise;
  quantity: number;
  lineTotalPaise: Paise;
}

export interface TrackingEvent {
  status: string;
  description: string;
  location: string | null;
  occurredAt: string;
}

export interface Shipment {
  id: string;
  awbCode: string | null;
  courierName: string | null;
  status: string;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  events: TrackingEvent[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  email: string;
  phone: string;
  items: OrderItem[];
  subtotalPaise: Paise;
  discountPaise: Paise;
  shippingPaise: Paise;
  taxPaise: Paise;
  totalPaise: Paise;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  shippingAddress: Address;
  shipment: Shipment | null;
  placedAt: string;
  updatedAt: string;
  notes?: string | null;
}

// ---------------------------------------------------------------------------
// Customers & staff
// ---------------------------------------------------------------------------

export interface Customer {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  addresses: Address[];
  createdAt: string;
  /** Denormalised for the admin customer list. */
  orderCount: number;
  totalSpentPaise: Paise;
}

export type StaffRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
  lastLoginAt: string | null;
}

// ---------------------------------------------------------------------------
// Marketing
// ---------------------------------------------------------------------------

export type CouponType = 'PERCENT' | 'FLAT';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  /** Percent (0-100) when type is PERCENT, else paise. */
  value: number;
  minOrderPaise: Paise;
  /** Ceiling on a percentage discount, in paise. Null means uncapped. */
  maxDiscountPaise: Paise | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface AppliedCoupon {
  code: string;
  description: string;
  discountPaise: Paise;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  position: number;
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  phone: string;
  hours: string;
  mapUrl: string;
}
