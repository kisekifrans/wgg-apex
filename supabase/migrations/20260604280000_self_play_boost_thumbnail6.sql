-- Duo Ranked Boost (self-play-boosting) homepage/card thumbnail

UPDATE public.services
SET display_config = display_config || '{"thumbnail_path": "/heroes/thumbnail6.jpg"}'::jsonb
WHERE slug = 'self-play-boosting';
