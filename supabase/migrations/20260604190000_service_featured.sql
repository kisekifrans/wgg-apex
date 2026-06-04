-- Homepage featured service (single active featured at a time)

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS services_single_featured_idx
  ON public.services ((true))
  WHERE is_featured = true;

CREATE OR REPLACE FUNCTION public.ensure_single_featured_service()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_featured = true THEN
    UPDATE public.services
    SET is_featured = false
    WHERE id <> NEW.id
      AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS services_single_featured ON public.services;

CREATE TRIGGER services_single_featured
  BEFORE INSERT OR UPDATE OF is_featured ON public.services
  FOR EACH ROW
  WHEN (NEW.is_featured = true)
  EXECUTE FUNCTION public.ensure_single_featured_service();

-- Default featured service for existing installs
UPDATE public.services
SET is_featured = true
WHERE slug = 'ranked-boosting'
  AND is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.services s WHERE s.is_featured = true
  );
