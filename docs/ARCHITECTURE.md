# Architecture

## The shape of it

```
apps/storefront (:3000)          apps/admin (:3001)
        │                                │
        └────────────┬───────────────────┘
                     ▼
        packages/db — Repository interface
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
  MockRepository            PrismaRepository
  (in-memory seed)          (Postgres — to build)
        
        packages/shared — money, types, pricing, validation, brand copy
        packages/ui     — tokens and shared components
```

Two Next.js apps, one shared data layer, one shared design system.

## The central idea: everything external is an adapter

Nothing in the application imports a vendor SDK. Every external dependency sits
behind an interface with a working local implementation, so the whole system
runs with no accounts, no keys and no network.

| Concern | Interface | Default | Production |
| --- | --- | --- | --- |
| Data | `Repository` | `MockRepository` | `PrismaRepository` |
| Payments | `PaymentProvider` | `MockPaymentProvider` | `RazorpayProvider` (written) |
| Email | — | console log | Resend |
| Rate limit | — | in-memory Map | Upstash Redis |

This is why `pnpm install && pnpm dev` is the entire setup, and why adding
Razorpay later is three environment variables rather than a refactor.

It also means the demo is honest: the checkout flow you click through is the
real flow, with the real validation, the real stock decrements and the real
totals. Only the gateway call is stubbed.

## Why a monorepo

The brief calls for two deliverables. Separate apps give separate deploys,
separate domains, separate auth, and keep admin code out of the public bundle —
while `packages/shared` and `packages/db` guarantee the two cannot drift on
types or pricing rules.

## Rendering strategy

The storefront is CDN-first. This is what makes it fast from anywhere rather
than only from India.

| Page | Strategy | Why |
| --- | --- | --- |
| Home, PLP, PDP, policies | Static + ISR (1h) | Cacheable at the edge; a shopper in Berlin hits Frankfurt, not Mumbai |
| Cart, checkout, tracking | Dynamic | Per-user, never cacheable |
| Admin | `force-dynamic`, `no-store` | Always fresh, never cached anywhere |

When admin edits a product, a `revalidateTag` call refreshes the affected pages
in seconds rather than waiting out the hour. That single decision is what makes
the site both fast worldwide and cheap to run.

## Money

Every amount is an integer count of **paise**. `₹6,995` is `699500`.

Rupee floats break: `0.1 + 0.2 !== 0.3`. Across a dozen cart lines with a
percentage discount, that drift produces totals off by a paisa — and a gateway
that receives a different amount than the one displayed rejects the order or
charges the wrong sum. Razorpay's API also takes paise, so this is the wire
format unchanged.

`packages/shared/src/money.ts` throws on any non-integer amount rather than
silently rounding. `money.test.ts` covers the cases.

**GST is inclusive.** Displayed prices already contain tax (5% under ₹1,000 per
piece, 12% above), matching Indian retail convention and the templates. The tax
line at checkout is a breakdown, not an addition. A customer who sees ₹6,995
pays ₹6,995.

## Trust boundary

**The client never sends prices.** The browser stores variant IDs and
quantities and nothing else. `POST /api/cart/resolve` and `POST /api/checkout`
both re-read every price from the data layer.

A request claiming a ₹24,995 lehenga costs ₹1 does not fail validation — the
claimed price is simply never read.

## Overselling

`POST /api/checkout` decrements stock through `adjustStock`, which refuses to
go below zero and reports it. If any line fails, every prior decrement in that
order is rolled back, so a partial failure does not strand inventory.

Verified: ten units requested against five in stock is rejected with
"Only 5 left of Jaipuri Suit Set (XL)".

The Postgres implementation must preserve this with
`UPDATE variants SET stock = stock - $n WHERE id = $id AND stock >= $n` and an
affected-row-count check. Read-then-write will not do.

## Order history is immutable

`OrderItem` snapshots the title, size, colour, image and unit price at purchase
time. Editing a product later must never rewrite what a customer bought.

## Status transitions are whitelisted

`ALLOWED_TRANSITIONS` in `apps/admin/app/orders/[orderNumber]/transitions.ts`
defines which statuses can follow which. `DELIVERED` cannot go back to `PAID`;
`CANCELLED` is terminal. Validated server-side in the action, not only in the
UI.

## Payment truth comes from the webhook

When Razorpay is connected, an order becomes `PAID` on a signature-verified
`payment.captured` webhook — not on the browser redirect. Users close tabs.

The webhook handler (not yet built) must:

1. Compute the HMAC over the **raw** request body. Parsing and re-serialising
   JSON changes key order and whitespace, changes the hash, and makes every
   webhook fail. This is the most common way to get this integration wrong.
2. Be idempotent — unique constraint on `(provider, providerPaymentId)`.
   Razorpay retries.

`RazorpayProvider.verifyWebhook` already implements the signature half
correctly, including a constant-time compare.

## A bug worth knowing about

The repository singleton is keyed on `globalThis`, not a module-level variable.

Next.js bundles route handlers and page components into separate module graphs,
so each got its own `MockRepository`. An order written by `POST /api/checkout`
was invisible to the confirmation page — a 404 immediately after a successful
purchase. Found by clicking through the flow, not by any test.

Same pattern the Prisma docs prescribe. It also survives hot reloads, so
in-memory orders are not wiped on every file save.

## Accessibility constraint baked into the tokens

Gold `#D4A764` on cream `#F8F2EC` measures roughly **1.9:1** — it fails WCAG at
every text size. Gold is therefore restricted to large display type, rules and
icons. Gold on maroon is ~6.1:1 and passes AA, which is why the footer and
announcement bar can use it for real text.

This is recorded in `packages/ui/src/styles.css` so it does not get
accidentally "fixed" later by someone making body copy gold.
