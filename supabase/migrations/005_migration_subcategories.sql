-- Migration script for Subcategories (Corrected for UUID)
-- 1. Add parent_id to categories for hierarchy
-- Using generic type-agnostic approach or matching UUID if that's what's in the DB
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- 2. Add category_id to dishes
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Migration: Update category_id based on current category name/slug/ID stored as text
UPDATE public.dishes d
SET category_id = c.id
FROM public.categories c
WHERE d.category = c.id::text OR d.category = c.slug OR d.category = c.name;
