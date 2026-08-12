import Link from 'next/link';
import { MapPin, Send } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './social-icons';
import {
  BRAND,
  FOOTER_BLURB,
  FOOTER_NAV,
  NEWSLETTER,
  PAYMENT_METHODS,
  STORES,
} from '@bobby/shared';
import { Container } from '@bobby/ui';
import { Logo } from './logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-maroon-deep text-cream mt-20">
      <Container wide>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo tone="cream" />
            <p className="text-cream/65 mt-4 max-w-xs text-xs leading-relaxed">{FOOTER_BLURB}</p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href={BRAND.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bobby Elegance on Facebook"
                className="border-cream/20 hover:border-gold hover:text-gold flex size-9 items-center justify-center rounded-full border transition-colors"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bobby Elegance on Instagram"
                className="border-cream/20 hover:border-gold hover:text-gold flex size-9 items-center justify-center rounded-full border transition-colors"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={BRAND.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Bobby Elegance on WhatsApp"
                className="border-cream/20 hover:border-gold hover:text-gold flex size-9 items-center justify-center rounded-full border transition-colors"
              >
                <WhatsAppIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-quick">
            <h2 id="footer-quick" className="label-caps text-gold mb-4">
              {FOOTER_NAV.quickLinks.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.quickLinks.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer care */}
          <nav aria-labelledby="footer-care">
            <h2 id="footer-care" className="label-caps text-gold mb-4">
              {FOOTER_NAV.customerCare.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.customerCare.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Store locator */}
          <div>
            <h2 className="label-caps text-gold mb-4">Store Locator</h2>
            <p className="text-cream/70 text-xs">{STORES.length} stores in Mira Road</p>
            <p className="text-cream/50 mt-1 text-xs">{STORES[0]?.hours}</p>
            <Link
              href="/stores"
              className="border-gold/40 text-gold hover:bg-gold hover:text-maroon-deep mt-4 inline-flex items-center gap-2 border px-4 py-2.5 text-[0.625rem] uppercase tracking-[0.16em] transition-colors"
            >
              <MapPin className="size-3.5" />
              Find a store
            </Link>
            <a
              href={`tel:+91${BRAND.contact.phone}`}
              className="text-cream hover:text-gold mt-3 block text-sm transition-colors"
            >
              {BRAND.contact.phoneDisplay}
            </a>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="label-caps text-gold mb-4">{NEWSLETTER.title}</h2>
            <p className="text-cream/70 text-xs leading-relaxed">{NEWSLETTER.body}</p>
            <form className="mt-4 flex" action="/api/newsletter" method="post">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder={NEWSLETTER.placeholder}
                className="border-cream/20 text-cream placeholder:text-cream/40 focus:border-gold min-w-0 flex-1 border bg-transparent px-3 py-2.5 text-xs focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to the newsletter"
                className="bg-gold text-maroon-deep hover:bg-gold-light flex size-10 shrink-0 items-center justify-center transition-colors"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-cream/10 flex flex-col-reverse items-center justify-between gap-4 border-t py-6 sm:flex-row">
          <p className="text-cream/50 text-[0.625rem] tracking-wide">
            © {year} {BRAND.name}. All Rights Reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-cream/40 text-[0.625rem] uppercase tracking-[0.14em]">
              We accept
            </span>
            <div className="flex items-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="border-cream/15 bg-cream/5 text-cream/70 rounded-[2px] border px-2 py-1 text-[0.5625rem] tracking-wide"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
