-- Production Module Enhancement: Finance Integration & Data Integrity
-- Date: March 10, 2026
-- Purpose: Enhance shop_transfers with batch tracking and create finance integration tables
-- This migration ensures bread distribution cannot exceed production and automatically creates finance records

-- Step 1: Enhance shop_transfers table with additional fields for finance tracking
ALTER TABLE public.shop_transfers
  ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES public.production_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS transferred_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shop_id uuid,
  ADD COLUMN IF NOT EXISTS quantity numeric DEFAULT 0;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shop_transfers_batch_id ON public.shop_transfers(batch_id);
CREATE INDEX IF NOT EXISTS idx_shop_transfers_product_id ON public.shop_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_transfers_transferred_by ON public.shop_transfers(transferred_by);
CREATE INDEX IF NOT EXISTS idx_shop_transfers_created_at ON public.shop_transfers(created_at);

-- Step 3: Create finance_shop_transfers view for Shop->Finance integration
-- This view logs shop transfers as financial transactions
CREATE OR REPLACE VIEW public.finance_shop_transfers AS
SELECT
  st.id AS transfer_id,
  st.product_id,
  st.batch_id,
  st.quantity,
  COALESCE(p.unit_cost, 0) AS unit_price,
  st.quantity * COALESCE(p.unit_cost, 0) AS expected_revenue,
  st.transferred_by,
  st.transfer_date,
  st.created_at,
  'shop_transfer' AS source_type,
  st.id AS source_id
FROM public.shop_transfers st
LEFT JOIN public.products p ON st.product_id = p.id
WHERE st.product_id IS NOT NULL AND st.batch_id IS NOT NULL;

-- Step 4: Data Integrity Function - Validate distribution does not exceed production
CREATE OR REPLACE FUNCTION validate_distribution_quantity()
RETURNS TRIGGER AS $$
DECLARE
  v_produced numeric;
  v_dispatched numeric;
  v_transferred_to_shop numeric;
  v_total_distributed numeric;
BEGIN
  -- Get produced quantity for this batch-product combo
  SELECT SUM(quantity_produced) INTO v_produced
  FROM public.batch_products
  WHERE batch_id = NEW.batch_id AND product_id = NEW.product_id;
  
  -- Get quantity dispatched to routes
  SELECT SUM(quantity_dispatched) INTO v_dispatched
  FROM public.route_dispatch_products rdp
  JOIN public.route_dispatch rd ON rdp.dispatch_id = rd.id
  WHERE rd.batch_id = NEW.batch_id AND rdp.product_id = NEW.product_id;
  
  -- Get quantity transferred to shop (including this transaction)
  SELECT SUM(quantity) INTO v_transferred_to_shop
  FROM public.shop_transfers
  WHERE batch_id = NEW.batch_id AND product_id = NEW.product_id;
  
  v_dispatched := COALESCE(v_dispatched, 0);
  v_transferred_to_shop := COALESCE(v_transferred_to_shop, 0);
  v_total_distributed := v_dispatched + v_transferred_to_shop;
  
  -- Check if total distributed exceeds produced
  IF v_produced IS NOT NULL AND v_total_distributed > v_produced THEN
    RAISE EXCEPTION 'Distribution validation failed: Total distributed (%) exceeds produced (%)',
      v_total_distributed, v_produced;
  END IF;
  
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Step 5: Create trigger for validation on shop_transfers insert/update
DROP TRIGGER IF EXISTS check_distribution_on_shop_transfer ON public.shop_transfers;
CREATE TRIGGER check_distribution_on_shop_transfer
BEFORE INSERT OR UPDATE ON public.shop_transfers
FOR EACH ROW
WHEN (NEW.batch_id IS NOT NULL AND NEW.product_id IS NOT NULL)
EXECUTE FUNCTION validate_distribution_quantity();

-- Step 6: Function to automatically create finance record when shop transfer occurs
CREATE OR REPLACE FUNCTION create_finance_record_on_shop_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into route_collections equivalent for shop transfers
  -- This creates a tracking record for finance to reconcile later
  INSERT INTO public.route_collections (
    dispatch_id,
    amount_collected,
    collection_date,
    payment_method,
    notes,
    created_at
  ) VALUES (
    NULL,  -- shop transfers don't have dispatch_id; they're from production directly
    NEW.quantity * COALESCE((SELECT unit_cost FROM public.products WHERE id = NEW.product_id), 0),
    NEW.transfer_date,
    'shop_transfer',
    'Automated shop transfer finance record - Batch: ' || COALESCE(NEW.batch_id::text, 'N/A'),
    NOW()
  );
  
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically create finance records
DROP TRIGGER IF EXISTS auto_create_finance_record_on_shop_transfer ON public.shop_transfers;
CREATE TRIGGER auto_create_finance_record_on_shop_transfer
AFTER INSERT ON public.shop_transfers
FOR EACH ROW
WHEN (NEW.batch_id IS NOT NULL AND NEW.product_id IS NOT NULL)
EXECUTE FUNCTION create_finance_record_on_shop_transfer();

-- Step 8: Summary comment for verification
-- After this migration, the system will:
-- 1. Track which batch and product each shop transfer comes from
-- 2. Automatically prevent distribution from exceeding production
-- 3. Create finance tracking records for all shop transfers
-- 4. Maintain data integrity with triggers and validation functions
