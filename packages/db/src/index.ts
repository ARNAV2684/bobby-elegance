import { MockRepository } from './mock-repository';
import type { Repository } from './repository';

export * from './repository';
export { MockRepository } from './mock-repository';
export { CATEGORIES, COLLECTIONS, PRODUCTS } from './seed/catalog';
export { COUPONS, HERO_SLIDES } from './seed/marketing';
export { CUSTOMERS, ORDERS, STAFF } from './seed/orders';

let instance: Repository | null = null;

/**
 * The repository singleton.
 *
 * Reads DATA_DRIVER to decide which implementation to hand back:
 *   unset / "mock" -> MockRepository  (default; no configuration needed)
 *   "prisma"       -> PrismaRepository (requires DATABASE_URL)
 *
 * Adding Postgres later means implementing `Repository` against Prisma and
 * extending the switch below. Nothing that *calls* getRepository() changes.
 */
export function getRepository(): Repository {
  if (instance) return instance;

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
      instance = new MockRepository();
      return instance;
  }
}

/** Test helper — drops the cached singleton so each test starts clean. */
export function resetRepository(): void {
  instance = null;
}
