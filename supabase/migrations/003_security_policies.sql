-- Row Level Security (RLS) Policies
-- This script enables RLS and sets up access rules for the public and authenticated users.

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_config ENABLE ROW LEVEL SECURITY;

-- 1. Categories Policies
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by authenticated users" 
ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- 2. Dishes Policies
CREATE POLICY "Dishes are viewable by everyone" 
ON public.dishes FOR SELECT USING (true);

CREATE POLICY "Dishes are manageable by authenticated users" 
ON public.dishes FOR ALL USING (auth.role() = 'authenticated');

-- 3. Restaurant Config Policies
CREATE POLICY "Config is viewable by everyone" 
ON public.restaurant_config FOR SELECT USING (true);

CREATE POLICY "Config is manageable by authenticated users" 
ON public.restaurant_config FOR ALL USING (auth.role() = 'authenticated');
