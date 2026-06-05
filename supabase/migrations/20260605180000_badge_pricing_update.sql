-- Badge pricing: 4K Damage and 20 Kill badges → $25 each

UPDATE public.service_pricing_items
SET price_cents = 2500
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'badge-boosting')
  AND name IN ('4000 Damage Badge', '20 Kill Badge');

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
