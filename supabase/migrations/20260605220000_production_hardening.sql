-- Production hardening: atomic checkout fulfillment, reservation tokens, order dedup

ALTER TYPE public.stripe_checkout_status ADD VALUE IF NOT EXISTS 'processing';

ALTER TABLE public.stripe_checkouts
  ADD COLUMN IF NOT EXISTS fulfillment_token text;

CREATE UNIQUE INDEX IF NOT EXISTS service_orders_stripe_checkout_id_unique
  ON public.service_orders (stripe_checkout_id)
  WHERE stripe_checkout_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS stripe_checkouts_marketplace_listing_idx
  ON public.stripe_checkouts (marketplace_listing_id)
  WHERE marketplace_listing_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS service_orders_customer_email_lower_idx
  ON public.service_orders (lower(customer_email))
  WHERE customer_email IS NOT NULL;
