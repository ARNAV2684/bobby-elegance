'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HeroSlide } from '@bobby/shared';
import { Container, Ornament, buttonClasses, cn } from '@bobby/ui';

const SLIDE_MS = 6000;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;

    // Respect a reduced-motion preference by not auto-advancing at all —
    // an unexpected slide change is exactly the kind of motion that setting
    // is asking us to avoid.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-[clamp(30rem,72vh,44rem)] overflow-hidden bg-maroon-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={!active}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.2,0.7,0.2,1)]',
              active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.imageAlt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-[60%_center]"
            />
            {/* Left-weighted scrim so the copy stays legible over a busy photo. */}
            <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/92 via-maroon-deep/65 to-transparent" />

            <Container wide className="relative flex h-full items-center">
              <div className={cn('max-w-xl', active && 'animate-fade-up')}>
                <div className="flex items-center gap-3">
                  <Ornament tone="cream" className="w-auto" />
                  <span className="label-caps text-gold">{slide.eyebrow}</span>
                </div>

                <h1 className="display-hero mt-5 text-[clamp(2.5rem,7vw,4.5rem)] text-cream">
                  {slide.headline}
                  <span className="block text-gold">{slide.headlineAccent}</span>
                </h1>

                <p className="mt-5 max-w-md text-sm leading-relaxed tracking-wide text-cream/80 uppercase">
                  {slide.subtext}
                </p>

                <Link
                  href={slide.ctaHref}
                  className={buttonClasses({ variant: 'primary', size: 'lg', className: 'mt-8' })}
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </Container>
          </div>
        );
      })}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${slide.eyebrow}`}
              aria-current={i === index}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
                i === index ? 'w-8 bg-gold' : 'w-4 bg-cream/40 hover:bg-cream/70',
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
