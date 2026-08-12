'use server';

import { revalidatePath } from 'next/cache';
import { getRepository } from '@bobby/db';
import type { OrderStatus } from '@bobby/shared';
import { ALLOWED_TRANSITIONS } from './transitions';

/**
 * Order status transitions.
 *
 * PRODUCTION NOTE: unauthenticated for now. Add a staff-session and role check
 * here before deploying — a Server Action is its own HTTP entry point and is
 * not covered by page middleware.
 */
export async function updateOrderStatus(
  orderNumber: string,
  next: OrderStatus,
): Promise<{ ok: boolean; error?: string }> {
  const repo = getRepository();
  const order = await repo.getOrderByNumber(orderNumber);
  if (!order) return { ok: false, error: 'Order not found.' };

  if (!ALLOWED_TRANSITIONS[order.status].includes(next)) {
    return { ok: false, error: `Cannot move an order from "${order.status}" to "${next}".` };
  }

  await repo.updateOrderStatus(orderNumber, next);

  revalidatePath(`/orders/${orderNumber}`);
  revalidatePath('/orders');
  revalidatePath('/');

  return { ok: true };
}
