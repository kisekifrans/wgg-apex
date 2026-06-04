# Supabase production setup (WGG Apex)

Apply these settings in the **Supabase Dashboard** for your production project before go-live.

## 1. Disable public sign-up (AUTH-02)

Admin access must not be obtainable by self-service registration.

1. Open **Authentication → Providers → Email**.
2. Turn **off** “Enable sign ups” (or use **Invite only** if your plan supports it).
3. Create admin users manually:
   - **Authentication → Users → Add user** (email + password), or
   - Invite by email from the dashboard.

4. Grant admin role in SQL (after the user exists):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ops@yourdomain.com'
);
```

Alternatively, bootstrap with `ADMIN_EMAILS` in Vercel (server env) until `profiles.role` is set—then remove the allowlist.

## 2. Auth URL configuration

**Authentication → URL configuration**

| Setting | Value |
|---------|--------|
| Site URL | `https://your-production-domain.com` |
| Redirect URLs | `https://your-production-domain.com/api/auth/callback` |

Match `NEXT_PUBLIC_SITE_URL` in your hosting env.

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
