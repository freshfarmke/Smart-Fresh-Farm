-- Phase 2 — Module 3: shop (stock & transfers)
-- Tables: shop_stock, shop_transfers, shop_transfer_products
-- Designed to support the Shop UI: stock summary, transfer table, transfer history

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Current stock in shop (inventory)
CREATE TABLE IF NOT EXISTS public.shop_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  location text NOT NULL DEFAULT 'shop', -- 'production' or 'shop'
  quantity_available numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, location)
);

-- Transfer records (move items from production -> shop)
CREATE TABLE IF NOT EXISTS public.shop_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location text NOT NULL,
  to_location text NOT NULL,
  transfer_date date NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Products associated with a transfer
CREATE TABLE IF NOT EXISTS public.shop_transfer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES public.shop_transfers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(transfer_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_stock_product_id ON public.shop_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_transfers_transfer_date ON public.shop_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_shop_transfer_products_transfer_id ON public.shop_transfer_products(transfer_id);
CREATE INDEX IF NOT EXISTS idx_shop_transfer_products_product_id ON public.shop_transfer_products(product_id);

-- Relationship notes:
-- - `shop_stock` stores current available quantities per product per location (shop vs production)
-- - `shop_transfers` logs each transfer event and `shop_transfer_products` stores transferred quantities per product
-- - Frontend components `TransferTable` and `TransferHistory` should create `shop_transfers` and `shop_transfer_products` rows,
--   and the `shop_stock` table should be updated to reflect the moved quantities.
-- - Column names match frontend usage: `product_id`, `quantity` etc.
