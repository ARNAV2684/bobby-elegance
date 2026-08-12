import type { Metadata } from 'next';
import { Clock, MapPin, Phone } from 'lucide-react';
import { BRAND, STORES, formatPhone } from '@bobby/shared';
import { Container, SectionHeading, buttonClasses } from '@bobby/ui';

export const metadata: Metadata = {
  title: 'Our Stores',
  description: `Visit Bobby Elegance — ${STORES.length} stores across Mira Road, Mumbai. Open 11 AM to 9:30 PM, all days.`,
};

export default function StoresPage() {
  /** LocalBusiness markup for each store, so they surface in local search. */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': STORES.map((store) => ({
      '@type': 'ClothingStore',
      name: store.name,
      telephone: `+91${store.phone}`,
      openingHours: 'Mo-Su 11:00-21:30',
      address: {
        '@type': 'PostalAddress',
        streetAddress: store.addressLine,
        addressLocality: store.area,
        addressRegion: 'Maharashtra',
        postalCode: store.pincode,
        addressCountry: 'IN',
      },
    })),
  };

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container wide>
        <SectionHeading
          eyebrow="Come and see us"
          title="Our Stores"
          subtitle={`${STORES.length} stores across Mira Road. Try before you buy — our staff know the fabrics and can advise on fit and alterations.`}
          className="mb-12"
          as="h1"
        />

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STORES.map((store) => (
            <li key={store.id} className="flex flex-col border border-line bg-card p-6">
              <h2 className="font-display text-xl leading-tight text-maroon">{store.name}</h2>

              <address className="mt-4 flex flex-1 flex-col gap-3 text-sm not-italic">
                <span className="flex gap-2.5 text-ink-soft">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold-muted" aria-hidden="true" />
                  <span>
                    {store.addressLine}
                    <br />
                    {store.area}, {store.city} {store.pincode}
                  </span>
                </span>

                <span className="flex gap-2.5 text-ink-soft">
                  <Clock className="mt-0.5 size-4 shrink-0 text-gold-muted" aria-hidden="true" />
                  {store.hours}
                </span>

                <a
                  href={`tel:+91${store.phone}`}
                  className="flex gap-2.5 text-ink-soft transition-colors hover:text-maroon"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold-muted" aria-hidden="true" />
                  {formatPhone(store.phone)}
                </a>
              </address>

              <a
                href={store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-5' })}
              >
                Get directions
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-14 border border-line bg-cream-panel/50 p-8 text-center">
          <h2 className="font-display text-2xl text-maroon">Can’t make it to a store?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-ink-soft">
            Call us and we will send photos and video of anything in stock over WhatsApp. We ship
            across India, and returns are free within 7 days.
          </p>
          <a
            href={BRAND.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: 'primary', className: 'mt-5' })}
          >
            Message us on WhatsApp
          </a>
        </div>
      </Container>
    </div>
  );
}
