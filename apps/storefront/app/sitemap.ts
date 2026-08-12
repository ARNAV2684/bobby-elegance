import type { MetadataRoute } from 'next';
import { getRepository } from '@bobby/db';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = getRepository();
  const [{ items: products }, categories, collections] = await Promise.all([
    repo.listProducts({}, 'newest', 1, 500),
    repo.listCategories(),
    repo.listCollections(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/collections`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/stores`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    ...['shipping', 'returns', 'privacy', 'terms'].map((slug) => ({
      url: `${BASE}/policies/${slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];

  return [
    ...staticPages,
    ...[...categories, ...collections].map((c) => ({
      url: `${BASE}/collections/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
