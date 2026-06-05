-- Predator Maintenance: clarify Switch play with cross-platform EA progress

UPDATE public.services
SET
  short_description = 'Predator RP on Nintendo (Switch)—rewards carry to PC, PSN, and Xbox.',
  description = 'Hold Predator RP with operator sessions on Nintendo (Switch). Your EA-linked progress—including ranked gains and rewards—carries over to PC, PlayStation, and Xbox.',
  updated_at = now()
WHERE slug = 'predator-maintenance';
