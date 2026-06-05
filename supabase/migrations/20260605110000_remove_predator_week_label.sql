-- Clear legacy "/ week" price suffix on Predator Maintenance (featured homepage card)

UPDATE public.services
SET
  price_label = NULL,
  short_description = 'Predator RP maintenance on Nintendo (Switch).'
WHERE slug = 'predator-maintenance'
  AND (price_label ILIKE '%week%' OR short_description ILIKE '%weekly%');
