-- Phase 2 — Module 4: dispatch (route dispatch, returns, collections)
-- Tables: route_dispatch, route_dispatch_products, route_returns, route_return_products, route_collections, route_collection_products
-- Fields mirror frontend usage and use UUID PKs with gen_random_uuid().

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Route dispatch master record
CREATE TABLE IF NOT EXISTS public.route_dispatch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES public.route_riders(id) ON DELETE RESTRICT,
  batch_id uuid REFERENCES public.production_batches(id) ON DELETE SET NULL,
  dispatch_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_transit','completed','returned')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Products assigned to a dispatch
CREATE TABLE IF NOT EXISTS public.route_dispatch_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid NOT NULL REFERENCES public.route_dispatch(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_dispatched numeric NOT NULL DEFAULT 0,
  quantity_sold numeric NOT NULL DEFAULT 0,
  quantity_returned numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(dispatch_id, product_id)
);

-- Returns recorded for a dispatch
CREATE TABLE IF NOT EXISTS public.route_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid NOT NULL REFERENCES public.route_dispatch(id) ON DELETE CASCADE,
  return_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Products within a return
CREATE TABLE IF NOT EXISTS public.route_return_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES public.route_returns(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_returned numeric NOT NULL DEFAULT 0,
  reason text CHECK (reason IN ('good','expired','unsold','damaged','other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(return_id, product_id)
);

-- Collections (money collected by rider for a dispatch)
CREATE TABLE IF NOT EXISTS public.route_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid NOT NULL REFERENCES public.route_dispatch(id) ON DELETE CASCADE,
  amount_collected numeric NOT NULL DEFAULT 0,
  collection_date date NOT NULL,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Products sold within a collection (to capture per-product sold quantities and unit price)
CREATE TABLE IF NOT EXISTS public.route_collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.route_collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_sold numeric NOT NULL DEFAULT 0,
  unit_price numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_route_dispatch_rider_id ON public.route_dispatch(rider_id);
CREATE INDEX IF NOT EXISTS idx_route_dispatch_batch_id ON public.route_dispatch(batch_id);
CREATE INDEX IF NOT EXISTS idx_route_dispatch_date ON public.route_dispatch(dispatch_date);
CREATE INDEX IF NOT EXISTS idx_route_dispatch_status ON public.route_dispatch(status);

CREATE INDEX IF NOT EXISTS idx_route_dispatch_products_dispatch_id ON public.route_dispatch_products(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_route_dispatch_products_product_id ON public.route_dispatch_products(product_id);

CREATE INDEX IF NOT EXISTS idx_route_returns_dispatch_id ON public.route_returns(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_route_return_products_return_id ON public.route_return_products(return_id);
CREATE INDEX IF NOT EXISTS idx_route_return_products_product_id ON public.route_return_products(product_id);

CREATE INDEX IF NOT EXISTS idx_route_collections_dispatch_id ON public.route_collections(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_route_collection_products_collection_id ON public.route_collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_route_collection_products_product_id ON public.route_collection_products(product_id);

-- Relationship notes:
-- - `route_dispatch` is the master dispatch record created by Production. It references `route_riders` and optionally `production_batches`.
-- - `route_dispatch_products` tracks quantities assigned to a dispatch and later updated when items are sold or returned.
-- - `route_returns` and `route_return_products` capture returned items linked to a dispatch.
-- - `route_collections` and `route_collection_products` record money collected and the per-product quantities/prices sold during collection events.
-- - Column names are chosen to match frontend fields used in `lib/api/routes.ts` and UI pages.

-- Confirm alignment with frontend API calls before moving to `route_riders` module.
