-- Collections Extension: Support for Shop & Institution Collections
-- Tables: shop_collections, institution_collections, and their product tracking
-- Purpose: Track money collected from shops and institutions in addition to route riders

-- ============= SHOP COLLECTIONS =============
-- Track money collected from shop sales (from items transferred to shop + returns from riders)
CREATE TABLE IF NOT EXISTS public.shop_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_date date NOT NULL,
  amount_collected numeric(15, 2) NOT NULL,
  payment_method text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Track individual product sales in shop collections
CREATE TABLE IF NOT EXISTS public.shop_collection_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.shop_collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_sold numeric NOT NULL DEFAULT 0,
  unit_price numeric(10, 2),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============= INSTITUTION COLLECTIONS =============
-- Track money collected from institution buyers
CREATE TABLE IF NOT EXISTS public.institution_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  collection_date date NOT NULL,
  amount_collected numeric(15, 2) NOT NULL,
  payment_method text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Track individual product sales in institution collections
CREATE TABLE IF NOT EXISTS public.institution_collection_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.institution_collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_sold numeric NOT NULL DEFAULT 0,
  unit_price numeric(10, 2),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============= INDEXES =============
CREATE INDEX IF NOT EXISTS idx_shop_collections_date ON public.shop_collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_shop_collection_products_collection_id ON public.shop_collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_shop_collection_products_product_id ON public.shop_collection_products(product_id);

CREATE INDEX IF NOT EXISTS idx_institution_collections_institution_id ON public.institution_collections(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_collections_date ON public.institution_collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_institution_collection_products_collection_id ON public.institution_collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_institution_collection_products_product_id ON public.institution_collection_products(product_id);
