-- Predator maintenance plan + platform matrix pricing; Nintendo from-price refresh

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

UPDATE public.services
SET
  from_price_cents = 18500,
  display_config = COALESCE(display_config, '{}'::jsonb) || '{
    "predator_platform_pricing": {
      "switch": { "Core": 18500, "Pro": 26500, "Elite": 45000 },
      "pc": { "Core": 40000, "Pro": 55000, "Elite": 95000 },
      "xbox": { "Core": 23500, "Pro": 35000, "Elite": 65000 },
      "playstation": { "Core": 35000, "Pro": 50000, "Elite": 95000 }
    }
  }'::jsonb
WHERE slug = 'predator-maintenance';
