'use server';

import { revalidatePath } from 'next/cache';
import { getRepository } from '@bobby/db';

/**
 * Inventory mutations.
 *
 * Server Actions rather than API routes: they run only on the server, are
 * called directly from the form, and need no client-side fetch code.
 *
 * PRODUCTION NOTE: these are currently unauthenticated because there is no
 * auth backend yet. Before this is deployed anywhere reachable, every action
 * in this file must check the caller's staff session and role. The check
 * belongs here, at the mutation, not only in middleware — middleware protects
 * page navigation but a Server Action is its own entry point.
 */

export type ActionResult = { ok: true; stock?: number } | { ok: false; error: string };

export async function setStock(variantId: string, newStock: number): Promise<ActionResult> {
  if (!Number.isInteger(newStock) || newStock < 0 || newStock > 9999) {
    return { ok: false, error: 'Stock must be a whole number between 0 and 9999.' };
  }

  const repo = getRepository();
  const variant = await repo.getVariantById(variantId);
  if (!variant) return { ok: false, error: 'That variant no longer exists.' };

  // adjustStock takes a delta, so convert the absolute target into one.
  const delta = newStock - variant.stock;
  const result = await repo.adjustStock(variantId, delta);
  if (!result.ok) return { ok: false, error: 'Could not update stock.' };

  // Refresh the storefront pages this affects. In production these become
  // revalidateTag calls so only the touched product is rebuilt.
  revalidatePath('/inventory');
  revalidatePath('/products');

  return { ok: true, stock: result.stock };
}

export async function toggleAvailability(
  variantId: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  const repo = getRepository();
  const ok = await repo.setVariantAvailability(variantId, isAvailable);
  if (!ok) return { ok: false, error: 'That variant no longer exists.' };

  revalidatePath('/inventory');
  revalidatePath('/products');
  return { ok: true };
}

/**
 * Bulk stock update from a pasted CSV of `sku,stock`.
 *
 * Every row is validated before anything is written, so a typo halfway down a
 * hundred-row paste does not leave the catalogue half-updated.
 */
export async function bulkUpdateStock(
  csv: string,
): Promise<{ ok: boolean; updated: number; errors: string[] }> {
  const repo = getRepository();
  const errors: string[] = [];
  const planned: { variantId: string; stock: number }[] = [];

  const rows = csv
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean);

  // Build a SKU index once rather than scanning per row.
  const { items } = await repo.listProducts({}, 'newest', 1, 500);
  const bySku = new Map<string, string>();
  for (const product of items) {
    for (const variant of product.variants) bySku.set(variant.sku.toUpperCase(), variant.id);
  }

  rows.forEach((row, i) => {
    const lineNo = i + 1;
    const [rawSku, rawStock] = row.split(',').map((c) => c?.trim() ?? '');

    // Tolerate a header row.
    if (i === 0 && rawSku?.toLowerCase() === 'sku') return;

    if (!rawSku || !rawStock) {
      errors.push(`Line ${lineNo}: expected "sku,stock"`);
      return;
    }

    const variantId = bySku.get(rawSku.toUpperCase());
    if (!variantId) {
      errors.push(`Line ${lineNo}: unknown SKU "${rawSku}"`);
      return;
    }

    const stock = Number(rawStock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
      errors.push(`Line ${lineNo}: "${rawStock}" is not a valid stock number`);
      return;
    }

    planned.push({ variantId, stock });
  });

  // Validate-then-apply: refuse the whole batch if any row is bad.
  if (errors.length > 0) return { ok: false, updated: 0, errors };

  let updated = 0;
  for (const change of planned) {
    const variant = await repo.getVariantById(change.variantId);
    if (!variant) continue;
    const result = await repo.adjustStock(change.variantId, change.stock - variant.stock);
    if (result.ok) updated++;
  }

  revalidatePath('/inventory');
  revalidatePath('/products');

  return { ok: true, updated, errors: [] };
}
