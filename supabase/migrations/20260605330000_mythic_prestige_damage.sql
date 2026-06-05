-- Mythic Prestige Damage — All Legend: 100,000 damage for $45

ALTER TYPE public.service_order_type ADD VALUE IF NOT EXISTS 'mythic_prestige_damage';

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
  'mythic-prestige-damage',
  'Mythic Prestige Damage - All Legend',
  '100,000 Mythic Prestige damage across all legends—one fixed price.',
  'Complete 100,000 Mythic Prestige damage on every legend in your roster. Operators run the full route with live order tracking and Discord updates.',
  'catalog_items',
  'crown',
  '/checkout/mythic-prestige-damage',
  4500,
  7,
  '{
    "homepage_section": "services_overview",
    "thumbnail_path": "/heroes/thumbnail8.jpg",
    "features": [
      "100,000 damage target",
      "All legends covered",
      "Fixed $45 price",
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
  sort_order = EXCLUDED.sort_order,
  display_config = EXCLUDED.display_config,
  updated_at = now();

INSERT INTO public.service_pricing_items (
  service_id, name, subtitle, price_cents, difficulty, sort_order, is_active
)
SELECT s.id, '100,000 Damage', 'All Legends · Mythic Prestige', 4500, 'Elite', 0, true
FROM public.services s
WHERE s.slug = 'mythic-prestige-damage'
  AND NOT EXISTS (
    SELECT 1 FROM public.service_pricing_items spi
    WHERE spi.service_id = s.id AND spi.name = '100,000 Damage'
  );

UPDATE public.service_pricing_items
SET
  subtitle = 'All Legends · Mythic Prestige',
  price_cents = 4500,
  difficulty = 'Elite',
  is_active = true
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'mythic-prestige-damage')
  AND name = '100,000 Damage';
