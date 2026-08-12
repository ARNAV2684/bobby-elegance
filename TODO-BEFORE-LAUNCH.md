# TODO before launch

Everything outstanding between this development build and a live shop, in
rough priority order. Nothing here blocks development or the client demo.

---

## 1. Client decisions needed

These change how the code behaves, so get answers before building further.

- [ ] **GST number** and confirmation that prices are tax-inclusive (they are
      currently treated as inclusive — 5% under ₹1,000/piece, 12% above, which
      is the Indian retail norm). Rates live in `packages/shared/src/cart.ts`.
- [ ] **Free-shipping threshold** — currently ₹1,999. Flat rate ₹99, COD fee ₹50.
- [ ] **Return window** — currently 7 days. Who pays return shipping?
- [ ] **COD order cap** — is there a value above which COD is refused?
- [ ] **Real store addresses.** The templates say "5 Stores in Mira Road" but
      list none. `packages/shared/src/brand.ts` has realistic stand-ins marked
      `CONFIRM`.
- [ ] **Business email address.** No email appeared in the templates;
      `care@bobbyelegance.com` is a placeholder.
- [ ] **Confirm the founder's name and phone number may appear publicly** —
      they are currently published in a public GitHub repo, taken from the
      design templates.

## 2. Content and assets

- [ ] **Real product photography.** 38 Unsplash placeholders are in place. The
      swap procedure and recommended export sizes are in
      `apps/storefront/public/images/ATTRIBUTION.md`.
- [ ] **Vector logo.** The wordmark is currently drawn as inline SVG in
      `apps/storefront/components/layout/logo.tsx`. Replace with the client's
      official artwork.
- [ ] **Real catalogue.** 20 seed products exist with plausible names, fabrics
      and prices. Replace with the actual range and real prices.
- [ ] **Favicon and OG image.**
- [ ] **Size chart** — `/size-guide` is linked from the PDP but not built yet.
- [ ] **FAQs page** — linked in the footer, not built.

## 3. Legal

- [ ] **Have a lawyer review the four policy pages.** The current wording is
      structurally complete and reasonable but explicitly unreviewed. It is
      marked as draft on the pages themselves.
- [ ] Razorpay will not activate a live merchant account until Privacy, Terms,
      Shipping and Refund policies are publicly reachable. They are built —
      they just need real content signed off.

## 4. Backend services

Each is a drop-in behind an existing adapter. None require code changes beyond
implementing the documented interface.

- [ ] **Database.** Implement `PrismaRepository` against the `Repository`
      interface in `packages/db/src/repository.ts`, then set `DATA_DRIVER=prisma`
      and `DATABASE_URL`. The mock implementation is the reference behaviour.
- [ ] **Razorpay.** `RazorpayProvider` is already written and tested against
      the API shape. Set `PAYMENT_PROVIDER=razorpay` plus the three keys.
      Requires client KYC — start this early, activation takes days.
- [ ] **Razorpay webhook.** `POST /api/webhooks/razorpay` is not built yet.
      It must verify the HMAC over the **raw** body, be idempotent on
      `providerPaymentId`, and be the thing that marks an order PAID.
- [ ] **Shiprocket.** Not built. Auth tokens expire after 240 hours (10 days),
      so cache and refresh on a schedule rather than fetching per request.
- [ ] **Resend.** Contact form falls back to console logging. Set
      `RESEND_API_KEY` to start delivering. Order confirmation emails are not
      built yet.

## 5. Security — required before any public deployment

- [ ] **Staff authentication for the admin portal.** It is currently completely
      open. Every Server Action in `apps/admin/app/**/actions.ts` carries a
      `PRODUCTION NOTE` comment marking where the check goes. Middleware alone
      is not enough — a Server Action is its own HTTP entry point.
- [ ] **Customer accounts.** `/account` is not built.
- [ ] **Rate limiting.** In-memory only, which does not survive multiple
      instances. Swap to Upstash Redis.
- [ ] **Cart storage.** Currently `localStorage`. Move guests to a signed
      HTTP-only cookie and logged-in shoppers to a `carts` table.
- [ ] **Order tracking access control.** `/track/[orderNumber]` currently needs
      only the order number. Require a matching email or phone —
      `trackOrderSchema` in `@bobby/shared` already models this.
- [ ] **CSP headers.** Basic security headers are set; a Content-Security-Policy
      is not.
- [ ] **Enable GitHub secret scanning and push protection** on the repo.

## 6. Not yet built

- [ ] Customer accounts, order history, saved addresses, wishlist persistence
- [ ] Admin product create/edit forms and image upload
- [ ] Admin homepage/banner editing
- [ ] Order confirmation and shipping-update emails
- [ ] Invoice PDF generation
- [ ] Multi-currency display
- [ ] Playwright end-to-end tests

## 7. Infrastructure

Deliberately deferred — nothing has been bought or deployed.

- [ ] Buy a domain
- [ ] Supabase project (Pro, $25/mo — for daily backups and no auto-pause)
- [ ] Vercel Pro ($20/mo — Hobby prohibits commercial use)
- [ ] Move `docs/ci/ci.yml` into `.github/workflows/` — see `docs/ci/README.md`
      (needs `gh auth refresh -s workflow` first)
- [ ] Branch protection on `main`
- [ ] Sentry and uptime monitoring

Costs and reasoning: [`docs/OPERATIONS.md`](docs/OPERATIONS.md).
