-- Default homepage card thumbnail for Badge Boosting

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail3.jpg"}'::jsonb
WHERE slug = 'badge-boosting'
  AND (display_config->>'thumbnail_path') IS NULL;
