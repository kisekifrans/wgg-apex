-- Correct customer-facing service links (Predator Maintenance was pointing at rank pricing)

UPDATE public.services
SET href = '/services/predator-maintenance', updated_at = now()
WHERE slug = 'predator-maintenance';

UPDATE public.services
SET href = '/services/apex-unban', updated_at = now()
WHERE slug = 'apex-unban';
