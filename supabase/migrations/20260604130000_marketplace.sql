-- Account Marketplace CMS

CREATE TYPE public.platform_type AS ENUM (
  'pc',
  'playstation',
  'xbox',
  'switch'
);

CREATE TYPE public.marketplace_listing_status AS ENUM (
  'draft',
  'available',
  'reserved',
  'sold'
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_number text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  rank_label text NOT NULL,
  rp_label text,
  platform public.platform_type NOT NULL,
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  heirloom_count integer NOT NULL DEFAULT 0 CHECK (heirloom_count >= 0),
  status public.marketplace_listing_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  sold_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings (id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_listings_status_idx
  ON public.marketplace_listings (status, created_at DESC);

CREATE INDEX marketplace_listings_platform_idx
  ON public.marketplace_listings (platform);

CREATE INDEX marketplace_listings_featured_idx
  ON public.marketplace_listings (is_featured)
  WHERE is_featured = true;

CREATE INDEX marketplace_listing_images_listing_idx
  ON public.marketplace_listing_images (listing_id, sort_order);

CREATE OR REPLACE FUNCTION public.set_marketplace_listing_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marketplace_listing_updated_at();

CREATE OR REPLACE FUNCTION public.marketplace_listing_status_timestamps()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'available' AND (OLD.status IS DISTINCT FROM 'available') THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  END IF;
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold') THEN
    NEW.sold_at = COALESCE(NEW.sold_at, now());
  END IF;
  IF NEW.status IS DISTINCT FROM 'sold' THEN
    NEW.sold_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER marketplace_listing_status_timestamps
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.marketplace_listing_status_timestamps();

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_images ENABLE ROW LEVEL SECURITY;

-- Public can view available, reserved, and sold listings (sold stays visible)
CREATE POLICY "Public read marketplace listings"
  ON public.marketplace_listings FOR SELECT
  TO anon, authenticated
  USING (status IN ('available', 'reserved', 'sold'));

CREATE POLICY "Public read marketplace listing images"
  ON public.marketplace_listing_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id
        AND l.status IN ('available', 'reserved', 'sold')
    )
  );

CREATE POLICY "Admins manage marketplace listings"
  ON public.marketplace_listings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage marketplace listing images"
  ON public.marketplace_listing_images FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-listings',
  'marketplace-listings',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read marketplace images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'marketplace-listings');

CREATE POLICY "Admins upload marketplace images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'marketplace-listings'
    AND public.is_admin()
  );

CREATE POLICY "Admins update marketplace images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'marketplace-listings' AND public.is_admin())
  WITH CHECK (bucket_id = 'marketplace-listings' AND public.is_admin());

CREATE POLICY "Admins delete marketplace images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'marketplace-listings' AND public.is_admin());
