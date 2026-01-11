-- Modular Database Schema for Restaurant Menu
-- This script creates the fundamental tables for categories, dishes, and configuration.

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image TEXT,
    "isVisible" BOOLEAN DEFAULT true,
    category_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Dishes Table
CREATE TABLE IF NOT EXISTS public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT, -- Legacy column
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image TEXT,
    "isVisible" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Restaurant Configuration Table
CREATE TABLE IF NOT EXISTS public.restaurant_config (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    restaurant_name TEXT NOT NULL DEFAULT 'A Chabola',
    subtitle TEXT DEFAULT 'Descubre una experiencia gastronómica única en A Chabola',
    icon TEXT,
    theme_id TEXT DEFAULT 'classic',
    show_name BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
