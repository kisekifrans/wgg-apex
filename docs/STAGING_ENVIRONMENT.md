# WGG Apex — Staging Environment

Use a separate staging stack to test checkout, webhooks, and emails without touching production data.

## Recommended layout

| Layer | Production | Staging |
|-------|------------|---------|
| **App** | `www.wggapex.com` (Vercel Production) | Vercel Preview or dedicated `staging.wggapex.com` branch deploy |
| **Supabase** | Production project | Separate Supabase project (free tier is fine) |
| **Stripe** | Live mode keys | **Test mode** keys only |
| **Resend** | Verified `wggapex.com` domain | Same API key; send test emails to your inbox |
| **Sentry** | Production DSN | Separate Sentry project or `environment: preview` |

## 1. Supabase staging project

1. Create a new project at [supabase.com](https://supabase.com).
2. Run all migrations from `supabase/migrations/` in order (SQL editor or CLI).
3. Create at least one admin user (Auth → Users) and set `profiles.role = 'admin'`.
4. Copy staging URL + anon key + service role key.

## 2. Vercel Preview environment

In **Project → Settings → Environment Variables**, add staging values scoped to **Preview** (not Production):

```env
NEXT_PUBLIC_SITE_URL=https://your-preview-url.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from stripe listen or Dashboard test webhook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

RESEND_API_KEY=re_...
EMAIL_FROM="WGG Apex <orders@wggapex.com>"
EMAIL_REPLY_TO=support@wggapex.com
EMAIL_OPS_NOTIFY=your-email@example.com

ADMIN_EMAILS=your-admin@example.com

# Optional error monitoring
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

Redeploy preview after saving.

## 3. Stripe test webhooks (local or preview)

**Local:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

**Preview deploy:**

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://your-preview-url.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed`.
4. Use the endpoint signing secret as `STRIPE_WEBHOOK_SECRET` for Preview.

Test card: `4242 4242 4242 4242`.

## 4. Customer magic-link sign-in (Supabase)

For `/account` magic links to work:

1. Supabase → Authentication → URL Configuration.
2. Add **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-preview-url.vercel.app/api/auth/callback`
   - `https://www.wggapex.com/api/auth/callback` (production)
3. Enable **Email** provider (magic link / OTP).

## 5. Smoke test checklist

- [ ] Homepage loads from DB (services, marketplace)
- [ ] Ranked checkout shows live quote → Stripe test pay → order in `/admin/orders`
- [ ] Webhook returns 200; confirmation email received
- [ ] `/track-order` works with email **and** Discord toggle
- [ ] `/account/login` magic link → `/account` lists orders for that email
- [ ] Admin status change sends status update email
- [ ] Failed webhook triggers ops email (`EMAIL_OPS_NOTIFY`) if configured

## 6. Never mix environments

- Do not point staging `NEXT_PUBLIC_SITE_URL` at production domain while using test Stripe.
- Do not use production `SUPABASE_SERVICE_ROLE_KEY` in Preview.
- Keep `STRIPE_SECRET_KEY` live keys **Production-only** in Vercel.

## Related docs

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) — production env vars
- [PRODUCTION_SECURITY_AUDIT.md](./PRODUCTION_SECURITY_AUDIT.md) — security checklist
