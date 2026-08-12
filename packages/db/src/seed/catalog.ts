import {
  rupeesToPaise,
  type Category,
  type Occasion,
  type Product,
  type ProductImage,
  type ProductVariant,
  type Size,
} from '@bobby/shared';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  {
    id: 'cat-anarkali',
    slug: 'anarkali-sets',
    name: 'Anarkali Sets',
    description:
      'Flowing floor-length silhouettes with fitted bodices — the anarkali is the most forgiving and most photographed cut in ethnic wear.',
    parentSlug: null,
    imageUrl: '/images/collections/anarkali-sets.jpg',
    position: 1,
  },
  {
    id: 'cat-lehenga',
    slug: 'lehengas',
    name: 'Lehengas',
    description:
      'Full-skirted ensembles for weddings and the biggest nights. Heavy work, real weight, built to photograph.',
    parentSlug: null,
    imageUrl: '/images/collections/lehengas.jpg',
    position: 2,
  },
  {
    id: 'cat-salwar',
    slug: 'salwar-suits',
    name: 'Salwar Suits',
    description:
      'The everyday classic. Comfortable cuts in breathable fabrics that still hold their shape through a long day.',
    parentSlug: null,
    imageUrl: '/images/collections/salwar-suits.jpg',
    position: 3,
  },
  {
    id: 'cat-sharara',
    slug: 'sharara-sets',
    name: 'Sharara Sets',
    description:
      'Wide flared trousers with a shorter kurta — festive, dramatic, and easier to move in than a lehenga.',
    parentSlug: null,
    imageUrl: '/images/collections/sharara-sets.jpg',
    position: 4,
  },
  {
    id: 'cat-gown',
    slug: 'gowns',
    name: 'Gowns',
    description:
      'Indo-western floor-length gowns for receptions and sangeets, where a lehenga is too much and a suit too little.',
    parentSlug: null,
    imageUrl: '/images/collections/gowns.jpg',
    position: 5,
  },
  {
    id: 'cat-kurti',
    slug: 'kurti-sets',
    name: 'Kurti Sets',
    description:
      'Relaxed, refined, and endlessly wearable. Our most repeat-purchased category.',
    parentSlug: null,
    imageUrl: '/images/collections/kurti-sets.jpg',
    position: 6,
  },
];

/** Curated collections. These are filters over the catalogue, not categories. */
export const COLLECTIONS: Category[] = [
  {
    id: 'col-new',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    description: 'The newest pieces to land in store and online.',
    parentSlug: null,
    imageUrl: '/images/collections/new-arrivals.jpg',
    position: 1,
  },
  {
    id: 'col-wedding',
    slug: 'wedding',
    name: 'Wedding Collection',
    description:
      'For the bride, her sisters and everyone who has to look good in the photographs. Heavy work, rich fabrics.',
    parentSlug: null,
    imageUrl: '/images/collections/wedding.jpg',
    icon: 'rings',
    position: 2,
  },
  {
    id: 'col-festive',
    slug: 'festive',
    name: 'Festive Collection',
    description: 'Diwali, Karva Chauth, Navratri — colour-forward pieces for the season.',
    parentSlug: null,
    imageUrl: '/images/collections/festive.jpg',
    icon: 'diya',
    position: 3,
  },
  {
    id: 'col-eid',
    slug: 'eid',
    name: 'Eid Collection',
    description: 'Elegant, modest silhouettes in soft palettes for Eid.',
    parentSlug: null,
    imageUrl: '/images/collections/eid.jpg',
    icon: 'moon',
    position: 4,
  },
  {
    id: 'col-party',
    slug: 'party-wear',
    name: 'Party Wear',
    description: 'Sangeets, receptions and every reason to dress up.',
    parentSlug: null,
    imageUrl: '/images/collections/party-wear.jpg',
    icon: 'glasses',
    position: 5,
  },
  {
    id: 'col-daily',
    slug: 'daily-wear',
    name: 'Daily Wear',
    description: 'Light, breathable pieces built for real days.',
    parentSlug: null,
    imageUrl: '/images/collections/daily-wear.jpg',
    icon: 'hanger',
    position: 6,
  },
  {
    id: 'col-luxury',
    slug: 'luxury',
    name: 'Luxury Collection',
    description: 'Our finest work — hand embroidery, premium silks, limited pieces.',
    parentSlug: null,
    imageUrl: '/images/collections/luxury.jpg',
    position: 7,
  },
  {
    id: 'col-womens',
    slug: 'womens',
    name: "Women's Collection",
    description: 'Everything we make, in one place.',
    parentSlug: null,
    imageUrl: '/images/collections/womens.jpg',
    position: 8,
  },
];

// ---------------------------------------------------------------------------
// Product seed
// ---------------------------------------------------------------------------

interface ColourSpec {
  name: string;
  hex: string;
  /** Which image in the pool this colourway uses. */
  image: number;
}

interface ProductSpec {
  slug: string;
  title: string;
  category: string;
  priceRupees: number;
  compareAtRupees?: number;
  fabric: string;
  workType: string;
  occasions: Occasion[];
  colours: ColourSpec[];
  sizes?: Size[];
  summary: string;
  description: string;
  newArrival?: boolean;
  bestseller?: boolean;
  /** Per-size stock. Missing sizes fall back to a default spread. */
  stock?: Partial<Record<Size, number>>;
}

const DEFAULT_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** A plausible stock spread — mid sizes move fastest, so they run lowest. */
const DEFAULT_STOCK: Record<string, number> = {
  XS: 6,
  S: 9,
  M: 4,
  L: 3,
  XL: 7,
  XXL: 5,
  '3XL': 2,
  'Free Size': 12,
};

const CARE = [
  'Dry clean only',
  'Do not bleach',
  'Warm iron on reverse',
  'Store folded in a muslin bag',
  'Keep away from direct sunlight',
];

const SPECS: ProductSpec[] = [
  {
    slug: 'embroidered-anarkali-set',
    title: 'Embroidered Anarkali Set',
    category: 'anarkali-sets',
    priceRupees: 6995,
    compareAtRupees: 9995,
    fabric: 'Georgette',
    workType: 'Zari & sequin embroidery',
    occasions: ['wedding', 'festive', 'party'],
    colours: [
      { name: 'Deep Maroon', hex: '#5C111F', image: 1 },
      { name: 'Bottle Green', hex: '#1F4034', image: 2 },
    ],
    summary: 'Floor-length georgette anarkali with dense zari work across the yoke.',
    description:
      'A floor-length anarkali cut from soft georgette, with dense zari and sequin embroidery running across the yoke and scattered down the flare. The fitted bodice is fully lined and the skirt takes a deep flare that holds its shape while you move. Comes with matching churidar and an embroidered net dupatta.',
    newArrival: true,
    bestseller: true,
  },
  {
    slug: 'designer-sharara-set',
    title: 'Designer Sharara Set',
    category: 'sharara-sets',
    priceRupees: 7495,
    compareAtRupees: 10995,
    fabric: 'Chinon silk',
    workType: 'Mirror & thread work',
    occasions: ['wedding', 'festive', 'party'],
    colours: [
      { name: 'Blush Pink', hex: '#D9A7A0', image: 3 },
      { name: 'Ivory', hex: '#EDE4D3', image: 4 },
    ],
    summary: 'Short embroidered kurta over wide flared sharara in chinon silk.',
    description:
      'A short kurta with mirror and thread work, worn over a wide sharara that flares generously from the knee. The chinon silk holds a soft sheen without shine, and the whole set moves well — which matters for a sangeet where you will actually dance. Includes a matching dupatta with an embroidered border.',
    newArrival: true,
  },
  {
    slug: 'heavy-embroidered-suit',
    title: 'Heavy Embroidered Suit',
    category: 'salwar-suits',
    priceRupees: 5995,
    compareAtRupees: 8495,
    fabric: 'Viscose silk',
    workType: 'Heavy zari embroidery',
    occasions: ['wedding', 'festive'],
    colours: [
      { name: 'Wine', hex: '#6B1F35', image: 5 },
      { name: 'Royal Blue', hex: '#22366B', image: 6 },
    ],
    summary: 'Straight-cut viscose silk suit with heavy zari across the bodice and hem.',
    description:
      'A straight-cut suit in viscose silk with heavy zari embroidery covering the bodice and running along the hem. Substantial without being stiff. Comes with a matching salwar and a dupatta finished with a broad embroidered border.',
    newArrival: true,
    bestseller: true,
  },
  {
    slug: 'jaipuri-suit-set',
    title: 'Jaipuri Suit Set',
    category: 'salwar-suits',
    priceRupees: 4995,
    fabric: 'Cotton',
    workType: 'Hand block print',
    occasions: ['daily', 'festive'],
    colours: [
      { name: 'Mustard', hex: '#B8862F', image: 7 },
      { name: 'Indigo', hex: '#2C3E63', image: 8 },
    ],
    summary: 'Hand block printed cotton suit from Jaipur — light enough for all day.',
    description:
      'Hand block printed in Jaipur on pure cotton, this set is built for real days rather than photographs. Breathable, easy to wash, and the print only softens with wear. Includes salwar and a cotton mulmul dupatta.',
    newArrival: true,
  },
  {
    slug: 'luxury-velvet-suit',
    title: 'Luxury Velvet Suit',
    category: 'salwar-suits',
    priceRupees: 8995,
    compareAtRupees: 12995,
    fabric: 'Velvet',
    workType: 'Dori & stone work',
    occasions: ['wedding', 'party'],
    colours: [
      { name: 'Emerald', hex: '#14503C', image: 9 },
      { name: 'Deep Maroon', hex: '#5C111F', image: 10 },
    ],
    summary: 'Winter-weight velvet suit with dori and stone detailing.',
    description:
      'A winter-weight velvet suit with dori work and stone detailing across the yoke and sleeves. Velvet reads as expensive under evening light, which is exactly where this belongs. Fully lined, with a matching velvet dupatta.',
    bestseller: true,
  },
  {
    slug: 'bridal-lehenga-choli',
    title: 'Bridal Lehenga Choli',
    category: 'lehengas',
    priceRupees: 24995,
    compareAtRupees: 34995,
    fabric: 'Raw silk',
    workType: 'Hand zardozi',
    occasions: ['wedding'],
    colours: [
      { name: 'Deep Red', hex: '#7A1220', image: 11 },
      { name: 'Rani Pink', hex: '#96234F', image: 12 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    summary: 'Hand zardozi bridal lehenga in raw silk with a full circular flare.',
    description:
      'Our most worked piece. Hand zardozi across the full skirt and blouse in raw silk, with a circular flare that takes over nine metres of fabric. This is a months-of-work garment and it wears like one. Includes an embroidered blouse and a heavy net dupatta with a scalloped border. Allow extra time for fitting.',
    bestseller: true,
  },
  {
    slug: 'reception-gown',
    title: 'Reception Gown',
    category: 'gowns',
    priceRupees: 11995,
    compareAtRupees: 15995,
    fabric: 'Satin georgette',
    workType: 'Sequin & bead work',
    occasions: ['wedding', 'party'],
    colours: [
      { name: 'Champagne', hex: '#C9A66B', image: 13 },
      { name: 'Midnight', hex: '#1B2340', image: 14 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    summary: 'Floor-length indo-western gown with a fitted bodice and trailing sequin work.',
    description:
      'A floor-length gown in satin georgette with a fitted bodice and sequin and bead work trailing down one side. Indo-western in cut, which makes it the right answer for a reception where a lehenga is too heavy. Concealed back zip, fully lined.',
    newArrival: true,
  },
  {
    slug: 'chikankari-kurti-set',
    title: 'Chikankari Kurti Set',
    category: 'kurti-sets',
    priceRupees: 3495,
    fabric: 'Cotton mulmul',
    workType: 'Lucknowi chikankari',
    occasions: ['daily', 'festive'],
    colours: [
      { name: 'White', hex: '#F2EDE4', image: 15 },
      { name: 'Powder Blue', hex: '#A8BCCF', image: 16 },
    ],
    summary: 'Hand-done Lucknowi chikankari on soft cotton mulmul.',
    description:
      'Hand-done chikankari from Lucknow on cotton mulmul so light you forget you are wearing it. The white-on-white shadow work is the traditional form and looks better with every wash. Comes with matching palazzo trousers.',
    bestseller: true,
  },
  {
    slug: 'banarasi-silk-suit',
    title: 'Banarasi Silk Suit',
    category: 'salwar-suits',
    priceRupees: 9495,
    compareAtRupees: 12995,
    fabric: 'Banarasi silk',
    workType: 'Woven zari brocade',
    occasions: ['wedding', 'festive'],
    colours: [
      { name: 'Gold', hex: '#B58A3C', image: 17 },
      { name: 'Peacock', hex: '#125A63', image: 18 },
    ],
    summary: 'Woven Banarasi brocade with real zari — a heritage weave.',
    description:
      'Woven in Banaras with real zari thread, this brocade is patterned in the loom rather than embroidered on afterwards, which is why it hangs the way it does. A heritage weave that outlives trends. Includes matching salwar and a brocade dupatta.',
  },
  {
    slug: 'festive-palazzo-set',
    title: 'Festive Palazzo Set',
    category: 'kurti-sets',
    priceRupees: 4295,
    compareAtRupees: 5995,
    fabric: 'Rayon',
    workType: 'Foil print & thread',
    occasions: ['festive', 'daily', 'party'],
    colours: [
      { name: 'Coral', hex: '#C2603F', image: 19 },
      { name: 'Teal', hex: '#1F5E5B', image: 20 },
    ],
    summary: 'Straight kurti with wide palazzos in easy-care rayon.',
    description:
      'A straight kurti with foil print and thread detailing, paired with wide palazzo trousers. Rayon drapes like something more expensive and survives a washing machine, which is the practical case for it. Everyday festive.',
  },
  {
    slug: 'eid-special-suit',
    title: 'Eid Special Suit',
    category: 'salwar-suits',
    priceRupees: 6495,
    fabric: 'Organza',
    workType: 'Pearl & thread work',
    occasions: ['eid', 'festive', 'party'],
    colours: [
      { name: 'Mint', hex: '#A8C4B0', image: 21 },
      { name: 'Lilac', hex: '#B3A4C7', image: 22 },
    ],
    summary: 'Sheer organza suit with pearl detailing in a soft Eid palette.',
    description:
      'Sheer organza over a full lining, with pearl and thread work concentrated at the neckline and cuffs. The soft palette is deliberate — designed for Eid, where restraint reads better than heavy work. Includes an organza dupatta with a pearl-finished edge.',
    newArrival: true,
  },
  {
    slug: 'georgette-a-line-suit',
    title: 'Georgette A-Line Suit',
    category: 'salwar-suits',
    priceRupees: 5495,
    fabric: 'Georgette',
    workType: 'Resham embroidery',
    occasions: ['festive', 'party', 'daily'],
    colours: [
      { name: 'Rust', hex: '#9C4A2A', image: 23 },
      { name: 'Sage', hex: '#8B9B7A', image: 24 },
    ],
    summary: 'A-line georgette suit with resham thread embroidery.',
    description:
      'An A-line cut in georgette with resham thread embroidery across the front panel. The A-line is the most universally flattering shape we stock and this one is cut generously through the hip. Comes with churidar and a printed dupatta.',
  },
  {
    slug: 'silk-blend-lehenga',
    title: 'Silk Blend Lehenga',
    category: 'lehengas',
    priceRupees: 15995,
    compareAtRupees: 21995,
    fabric: 'Silk blend',
    workType: 'Sequin & zari',
    occasions: ['wedding', 'party'],
    colours: [
      { name: 'Dusty Rose', hex: '#B9807E', image: 25 },
      { name: 'Slate Blue', hex: '#4A5C7A', image: 26 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    summary: 'A lighter lehenga for guests — full flare without the bridal weight.',
    description:
      'Cut for the wedding guest rather than the bride: full flare and real presence, but roughly half the weight of our bridal pieces, so you can wear it through a long evening. Sequin and zari work across the skirt with a matching embroidered blouse.',
    newArrival: true,
  },
  {
    slug: 'cotton-straight-kurti',
    title: 'Cotton Straight Kurti',
    category: 'kurti-sets',
    priceRupees: 1995,
    fabric: 'Cotton',
    workType: 'Screen print',
    occasions: ['daily'],
    colours: [
      { name: 'Off White', hex: '#EFE9DD', image: 27 },
      { name: 'Olive', hex: '#6E7248', image: 28 },
    ],
    summary: 'A plain cotton straight kurti that does the everyday work.',
    description:
      'The plainest thing we sell and one of the best-selling. Pure cotton, straight cut, side slits, two pockets. No dupatta, no fuss — this is what people actually reach for on a weekday.',
  },
  {
    slug: 'net-embroidered-gown',
    title: 'Net Embroidered Gown',
    category: 'gowns',
    priceRupees: 9995,
    compareAtRupees: 13495,
    fabric: 'Net',
    workType: 'Cutdana & sequin',
    occasions: ['party', 'wedding'],
    colours: [
      { name: 'Black', hex: '#1C1A1E', image: 29 },
      { name: 'Wine', hex: '#5E1A2E', image: 30 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    summary: 'Net gown with cutdana and sequin work over a satin lining.',
    description:
      'Net over a satin lining, with cutdana and sequin work distributed so it catches light as you move rather than sitting in one heavy block. A flared hem and a fitted waist. For sangeets and receptions.',
  },
  {
    slug: 'printed-sharara-set',
    title: 'Printed Sharara Set',
    category: 'sharara-sets',
    priceRupees: 5295,
    fabric: 'Muslin',
    workType: 'Digital print',
    occasions: ['festive', 'eid', 'daily'],
    colours: [
      { name: 'Peach', hex: '#DBA88C', image: 31 },
      { name: 'Sky', hex: '#9EB8D0', image: 32 },
    ],
    summary: 'Digitally printed muslin sharara — lightweight festive wear.',
    description:
      'A digitally printed muslin sharara set that weighs almost nothing. Good for daytime functions and Mumbai humidity, where heavier fabrics stop being enjoyable an hour in. Includes a matching printed dupatta.',
  },
  {
    slug: 'velvet-bridal-lehenga',
    title: 'Velvet Bridal Lehenga',
    category: 'lehengas',
    priceRupees: 29995,
    compareAtRupees: 39995,
    fabric: 'Velvet',
    workType: 'Hand zardozi & dabka',
    occasions: ['wedding'],
    colours: [
      { name: 'Deep Maroon', hex: '#4E0F1B', image: 33 },
      { name: 'Forest', hex: '#153327', image: 34 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    summary: 'Winter bridal velvet with hand zardozi and dabka work throughout.',
    description:
      'Our winter bridal piece. Velvet carries zardozi and dabka work better than almost any other fabric, and this one is worked across the full skirt, blouse and dupatta. Heavy, deliberate, and built for a December wedding. Made to order — allow four weeks.',
  },
  {
    slug: 'organza-suit-set',
    title: 'Organza Suit Set',
    category: 'salwar-suits',
    priceRupees: 7295,
    fabric: 'Organza',
    workType: 'Hand embroidery',
    occasions: ['festive', 'party', 'eid'],
    colours: [
      { name: 'Powder Pink', hex: '#E0BCBF', image: 35 },
      { name: 'Pistachio', hex: '#BCC9A0', image: 36 },
    ],
    summary: 'Crisp organza with hand embroidery in a light, structured silhouette.',
    description:
      'Organza holds its own shape, which gives this suit structure without any padding or stiffening. Hand embroidery across the yoke in tonal thread. Fully lined with a matching organza dupatta.',
    newArrival: true,
  },
  {
    slug: 'indo-western-drape-gown',
    title: 'Indo-Western Drape Gown',
    category: 'gowns',
    priceRupees: 13495,
    fabric: 'Crepe',
    workType: 'Embellished waist',
    occasions: ['party', 'wedding'],
    colours: [
      { name: 'Wine', hex: '#63203A', image: 37 },
      { name: 'Charcoal', hex: '#33333A', image: 38 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    summary: 'Pre-draped crepe gown with an embellished waist — no pinning required.',
    description:
      'A pre-draped gown in crepe with an embellished waist belt stitched in place. All the drape of a saree with none of the pinning, which is the entire point. Concealed zip, fully lined.',
  },
  {
    slug: 'daily-wear-kurta-pant',
    title: 'Daily Wear Kurta & Pant',
    category: 'kurti-sets',
    priceRupees: 2495,
    fabric: 'Cotton blend',
    workType: 'Solid dyed',
    occasions: ['daily'],
    colours: [
      { name: 'Navy', hex: '#2A3550', image: 39 },
      { name: 'Maroon', hex: '#5C2230', image: 40 },
    ],
    summary: 'Solid cotton-blend kurta with straight pants. Pockets included.',
    description:
      'Solid-dyed cotton blend, straight kurta, straight pants, real pockets. Wrinkle-resistant enough for a working day. The least exciting thing in the catalogue and one of the most reordered.',
  },
];

// ---------------------------------------------------------------------------
// Expansion
// ---------------------------------------------------------------------------

/** Rotate through the downloaded photo pool so every product has real imagery. */
const IMAGE_POOL_SIZE = 20;
const poolPath = (n: number) => `/images/products/product-${((n - 1) % IMAGE_POOL_SIZE) + 1}.jpg`;

function buildImages(spec: ProductSpec): ProductImage[] {
  return spec.colours.map((colour, i) => ({
    id: `${spec.slug}-img-${i + 1}`,
    url: poolPath(colour.image),
    alt: `${spec.title} in ${colour.name} — ${spec.fabric} with ${spec.workType.toLowerCase()}`,
    position: i,
    isPrimary: i === 0,
    width: 800,
    height: 1200,
    credit: null,
  }));
}

function buildVariants(spec: ProductSpec): ProductVariant[] {
  const sizes = spec.sizes ?? DEFAULT_SIZES;
  const variants: ProductVariant[] = [];

  for (const colour of spec.colours) {
    for (const size of sizes) {
      const stock = spec.stock?.[size] ?? DEFAULT_STOCK[size] ?? 5;
      // Give the second colourway a different stock profile so the demo shows
      // both in-stock and sold-out states without hand-authoring every row.
      const isSecondary = spec.colours.indexOf(colour) > 0;
      const adjusted = isSecondary ? Math.max(0, stock - 3) : stock;

      variants.push({
        id: `${spec.slug}-${colour.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase().replace(/\s+/g, '-')}`,
        productId: spec.slug,
        sku: `BE-${spec.slug.slice(0, 6).toUpperCase()}-${colour.name.slice(0, 3).toUpperCase()}-${size.replace(/\s+/g, '')}`,
        size,
        colour: colour.name,
        colourHex: colour.hex,
        pricePaise: rupeesToPaise(spec.priceRupees),
        stock: adjusted,
        reserved: 0,
        lowStockThreshold: 3,
        isAvailable: adjusted > 0,
      });
    }
  }

  return variants;
}

function buildProduct(spec: ProductSpec, index: number): Product {
  // Stagger creation dates so "newest first" sorting has something to work with.
  const createdAt = new Date(Date.UTC(2026, 6, 28) - index * 36 * 3600 * 1000).toISOString();

  return {
    id: spec.slug,
    slug: spec.slug,
    title: spec.title,
    description: spec.description,
    summary: spec.summary,
    categorySlug: spec.category,
    fabric: spec.fabric,
    workType: spec.workType,
    occasions: spec.occasions,
    basePricePaise: rupeesToPaise(spec.priceRupees),
    compareAtPaise: spec.compareAtRupees ? rupeesToPaise(spec.compareAtRupees) : null,
    status: 'ACTIVE',
    isNewArrival: spec.newArrival ?? false,
    isBestseller: spec.bestseller ?? false,
    images: buildImages(spec),
    variants: buildVariants(spec),
    careInstructions: CARE,
    metaTitle: `${spec.title} — ${spec.fabric} | Bobby Elegance`,
    metaDescription: spec.summary,
    createdAt,
  };
}

export const PRODUCTS: Product[] = SPECS.map(buildProduct);

/** Slugs that a curated collection resolves to. */
export const COLLECTION_RULES: Record<string, (p: Product) => boolean> = {
  'new-arrivals': (p) => p.isNewArrival,
  wedding: (p) => p.occasions.includes('wedding'),
  festive: (p) => p.occasions.includes('festive'),
  eid: (p) => p.occasions.includes('eid'),
  'party-wear': (p) => p.occasions.includes('party'),
  'daily-wear': (p) => p.occasions.includes('daily'),
  luxury: (p) => p.basePricePaise >= 1000000,
  womens: () => true,
};
