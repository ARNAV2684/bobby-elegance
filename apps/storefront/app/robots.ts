import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing under these paths is useful in an index, and /track and
      // /checkout/success contain order details that should never be crawled.
      disallow: [
        '/api/',
        '/cart',
        '/checkout',
        '/checkout/success/',
        '/track/',
        '/account',
        '/search',
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
