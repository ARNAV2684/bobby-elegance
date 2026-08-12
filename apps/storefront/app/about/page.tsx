import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND, STORES, STORY, TRUST_POINTS } from '@bobby/shared';
import { Container, Ornament, SectionHeading, buttonClasses } from '@bobby/ui';

export const metadata: Metadata = {
  title: 'About Us',
  description: STORY.body,
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-maroon-deep relative flex h-80 items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/hero-2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative text-center">
          <span className="label-caps text-gold">{BRAND.legacyLabel}</span>
          <h1 className="display-hero text-cream mt-3 text-[clamp(2.25rem,6vw,3.5rem)]">
            Our Story
          </h1>
          <Ornament tone="cream" className="mt-4" />
        </div>
      </section>

      <Container>
        <div className="mx-auto max-w-2xl py-16">
          <p className="font-display text-maroon text-2xl leading-relaxed">{STORY.body}</p>

          <div className="text-ink-soft mt-10 space-y-5 text-sm leading-relaxed">
            <p>
              What started as a single shop in Mira Road has become five, and the reason is
              unglamorous: we kept the same suppliers, kept the same standards, and kept answering
              the phone. Customers who bought their engagement outfit from us come back for their
              daughter&apos;s.
            </p>
            <p>
              A good part of what we sell is made in-house or with karigars we have worked with for
              years. That is why we can tell you exactly what a piece is made from, how it will
              behave after three washes, and whether it can be let out at the waist — and why we
              will tell you when something is not right for you.
            </p>
            <p>
              Ethnic wear is bought for the days people remember. Weddings, Eid, Diwali, a first job
              interview. We take that seriously, which mostly means being honest about fit, fabric
              and delivery dates rather than saying whatever closes the sale.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <div key={point.subtitle} className="border-line bg-card border p-5">
                <p className="font-display text-maroon text-2xl">{point.title}</p>
                <p className="text-muted mt-1 text-xs uppercase tracking-wide">{point.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Founder */}
      <section className="bg-cream-panel/50 py-16">
        <Container>
          <div className="mx-auto grid max-w-3xl items-center gap-10 sm:grid-cols-[280px_1fr]">
            <div className="aspect-3/4 bg-cream-panel relative overflow-hidden">
              <Image
                src="/images/brand/founder.jpg"
                alt={`${BRAND.founder.name}, founder of ${BRAND.name}`}
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="label-caps text-gold-muted">Founder</span>
              <h2 className="font-display text-maroon mt-2 text-3xl">{BRAND.founder.name}</h2>
              <p className="text-ink-soft mt-4 text-sm leading-relaxed">
                Known to everyone as {BRAND.founder.nickname}, he opened the first Bobby Elegance in{' '}
                {BRAND.established} and still picks the fabric for every collection himself. If you
                visit the flagship on a weekday, he is usually there.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <Container>
        <div className="py-16 text-center">
          <SectionHeading
            title="Come and see us"
            subtitle={`${STORES.length} stores across Mira Road, open every day from 11 AM.`}
          />
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/stores" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
              Find a store
            </Link>
            <Link
              href="/collections/womens"
              className={buttonClasses({ variant: 'outline', size: 'lg' })}
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
