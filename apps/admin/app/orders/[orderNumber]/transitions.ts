import type { OrderStatus } from '@bobby/shared';

/**
 * Legal order status transitions.
 *
 * Lives in its own module because a `'use server'` file may only export async
 * functions — this map and its sync lookup cannot sit alongside the actions.
 *
 * Transitions are whitelisted rather than free-form so a stray click cannot
 * mark a cancelled order delivered or move a shipped order back to paid. Order
 * history is the one thing a shop cannot afford to have wrong.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['CONFIRMED', 'CANCELLED', 'REFUNDED'],
  CONFIRMED: ['PACKED', 'CANCELLED', 'REFUNDED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  // Terminal states.
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function allowedTransitions(from: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[from];
}
