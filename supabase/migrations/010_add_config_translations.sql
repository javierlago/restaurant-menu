-- Add translations column to restaurant_config so the subtitle can be
-- localized (gl/en/fr), matching the pattern already used on dishes/categories.
ALTER TABLE public.restaurant_config ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.restaurant_config.translations IS 'Per-locale overrides for subtitle, e.g. {"en": {"subtitle": "..."}}. Falls back to the Spanish subtitle column when a locale is missing.';
