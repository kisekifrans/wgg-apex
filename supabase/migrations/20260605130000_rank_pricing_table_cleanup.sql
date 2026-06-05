-- Remove configure-at-checkout example rows; fix Master → Predator bundle + duo sync

DELETE FROM public.service_pricing_items
WHERE service_id IN (
  SELECT id FROM public.services
  WHERE slug IN ('ranked-boosting', 'self-play-boosting')
)
AND (
  subtitle ILIKE '%example%configure%'
  OR name IN ('Bronze → Gold', 'Plat → Master', 'Platinum → Master')
);

-- Ranked boosting: six official bundle tiers only
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

-- Duo ranked boost: 2× standard bundle prices
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

UPDATE public.services s
SET from_price_cents = sub.min_cents
FROM (
  SELECT service_id, MIN(price_cents) AS min_cents
  FROM public.service_pricing_items
  WHERE is_active = true
  GROUP BY service_id
) sub
WHERE s.id = sub.service_id
  AND s.slug IN ('ranked-boosting', 'self-play-boosting');
