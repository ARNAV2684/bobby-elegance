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
    <footer className="mt-20 bg-maroon-deep text-cream">
      <Container wide>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo tone="cream" />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-cream/65">{FOOTER_BLURB}</p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href={BRAND.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bobby Elegance on Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:text-gold"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bobby Elegance on Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:text-gold"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={BRAND.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Bobby Elegance on WhatsApp"
                className="flex size-9 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:text-gold"
              >
                <WhatsAppIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-quick">
            <h2 id="footer-quick" className="label-caps mb-4 text-gold">
              {FOOTER_NAV.quickLinks.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.quickLinks.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-cream/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer care */}
          <nav aria-labelledby="footer-care">
            <h2 id="footer-care" className="label-caps mb-4 text-gold">
              {FOOTER_NAV.customerCare.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.customerCare.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-cream/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Store locator */}
          <div>
            <h2 className="label-caps mb-4 text-gold">Store Locator</h2>
            <p className="text-xs text-cream/70">{STORES.length} stores in Mira Road</p>
            <p className="mt-1 text-xs text-cream/50">{STORES[0]?.hours}</p>
            <Link
              href="/stores"
              className="mt-4 inline-flex items-center gap-2 border border-gold/40 px-4 py-2.5 text-[0.625rem] tracking-[0.16em] uppercase text-gold transition-colors hover:bg-gold hover:text-maroon-deep"
            >
              <MapPin className="size-3.5" />
              Find a store
            </Link>
            <a
              href={`tel:+91${BRAND.contact.phone}`}
              className="mt-3 block text-sm text-cream transition-colors hover:text-gold"
            >
              {BRAND.contact.phoneDisplay}
            </a>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="label-caps mb-4 text-gold">{NEWSLETTER.title}</h2>
            <p className="text-xs leading-relaxed text-cream/70">{NEWSLETTER.body}</p>
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
                className="min-w-0 flex-1 border border-cream/20 bg-transparent px-3 py-2.5 text-xs text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to the newsletter"
                className="flex size-10 shrink-0 items-center justify-center bg-gold text-maroon-deep transition-colors hover:bg-gold-light"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-cream/10 py-6 sm:flex-row">
          <p className="text-[0.625rem] tracking-wide text-cream/50">
            © {year} {BRAND.name}. All Rights Reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[0.625rem] tracking-[0.14em] uppercase text-cream/40">
              We accept
            </span>
            <div className="flex items-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded-[2px] border border-cream/15 bg-cream/5 px-2 py-1 text-[0.5625rem] tracking-wide text-cream/70"
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
