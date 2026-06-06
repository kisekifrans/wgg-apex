-- Service label for completed boost showcase + Discord embeds.

ALTER TABLE public.completed_boosts
  ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'Ranked Boosting';
