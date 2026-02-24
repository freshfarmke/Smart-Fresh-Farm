-- Phase 2 — Module 1: products table
-- Creates the `product` table (singular) used by the frontend
-- Uses gen_random_uuid() for id; ensures created_at timestamp

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create plural table `products` to match existing frontend queries.
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weight text NULL,
  wholesale_price numeric(10,2) NOT NULL DEFAULT 0,
  retail_price numeric(10,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create a compatibility view named `product` (singular) that selects from `products`.
-- This ensures both `products` and `product` identifiers work for existing code.
CREATE OR REPLACE VIEW public.product AS
SELECT * FROM public.products;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (active);

-- Notes:
-- - Table name is `products` (plural) to match the frontend which queries `products`.
-- - A read-only view `product` (singular) is provided for compatibility.
-- - Column names match frontend field names: `name`, `weight`, `wholesale_price`, `retail_price`, `active`, `created_at`, `updated_at`.
-- - No foreign keys are added here because no direct relationship from UI requires it.
-- - If you later need `INSERT` permission to the `product` view, consider creating an INSTEAD OF trigger
--   or update the frontend to insert into `products` directly.
