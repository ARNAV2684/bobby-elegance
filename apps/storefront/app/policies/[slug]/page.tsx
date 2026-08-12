import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BRAND } from '@bobby/shared';
import { Alert, Container, SectionHeading } from '@bobby/ui';

/**
 * Policy pages.
 *
 * Razorpay will not activate a live merchant account until Privacy, Terms,
 * Shipping and Refund policies are publicly reachable, so these exist from the
 * start rather than being left to launch week.
 *
 * IMPORTANT: this is placeholder wording written to be reasonable and
 * structurally complete. It has not been reviewed by a lawyer and the specific
 * numbers (return windows, delivery times) need the client's confirmation
 * before launch. See TODO-BEFORE-LAUNCH.md.
 */

interface Policy {
  title: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
}

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: 'Shipping & Delivery',
    summary: 'How and when your order reaches you.',
    sections: [
      {
        heading: 'Dispatch time',
        body: [
          'Orders are packed and dispatched within 2–3 working days of confirmation from our Mira Road warehouse. Made-to-order and heavily worked bridal pieces take longer — the product page states the timeline for those.',
          'Orders placed on Sundays or public holidays are processed the next working day.',
        ],
      },
      {
        heading: 'Delivery time',
        body: [
          'Metro cities: typically 3–5 working days after dispatch. Other locations: 5–8 working days.',
          'These are courier estimates, not guarantees. Weather, strikes and regional restrictions can add time.',
        ],
      },
      {
        heading: 'Shipping charges',
        body: [
          'Free shipping on all orders of ₹1,999 and above.',
          'Below ₹1,999, a flat ₹99 applies.',
          'Cash on delivery carries an additional ₹50 handling fee.',
        ],
      },
      {
        heading: 'Tracking',
        body: [
          'You receive a tracking number by SMS and email once your order is handed to the courier. You can also track it any time at /track using your order number.',
        ],
      },
      {
        heading: 'International shipping',
        body: [
          'We currently deliver within India only. International shipping is planned — contact us if you would like to be told when it opens.',
        ],
      },
    ],
  },

  returns: {
    title: 'Returns & Exchange',
    summary: 'What to do if something is not right.',
    sections: [
      {
        heading: 'Return window',
        body: [
          'Returns and exchanges are accepted within 7 days of delivery.',
          'The item must be unworn and unwashed, with all original tags and packaging intact.',
        ],
      },
      {
        heading: 'What cannot be returned',
        body: [
          'Custom-stitched, altered and made-to-measure pieces cannot be returned unless they arrived damaged or incorrect.',
          'Items marked as final sale at the time of purchase.',
          'Innerwear and accessories, for hygiene reasons.',
        ],
      },
      {
        heading: 'How to start a return',
        body: [
          `Call us on ${BRAND.contact.phoneDisplay} or email ${BRAND.contact.email} with your order number and photographs of the item.`,
          'We arrange a reverse pickup where the courier serves your PIN code. Where it does not, we reimburse reasonable return postage.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Once the returned item reaches us and passes inspection, refunds are issued to the original payment method within 5–7 working days.',
          'Cash-on-delivery orders are refunded by bank transfer to an account you nominate.',
          'Shipping charges already paid are not refunded unless the return is due to our error.',
        ],
      },
      {
        heading: 'Damaged or wrong items',
        body: [
          'If your order arrives damaged or is not what you ordered, tell us within 48 hours of delivery with photographs. We cover return shipping and either replace the item or refund it in full, whichever you prefer.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    summary: 'What we collect, why, and what we do with it.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Information you give us when ordering: name, email address, phone number and delivery address.',
          'Order history and payment status. We never see or store your full card number — that stays with the payment gateway.',
          'Basic technical information such as browser type and pages visited, used to keep the site working.',
        ],
      },
      {
        heading: 'Why we collect it',
        body: [
          'To process and deliver your order, and to contact you about it.',
          'To handle returns, refunds and support requests.',
          'To send offers and new-arrival updates, but only if you have asked us to. You can unsubscribe at any time.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Our courier partner, so they can deliver your order.',
          'Our payment gateway, so they can process your payment.',
          'Nobody else. We do not sell or rent your data.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          `You can ask us for a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Email ${BRAND.contact.email} and we will respond within 30 days.`,
          'We keep order records for as long as tax and accounting law requires.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'We use only what is necessary to keep your shopping bag working and the site secure. We do not run advertising trackers.',
        ],
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    summary: 'The terms you agree to when ordering from us.',
    sections: [
      {
        heading: 'About us',
        body: [
          `${BRAND.name} operates this website and five retail stores in Mira Road, Mumbai. Using this site means you accept these terms.`,
        ],
      },
      {
        heading: 'Products and pricing',
        body: [
          'All prices are in Indian Rupees and inclusive of GST.',
          'Product photographs are as accurate as we can make them, but screens vary and handwork means no two pieces are identical. Minor variation is a feature of the craft, not a defect.',
          'We may change prices at any time. The price that applies is the one shown when your order is confirmed.',
        ],
      },
      {
        heading: 'Orders',
        body: [
          'An order is a request to buy. It is accepted when we confirm it.',
          'We may decline an order if the item is out of stock, the price was listed in error, or we cannot deliver to your address. If we decline after payment, you are refunded in full.',
        ],
      },
      {
        heading: 'Payment',
        body: [
          'Payment is taken at the time of order for prepaid methods, or on delivery for cash on delivery.',
          'Payments are handled by our payment gateway. We do not store your card details.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'All content on this site — photographs, designs, text and the Bobby Elegance name — belongs to us and may not be reproduced without written permission.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are governed by the laws of India. Any dispute falls under the jurisdiction of the courts of Thane, Maharashtra.',
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) return { title: 'Not found' };
  return { title: policy.title, description: policy.summary };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="py-12">
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            title={policy.title}
            subtitle={policy.summary}
            className="mb-10"
            as="h1"
          />

          <Alert tone="warning" className="mb-8">
            <strong>Draft wording.</strong> These policies are structurally complete and reasonable,
            but have not been legally reviewed. Confirm the return window, delivery estimates and
            refund timelines with the business before launch.
          </Alert>

          <div className="flex flex-col gap-8">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-maroon text-xl">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-ink-soft text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="border-line text-muted mt-12 border-t pt-6 text-xs">
            Questions about this policy? Call {BRAND.contact.phoneDisplay} or email{' '}
            <a href={`mailto:${BRAND.contact.email}`} className="text-maroon hover:underline">
              {BRAND.contact.email}
            </a>
            .
          </p>
        </div>
      </Container>
    </div>
  );
}
