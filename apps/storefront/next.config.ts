import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Workspace packages ship raw TypeScript; Next compiles them itself.
  transpilePackages: ['@bobby/ui', '@bobby/shared', '@bobby/db'],

  images: {
    formats: ['image/avif', 'image/webp'],
    // Product photography is portrait 2:3; these widths cover the card grid,
    // the PDP gallery and the hero without generating dozens of unused sizes.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
