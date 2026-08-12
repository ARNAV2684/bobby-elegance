/** Display helpers shared by both apps. */

const DATE_FULL = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

const DATE_TIME = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
});

const DATE_SHORT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Kolkata',
});

/**
 * All dates render in IST regardless of where the visitor is.
 * The business runs on Indian time — an order placed "12 Aug, 9:42 PM" means
 * 9:42 PM in Mira Road, not in the viewer's timezone.
 */
export const formatDate = (iso: string | Date): string => DATE_FULL.format(new Date(iso));
export const formatDateTime = (iso: string | Date): string => DATE_TIME.format(new Date(iso));
export const formatDateShort = (iso: string | Date): string => DATE_SHORT.format(new Date(iso));

/** "2 days ago", "in 3 days", "just now". */
export function formatRelative(iso: string | Date, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = then - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);

  if (abs < 60) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];

  for (const [unit, seconds] of units) {
    if (abs >= seconds) return rtf.format(Math.round(diffSec / seconds), unit);
  }
  return 'just now';
}

/** Mask a phone for public display: 7506000091 -> +91 75060 •••91 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} •••${digits.slice(8)}`;
}

/** Format a 10-digit Indian mobile for display: 7506000091 -> +91 75060 00091 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** Mask an email: arug2004@gmail.com -> a•••4@gmail.com */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  if (user.length <= 2) return `${user[0]}•••@${domain}`;
  return `${user[0]}•••${user[user.length - 1]}@${domain}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Order numbers: BE + 8 unambiguous characters.
 * Excludes I/O/0/1 so numbers read correctly over the phone — a real support
 * concern when a customer calls the Mira Road store about an order.
 */
const ORDER_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateOrderNumber(random: () => number = Math.random): string {
  let out = 'BE';
  for (let i = 0; i < 8; i++) {
    out += ORDER_ALPHABET[Math.floor(random() * ORDER_ALPHABET.length)];
  }
  return out;
}

/** Current time in IST, formatted "9:42 PM IST". */
export function istClock(now: Date = new Date()): string {
  const t = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(now);
  return `${t} IST`;
}
