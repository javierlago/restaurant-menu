-- Add missing columns to dishes table
-- These columns exist in 000_full_setup.sql but were never added via
-- an incremental migration, so databases built from 001-007 lack them.
-- "portionSize" must stay quoted to preserve camelCase, matching the client payload.
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS "portionSize" TEXT;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS allergens TEXT[];
