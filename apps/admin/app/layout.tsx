import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Bobby Elegance Admin' },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#31060a',
  width: 'device-width',
  initialScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-cream">
        <a href="#admin-main" className="skip-link">
          Skip to content
        </a>
        <div className="flex min-h-screen">
          <Sidebar />
          <main id="admin-main" className="min-w-0 flex-1 pb-16 lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
