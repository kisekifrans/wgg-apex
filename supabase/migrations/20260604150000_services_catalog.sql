-- Services catalog & pricing (admin-managed, public read)

CREATE TYPE public.pricing_engine AS ENUM (
  'tier_table',
  'catalog_items',
  'subscription_plans',
  'flat_fee',
  'marketplace'
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  description text,
  pricing_engine public.pricing_engine NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  href text NOT NULL DEFAULT '#',
  price_label text,
  from_price_cents bigint CHECK (from_price_cents IS NULL OR from_price_cents >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  display_config jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services (id) ON DELETE CASCADE,
  name text NOT NULL,
  subtitle text,
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  eta_label text,
  difficulty text,
  features jsonb NOT NULL DEFAULT '[]',
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX services_active_sort_idx
  ON public.services (is_active, sort_order);

CREATE INDEX service_pricing_items_service_sort_idx
  ON public.service_pricing_items (service_id, sort_order)
  WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.set_services_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_services_updated_at();

CREATE TRIGGER service_pricing_items_updated_at
  BEFORE UPDATE ON public.service_pricing_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_services_updated_at();

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_public_read
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY services_admin_all
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY service_pricing_items_public_read
  ON public.service_pricing_items FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.is_active = true
    )
  );

CREATE POLICY service_pricing_items_admin_all
  ON public.service_pricing_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed catalog (migrates hardcoded platform.ts pricing)
INSERT INTO public.services (
  slug, name, short_description, description, pricing_engine,
  icon, href, price_label, from_price_cents, is_active, sort_order, display_config
) VALUES
  (
    'ranked-boosting',
    'Ranked Boosting',
    'Ranked progression with live tracking and verified boosters.',
    'Climb from your current tier to your target division with verified boosters and live order tracking.',
    'tier_table',
    'trophy',
    '#rank-pricing',
    NULL,
    4900,
    true,
    0,
    '{"homepage_section":"services_overview"}'::jsonb
  ),
  (
    'predator-maintenance',
    'Predator Maintenance',
    'Weekly RP maintenance on Nintendo (Switch).',
    'Hold Predator RP with scheduled sessions, progress reports, and priority queue placement on Switch.',
    'subscription_plans',
    'crown',
    '#rank-pricing',
    '/ week',
    19900,
    true,
    1,
    '{"homepage_section":"services_overview"}'::jsonb
  ),
  (
    'badge-boosting',
    'Badge Boosting',
    'Fixed prices for badge and achievement runs.',
    'Badge and achievement completion at fixed prices—exact cost before you pay.',
    'catalog_items',
    'badge-check',
    '#badges',
    NULL,
    3900,
    true,
    2,
    '{"homepage_section":"services_overview"}'::jsonb
  ),
  (
    'apex-unban',
    'Apex Unban Service',
    'Guided workflow for suspended accounts.',
    'Eligibility screening and a guided recovery workflow for suspended accounts—with clear expectations upfront.',
    'flat_fee',
    'unlock',
    '#unban',
    NULL,
    14900,
    true,
    3,
    '{"homepage_section":"services_overview","features":["Eligibility review before you pay","Case timeline in your dashboard","Operator-guided submission workflow","Clear refund terms if ineligible"]}'::jsonb
  ),
  (
    'account-marketplace',
    'Account Marketplace',
    'Verified listings with escrow checkout.',
    'Verified listings with rank, RP, and heirloom disclosure—purchased through secure escrow checkout.',
    'marketplace',
    'shopping-bag',
    '/marketplace',
    'Listings vary',
    NULL,
    true,
    4,
    '{"homepage_section":"services_overview"}'::jsonb
  );

INSERT INTO public.service_pricing_items (service_id, name, subtitle, price_cents, eta_label, sort_order)
SELECT s.id, v.name, v.subtitle, v.price_cents, v.eta_label, v.sort_order
FROM public.services s
CROSS JOIN (VALUES
  ('Bronze', 'IV → I', 4900, '2–4 days', 0),
  ('Silver', 'IV → I', 5900, '2–4 days', 1),
  ('Gold', 'IV → I', 6900, '3–5 days', 2),
  ('Platinum', 'IV → I', 8900, '3–6 days', 3),
  ('Diamond', 'IV → I', 11900, '4–7 days', 4),
  ('Master', 'Divisions', 15900, '5–9 days', 5),
  ('Predator', 'RP maintenance', 19900, 'Weekly', 6)
) AS v(name, subtitle, price_cents, eta_label, sort_order)
WHERE s.slug = 'ranked-boosting';

INSERT INTO public.service_pricing_items (
  service_id, name, subtitle, price_cents, features, is_featured, sort_order
)
SELECT s.id, v.name, v.subtitle, v.price_cents, v.features::jsonb, v.is_featured, v.sort_order
FROM public.services s
CROSS JOIN (VALUES
  ('Core', 'per week', 19900, '["Minimum RP floor maintenance","Weekly progress report","Standard queue"]', false, 0),
  ('Pro', 'per week', 34900, '["Aggressive RP target band","Daily status updates","Priority queue and duo option"]', true, 1),
  ('Elite', 'per week', 54900, '["Custom RP schedule","Dedicated operator channel","Express recovery sessions"]', false, 2)
) AS v(name, subtitle, price_cents, features, is_featured, sort_order)
WHERE s.slug = 'predator-maintenance';

INSERT INTO public.service_pricing_items (
  service_id, name, price_cents, difficulty, sort_order
)
SELECT s.id, v.name, v.price_cents, v.difficulty, v.sort_order
FROM public.services s
CROSS JOIN (VALUES
  ('Apex Predator Badge', 8900, 'Advanced', 0),
  ('4000 Damage Badge', 6500, 'Standard', 1),
  ('20 Kill Badge', 12000, 'Elite', 2),
  ('Legend-Specific Master', 7500, 'Standard', 3),
  ('Event Collection Badge', 5500, 'Standard', 4)
) AS v(name, price_cents, difficulty, sort_order)
WHERE s.slug = 'badge-boosting';

INSERT INTO public.service_pricing_items (service_id, name, price_cents, sort_order)
SELECT s.id, 'Unban case review', 14900, 0
FROM public.services s
WHERE s.slug = 'apex-unban';
