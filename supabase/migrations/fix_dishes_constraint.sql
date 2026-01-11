-- Fix for NOT NULL constraint on legacy category column
ALTER TABLE public.dishes ALTER COLUMN category DROP NOT NULL;

-- Ensure category_id is used for future relations
COMMENT ON COLUMN public.dishes.category IS 'Legacy column, use category_id instead';
