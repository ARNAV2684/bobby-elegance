import type { OrderStatus } from '@bobby/shared';

/**
 * Badge colour per order status.
 *
 * Kept out of `page.tsx` because importing a non-component value from a route
 * file drags the whole page module into every consumer's bundle.
 */
export const TONE: Record<OrderStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  PAID: 'info',
  CONFIRMED: 'info',
  PACKED: 'warning',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
};
