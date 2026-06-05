-- Re-enable individual 4K Damage and 20 Kill badges at $15 each (bundle remains $25)

UPDATE public.service_pricing_items
SET
  price_cents = 1500,
  is_active = true,
  sort_order = 3
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'badge-boosting')
  AND name = '4000 Damage Badge';

UPDATE public.service_pricing_items
SET
  price_cents = 1500,
  is_active = true,
  sort_order = 4
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'badge-boosting')
  AND name = '20 Kill Badge';

INSERT INTO public.service_pricing_items (
  service_id, name, price_cents, difficulty, sort_order, is_active
)
SELECT s.id, v.name, v.price_cents, v.difficulty, v.sort_order, true
FROM public.services s
CROSS JOIN (VALUES
  ('4000 Damage Badge', 1500, 'Standard', 3),
  ('20 Kill Badge', 1500, 'Elite', 4)
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
