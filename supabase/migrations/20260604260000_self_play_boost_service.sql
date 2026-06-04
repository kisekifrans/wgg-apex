-- Duo / self-play ranked boost (2× standard tier prices) + checkout order type

ALTER TYPE public.service_order_type ADD VALUE IF NOT EXISTS 'self_play_boost';

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
  'self-play-boosting',
  'Duo Ranked Boost',
  'Queue with a verified operator and climb together in real time.',
  'Self-play ranked boosting: you play on your account alongside a WGG operator who carries you to your target rank. Live comms, coordinated drops, and faster improvement than piloted boosting alone.',
  'tier_table',
  'users',
  '#self-play-boosting',
  NULL,
  9800,
  true,
  5,
  '{"homepage_section":"rank_pricing","features":["Play alongside a verified WGG operator","Same rank targets as standard boosting","2× investment for dedicated duo queue time","Ideal if you want to learn while climbing"]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.service_pricing_items (
  service_id,
  name,
  subtitle,
  price_cents,
  eta_label,
  sort_order
)
SELECT
  sp.id,
  ri.name,
  ri.subtitle,
  ri.price_cents * 2,
  ri.eta_label,
  ri.sort_order
FROM public.services sp
CROSS JOIN public.services rb
JOIN public.service_pricing_items ri ON ri.service_id = rb.id
WHERE sp.slug = 'self-play-boosting'
  AND rb.slug = 'ranked-boosting'
  AND ri.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.service_pricing_items existing
    WHERE existing.service_id = sp.id
  );
