/**
 * Every piece of brand copy, contact detail and navigation label lives here.
 *
 * Nothing in `components/` hardcodes a phone number, address or headline. When
 * the client wants to change the hero copy or add a store, this is the only
 * file that gets touched.
 *
 * Values marked CONFIRM were not visible in the design templates and are
 * realistic stand-ins. They are listed in TODO-BEFORE-LAUNCH.md.
 */

export const BRAND = {
  name: 'Bobby Elegance',
  shortName: 'Bobby',
  tagline: 'Ethnic Wear',
  established: 2004,
  legacyYears: 20,
  legacyLabel: '20 Years of Legacy',

  founder: {
    name: 'Mr. Abdullah Khan',
    nickname: 'Bobby',
    title: 'Founder',
  },

  contact: {
    phone: '7506000091',
    phoneDisplay: '75060 00091',
    // CONFIRM: no email address appeared in the templates.
    email: 'care@bobbyelegance.com',
    whatsapp: '7506000091',
  },

  social: {
    instagram: 'https://instagram.com/bobbyelegance.official',
    instagramHandle: '@bobbyelegance.official',
    facebook: 'https://facebook.com/bobbyelegance',
    whatsapp: 'https://wa.me/917506000091',
  },

  seo: {
    title: 'Bobby Elegance — Premium Ethnic Wear Since 2004',
    description:
      'Discover premium ethnic wear for every celebration. Anarkali sets, lehengas, sharara sets and designer suits from Bobby Elegance — 20 years of trust, 5 stores in Mira Road.',
    keywords: [
      'ethnic wear',
      'anarkali set',
      'lehenga',
      'sharara set',
      'designer suits',
      'wedding wear',
      'Mira Road',
      'Bobby Elegance',
    ],
  },
} as const;

export const HERO_SUBTEXT = 'Discover premium ethnic wear for every celebration';

export const STORY = {
  eyebrow: 'The Story of',
  heading: 'Bobby Elegance',
  body: `Founded by ${BRAND.founder.name} (${BRAND.founder.nickname}) in ${BRAND.established}, Bobby Elegance has been a trusted name in ethnic fashion for over ${BRAND.legacyYears} years. With love, trust and unmatched quality, we continue to be a part of your most precious celebrations.`,
  ctaLabel: 'Know Our Journey',
  ctaHref: '/about',
} as const;

/** The trust panel beside the founder portrait on the home page. */
export const TRUST_POINTS = [
  { icon: 'award', title: '20', subtitle: 'Years of Trust' },
  { icon: 'gem', title: 'Premium', subtitle: 'Quality' },
  { icon: 'sparkles', title: 'Exclusive', subtitle: 'Designs' },
  { icon: 'scissors', title: 'Selected In-House', subtitle: 'Manufacturing' },
  { icon: 'map-pin', title: '5 Stores in', subtitle: 'Mira Road' },
] as const;

/** The hairline-separated strip beneath the story panel. */
export const USP_STRIP = [
  { icon: 'gem', title: 'Premium Quality', subtitle: 'Fine Fabrics' },
  { icon: 'sparkles', title: 'Exclusive Designs', subtitle: 'Unique & Timeless' },
  { icon: 'shield-check', title: 'Secure Payments', subtitle: '100% Safe & Secure' },
  { icon: 'refresh-cw', title: 'Easy Returns', subtitle: 'Hassle Free Returns' },
  { icon: 'globe', title: 'Worldwide Shipping', subtitle: 'Delivering Worldwide' },
  { icon: 'headphones', title: 'Customer Support', subtitle: "We're Here For You" },
] as const;

/** Rotating messages in the top announcement bar. */
export const ANNOUNCEMENTS = [
  { icon: 'crown', text: '20 Years of Legacy' },
  { icon: 'map-pin', text: '5 Stores in Mira Road' },
  { icon: 'phone', text: BRAND.contact.phoneDisplay, href: `tel:+91${BRAND.contact.phone}` },
] as const;

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Wedding', href: '/collections/wedding' },
  { label: 'Festive', href: '/collections/festive' },
  {
    label: 'Collections',
    href: '/collections',
    children: [
      {
        label: 'Salwar Suits',
        href: '/collections/salwar-suits',
        description: 'Everyday elegance',
      },
      {
        label: 'Anarkali Sets',
        href: '/collections/anarkali-sets',
        description: 'Flowing silhouettes',
      },
      { label: 'Lehengas', href: '/collections/lehengas', description: 'For the big day' },
      { label: 'Gowns', href: '/collections/gowns', description: 'Contemporary drama' },
      { label: 'Kurti Sets', href: '/collections/kurti-sets', description: 'Relaxed and refined' },
      {
        label: 'Sharara Sets',
        href: '/collections/sharara-sets',
        description: 'Festive favourites',
      },
    ],
  },
  { label: 'About Us', href: '/about' },
  { label: 'Stores', href: '/stores' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_NAV = {
  quickLinks: {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'Wedding', href: '/collections/wedding' },
      { label: 'Festive', href: '/collections/festive' },
      { label: 'Collections', href: '/collections' },
      { label: 'About Us', href: '/about' },
    ],
  },
  customerCare: {
    title: 'Customer Care',
    links: [
      { label: 'Shipping & Delivery', href: '/policies/shipping' },
      { label: 'Returns & Exchange', href: '/policies/returns' },
      { label: 'Track Order', href: '/track' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms & Conditions', href: '/policies/terms' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
} as const;

export const FOOTER_BLURB =
  'Celebrating 20 years of elegance, style and trust. Thank you for making us a part of your journey.';

export const NEWSLETTER = {
  title: 'Newsletter',
  body: 'Subscribe to get updates on new arrivals & offers',
  placeholder: 'Enter your email',
} as const;

/** Payment marks shown in the footer. Display only — no gateway is wired yet. */
export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'RuPay', 'UPI'] as const;

/**
 * The five Mira Road stores.
 * CONFIRM: the templates state "5 Stores in Mira Road" but list no addresses.
 * These are realistic Mira Road locations pending the client's real list.
 */
export const STORES = [
  {
    id: 'store-1',
    name: 'Bobby Elegance — Flagship',
    addressLine: 'Shop 1-4, Ground Floor, Shanti Shopping Centre',
    area: 'Mira Road East',
    city: 'Thane',
    pincode: '401107',
    phone: '7506000091',
    hours: '11:00 AM – 9:30 PM, all days',
    mapUrl: 'https://maps.google.com/?q=Shanti+Shopping+Centre+Mira+Road',
  },
  {
    id: 'store-2',
    name: 'Bobby Elegance — Sheetal Nagar',
    addressLine: 'Shop 12, Sheetal Nagar Market',
    area: 'Mira Road East',
    city: 'Thane',
    pincode: '401107',
    phone: '7506000091',
    hours: '11:00 AM – 9:30 PM, all days',
    mapUrl: 'https://maps.google.com/?q=Sheetal+Nagar+Mira+Road',
  },
  {
    id: 'store-3',
    name: 'Bobby Elegance — Naya Nagar',
    addressLine: 'Shop 7, Naya Nagar Main Road',
    area: 'Mira Road East',
    city: 'Thane',
    pincode: '401107',
    phone: '7506000091',
    hours: '11:00 AM – 9:30 PM, all days',
    mapUrl: 'https://maps.google.com/?q=Naya+Nagar+Mira+Road',
  },
  {
    id: 'store-4',
    name: 'Bobby Elegance — Kanakia',
    addressLine: 'Shop 3, Kanakia Road',
    area: 'Mira Road East',
    city: 'Thane',
    pincode: '401107',
    phone: '7506000091',
    hours: '11:00 AM – 9:30 PM, all days',
    mapUrl: 'https://maps.google.com/?q=Kanakia+Road+Mira+Road',
  },
  {
    id: 'store-5',
    name: 'Bobby Elegance — Beverly Park',
    addressLine: 'Shop 21, Beverly Park Market',
    area: 'Mira Road East',
    city: 'Thane',
    pincode: '401107',
    phone: '7506000091',
    hours: '11:00 AM – 9:30 PM, all days',
    mapUrl: 'https://maps.google.com/?q=Beverly+Park+Mira+Road',
  },
] as const;
