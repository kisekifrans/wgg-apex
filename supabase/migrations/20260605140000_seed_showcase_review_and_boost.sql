-- Showcase review + completed boost for homepage (safe to re-run)

DELETE FROM public.customer_reviews
WHERE customer_name = 'Frans'
  AND service_type = 'Predator Maintenance Pro';

INSERT INTO public.customer_reviews (
  customer_name,
  service_type,
  rating,
  review_text,
  avatar_path,
  sort_order,
  is_active
)
VALUES (
  'Frans',
  'Predator Maintenance Pro',
  5,
  'Booster very communicate, thank you!',
  NULL,
  0,
  true
);

DELETE FROM public.completed_boosts
WHERE description = 'Predator Maintenance Pro'
  AND screenshot_path = '/heroes/thumbnail1.png';

INSERT INTO public.completed_boosts (
  from_rank,
  to_rank,
  description,
  screenshot_path,
  completed_at,
  sort_order,
  is_active
)
VALUES (
  'Master',
  'Predator',
  'Predator Maintenance Pro',
  '/heroes/thumbnail1.png',
  CURRENT_DATE,
  0,
  true
);
