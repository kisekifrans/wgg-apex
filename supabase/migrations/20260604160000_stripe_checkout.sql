-- Stripe Checkout + webhook idempotency

ALTER TYPE public.service_order_type ADD VALUE IF NOT EXISTS 'marketplace';

CREATE TYPE public.stripe_checkout_status AS ENUM (
  'pending',
  'completed',
  'expired',
  'failed'
);

CREATE TABLE IF NOT EXISTS public.stripe_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  status public.stripe_checkout_status NOT NULL DEFAULT 'pending',
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  checkout_kind public.service_order_type NOT NULL,
  service_slug text,
  pricing_item_id uuid REFERENCES public.service_pricing_items (id) ON DELETE SET NULL,
  marketplace_listing_id uuid REFERENCES public.marketplace_listings (id) ON DELETE SET NULL,
  customer_discord text NOT NULL,
  customer_email text,
  current_rank text,
  target_rank text,
  service_detail text,
  notes text,
  line_item_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  service_order_id uuid REFERENCES public.service_orders (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stripe_checkouts_status_idx
  ON public.stripe_checkouts (status, created_at DESC);

CREATE INDEX stripe_checkouts_session_idx
  ON public.stripe_checkouts (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX stripe_checkouts_order_idx
  ON public.stripe_checkouts (service_order_id)
  WHERE service_order_id IS NOT NULL;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_id uuid REFERENCES public.stripe_checkouts (id) ON DELETE SET NULL;

CREATE INDEX service_orders_stripe_checkout_idx
  ON public.service_orders (stripe_checkout_id)
  WHERE stripe_checkout_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_stripe_checkout_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER stripe_checkouts_updated_at
  BEFORE UPDATE ON public.stripe_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_stripe_checkout_updated_at();

ALTER TABLE public.stripe_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No public policies: server role only via service role client

CREATE POLICY stripe_checkouts_admin_read
  ON public.stripe_checkouts FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY stripe_webhook_events_admin_read
  ON public.stripe_webhook_events FOR SELECT
  TO authenticated
  USING (public.is_admin());
