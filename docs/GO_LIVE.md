# WGG Apex — Production Go-Live Checklist

Use this checklist before accepting real customer payments on **https://www.wggapex.com**.

## 1. Supabase (production project)

Run all migrations in `supabase/migrations/` (currently **29** files), including:

- `20260605190000_paypal_checkout.sql`
- `20260605200000_master_predator_platform_pricing.sql`
- `20260605210000_unban_pricing_40.sql`
- `20260605220000_production_hardening.sql`

Confirm in SQL editor:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'stripe_checkouts' AND column_name = 'fulfillment_token';
```

## 2. Vercel Production environment variables

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.wggapex.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service role (secret) |
| `PAYPAL_CLIENT_ID` | **Live** app client ID |
| `PAYPAL_CLIENT_SECRET` | **Live** app secret |
| `PAYPAL_WEBHOOK_ID` | Live webhook ID (`WH-...`, not a URL) |
| `PAYPAL_MODE` | `live` |
| `CHECKOUT_PAYLOAD_ENCRYPTION_KEY` | `openssl rand -base64 32` output |
| `RESEND_API_KEY` | Production Resend key |
| `EMAIL_FROM` | `WGG Apex <orders@wggapex.com>` |
| `EMAIL_REPLY_TO` | `support@wggapex.com` |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `DISCORD_MARKETPLACE_SOLD_WEBHOOK_URL` | Optional sold webhook |

**Local `.env.local`:** keep `PAYPAL_MODE=sandbox` and sandbox credentials for development.

## 3. PayPal Live setup

1. [developer.paypal.com](https://developer.paypal.com) → toggle **Live**
2. Create app → copy Client ID + Secret
3. Webhook URL: `https://www.wggapex.com/api/webhooks/paypal`
4. Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`, `CHECKOUT.ORDER.VOIDED`, `CHECKOUT.ORDER.CANCELLED`
5. Copy webhook ID (`WH-...`)

## 4. Resend

Verify domain `wggapex.com` and sender `orders@wggapex.com`.

## 5. Supabase Auth URLs

**Authentication → URL configuration:**

- Site URL: `https://www.wggapex.com`
- Redirect: `https://www.wggapex.com/api/auth/callback`

## 6. Deploy

1. Push latest code to production branch
2. Redeploy Vercel Production after env changes
3. Confirm build succeeds

## 7. Smoke test (real money)

1. Open `https://www.wggapex.com`
2. Complete a **small** real checkout ($5–10)
3. Verify:
   - PayPal Live dashboard shows payment
   - Order appears in `/admin/orders`
   - Confirmation email received
   - `/track-order` works with order number
4. Test cancel flow releases marketplace reservation (if applicable)

## 8. Post-launch monitoring

- PayPal Dashboard → Webhooks (delivery status)
- Vercel → Logs (PayPal webhook errors)
- Admin → Pending checkouts panel (stuck `processing` rows)
- Sentry (if `SENTRY_DSN` configured)

## Security notes (implemented)

- Checkout fulfillment uses atomic `pending` → `processing` claim
- `service_orders.stripe_checkout_id` is unique (prevents duplicate orders)
- Cancel reservation requires `fulfillment_token`
- PayPal capture verifies checkout session + rate limit
- Predator credentials encrypted at rest (`CHECKOUT_PAYLOAD_ENCRYPTION_KEY`)
- Discord sold webhook action requires admin auth
