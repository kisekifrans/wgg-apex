-- Badge catalog refresh, promo codes, order Discord webhook support columns

-- Remove Apex Predator Badge; refresh badge lineup
UPDATE public.service_pricing_items
SET is_active = false
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'badge-boosting')
  AND name = 'Apex Predator Badge';

UPDATE public.service_pricing_items
SET is_active = false
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'badge-boosting')
  AND name IN ('4000 Damage Badge', '20 Kill Badge');

UPDATE public.service_pricing_items spi
SET
  price_cents = v.price_cents,
  difficulty = v.difficulty,
  sort_order = v.sort_order,
  is_active = true
FROM public.services s
JOIN (VALUES
  ('10-10-10 Teamwork Badge', 3000, 'Standard', 1),
  ('5 Win Streak Badge', 3500, 'Advanced', 2),
  ('4K Damage + 20 Kills Bundle', 2500, 'Elite', 0)
) AS v(name, price_cents, difficulty, sort_order) ON true
WHERE spi.service_id = s.id
  AND s.slug = 'badge-boosting'
  AND spi.name = v.name;

INSERT INTO public.service_pricing_items (
  service_id, name, price_cents, difficulty, sort_order, is_active
)
SELECT s.id, v.name, v.price_cents, v.difficulty, v.sort_order, true
FROM public.services s
CROSS JOIN (VALUES
  ('10-10-10 Teamwork Badge', 3000, 'Standard', 1),
  ('5 Win Streak Badge', 3500, 'Advanced', 2),
  ('4K Damage + 20 Kills Bundle', 2500, 'Elite', 0)
) AS v(name, price_cents, difficulty, sort_order)
WHERE s.slug = 'badge-boosting'
  AND NOT EXISTS (
    SELECT 1 FROM public.service_pricing_items spi
    WHERE spi.service_id = s.id AND spi.name = v.name
  );

UPDATE public.services
SET from_price_cents = sub.min_cents
FROM (
  SELECT service_id, MIN(price_cents) AS min_cents
  FROM public.service_pricing_items
  WHERE is_active = true
    AND service_id = (SELECT id FROM public.services WHERE slug = 'badge-boosting')
  GROUP BY service_id
) sub
WHERE services.id = sub.service_id
  AND services.slug = 'badge-boosting';

-- Promo codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  description text,
  discount_cents int NOT NULL CHECK (discount_cents > 0),
  service_slug text,
  is_featured boolean NOT NULL DEFAULT false,
  max_redemptions int,
  redemption_count int NOT NULL DEFAULT 0 CHECK (redemption_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_code_unique UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS promo_codes_active_idx
  ON public.promo_codes (is_active, is_featured);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_codes_admin_all ON public.promo_codes;
CREATE POLICY promo_codes_admin_all ON public.promo_codes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS promo_codes_public_featured_read ON public.promo_codes;
CREATE POLICY promo_codes_public_featured_read ON public.promo_codes
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND is_featured = true);

CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes (id) ON DELETE CASCADE,
  checkout_id uuid REFERENCES public.stripe_checkouts (id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.service_orders (id) ON DELETE SET NULL,
  discount_cents int NOT NULL CHECK (discount_cents > 0),
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promo_code_redemptions_promo_idx
  ON public.promo_code_redemptions (promo_code_id, redeemed_at DESC);

ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_code_redemptions_admin_all ON public.promo_code_redemptions;
CREATE POLICY promo_code_redemptions_admin_all ON public.promo_code_redemptions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.stripe_checkouts
  ADD COLUMN IF NOT EXISTS promo_code_id uuid REFERENCES public.promo_codes (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_cents int NOT NULL DEFAULT 0 CHECK (discount_cents >= 0);

-- Seed: $20 off Predator Maintenance (featured on homepage)
INSERT INTO public.promo_codes (
  code,
  description,
  discount_cents,
  service_slug,
  is_featured,
  is_active
)
VALUES (
  'PREDATOR20',
  '$20 off Predator Maintenance plans',
  2000,
  'predator-maintenance',
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_cents = EXCLUDED.discount_cents,
  service_slug = EXCLUDED.service_slug,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  updated_at = now();
