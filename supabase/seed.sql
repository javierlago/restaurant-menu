-- Seed File
-- Use this to populate the database with initial configuration.

INSERT INTO public.restaurant_config (restaurant_name, subtitle, icon, theme_id, show_name)
VALUES ('Restaurant Name', 'Discover our delicious menu and unique flavors', '/restaurant-logo.png', 'classic', true)
ON CONFLICT (id) DO NOTHING;

-- Example initial categories (Optional)
-- INSERT INTO public.categories (name, slug) VALUES ('Entrantes', 'entrantes'), ('Platos Principales', 'platos-principales');
