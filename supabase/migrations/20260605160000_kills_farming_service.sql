-- Kills Farming: configurable kill count (min 100), $45 per 1,000 kills

ALTER TYPE public.service_order_type ADD VALUE IF NOT EXISTS 'kills_farming';

INSERT INTO public.services (
  slug,
  name,
  short_description,
  description,
  pricing_engine,
  icon,
  href,
  price_label,
  from_price_cents,
  is_active,
  sort_order,
  display_config
)
VALUES (
  'kills-farming',
  'Kills Farming',
  'Stack kills fast with verified operators—pick your target from 100 kills up.',
  'Professional kill farming on your account. Choose any amount from 100 kills minimum—priced at $45 per 1,000 kills ($4.50 per 100). Live tracking and operator updates included.',
  'catalog_items',
  'crosshair',
  '/checkout/kills-farming',
  NULL,
  450,
  true,
  6,
  '{
    "homepage_section": "services_overview",
    "thumbnail_path": "/heroes/thumbnail8.jpg",
    "features": [
      "Minimum 100 kills",
      "$45 per 1,000 kills",
      "Configure any amount in 100-kill steps",
      "Verified operator queue"
    ]
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  pricing_engine = EXCLUDED.pricing_engine,
  icon = EXCLUDED.icon,
  href = EXCLUDED.href,
  from_price_cents = EXCLUDED.from_price_cents,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  display_config = EXCLUDED.display_config;

DELETE FROM public.service_pricing_items
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'kills-farming');

INSERT INTO public.service_pricing_items (
  service_id,
  name,
  subtitle,
  price_cents,
  eta_label,
  sort_order,
  metadata
)
SELECT
  s.id,
  'Per 100 kills',
  '$45 per 1,000 kills · min 100',
  450,
  '1–5 days',
  0,
  '{
    "kills_step": 100,
    "min_kills": 100,
    "cents_per_100_kills": 450,
    "reference_kills": 1000,
    "reference_price_cents": 4500
  }'::jsonb
FROM public.services s
WHERE s.slug = 'kills-farming';
