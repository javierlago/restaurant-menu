-- Add category_order column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS category_order INTEGER DEFAULT 0;

-- Initialize order based on name for existing rows
WITH OrderedCategories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 as new_order
  FROM public.categories
)
UPDATE public.categories
SET category_order = OrderedCategories.new_order
FROM OrderedCategories
WHERE public.categories.id = OrderedCategories.id;
