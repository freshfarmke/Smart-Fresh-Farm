-- Phase 2 — Module 2: production tables
-- Creates `production_batches` and `batch_products` tables used by the frontend
-- Columns match frontend field names exactly and use UUID PKs per Phase 2 rules.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Production batches (plural to match frontend queries)
CREATE TABLE IF NOT EXISTS public.production_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number text NOT NULL,
  batch_code text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','closed')),
  production_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Batch products: products produced within a batch
CREATE TABLE IF NOT EXISTS public.batch_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_produced numeric NOT NULL DEFAULT 0,
  quantity_remaining numeric NOT NULL DEFAULT 0,
  expiry_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(batch_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_production_batches_production_date ON public.production_batches (production_date);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches (status);
CREATE INDEX IF NOT EXISTS idx_batch_products_batch_id ON public.batch_products (batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_products_product_id ON public.batch_products (product_id);

-- Relationship notes:
-- - `production_batches` holds batch metadata (batch_number, batch_code, production_date, status)
-- - `batch_products` links a batch to the `products` table and tracks quantities and expiry
-- - Column names match frontend types: `batch_number`, `batch_code`, `production_date`, `notes`, `quantity_produced`, `quantity_remaining`, `expiry_date`.
-- Confirm alignment before proceeding to `shop` module.
