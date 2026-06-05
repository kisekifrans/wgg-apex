-- Apex Unban Service → $40 flat fee

UPDATE public.service_pricing_items
SET price_cents = 4000
WHERE service_id = (SELECT id FROM public.services WHERE slug = 'apex-unban');

UPDATE public.services
SET from_price_cents = 4000
WHERE slug = 'apex-unban';
