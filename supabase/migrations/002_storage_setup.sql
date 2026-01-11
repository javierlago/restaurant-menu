-- Storage Buckets and Policies Setup
-- This script initializes the required buckets and sets up their security rules.

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('dish-images', 'dish-images', true),
    ('categories-images', 'categories-images', true),
    ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Generic Policies for Storage (Allowing public read and authenticated management)

-- Dish Images
CREATE POLICY "Public access to dish-images" ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');
CREATE POLICY "Auth management of dish-images" ON storage.objects FOR ALL USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

-- Categories Images
CREATE POLICY "Public access to categories-images" ON storage.objects FOR SELECT USING (bucket_id = 'categories-images');
CREATE POLICY "Auth management of categories-images" ON storage.objects FOR ALL USING (bucket_id = 'categories-images' AND auth.role() = 'authenticated');

-- Restaurant Assets
CREATE POLICY "Public access to restaurant-assets" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Auth management of restaurant-assets" ON storage.objects FOR ALL USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
