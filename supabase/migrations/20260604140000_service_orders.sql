-- Service order management (boost / maintenance / unban)

CREATE TYPE public.service_order_type AS ENUM (
  'ranked_boost',
  'badge_boost',
  'predator_maintenance',
  'unban_service'
);

CREATE TYPE public.service_order_status AS ENUM (
  'pending',
  'paid',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE public.service_order_payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

CREATE TABLE IF NOT EXISTS public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  order_type public.service_order_type NOT NULL,
  customer_discord text NOT NULL,
  current_rank text,
  target_rank text,
  service_detail text,
  notes text,
  status public.service_order_status NOT NULL DEFAULT 'pending',
  payment_status public.service_order_payment_status NOT NULL DEFAULT 'pending',
  amount_cents bigint CHECK (amount_cents IS NULL OR amount_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  customer_email text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX service_orders_status_idx
  ON public.service_orders (status, created_at DESC);

CREATE INDEX service_orders_payment_status_idx
  ON public.service_orders (payment_status, created_at DESC);

CREATE INDEX service_orders_type_idx
  ON public.service_orders (order_type, created_at DESC);

CREATE INDEX service_orders_discord_idx
  ON public.service_orders (lower(customer_discord));

CREATE OR REPLACE FUNCTION public.set_service_order_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_service_order_updated_at();

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_orders_admin_all
  ON public.service_orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
