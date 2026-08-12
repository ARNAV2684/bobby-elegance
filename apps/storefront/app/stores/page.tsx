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
            <li key={store.id} className="border-line bg-card flex flex-col border p-6">
              <h2 className="font-display text-maroon text-xl leading-tight">{store.name}</h2>

              <address className="mt-4 flex flex-1 flex-col gap-3 text-sm not-italic">
                <span className="text-ink-soft flex gap-2.5">
                  <MapPin className="text-gold-muted mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    {store.addressLine}
                    <br />
                    {store.area}, {store.city} {store.pincode}
                  </span>
                </span>

                <span className="text-ink-soft flex gap-2.5">
                  <Clock className="text-gold-muted mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {store.hours}
                </span>

                <a
                  href={`tel:+91${store.phone}`}
                  className="text-ink-soft hover:text-maroon flex gap-2.5 transition-colors"
                >
                  <Phone className="text-gold-muted mt-0.5 size-4 shrink-0" aria-hidden="true" />
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

        <div className="border-line bg-cream-panel/50 mt-14 border p-8 text-center">
          <h2 className="font-display text-maroon text-2xl">Can’t make it to a store?</h2>
          <p className="text-ink-soft mx-auto mt-3 max-w-lg text-sm">
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
