-- Default homepage card thumbnails in services CMS (display_config.thumbnail_path)

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail1.png"}'::jsonb
WHERE slug = 'ranked-boosting'
  AND (display_config->>'thumbnail_path') IS NULL;

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail2.jpg"}'::jsonb
WHERE slug = 'predator-maintenance'
  AND (display_config->>'thumbnail_path') IS NULL;

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail3.jpg"}'::jsonb
WHERE slug = 'badge-boosting'
  AND (display_config->>'thumbnail_path') IS NULL;

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail4.jpg"}'::jsonb
WHERE slug = 'account-marketplace'
  AND (display_config->>'thumbnail_path') IS NULL;

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail5.png"}'::jsonb
WHERE slug = 'apex-unban'
  AND (display_config->>'thumbnail_path') IS NULL;
