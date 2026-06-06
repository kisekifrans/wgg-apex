-- Custom Predator RP for predator_maintenance rank-based progress (admin-set).

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS predator_custom_rp integer
  CHECK (predator_custom_rp IS NULL OR predator_custom_rp >= 0);
