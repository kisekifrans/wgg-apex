-- Sync cached from_price_cents from active pricing rows + seed homepage reviews

UPDATE public.services s
SET from_price_cents = sub.min_cents
FROM (
  SELECT service_id, MIN(price_cents) AS min_cents
  FROM public.service_pricing_items
  WHERE is_active = true
  GROUP BY service_id
) sub
WHERE s.id = sub.service_id
  AND s.pricing_engine <> 'marketplace';

-- Replace seeded showcase reviews (keeps Frans + adds varied 5-star feedback)
DELETE FROM public.customer_reviews
WHERE customer_name IN (
  'Frans',
  'Marcus',
  'Jamie',
  'Alex',
  'Taylor',
  'Chris',
  'Sam',
  'Jordan'
);

INSERT INTO public.customer_reviews (
  customer_name,
  service_type,
  rating,
  review_text,
  sort_order,
  is_active
)
VALUES
  (
    'Frans',
    'Predator Maintenance Pro',
    5,
    'Booster very communicate, thank you!',
    0,
    true
  ),
  (
    'Marcus',
    'Ranked Boost',
    5,
    'Hit Gold way faster than I thought. They sent updates on Discord every session and never missed a deadline.',
    1,
    true
  ),
  (
    'Jamie',
    'Duo Ranked Boost',
    5,
    'Queued duo with a cracked player and actually learned a ton. Comms were clear and we climbed two full tiers.',
    2,
    true
  ),
  (
    'Alex',
    'Predator Maintenance Elite',
    5,
    'Held Predator all split without me stressing. Daily RP updates made it feel legit and professional.',
    3,
    true
  ),
  (
    'Taylor',
    'Badge Boosting',
    5,
    'Got my 20 kill badge in two nights. Super fast turnaround and they handled everything on my account safely.',
    4,
    true
  ),
  (
    'Chris',
    'Ranked Boost',
    5,
    'Plat to Diamond in under a week. No drama, just clean games and solid progress the whole way.',
    5,
    true
  ),
  (
    'Sam',
    'Duo Ranked Boost',
    5,
    'My duo was patient even when I whiffed fights. Still made Masters and had a blast doing it.',
    6,
    true
  ),
  (
    'Jordan',
    'Predator Maintenance Core',
    5,
    'Solid service for the price. Weekly reports were clutch and support replied within minutes.',
    7,
    true
  );
