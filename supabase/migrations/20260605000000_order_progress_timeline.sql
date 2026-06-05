-- Order progress % + customer-visible status timeline

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS progress_percent smallint NOT NULL DEFAULT 0
  CHECK (progress_percent >= 0 AND progress_percent <= 100);

CREATE TABLE IF NOT EXISTS public.order_status_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.service_orders (id) ON DELETE CASCADE,
  status public.service_order_status NOT NULL,
  progress_percent smallint CHECK (progress_percent IS NULL OR (progress_percent >= 0 AND progress_percent <= 100)),
  message text,
  is_customer_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_status_updates_order_idx
  ON public.order_status_updates (order_id, created_at DESC);

ALTER TABLE public.order_status_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_status_updates_admin_all
  ON public.order_status_updates
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Backfill progress from current status for existing orders
UPDATE public.service_orders
SET progress_percent = CASE status
  WHEN 'pending' THEN 5
  WHEN 'paid' THEN 20
  WHEN 'in_progress' THEN 50
  WHEN 'completed' THEN 100
  ELSE 0
END
WHERE progress_percent = 0;
