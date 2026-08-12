import { MockRepository } from './mock-repository';
import type { Repository } from './repository';

export * from './repository';
export { MockRepository } from './mock-repository';
export { CATEGORIES, COLLECTIONS, PRODUCTS } from './seed/catalog';
export { COUPONS, HERO_SLIDES } from './seed/marketing';
export { CUSTOMERS, ORDERS, STAFF } from './seed/orders';

/**
 * The singleton is parked on globalThis rather than in a module-level variable.
 *
 * Next.js bundles route handlers and page components into separate module
 * graphs, so each would otherwise get its own copy of this module — and its own
 * MockRepository. An order written by POST /api/checkout would then be invisible
 * to the confirmation page rendering in a different bundle, which shows up as a
 * 404 immediately after a successful checkout.
 *
 * Hanging it off globalThis gives one instance per Node process. This is the
 * same pattern the Prisma docs prescribe for the Prisma client in development,
 * and it also survives hot-module reloads, so in-memory orders are not wiped
 * every time a file is saved.
 */
const GLOBAL_KEY = Symbol.for('bobby.repository');

type GlobalWithRepo = typeof globalThis & { [GLOBAL_KEY]?: Repository };

function createRepository(): Repository {
  const driver = process.env.DATA_DRIVER?.toLowerCase() ?? 'mock';

  switch (driver) {
    case 'prisma':
      throw new Error(
        'DATA_DRIVER=prisma is not implemented yet. ' +
          'Implement PrismaRepository against the Repository interface in ' +
          'packages/db/src/repository.ts, then wire it here. ' +
          'Unset DATA_DRIVER to use the in-memory seed data.',
      );
    case 'mock':
    default:
      return new MockRepository();
  }
}

/**
 * Resolve the repository.
 *
 *   DATA_DRIVER unset / "mock" -> MockRepository (default; no configuration)
 *   DATA_DRIVER=prisma         -> PrismaRepository (requires DATABASE_URL)
 *
 * Adding Postgres later means implementing `Repository` against Prisma and
 * extending the switch above. Nothing that *calls* getRepository() changes.
 */
export function getRepository(): Repository {
  const g = globalThis as GlobalWithRepo;
  g[GLOBAL_KEY] ??= createRepository();
  return g[GLOBAL_KEY];
}

/** Test helper — drops the cached singleton so each test starts clean. */
export function resetRepository(): void {
  delete (globalThis as GlobalWithRepo)[GLOBAL_KEY];
}
