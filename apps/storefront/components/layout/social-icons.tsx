/**
 * Brand marks for social links.
 *
 * lucide-react v1 removed third-party brand icons, so these are drawn here.
 * They inherit `currentColor` and size from the surrounding element, matching
 * how the lucide icons elsewhere behave.
 */

type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14.5 8.5V6.9c0-.8.2-1.2 1.4-1.2h1.5V2.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v1.7H8.6v3h2.6V21h3.3v-9.5h2.6l.4-3h-3z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.6a9.3 9.3 0 00-8 14.1L2.6 21.4l4.8-1.3A9.3 9.3 0 1012 2.6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.9 7.6c.2 0 .4 0 .6.4l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5a7 7 0 003 2.6c.2.1.4 0 .5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.3.1.3.4.3.5a2 2 0 01-2 1.7c-1 0-3-.7-4.6-2.3S8 10.5 8 9.5a2 2 0 011-1.9z"
        fill="currentColor"
      />
    </svg>
  );
}
