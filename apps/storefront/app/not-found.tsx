import Link from 'next/link';
import { Container, Ornament, buttonClasses } from '@bobby/ui';

export default function NotFound() {
  return (
    <Container>
      <div className="flex flex-col items-center py-28 text-center">
        <p className="font-display text-7xl text-gold">404</p>
        <h1 className="mt-4 font-display text-3xl text-maroon">This page doesn’t exist</h1>
        <Ornament className="mt-4" />
        <p className="mt-5 max-w-md text-sm text-muted">
          The page you were looking for may have moved, or the link may be out of date.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={buttonClasses({ variant: 'primary' })}>
            Back to home
          </Link>
          <Link href="/collections/womens" className={buttonClasses({ variant: 'outline' })}>
            Browse the collection
          </Link>
        </div>
      </div>
    </Container>
  );
}
