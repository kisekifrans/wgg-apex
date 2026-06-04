# WGG Apex — Production Readiness & Security Audit

**Audit date:** 2026-06-04  
**Scope:** Authentication, authorization, admin routes, Stripe, webhooks, environment variables, Supabase RLS, input validation, file uploads  
**Method:** Static code review of application and SQL migrations (no penetration test)

---

## Executive summary

| Area | Rating | Notes |
|------|--------|-------|
| Authentication | **Adequate** | Supabase password auth; session via cookies |
| Authorization | **At risk** | App-layer admin checks exist; **RLS allows self–role escalation** |
| Admin routes | **Adequate** | Layout + server actions guarded; middleware is weak |
| Stripe integration | **Good** | Secrets server-only; quotes from DB |
| Webhooks | **At risk** | Signature verification good; **idempotency ordering bug** |
| Environment variables | **Good** | `.env*` gitignored; documented in `.env.example` |
| Supabase policies | **At risk** | Profile UPDATE policy; service role bypass by design |
| Input validation | **Adequate** | Zod on forms; gaps on IDs and redirects |
| File uploads | **Adequate** | Admin-only; size/MIME checks; bucket limits |

**Production recommendation:** P0 fixes applied 2026-06-04 (migration `20260604170000_security_hardening.sql`). Re-verify after deploy; remaining items in §11 still apply.

---

## 1. Authentication

### What is implemented

- Supabase Auth with email/password on `/login` (`signInWithPassword`).
- Session cookies via `@supabase/ssr` in middleware and server client.
- OAuth callback route at `/api/auth/callback` (code exchange).
- `getUser()` used in middleware (not deprecated `getSession()` alone).
- Sign-out server action clears Supabase session.

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| AUTH-01 | **Medium** | No MFA, magic link hardening, or account lockout documented. Acceptable for internal admin-only login if Supabase dashboard policies are strict. |
| AUTH-02 | **Medium** (ops) | Disable public sign-up in Supabase Dashboard — steps in `docs/SUPABASE_PRODUCTION_SETUP.md`. |
| AUTH-03 | **Low** | `ADMIN_EMAILS` env allowlist grants `admin` role in app logic when profile role is missing—use only for bootstrap; prefer `profiles.role` in DB. |
| AUTH-04 | **High** | **Open redirect** via `redirectTo` query param (see §7). |

### Passed

- No passwords stored in application code.
- Admin login page does not expose service role or Stripe secrets.

---

## 2. Authorization

### What is implemented

- `requireAdmin()` on admin layout and all `src/actions/admin/*` entry points.
- `isAdminRole()` allows `admin` and `super_admin` only.
- `is_admin()` SQL function for RLS policies (SECURITY DEFINER, `search_path` set).

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| AUTHZ-01 | ~~**Critical**~~ **Fixed** | Trigger `profiles_prevent_role_escalation` blocks non-admins from changing `role` (`20260604170000_security_hardening.sql`). |
| AUTHZ-02 | ~~**High**~~ **Fixed** | Middleware now calls `isRequestAdmin()` before allowing `/admin/*`. |
| AUTHZ-03 | **Medium** | `booster` role exists in enum but has no dedicated policies; behaves as non-admin. Document or remove if unused. |
| AUTHZ-04 | **Low** | Service role client (`createAdminClient`) bypasses all RLS—required for checkout/webhooks; must never be imported in client components (currently guarded with `server-only`). |

### Recommended fix (AUTHZ-01)

```sql
-- Restrict self-service profile updates to safe columns only
CREATE POLICY "Users can update own profile safe columns"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );
```

Better: use a `BEFORE UPDATE` trigger that rejects `role` changes unless `is_admin()`.

---

## 3. Admin routes

### Surface area

| Route | Protection |
|-------|------------|
| `/admin/*` | Middleware: session required; Layout: `requireAdmin()` |
| Server actions | `requireAdmin()` on marketplace, orders, services |
| `/login` | Public |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| ADM-01 | **Medium** | No audit log for admin mutations (orders, pricing, deletes). |
| ADM-02 | **Low** | `robots: noindex` on admin layout—good. |
| ADM-03 | **Passed** | Destructive actions (delete listing/order) use confirmations in UI only—not a security control. |

---

## 4. Stripe integration

### What is implemented

- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `lib/stripe/env.ts` with `import "server-only"`.
- Checkout Session created server-side; amounts from `buildCheckoutQuote()` (database prices).
- Metadata: `checkout_id`, `checkout_kind`, `service_slug` (internal UUID).
- Unban intake validated with Zod before session creation.
- `.env.example` documents keys; publishable key optional.

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| STR-01 | ~~**Medium**~~ **Fixed** | `charge.refunded` and `payment_intent.payment_failed` webhooks sync orders/checkouts/listings. |
| STR-02 | ~~**Medium**~~ **Fixed** | Listing set to `reserved` when checkout session is created; released on cancel/expiry/failure. |
| STR-03 | **Low** | `payment_method_types: ["card"]` only—Apple/Google Pay need `automatic_payment_methods` if desired. |
| STR-04 | **Passed** | No secret keys in `NEXT_PUBLIC_*` except optional publishable key. |
| STR-05 | **Passed** | Webhook validates `amount_total` and currency against `stripe_checkouts` row. |

---

## 5. Webhooks

### What is implemented

- `POST /api/webhooks/stripe` with `runtime = "nodejs"`.
- Raw body + `stripe.webhooks.constructEvent()`.
- Rejects missing signature.
- Handles `checkout.session.completed` and `checkout.session.expired`.
- Idempotency table `stripe_webhook_events` with unique `stripe_event_id`.

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| WH-01 | ~~**Critical**~~ **Fixed** | `claimWebhookEvent` / `completeWebhookEvent` / `failWebhookEvent` — failed events marked `failed` and can retry. |
| WH-02 | **High** | Handler errors return **500** with error message body—may leak internal details to Stripe logs; acceptable but avoid stack traces. |
| WH-03 | **Medium** | No replay protection beyond Stripe event ID (good). No monitoring/alerting on failed webhooks. |
| WH-04 | **Passed** | Signature verification is mandatory when secret is configured. |

### Recommended fix (WH-01)

Insert webhook event **after** successful fulfillment, or use a two-phase status (`processing` / `completed`) and only skip duplicates when `completed`.

---

## 6. Environment variables

| Variable | Exposure | Required prod |
|----------|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes |
| `STRIPE_SECRET_KEY` | Server only | Yes |
| `STRIPE_WEBHOOK_SECRET` | Server only | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Optional |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes |
| `ADMIN_EMAILS` | Server only | Bootstrap only |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| ENV-01 | **Passed** | `.gitignore` includes `.env*`. |
| ENV-02 | **Medium** | No runtime schema validation (e.g. Zod) for env at startup—misconfiguration fails at first request. |
| ENV-03 | **Low** | Use separate Stripe live/test keys and webhook secrets per environment in Vercel/hosting. |

---

## 7. Input validation

### Covered

| Input | Validation |
|-------|------------|
| Marketplace listings | `marketplaceListingSchema` (Zod) |
| Service orders (admin) | `serviceOrderSchema` + superRefine by type |
| Unban intake | `unbanIntakeSchema` |
| Services / pricing items | `serviceSchema`, `pricingItemSchema` |
| Checkout quotes | Server-side DB price lookup; pricing item must be active |
| Search filters | Sanitize `%`, `_`, `,` in ILIKE patterns |

### Gaps

| ID | Severity | Finding |
|----|----------|---------|
| VAL-01 | ~~**High**~~ **Fixed** | `safeRedirectPath()` used in middleware, auth callback, login form, and `requireAuth`. |
| VAL-02 | **Medium** | `listingId` / `pricingItemId` not validated as UUID format before DB—low risk with Postgres UUID type. |
| VAL-03 | **Medium** | No max length on `customerDiscord` / notes at DB layer beyond app Zod. |
| VAL-04 | ~~**Low**~~ **Mitigated** | In-process rate limits on `signInAction` (10/min) and `createCheckoutSession` (20/min) per IP. |

### Recommended fix (VAL-01)

```typescript
function safeRedirectPath(path: string, fallback = "/admin"): string {
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
```

---

## 8. Supabase RLS & data access

### Table summary

| Table | Public read | Public write | Admin |
|-------|-------------|--------------|-------|
| `profiles` | Own row | Own row **(all columns)** | Read all |
| `marketplace_listings` | available/reserved/sold | No | ALL via `is_admin()` |
| `marketplace_listing_images` | Via listing status | No | ALL |
| `service_orders` | No | No | ALL via `is_admin()` |
| `services` / `service_pricing_items` | Active only | No | ALL |
| `stripe_checkouts` | No | No | SELECT only |
| `stripe_webhook_events` | No | No | SELECT only |
| `storage.objects` (marketplace) | Public read bucket | No | Admin insert/update/delete |

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| RLS-01 | **Critical** | See AUTHZ-01 (profile role escalation). |
| RLS-02 | **Medium** | `stripe_checkouts` / `stripe_webhook_events` have no INSERT policy for authenticated users—correct; all writes via service role. |
| RLS-03 | **Medium** | Draft marketplace listings not public—good. Admin must not leak draft via anon (they cannot). |
| RLS-04 | **Passed** | `is_admin()` uses SECURITY DEFINER with fixed `search_path`. |
| RLS-05 | **Passed** | Service orders not readable by customers via anon key. |

---

## 9. File uploads

### What is implemented

- Upload only in `uploadListingImages()` after `requireAdmin()`.
- Uses service role storage API (not end-user direct upload).
- Checks: `file.type.startsWith("image/")`, max 5MB, extension allowlist in path builder.
- Bucket: `file_size_limit` 5MB, `allowed_mime_types` jpeg/png/webp/gif.
- Path: `{listingId}/{uuid}.{ext}`—no user-controlled path segments.

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| UPL-01 | **Medium** | Client `file.type` is spoofable; rely on Supabase `allowed_mime_types` + consider magic-byte sniffing for production. |
| UPL-02 | **Low** | Public bucket—anyone with URL can view listing images (intended). |
| UPL-03 | **Passed** | No arbitrary file upload endpoints for customers. |
| UPL-04 | **Passed** | Filename does not control storage path (UUID used). |

---

## 10. Additional production gaps

| ID | Severity | Topic |
|----|----------|-------|
| PROD-01 | ~~**Medium**~~ **Fixed** | CSP, HSTS (prod), X-Frame-Options, etc. via `next.config.ts` + `src/lib/security/headers.ts`. |
| PROD-02 | **Medium** | No structured logging / error tracking (Sentry, etc.). |
| PROD-03 | **Medium** | PII (EA credentials, Discord) in `service_orders.notes`—ensure DB encryption at rest and access controls. |
| PROD-04 | **Low** | Legal routes (`/legal/*`) referenced but may 404—operational not security. |
| PROD-05 | **Low** | Middleware deprecation warning (Next.js 16 proxy)—track framework migration. |

---

## 11. Remediation priority

### P0 — Block production

1. ~~**AUTHZ-01 / RLS-01:**~~ Done — profile role trigger.
2. ~~**WH-01:**~~ Done — webhook claim/complete/fail flow.
3. ~~**VAL-01:**~~ Done — `safeRedirectPath()`.

### P1 — Before launch

4. ~~**STR-02:**~~ Done — marketplace reservation.
5. ~~**AUTHZ-02:**~~ Done — middleware admin check.
6. **AUTH-02:** Disable public Supabase sign-up (dashboard — see `SUPABASE_PRODUCTION_SETUP.md`).
7. ~~**STR-01:**~~ Done — refund / payment-failed webhooks.

### P2 — Hardening

8. ~~Rate limiting (login, checkout):~~ Done (in-process; use Redis/Upstash for multi-instance).
9. ~~Security headers + CSP:~~ Done.
10. Env validation at boot.
11. Admin audit log.
12. Magic-byte validation on uploads.

---

## 12. Checklist for go-live

- [ ] All Supabase migrations applied in production project
- [ ] `STRIPE_SECRET_KEY` = live mode; webhook endpoint registered with live signing secret
- [ ] `NEXT_PUBLIC_SITE_URL` = production domain (HTTPS)
- [ ] `ADMIN_EMAILS` removed or minimized; admins set via `profiles.role` only
- [ ] Supabase: email sign-up disabled ([SUPABASE_PRODUCTION_SETUP.md](./SUPABASE_PRODUCTION_SETUP.md))
- [ ] Migration `20260604180000_p1_hardening.sql` applied
- [ ] Stripe webhook includes `charge.refunded` and `payment_intent.payment_failed`
- [ ] Supabase: RLS enabled on all public tables (verify dashboard)
- [ ] Service role key only in server env (Vercel encrypted)
- [ ] Stripe webhook delivery monitored in Dashboard
- [ ] Migration `20260604170000_security_hardening.sql` applied
- [ ] P0 remediation items verified in staging

---

## Appendix: Files reviewed

- `src/middleware.ts`, `src/lib/auth/*`, `src/app/(admin)/admin/layout.tsx`
- `src/actions/admin/*`, `src/actions/checkout/create-session.ts`
- `src/app/api/webhooks/stripe/route.ts`, `src/lib/stripe/*`, `src/lib/checkout/*`
- `src/actions/admin/marketplace/listings.ts`, `src/lib/marketplace/storage.ts`
- `supabase/migrations/*.sql`
- `.env.example`, `.gitignore`, `next.config.ts`

---

*This document is a point-in-time audit. Re-run after significant changes or before each major release.*
