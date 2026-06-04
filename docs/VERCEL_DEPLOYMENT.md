# Deploying WGG Apex on Vercel

Vercel does **not** read your local `.env.local`. You must add the same variables in the Vercel project settings.

## 1. Add environment variables

In the Vercel dashboard: **Project → Settings → Environment Variables**.

Add these for **Production** (and **Preview** if you use preview deployments):

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL or custom domain, e.g. `https://wggapex.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Project Settings → API → Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **API → anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **API → service_role** (server only, never expose in the browser) |
| `STRIPE_SECRET_KEY` | Stripe → **Developers → API keys** (use live key in production) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → **Webhooks → signing secret** for your production endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → publishable key (optional for Checkout redirect flow) |
| `ADMIN_EMAILS` | Comma-separated admin emails (optional bootstrap until `profiles.role = admin`) |

Copy values from your local `.env.local` (same Supabase project you use in development).

**Required for a successful build:** at minimum `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
**Required for admin, checkout, and webhooks:** `SUPABASE_SERVICE_ROLE_KEY` and Stripe variables.

After adding variables, **redeploy** (Deployments → … → Redeploy).

## 2. Supabase auth redirect

In Supabase **Authentication → URL configuration**, add:

- **Site URL:** your production domain  
- **Redirect URLs:** `https://your-domain.com/api/auth/callback`

See [SUPABASE_PRODUCTION_SETUP.md](./SUPABASE_PRODUCTION_SETUP.md).

## 3. Run database migrations

Apply all files under `supabase/migrations/` to your Supabase project (SQL Editor or `supabase db push`).

## 4. Stripe webhook (production)

Create a webhook endpoint:

`https://your-domain.com/api/webhooks/stripe`

Subscribe to: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed`.

## 5. Common build error

```
Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

**Cause:** Environment variables are missing on Vercel, or the deploy ran before you saved them.

**Fix:** Add the variables in step 1 and redeploy. Public marketing pages only need the `NEXT_PUBLIC_SUPABASE_*` pair; the service role is still required for admin and payments.
