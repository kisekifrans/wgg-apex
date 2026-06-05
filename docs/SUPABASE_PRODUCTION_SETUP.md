# Supabase production setup (WGG Apex)

Apply these settings in the **Supabase Dashboard** for your production project before go-live.

## 1. Email provider & sign-up policy

**Customer accounts** (`/account/login`) use magic links with `shouldCreateUser: true`.  
**Admin access** (`/login`) uses email + password and is gated by `ADMIN_EMAILS` / `profiles.role`.

1. Open **Authentication → Providers → Email**.
2. Keep **Enable sign ups** **ON** so checkout customers can create an account from the magic link.
3. Do **not** expose `/login` on the marketing site — only staff should know that URL.
4. Create admin users manually:
   - **Authentication → Users → Add user** (email + password), or
   - Invite by email from the dashboard.

4. Grant admin access (pick one):

**A — Email allowlist (no SQL)**  
Add the user’s email to `ADMIN_EMAILS` in `.env.local` and Vercel (comma-separated), restart dev / redeploy, then sign in at `/login`. Works even when `profiles.role` is still `customer`.

**B — Set `profiles.role` in SQL (permanent)**  
A security trigger blocks role changes unless the session is already an admin. In the SQL Editor, run:

```sql
ALTER TABLE public.profiles DISABLE TRIGGER profiles_prevent_role_escalation;

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'ops@yourdomain.com';

ALTER TABLE public.profiles ENABLE TRIGGER profiles_prevent_role_escalation;

SELECT id, email, role FROM public.profiles WHERE email = 'ops@yourdomain.com';
```

Use the same email as in **Authentication → Users**. After this, you can remove that address from `ADMIN_EMAILS` if you want role-only access.

## 2. Auth URL configuration (required for customer sign-in)

**Authentication → URL configuration**

If these are wrong, email links land on the homepage and the user stays logged out.

| Setting | Value |
|---------|--------|
| Site URL | `https://www.wggapex.com` (use the host customers actually browse) |
| Redirect URLs | Add **every** variant below (www and non-www are different): |

```
https://www.wggapex.com/api/auth/callback
https://www.wggapex.com/api/auth/callback/**
https://wggapex.com/api/auth/callback
https://wggapex.com/api/auth/callback/**
http://localhost:3000/api/auth/callback
http://localhost:3000/api/auth/callback/**
```

Also set **Vercel** env `NEXT_PUBLIC_SITE_URL` to the same canonical host (`https://www.wggapex.com`).

**Quick test:** Request a link at `/account/login`, then hover the email **Sign in** button. The link should contain  
`redirect_to=...%2Fapi%2Fauth%2Fcallback...`  
If it only points at `https://www.wggapex.com/` with no `/api/auth/callback`, Supabase rejected your redirect URL — fix the allow list above.

## 3. Run all migrations

Apply SQL migrations in order (`supabase/migrations/*.sql`), including:

- `20260604170000_security_hardening.sql` (role escalation + webhook status)
- `20260604180000_p1_hardening.sql` (checkout `refunded` status)

Use **SQL Editor** or `supabase db push` against the production project.

## 4. RLS verification

In **Database → Tables**, confirm **RLS enabled** on:

- `profiles`, `service_orders`, `marketplace_listings`, `services`, `service_pricing_items`
- `stripe_checkouts`, `stripe_webhook_events` (no public write policies)

## 5. Secrets

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or `NEXT_PUBLIC_*`.
- Rotate service role key if it was ever committed or shared.

## 6. Storage (marketplace images)

Bucket `marketplace-listings` (or as configured): restrict uploads to authenticated admins via policies; keep `allowed_mime_types` aligned with `src/lib/marketplace/storage.ts`.

## 7. Stripe webhook events

In **Stripe Dashboard → Webhooks**, subscribe the production endpoint to:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`
- `payment_intent.payment_failed`

Use the **live** signing secret as `STRIPE_WEBHOOK_SECRET` in production.

---

See also: [PRODUCTION_SECURITY_AUDIT.md](./PRODUCTION_SECURITY_AUDIT.md)
