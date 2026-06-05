-- Platform enhancements: bundle pricing metadata, CMS tables, predator progression

-- Bundle metadata on pricing items (additional_rank_cents, bundle_from, bundle_to)
ALTER TABLE public.service_pricing_items
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}';

-- Ranked boosting: official bundle packages
DELETE FROM public.service_pricing_items
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'ranked-boosting');

INSERT INTO public.service_pricing_items (
  service_id, name, subtitle, price_cents, eta_label, sort_order, metadata
)
SELECT s.id, v.name, v.subtitle, v.price_cents, v.eta_label, v.sort_order, v.metadata::jsonb
FROM public.services s
CROSS JOIN (VALUES
  ('Bronze → Silver', 'Bundle package', 1200, '2–4 days', 0,
   '{"bundle_from":"Bronze IV","bundle_to":"Silver IV","additional_rank_cents":300,"tier":"Bronze"}'),
  ('Silver → Gold', 'Bundle package', 1300, '2–4 days', 1,
   '{"bundle_from":"Silver IV","bundle_to":"Gold IV","additional_rank_cents":400,"tier":"Silver"}'),
  ('Gold → Plat', 'Bundle package', 1600, '3–5 days', 2,
   '{"bundle_from":"Gold IV","bundle_to":"Platinum IV","additional_rank_cents":500,"tier":"Gold"}'),
  ('Plat → Diamond', 'Bundle package', 2500, '4–6 days', 3,
   '{"bundle_from":"Platinum IV","bundle_to":"Diamond IV","additional_rank_cents":800,"tier":"Platinum"}'),
  ('Diamond → Master', 'Bundle package', 4500, '5–8 days', 4,
   '{"bundle_from":"Diamond IV","bundle_to":"Master","additional_rank_cents":1400,"tier":"Diamond"}'),
  ('Master → Predator', 'Bundle package', 12000, '7–9 days', 5,
   '{"bundle_from":"Master","bundle_to":"Predator","additional_rank_cents":1400,"tier":"Master"}')
) AS v(name, subtitle, price_cents, eta_label, sort_order, metadata)
WHERE s.slug = 'ranked-boosting';

-- Self-play: 2× ranked bundle prices
DELETE FROM public.service_pricing_items
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'self-play-boosting');

INSERT INTO public.service_pricing_items (
  service_id, name, subtitle, price_cents, eta_label, sort_order, metadata
)
SELECT sp.id, rb.name, rb.subtitle, rb.price_cents * 2, rb.eta_label, rb.sort_order, rb.metadata
FROM public.services sp
JOIN public.services rb_svc ON rb_svc.slug = 'ranked-boosting'
JOIN public.service_pricing_items rb ON rb.service_id = rb_svc.id
WHERE sp.slug = 'self-play-boosting';

-- Predator plans: Core → Elite → Pro, no /week
DELETE FROM public.service_pricing_items
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'predator-maintenance');

INSERT INTO public.service_pricing_items (
  service_id, name, subtitle, price_cents, features, is_featured, sort_order
)
SELECT s.id, v.name, v.subtitle, v.price_cents, v.features::jsonb, v.is_featured, v.sort_order
FROM public.services s
CROSS JOIN (VALUES
  ('Core', 'Nintendo (Switch)', 18500,
   '["Entry Predator Maintenance","Minimum RP floor held","Weekly progress report","Standard operator queue"]',
   false, 0),
  ('Elite', 'Nintendo (Switch)', 45000,
   '["Top 30–50 Leaderboard targeting","Dedicated operator channel","Daily RP status updates","Priority recovery sessions"]',
   false, 1),
  ('Pro', 'Nintendo (Switch)', 26500,
   '["Double-digit leaderboard push","Top 80–99 rank band","Aggressive RP target band","Priority queue placement"]',
   true, 2)
) AS v(name, subtitle, price_cents, features, is_featured, sort_order)
WHERE s.slug = 'predator-maintenance';

-- Remove legacy "/ week" suffix from featured service card
UPDATE public.services
SET
  price_label = NULL,
  short_description = 'Predator RP maintenance on Nintendo (Switch).',
  display_config = display_config || '{
    "predator_platform_pricing": {
      "switch": { "Core": 18500, "Pro": 26500, "Elite": 45000 },
      "pc": { "Core": 40000, "Pro": 55000, "Elite": 95000 },
      "xbox": { "Core": 23500, "Pro": 35000, "Elite": 65000 },
      "playstation": { "Core": 35000, "Pro": 50000, "Elite": 95000 }
    }
  }'::jsonb
WHERE slug = 'predator-maintenance';

-- Predator rank progression (Nintendo ladder: Rookie → Predator)
CREATE TABLE IF NOT EXISTS public.predator_rank_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.service_orders (id) ON DELETE CASCADE,
  rank_label text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, rank_label)
);

CREATE INDEX IF NOT EXISTS predator_rank_progress_order_idx
  ON public.predator_rank_progress (order_id, sort_order);

ALTER TABLE public.predator_rank_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS predator_rank_progress_admin_all ON public.predator_rank_progress;
CREATE POLICY predator_rank_progress_admin_all ON public.predator_rank_progress
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS predator_rank_progress_public_read ON public.predator_rank_progress;
CREATE POLICY predator_rank_progress_public_read ON public.predator_rank_progress
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_orders o
      WHERE o.id = order_id
        AND o.order_type = 'predator_maintenance'
        AND o.payment_status = 'paid'
    )
  );

-- Customer reviews (homepage social proof)
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  service_type text NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  avatar_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_reviews_active_sort_idx
  ON public.customer_reviews (is_active, sort_order);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_reviews_public_read ON public.customer_reviews;
CREATE POLICY customer_reviews_public_read ON public.customer_reviews
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS customer_reviews_admin_all ON public.customer_reviews;
CREATE POLICY customer_reviews_admin_all ON public.customer_reviews
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Completed boosts showcase
CREATE TABLE IF NOT EXISTS public.completed_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_rank text NOT NULL,
  to_rank text NOT NULL,
  description text,
  screenshot_path text NOT NULL,
  completed_at date NOT NULL DEFAULT CURRENT_DATE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS completed_boosts_active_sort_idx
  ON public.completed_boosts (is_active, sort_order DESC, completed_at DESC);

ALTER TABLE public.completed_boosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS completed_boosts_public_read ON public.completed_boosts;
CREATE POLICY completed_boosts_public_read ON public.completed_boosts
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS completed_boosts_admin_all ON public.completed_boosts;
CREATE POLICY completed_boosts_admin_all ON public.completed_boosts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- App settings (Discord sold webhook, etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_settings_admin_all ON public.app_settings;
CREATE POLICY app_settings_admin_all ON public.app_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-assets',
  'cms-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS cms_assets_public_read ON storage.objects;
CREATE POLICY cms_assets_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'cms-assets');

DROP POLICY IF EXISTS cms_assets_admin_insert ON storage.objects;
CREATE POLICY cms_assets_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cms-assets' AND public.is_admin());

DROP POLICY IF EXISTS cms_assets_admin_update ON storage.objects;
CREATE POLICY cms_assets_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cms-assets' AND public.is_admin());

DROP POLICY IF EXISTS cms_assets_admin_delete ON storage.objects;
CREATE POLICY cms_assets_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cms-assets' AND public.is_admin());
