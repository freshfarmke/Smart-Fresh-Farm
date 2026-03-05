-- Unified Collections Table
-- Consolidates all collection types (rider, shop, institution) into single table
-- Source type determines the data source and what products to show

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type text NOT NULL CHECK (source_type IN ('rider', 'shop', 'institution')), -- Collection source
  source_id uuid, -- rider_id (for rider collections) or institution_id (for institution collections), NULL for shop
  dispatch_id uuid REFERENCES public.route_dispatch(id) ON DELETE SET NULL, -- Reference to dispatch (rider only)
  collection_date date NOT NULL,
  amount_collected numeric(15, 2) NOT NULL,
  payment_method text, -- mpesa, cash, bank, check, credit
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Track products sold in each collection
CREATE TABLE IF NOT EXISTS public.collection_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_sold numeric NOT NULL DEFAULT 0,
  unit_price numeric(10, 2), -- Price per unit at time of sale
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============= INDEXES =============
CREATE INDEX IF NOT EXISTS idx_collections_source_type ON public.collections(source_type);
CREATE INDEX IF NOT EXISTS idx_collections_source_id ON public.collections(source_id);
CREATE INDEX IF NOT EXISTS idx_collections_dispatch_id ON public.collections(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON public.collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_id ON public.collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product_id ON public.collection_products(product_id);

-- ============= VIEWS =============
-- View: Collections with related data (rider, dispatch, institution info)
CREATE OR REPLACE VIEW public.v_collections_detail AS
SELECT 
  c.id,
  c.source_type,
  c.collection_date,
  c.amount_collected,
  c.payment_method,
  c.notes,
  c.created_at,
  -- Rider details (if source_type = 'rider')
  rr.id as rider_id,
  rr.full_name as rider_name,
  rr.nickname as rider_nickname,
  rr.phone as rider_phone,
  -- Dispatch details
  rd.id as dispatch_id,
  rd.dispatch_date,
  rd.status as dispatch_status,
  -- Institution details (if source_type = 'institution')
  i.id as institution_id,
  i.name as institution_name,
  i.contact_person,
  i.phone as institution_phone
FROM public.collections c
LEFT JOIN public.route_riders rr ON c.source_id = rr.id AND c.source_type = 'rider'
LEFT JOIN public.route_dispatch rd ON c.dispatch_id = rd.id
LEFT JOIN public.institutions i ON c.source_id = i.id AND c.source_type = 'institution';

-- View: Collections with product details
CREATE OR REPLACE VIEW public.v_collection_products_detail AS
SELECT 
  cp.id,
  cp.collection_id,
  cp.product_id,
  cp.quantity_sold,
  cp.unit_price,
  cp.quantity_sold * cp.unit_price as line_total,
  p.name as product_name,
  p.retail_price,
  c.collection_date,
  c.source_type,
  c.amount_collected
FROM public.collection_products cp
JOIN public.collections c ON cp.collection_id = c.id
JOIN public.products p ON cp.product_id = p.id;
