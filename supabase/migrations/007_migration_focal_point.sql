-- Add image_position column to dishes and categories
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';

COMMENT ON COLUMN public.dishes.image_position IS 'Vertical alignment for object-position (e.g., top, center, bottom)';
COMMENT ON COLUMN public.categories.image_position IS 'Vertical alignment for object-position (e.g., top, center, bottom)';
