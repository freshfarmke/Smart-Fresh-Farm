-- =============================================================================
-- FIX: Route Dispatch Products Table and Data
-- =============================================================================
-- 
-- Issue: "Product was not part of this dispatch" error when recording returns
-- 
-- Root Cause: The route_dispatch_products table may be empty or not properly
-- linked to dispatches. Products must be explicitly added to each dispatch
-- when it's created, otherwise the returns validation will fail.
--
-- =============================================================================

-- 1. VERIFY THE TABLE EXISTS AND HAS CORRECT STRUCTURE
-- Run this to check your current schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'route_dispatch_products'
ORDER BY ordinal_position;

-- Expected columns should be:
-- - id (bigint, primary key)
-- - dispatch_id (bigint, foreign key -> route_dispatch.id)
-- - product_id (bigint, foreign key -> products.id)
-- - quantity_dispatched (numeric or integer)
-- - quantity_sold (optional, numeric or integer)
-- - quantity_returned (optional, numeric or integer)
-- - created_at (timestamp)

-- =============================================================================

-- 2. IF TABLE DOESN'T EXIST, CREATE IT:
CREATE TABLE IF NOT EXISTS public.route_dispatch_products (
  id BIGSERIAL PRIMARY KEY,
  dispatch_id BIGINT NOT NULL REFERENCES public.route_dispatch(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  quantity_dispatched INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER DEFAULT 0,
  quantity_returned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dispatch_id, product_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_route_dispatch_products_dispatch_id 
ON public.route_dispatch_products(dispatch_id);

CREATE INDEX IF NOT EXISTS idx_route_dispatch_products_product_id 
ON public.route_dispatch_products(product_id);

-- =============================================================================

-- 3. VERIFY DATA - CHECK IF YOUR DISPATCHES HAVE PRODUCTS ASSIGNED
-- This will show all dispatches and their product counts
SELECT 
  rd.id as dispatch_id,
  rd.dispatch_date,
  rr.full_name as rider_name,
  COUNT(rdp.product_id) as products_assigned,
  COALESCE(STRING_AGG(p.name, ', '), 'NO PRODUCTS') as product_names
FROM public.route_dispatch rd
LEFT JOIN public.route_dispatch_products rdp ON rd.id = rdp.dispatch_id
LEFT JOIN public.products p ON rdp.product_id = p.id
LEFT JOIN public.route_riders rr ON rd.rider_id = rr.id
GROUP BY rd.id, rd.dispatch_date, rr.full_name
ORDER BY rd.created_at DESC;

-- =============================================================================

-- 4. IF PRODUCTS ARE MISSING, ADD THEM TO A DISPATCH
-- Example: Add products to dispatch ID 1 from a batch
-- First, get the batch ID from the dispatch:
SELECT batch_id, rider_id FROM public.route_dispatch WHERE id = 1;

-- Then add all products from that batch to the dispatch:
INSERT INTO public.route_dispatch_products 
  (dispatch_id, product_id, quantity_dispatched)
SELECT 
  1, -- dispatch_id (change this to your dispatch ID)
  bp.product_id,
  bp.quantity_produced as quantity_dispatched
FROM public.batch_products bp
WHERE bp.batch_id = (SELECT batch_id FROM public.route_dispatch WHERE id = 1)
ON CONFLICT (dispatch_id, product_id) DO NOTHING;

-- =============================================================================

-- 5. VERIFY THE FIX - RUN THIS AFTER ADDING PRODUCTS
-- This will show if your dispatch now has products:
SELECT 
  p.id,
  p.name,
  rdp.quantity_dispatched
FROM public.route_dispatch_products rdp
JOIN public.products p ON rdp.product_id = p.id
WHERE rdp.dispatch_id = 1 -- Change this to your dispatch ID
ORDER BY p.name;

-- =============================================================================

-- 6. FIX MISSING PRODUCTS FOR ALL DISPATCHES (BULK OPERATION)
-- This will populate all dispatches that reference a batch with products
INSERT INTO public.route_dispatch_products 
  (dispatch_id, product_id, quantity_dispatched)
SELECT 
  rd.id as dispatch_id,
  bp.product_id,
  bp.quantity_produced as quantity_dispatched
FROM public.route_dispatch rd
LEFT JOIN public.batch_products bp ON rd.batch_id = bp.batch_id
WHERE bp.product_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.route_dispatch_products rdp 
    WHERE rdp.dispatch_id = rd.id AND rdp.product_id = bp.product_id
  )
ON CONFLICT (dispatch_id, product_id) DO NOTHING;

-- =============================================================================

-- 7. VERIFY NO DISPATCHES ARE MISSING PRODUCTS
-- This shows any dispatches with 0 products (these will cause the error):
SELECT 
  rd.id,
  rd.dispatch_date,
  rr.full_name as rider_name,
  COUNT(rdp.id) as product_count
FROM public.route_dispatch rd
LEFT JOIN public.route_riders rr ON rd.rider_id = rr.id
LEFT JOIN public.route_dispatch_products rdp ON rd.id = rdp.dispatch_id
GROUP BY rd.id, rd.dispatch_date, rr.full_name
HAVING COUNT(rdp.id) = 0
ORDER BY rd.created_at DESC;

-- If this query returns any rows, those dispatches need products added!

-- =============================================================================

-- DEBUGGING STEPS:

-- Check if a specific product exists in the database:
SELECT id, name, active FROM public.products WHERE id = 123; -- replace 123 with product ID

-- Check if route_dispatch table has data:
SELECT COUNT(*) FROM public.route_dispatch;

-- Check if route_dispatch_products table has data:
SELECT COUNT(*) FROM public.route_dispatch_products;

-- Show details of a specific dispatch:
SELECT * FROM public.route_dispatch WHERE id = 1;

-- Show all products for a specific dispatch:
SELECT rdp.*, p.name 
FROM public.route_dispatch_products rdp
JOIN public.products p ON rdp.product_id = p.id
WHERE rdp.dispatch_id = 1;

-- =============================================================================
