# Operations — what to buy and what it costs

## Right now: ₹0

Nothing has been purchased and nothing is deployed. The build runs entirely
locally. No domain, no hosting, no database, no gateway account.

If the client never approves, nothing has been spent.

## Scale reality

The brief says ~1,000 visitors/day. That is ~30,000/month, roughly one visitor
every 86 seconds, and perhaps 10–20 concurrent users at a 20× peak.

**This is small.** Free tiers would handle it without strain. Every
recommendation below is chosen for correctness, legality or data safety — not
for capacity. Anyone quoting a larger bill for "scalability" at this traffic is
overselling.

## Production: ~$45–50/month

| Service | Plan | Cost | Why it is actually needed |
| --- | --- | --- | --- |
| **Vercel** | Pro | **$20**/seat/mo | **Licensing, not capacity.** Vercel's Hobby tier prohibits commercial use; a revenue-generating store must be on Pro. Suspension risk on a live client store is not worth testing. |
| **Supabase** | Pro | **$25**/mo | **Data safety, not capacity.** The free tier has *no backups* and pauses after 7 days idle. Holding real orders with no backup is the dealbreaker. Also brings 8GB DB, 100GB storage, email support. |
| Domain | — | ~$12/yr | |
| **Razorpay** | Pay-as-you-go | **~2% + GST**/txn | No monthly fee. Requires client KYC. |
| **Shiprocket** | Pay-per-shipment | Varies | No monthly fee on the basic tier. |
| Resend | Free | $0 | 3,000 emails/month covers this traffic comfortably |
| Upstash Redis | Free | $0 | |
| Sentry | Free | $0 | |
| GitHub | Free | $0 | |

### Not needed

CDN (Vercel includes it), Cloudflare paid, Algolia or any search service
(Postgres full-text handles a few hundred SKUs), managed Redis, Kubernetes, a
separate API server, Vercel Enterprise.

Revisit past roughly 100,000 visits/month.

> Prices verified August 2026. Confirm before purchasing — vendor pricing moves.

## Order of operations for going live

1. **Client KYC with Razorpay first.** Activation takes days, not minutes, and
   requires business PAN, GST, a bank account, and the four policy pages
   publicly reachable. Everything else waits on nothing; this waits on a third
   party. Start it first.
2. Provision Supabase, implement `PrismaRepository`, migrate, seed.
3. Wire Razorpay in **test mode**, build the webhook handler, verify a full
   order end to end including a replayed webhook.
4. Shiprocket account and integration.
5. Buy the domain, deploy to Vercel, add environment variables.
6. Switch Razorpay to live keys. Place one real ₹1 order and refund it.
7. Enable monitoring and backups. Confirm a backup actually restores.

## Deployment

Deliberately not done yet — the client asked to hold this until everything else
is built.

When the time comes: import the repo into Vercel, set the root directory per
app (`apps/storefront` and `apps/admin` as two projects), add the environment
variables from `.env.example`, and point the domains. Vercel auto-detects
Next.js and Turborepo.

The admin app should additionally get Vercel's deployment protection or an
IP allowlist — it holds customer PII.

## Backups

Supabase Pro takes daily backups automatically. Two things people skip:

- **Test a restore before you need one.** A backup you have never restored is a
  hypothesis, not a backup.
- Keep the retention window in mind. Pro is daily snapshots; if a data
  corruption goes unnoticed for longer than the window, it is unrecoverable.

## Monitoring

Minimum viable set, all free:

- **Sentry** for exceptions in both apps
- **Uptime check** on the storefront home page and `/api/cart/resolve`
- **A weekly look at the admin dashboard.** Orders stuck in `PAID` without
  moving to `CONFIRMED` is the signal that webhook processing or fulfilment has
  broken.
