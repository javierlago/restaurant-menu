-- ==========================================
-- 000_FULL_SETUP.SQL
-- Consolidated script to initialize a new Supabase project
-- Includes: Schema, Storage, and RLS Policies
-- ==========================================

-- 1. TABLES SETUP
-- ------------------------------------------

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image TEXT,
    "isVisible" BOOLEAN DEFAULT true,
    category_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    image_position TEXT DEFAULT 'center',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Dishes Table
CREATE TABLE IF NOT EXISTS public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    portionSize TEXT,
    allergens TEXT[], -- Array of strings
    category TEXT, -- Legacy reference (still used for backward sync)
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image TEXT,
    image_position TEXT DEFAULT 'center',
    "isVisible" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Restaurant Configuration Table
CREATE TABLE IF NOT EXISTS public.restaurant_config (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    restaurant_name TEXT NOT NULL DEFAULT 'A Chabola',
    subtitle TEXT DEFAULT 'Descubre una experiencia gastronómica única en A Chabola',
    icon TEXT,
    theme_id TEXT DEFAULT 'classic',
    show_name BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. SECURITY (RLS)
-- ------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_config ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are manageable by authenticated users" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- Dishes Policies
CREATE POLICY "Dishes are viewable by everyone" ON public.dishes FOR SELECT USING (true);
CREATE POLICY "Dishes are manageable by authenticated users" ON public.dishes FOR ALL USING (auth.role() = 'authenticated');

-- Config Policies
CREATE POLICY "Config is viewable by everyone" ON public.restaurant_config FOR SELECT USING (true);
CREATE POLICY "Config is manageable by authenticated users" ON public.restaurant_config FOR ALL USING (auth.role() = 'authenticated');

-- 3. STORAGE SETUP
-- ------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('dish-images', 'dish-images', true),
    ('categories-images', 'categories-images', true),
    ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public access to dish-images" ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');
CREATE POLICY "Auth management of dish-images" ON storage.objects FOR ALL USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public access to categories-images" ON storage.objects FOR SELECT USING (bucket_id = 'categories-images');
CREATE POLICY "Auth management of categories-images" ON storage.objects FOR ALL USING (bucket_id = 'categories-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public access to restaurant-assets" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Auth management of restaurant-assets" ON storage.objects FOR ALL USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');

-- 4. COMMENTS & DOCUMENTATION
-- ------------------------------------------
COMMENT ON COLUMN public.dishes.image_position IS 'Image alignment for object-position (e.g., 50% 50%)';
COMMENT ON COLUMN public.categories.image_position IS 'Image alignment for object-position (e.g., 50% 50%)';
