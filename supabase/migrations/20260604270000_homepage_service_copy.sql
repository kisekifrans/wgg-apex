-- Homepage bullet copy: sentence case, parallel structure (no trailing periods)

UPDATE public.services
SET display_config = jsonb_set(
  display_config,
  '{features}',
  '["Eligibility review before you pay","Case timeline in your dashboard","Operator-guided submission workflow","Clear refund terms if ineligible"]'::jsonb
)
WHERE slug = 'apex-unban';

UPDATE public.services
SET display_config = jsonb_set(
  display_config,
  '{features}',
  '["Queue with a verified WGG operator","Same rank targets as standard boosting","Double the standard tier rate for duo time","Learn while you climb with a pro"]'::jsonb
)
WHERE slug = 'self-play-boosting';

UPDATE public.service_pricing_items spi
SET features = '["Minimum RP floor maintenance","Weekly progress report","Standard queue"]'::jsonb
FROM public.services s
WHERE spi.service_id = s.id AND s.slug = 'predator-maintenance' AND spi.name = 'Core';

UPDATE public.service_pricing_items spi
SET features = '["Aggressive RP target band","Daily status updates","Priority queue and duo option"]'::jsonb
FROM public.services s
WHERE spi.service_id = s.id AND s.slug = 'predator-maintenance' AND spi.name = 'Pro';

UPDATE public.service_pricing_items spi
SET features = '["Custom RP schedule","Dedicated operator channel","Express recovery sessions"]'::jsonb
FROM public.services s
WHERE spi.service_id = s.id AND s.slug = 'predator-maintenance' AND spi.name = 'Elite';

UPDATE public.services SET short_description = 'Ranked progression with live tracking and verified boosters.' WHERE slug = 'ranked-boosting';
UPDATE public.services SET description = 'Climb from your current tier to your target division with verified boosters and live order tracking.' WHERE slug = 'ranked-boosting';

UPDATE public.services SET short_description = 'Weekly RP maintenance on Nintendo (Switch).' WHERE slug = 'predator-maintenance';
UPDATE public.services SET description = 'Hold Predator RP with scheduled sessions, progress reports, and priority queue placement on Switch.' WHERE slug = 'predator-maintenance';

UPDATE public.services SET short_description = 'Fixed prices for badge and achievement runs.' WHERE slug = 'badge-boosting';
UPDATE public.services SET description = 'Badge and achievement completion at fixed prices—exact cost before you pay.' WHERE slug = 'badge-boosting';

UPDATE public.services SET short_description = 'Guided workflow for suspended accounts.' WHERE slug = 'apex-unban';
UPDATE public.services SET description = 'Eligibility screening and a guided recovery workflow for suspended accounts—with clear expectations upfront.' WHERE slug = 'apex-unban';

UPDATE public.services SET short_description = 'Verified accounts with secure checkout.' WHERE slug = 'account-marketplace';
UPDATE public.services SET description = 'Verified listings with rank, RP, and heirloom details—buy through secure checkout.' WHERE slug = 'account-marketplace';

UPDATE public.services SET short_description = 'Queue with a verified operator and climb together.' WHERE slug = 'self-play-boosting';
UPDATE public.services SET description = 'Play on your account alongside a WGG operator—live comms, coordinated drops, and faster improvement than piloted boosting.' WHERE slug = 'self-play-boosting';
