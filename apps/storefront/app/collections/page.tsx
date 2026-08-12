import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getRepository } from '@bobby/db';
import { Container, SectionHeading } from '@bobby/ui';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Browse every Bobby Elegance collection — anarkali sets, lehengas, salwar suits, sharara sets, gowns and kurti sets.',
};

export default async function CollectionsIndexPage() {
  const repo = getRepository();
  const [categories, collections] = await Promise.all([
    repo.listCategories(),
    repo.listCollections(),
  ]);

  const Grid = ({ items }: { items: typeof categories }) => (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={`/collections/${c.slug}`}
            className="group relative block aspect-4/5 overflow-hidden bg-maroon-deep"
          >
            <Image
              src={c.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 via-maroon-deep/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-display text-xl text-cream">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-cream/70">{c.description}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="py-12">
      <Container wide>
        <SectionHeading
          title="Collections"
          eyebrow="Browse the catalogue"
          subtitle="Twenty years of ethnic wear, organised by what you're shopping for."
          className="mb-12"
          as="h1"
        />

        <section aria-labelledby="by-style" className="mb-16">
          <SectionHeading id="by-style" title="Shop by style" align="left" className="mb-7 items-start" />
          <Grid items={categories} />
        </section>

        <section aria-labelledby="by-occasion">
          <SectionHeading
            id="by-occasion"
            title="Shop by occasion"
            align="left"
            className="mb-7 items-start"
          />
          <Grid items={collections} />
        </section>
      </Container>
    </div>
  );
}
