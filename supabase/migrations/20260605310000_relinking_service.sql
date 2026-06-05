-- EA / Steam / Xbox / PlayStation account relinking service ($30)

ALTER TYPE public.service_order_type ADD VALUE IF NOT EXISTS 'relinking_service';

INSERT INTO public.services (
  slug,
  name,
  short_description,
  description,
  pricing_engine,
  icon,
  href,
  from_price_cents,
  sort_order,
  display_config
)
VALUES (
  'relinking',
  'Account Relinking',
  'Link a new Steam, Xbox, or PlayStation account to your existing EA profile.',
  'Resolve EA account linking conflicts when a platform ID is already tied to another account. WGG operators handle the relink process with documented steps and realistic expectations—success is likely but never guaranteed.',
  'flat_fee',
  'link',
  '/services/relinking',
  3000,
  8,
  '{
    "homepage_section": "services_overview",
    "thumbnail_path": "/heroes/thumbnail4.jpg",
    "features": [
      "Steam, Xbox, PlayStation, and EA account support",
      "Operator-guided relink with case notes",
      "Secure credential handling (encrypted at rest)",
      "Live order tracking after checkout"
    ]
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  from_price_cents = EXCLUDED.from_price_cents,
  display_config = EXCLUDED.display_config,
  updated_at = now();

INSERT INTO public.service_pricing_items (service_id, name, price_cents, sort_order, is_active)
SELECT s.id, 'Platform account relinking', 3000, 0, true
FROM public.services s
WHERE s.slug = 'relinking'
  AND NOT EXISTS (
    SELECT 1 FROM public.service_pricing_items spi
    WHERE spi.service_id = s.id AND spi.name = 'Platform account relinking'
  );

UPDATE public.service_pricing_items
SET price_cents = 3000, is_active = true
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'relinking')
  AND name = 'Platform account relinking';
