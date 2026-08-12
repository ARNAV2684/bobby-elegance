import Link from 'next/link';
import { Crown, MapPin, Phone } from 'lucide-react';
import { ANNOUNCEMENTS } from '@bobby/shared';
import { Container } from '@bobby/ui';

const ICONS = { crown: Crown, 'map-pin': MapPin, phone: Phone } as const;

/**
 * The thin maroon strip above the header.
 *
 * On desktop all three messages sit side by side, as in the template. On
 * mobile there is not room, so the phone number wins — it is the only one that
 * is actionable, and a tap-to-call is worth more than a tagline.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-maroon text-cream">
      <Container wide>
        <div className="flex h-9 items-center justify-between gap-4 text-[0.625rem] uppercase tracking-[0.14em]">
          {ANNOUNCEMENTS.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Crown;
            const content = (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Icon className="text-gold size-3" aria-hidden="true" />
                {item.text}
              </span>
            );

            // Index 2 is the phone — the one entry kept on small screens.
            const responsive = i === 2 ? 'flex' : 'hidden sm:flex';

            return 'href' in item && item.href ? (
              <Link
                key={item.text}
                href={item.href}
                className={`${responsive} hover:text-gold transition-colors`}
              >
                {content}
              </Link>
            ) : (
              <span key={item.text} className={responsive}>
                {content}
              </span>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
