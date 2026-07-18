-- Add translations column for multi-language menu support (gl, en, fr).
-- Spanish stays canonical in the existing name/description/portionSize columns;
-- translations holds optional per-locale overrides: {"en": {"name": "...", "description": "...", "portionSize": "..."}, ...}
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.dishes.translations IS 'Per-locale overrides for name/description/portionSize, e.g. {"en": {"name": "..."}}. Falls back to the Spanish columns when a locale/field is missing.';
COMMENT ON COLUMN public.categories.translations IS 'Per-locale overrides for name, e.g. {"en": {"name": "..."}}. Falls back to the Spanish name column when a locale is missing.';
