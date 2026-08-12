import {
  rupeesToPaise,
  type Address,
  type Customer,
  type Order,
  type OrderStatus,
  type Size,
  type StaffUser,
} from '@bobby/shared';

const addr = (
  id: string,
  fullName: string,
  phone: string,
  line1: string,
  city: string,
  state: string,
  pincode: string,
): Address => ({
  id,
  fullName,
  phone,
  line1,
  line2: null,
  city,
  state,
  pincode,
  country: 'India',
  isDefault: true,
  label: 'Home',
});

export const CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    email: 'priya.sharma@example.com',
    phone: '9820012345',
    name: 'Priya Sharma',
    addresses: [
      addr(
        'a1',
        'Priya Sharma',
        '9820012345',
        '502, Sai Darshan, Sheetal Nagar',
        'Thane',
        'Maharashtra',
        '401107',
      ),
    ],
    createdAt: '2026-02-14T10:20:00.000Z',
    orderCount: 4,
    totalSpentPaise: rupeesToPaise(28480),
  },
  {
    id: 'cust-2',
    email: 'aisha.khan@example.com',
    phone: '9930045678',
    name: 'Aisha Khan',
    addresses: [
      addr(
        'a2',
        'Aisha Khan',
        '9930045678',
        '12, Green Acres, Naya Nagar',
        'Thane',
        'Maharashtra',
        '401107',
      ),
    ],
    createdAt: '2026-04-02T08:15:00.000Z',
    orderCount: 2,
    totalSpentPaise: rupeesToPaise(14490),
  },
  {
    id: 'cust-3',
    email: 'meera.iyer@example.com',
    phone: '9845067890',
    name: 'Meera Iyer',
    addresses: [
      addr('a3', 'Meera Iyer', '9845067890', '8, Brigade Road', 'Bengaluru', 'Karnataka', '560001'),
    ],
    createdAt: '2026-05-21T14:40:00.000Z',
    orderCount: 1,
    totalSpentPaise: rupeesToPaise(6995),
  },
  {
    id: 'cust-4',
    email: 'fatima.ansari@example.com',
    phone: '9769023456',
    name: 'Fatima Ansari',
    addresses: [
      addr(
        'a4',
        'Fatima Ansari',
        '9769023456',
        '301, Pearl Residency, Beverly Park',
        'Thane',
        'Maharashtra',
        '401107',
      ),
    ],
    createdAt: '2026-06-11T11:05:00.000Z',
    orderCount: 3,
    totalSpentPaise: rupeesToPaise(19985),
  },
  {
    id: 'cust-5',
    email: 'ananya.desai@example.com',
    phone: '9876054321',
    name: 'Ananya Desai',
    addresses: [
      addr('a5', 'Ananya Desai', '9876054321', '44, CG Road', 'Ahmedabad', 'Gujarat', '380009'),
    ],
    createdAt: '2026-07-30T09:30:00.000Z',
    orderCount: 1,
    totalSpentPaise: rupeesToPaise(11995),
  },
];

interface OrderSpec {
  number: string;
  customer: number;
  status: OrderStatus;
  daysAgo: number;
  cod?: boolean;
  items: {
    slug: string;
    title: string;
    size: string;
    colour: string;
    price: number;
    qty: number;
    img: number;
  }[];
  coupon?: { code: string; discount: number };
  awb?: string;
  courier?: string;
}

const ORDER_SPECS: OrderSpec[] = [
  {
    number: 'BE7K3M9QX2',
    customer: 0,
    status: 'DELIVERED',
    daysAgo: 18,
    items: [
      {
        slug: 'embroidered-anarkali-set',
        title: 'Embroidered Anarkali Set',
        size: 'M',
        colour: 'Deep Maroon',
        price: 6995,
        qty: 1,
        img: 1,
      },
      {
        slug: 'chikankari-kurti-set',
        title: 'Chikankari Kurti Set',
        size: 'L',
        colour: 'White',
        price: 3495,
        qty: 1,
        img: 15,
      },
    ],
    coupon: { code: 'WELCOME10', discount: 1049 },
    awb: 'SR8842910337',
    courier: 'Delhivery Surface',
  },
  {
    number: 'BE4TP82NRH',
    customer: 1,
    status: 'SHIPPED',
    daysAgo: 4,
    items: [
      {
        slug: 'designer-sharara-set',
        title: 'Designer Sharara Set',
        size: 'S',
        colour: 'Blush Pink',
        price: 7495,
        qty: 1,
        img: 3,
      },
    ],
    awb: 'SR9917462201',
    courier: 'Blue Dart Express',
  },
  {
    number: 'BE2XW5JD7F',
    customer: 3,
    status: 'PACKED',
    daysAgo: 2,
    cod: true,
    items: [
      {
        slug: 'jaipuri-suit-set',
        title: 'Jaipuri Suit Set',
        size: 'XL',
        colour: 'Mustard',
        price: 4995,
        qty: 2,
        img: 7,
      },
    ],
  },
  {
    number: 'BE9HC6VK4L',
    customer: 2,
    status: 'CONFIRMED',
    daysAgo: 1,
    items: [
      {
        slug: 'embroidered-anarkali-set',
        title: 'Embroidered Anarkali Set',
        size: 'S',
        colour: 'Bottle Green',
        price: 6995,
        qty: 1,
        img: 2,
      },
    ],
  },
  {
    number: 'BE5NQ3ZB8T',
    customer: 4,
    status: 'PAID',
    daysAgo: 0,
    items: [
      {
        slug: 'reception-gown',
        title: 'Reception Gown',
        size: 'M',
        colour: 'Champagne',
        price: 11995,
        qty: 1,
        img: 13,
      },
    ],
  },
  {
    number: 'BE6RD4YM2P',
    customer: 0,
    status: 'CANCELLED',
    daysAgo: 9,
    items: [
      {
        slug: 'luxury-velvet-suit',
        title: 'Luxury Velvet Suit',
        size: 'L',
        colour: 'Emerald',
        price: 8995,
        qty: 1,
        img: 9,
      },
    ],
  },
];

/** Tracking events consistent with each status, so the timeline renders truthfully. */
function eventsFor(status: OrderStatus, placedAt: Date, courier: string | null) {
  const step = (offsetHours: number, s: string, description: string, location: string | null) => ({
    status: s,
    description,
    location,
    occurredAt: new Date(placedAt.getTime() + offsetHours * 3600_000).toISOString(),
  });

  const all = [
    step(0, 'Order placed', 'We have received your order', null),
    step(3, 'Confirmed', 'Payment confirmed and order accepted', 'Mira Road, Thane'),
    step(20, 'Packed', 'Your order has been packed and is ready for pickup', 'Mira Road, Thane'),
    step(28, 'Shipped', `Picked up by ${courier ?? 'courier partner'}`, 'Bhiwandi Hub'),
    step(52, 'In transit', 'Package is on the way to your city', 'Nashik Hub'),
    step(74, 'Out for delivery', 'Package is out for delivery', null),
    step(78, 'Delivered', 'Delivered successfully', null),
  ];

  const cut: Record<OrderStatus, number> = {
    PENDING: 1,
    PAID: 1,
    CONFIRMED: 2,
    PACKED: 3,
    SHIPPED: 5,
    DELIVERED: 7,
    CANCELLED: 2,
    REFUNDED: 2,
  };

  return all.slice(0, cut[status]).reverse();
}

function buildOrder(spec: OrderSpec, now: Date): Order {
  const customer = CUSTOMERS[spec.customer]!;
  const placedAt = new Date(now.getTime() - spec.daysAgo * 86400_000);

  const items = spec.items.map((it, i) => ({
    id: `${spec.number}-item-${i + 1}`,
    variantId: `${it.slug}-${it.colour.toLowerCase().replace(/\s+/g, '-')}-${it.size.toLowerCase()}`,
    productSlug: it.slug,
    titleSnapshot: it.title,
    sizeSnapshot: it.size as Size,
    colourSnapshot: it.colour,
    imageUrlSnapshot: `/images/products/product-${((it.img - 1) % 20) + 1}.jpg`,
    unitPricePaise: rupeesToPaise(it.price),
    quantity: it.qty,
    lineTotalPaise: rupeesToPaise(it.price * it.qty),
  }));

  const subtotalPaise = items.reduce((s, i) => s + i.lineTotalPaise, 0);
  const discountPaise = spec.coupon ? rupeesToPaise(spec.coupon.discount) : 0;
  const discounted = subtotalPaise - discountPaise;
  let shippingPaise = discounted >= rupeesToPaise(1999) ? 0 : rupeesToPaise(99);
  if (spec.cod) shippingPaise += rupeesToPaise(50);
  const totalPaise = discounted + shippingPaise;

  // GST is included in the price; recorded for the invoice breakdown.
  const taxPaise = Math.round((discounted * 12) / 112);

  const shipped = spec.status === 'SHIPPED' || spec.status === 'DELIVERED';

  return {
    id: `order-${spec.number}`,
    orderNumber: spec.number,
    customerId: customer.id,
    email: customer.email,
    phone: customer.phone ?? '',
    items,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise,
    status: spec.status,
    paymentMethod: spec.cod ? 'COD' : 'RAZORPAY',
    couponCode: spec.coupon?.code ?? null,
    shippingAddress: customer.addresses[0]!,
    shipment: shipped
      ? {
          id: `ship-${spec.number}`,
          awbCode: spec.awb ?? null,
          courierName: spec.courier ?? null,
          status: spec.status === 'DELIVERED' ? 'Delivered' : 'In transit',
          trackingUrl: spec.awb ? `https://shiprocket.co/tracking/${spec.awb}` : null,
          estimatedDelivery: new Date(placedAt.getTime() + 5 * 86400_000).toISOString(),
          events: eventsFor(spec.status, placedAt, spec.courier ?? null),
        }
      : {
          id: `ship-${spec.number}`,
          awbCode: null,
          courierName: null,
          status: spec.status === 'CANCELLED' ? 'Cancelled' : 'Awaiting pickup',
          trackingUrl: null,
          estimatedDelivery: null,
          events: eventsFor(spec.status, placedAt, null),
        },
    placedAt: placedAt.toISOString(),
    updatedAt: placedAt.toISOString(),
    notes: null,
  };
}

/** Built relative to "now" so the demo always shows recent activity. */
export function buildOrders(now: Date = new Date()): Order[] {
  return ORDER_SPECS.map((s) => buildOrder(s, now));
}

export const ORDERS: Order[] = buildOrders();

export const STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    email: 'owner@bobbyelegance.com',
    name: 'Abdullah Khan',
    role: 'OWNER',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'staff-2',
    email: 'manager@bobbyelegance.com',
    name: 'Store Manager',
    role: 'MANAGER',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: 'staff-3',
    email: 'staff@bobbyelegance.com',
    name: 'Catalogue Assistant',
    role: 'STAFF',
    isActive: true,
    lastLoginAt: null,
  },
];
