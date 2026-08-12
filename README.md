# Bobby Elegance

E-commerce storefront and admin portal for **Bobby Elegance**, a premium ethnic-wear brand based in Mira Road, Mumbai (est. 2004, five physical stores).

> **Status: development build.** Everything runs locally with no external accounts, no API keys and no paid services. Payments, shipping, email and the database are all behind adapters that fall back to working mock implementations. Going live is a matter of filling in `.env` — see [Going to production](#going-to-production).

---

## Quick start

```bash
pnpm install
pnpm dev
```

That is the whole setup. No database to provision, no `.env` to write, no accounts to create.

| App | URL | What it is |
| --- | --- | --- |
| Storefront | http://localhost:3000 | The public shop |
| Admin | http://localhost:3001 | Staff portal |

Requires **Node 20+** and **pnpm 9+** (`npm install -g pnpm`).

---

## Why it runs with zero configuration

Every external dependency sits behind an interface with a working local implementation:

| Concern | Default (no setup) | Production |
| --- | --- | --- |
| Database | In-memory seed data | Supabase Postgres via Prisma |
| Payments | Mock provider — checkout completes locally | Razorpay + COD |
| Shipping | Simulated rates and tracking events | Shiprocket |
| Email | Logged to the console | Resend |
| Rate limiting | In-memory counter | Upstash Redis |

Swapping any one of them is an environment variable, not a refactor. The
application code never imports a vendor SDK directly.

---

## Layout

```
apps/
  storefront/        Next.js 16 — the shop
  admin/             Next.js 16 — staff portal
packages/
  shared/            Money, domain types, cart pricing, validation, brand copy
  db/                Repository interface + seed data + mock implementation
  ui/                Design tokens and shared components
  config/            Base TypeScript config
```

### Where things live

| I want to change… | Edit |
| --- | --- |
| Any brand copy, phone number, store address, nav | `packages/shared/src/brand.ts` |
| Colours, fonts, spacing | `packages/ui/src/styles.css` |
| Products, categories, coupons, demo orders | `packages/db/src/seed/` |
| Pricing rules (shipping, GST, COD fee) | `packages/shared/src/cart.ts` |
| Product photography | `apps/storefront/public/images/` — see its `ATTRIBUTION.md` |

No component hardcodes a colour, a price, or a piece of copy.

---

## Commands

```bash
pnpm dev              # both apps
pnpm dev:storefront   # just the shop
pnpm dev:admin        # just the admin
pnpm build            # production build of everything
pnpm typecheck        # TypeScript across the workspace
pnpm test             # unit tests
pnpm lint             # ESLint
pnpm format           # Prettier
```

---

## Design

The visual design follows two client-supplied templates. Every colour token was
sampled from those files rather than estimated:

| Token | Value | Source |
| --- | --- | --- |
| `--color-maroon` | `#530A15` | Top bar / CTA, 82.8% of sampled pixels |
| `--color-maroon-deep` | `#31060A` | Footer base, 76.5% |
| `--color-gold` | `#D4A764` | Hero display word, median of gold-hued pixels |
| `--color-cream` | `#F8F2EC` | Page background |
| `--color-ink` | `#3A2B23` | Body text |

**Gold is decorative only.** Gold on cream measures ~1.9:1 contrast and fails
WCAG at every text size. It is used for large display type, rules and icons.
Gold on maroon is ~6.1:1 and passes AA, which is why the footer can use it for
real text.

Type: *Cormorant Garamond* (display) and *Jost* (body), self-hosted via
`next/font` — no runtime request to Google, no layout shift.

---

## Conventions worth knowing

**Money is always an integer count of paise.** `₹6,995` is `699500`. There are
no floating-point rupees anywhere. See `packages/shared/src/money.ts` for why,
and `money.test.ts` for the cases that enforce it.

**The client never sends prices.** The browser sends variant IDs and
quantities; `/api/cart/resolve` recomputes every total from the database. A
tampered request simply has its prices ignored.

**GST is inclusive.** Displayed prices already contain tax (5% under ₹1,000 per
piece, 12% above), matching Indian retail convention. The tax line at checkout
is a breakdown, not an addition — a customer who sees ₹6,995 pays ₹6,995.

---

## Going to production

Nothing here has been deployed and no services have been purchased. When the
client approves:

1. Copy `.env.example` to `.env` and fill in the blocks you need.
2. Provision Supabase, set `DATABASE_URL` and `DATA_DRIVER=prisma`.
3. Add Razorpay keys (test first), configure the webhook, verify end to end.
4. Add Shiprocket credentials.
5. Deploy.

Costs and the reasoning behind each service are documented in
[`docs/OPERATIONS.md`](docs/OPERATIONS.md).

---

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the pieces fit and why |
| [`docs/OPERATIONS.md`](docs/OPERATIONS.md) | What to buy, what it costs, deployment |
| [`docs/CLIENT-GUIDE.md`](docs/CLIENT-GUIDE.md) | Non-technical: running the shop |
| [`TODO-BEFORE-LAUNCH.md`](TODO-BEFORE-LAUNCH.md) | Everything outstanding |
