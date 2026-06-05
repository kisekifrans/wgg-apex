-- PayPal checkout columns (table name kept for compatibility)

ALTER TABLE public.stripe_checkouts
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text;

CREATE UNIQUE INDEX IF NOT EXISTS stripe_checkouts_paypal_order_id_idx
  ON public.stripe_checkouts (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS stripe_checkouts_paypal_capture_id_idx
  ON public.stripe_checkouts (paypal_capture_id)
  WHERE paypal_capture_id IS NOT NULL;
