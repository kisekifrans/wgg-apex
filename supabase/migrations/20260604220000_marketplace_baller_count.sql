-- Legendary skin count ("Baller") on marketplace listings

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS baller_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.marketplace_listings
  DROP CONSTRAINT IF EXISTS marketplace_listings_baller_count_check;

ALTER TABLE public.marketplace_listings
  ADD CONSTRAINT marketplace_listings_baller_count_check
  CHECK (baller_count >= 0);
