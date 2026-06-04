-- Marketplace + unban card thumbnails; retire Ranked Arena Badge from catalog

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail4.jpg"}'::jsonb
WHERE slug = 'account-marketplace';

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail5.png"}'::jsonb
WHERE slug = 'apex-unban';

UPDATE public.service_pricing_items spi
SET is_active = false,
    updated_at = now()
FROM public.services s
WHERE spi.service_id = s.id
  AND s.slug = 'badge-boosting'
  AND spi.name = 'Ranked Arena Badge';
