-- Master → Predator: from $170 (Xbox baseline); duo 2×

UPDATE public.service_pricing_items
SET price_cents = 17000
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'ranked-boosting')
  AND metadata->>'bundle_from' = 'Master'
  AND metadata->>'bundle_to' = 'Predator';

UPDATE public.service_pricing_items sp
SET price_cents = rb.price_cents * 2
FROM public.service_pricing_items rb
JOIN public.services rb_svc ON rb_svc.id = rb.service_id AND rb_svc.slug = 'ranked-boosting'
JOIN public.services sp_svc ON sp_svc.slug = 'self-play-boosting'
WHERE sp.service_id = sp_svc.id
  AND sp.name = rb.name
  AND rb.metadata->>'bundle_from' = 'Master'
  AND rb.metadata->>'bundle_to' = 'Predator';
