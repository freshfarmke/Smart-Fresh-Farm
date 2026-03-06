-- Migration: Enhanced finance summary with stock_loss and net_profit
-- Date: March 6, 2026
-- Purpose: Add stock_loss and net_profit calculations to the finance summary view
-- These fields are required by the Reports & Analytics page

-- Step 1: Create stock_losses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stock_losses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id uuid REFERENCES public.production_batches(id) ON DELETE SET NULL,
  quantity numeric NOT NULL DEFAULT 0,
  reason text,
  recorded_by text,
  loss_date date NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes on stock_losses
CREATE INDEX IF NOT EXISTS idx_stock_losses_product_id ON public.stock_losses(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_losses_batch_id ON public.stock_losses(batch_id);
CREATE INDEX IF NOT EXISTS idx_stock_losses_recorded_by ON public.stock_losses(recorded_by);
CREATE INDEX IF NOT EXISTS idx_stock_losses_created_at ON public.stock_losses(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_losses_loss_date ON public.stock_losses(loss_date);

-- Step 2: Ensure products table has unit_cost column
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0;

-- Step 3: Drop existing view since we're modifying its definition
DROP VIEW IF EXISTS public.v_finance_summary CASCADE;

-- Recreate the view with stock_loss and net_profit
CREATE OR REPLACE VIEW public.v_finance_summary AS
SELECT
  day,
  COALESCE(SUM(expense_total), 0) AS total_expenses,
  COALESCE(SUM(collection_total), 0) AS total_collections,
  COALESCE(SUM(payment_total), 0) AS total_payments,
  COALESCE(SUM(stock_loss_total), 0) AS total_stock_loss,
  COALESCE(SUM(collection_total), 0) - COALESCE(SUM(expense_total), 0) - COALESCE(SUM(stock_loss_total), 0) AS net_profit
FROM (
  -- Expenses per day
  SELECT 
    expense_date::date AS day, 
    SUM(amount) AS expense_total, 
    0::numeric AS collection_total, 
    0::numeric AS payment_total,
    0::numeric AS stock_loss_total
  FROM public.expenses
  GROUP BY expense_date::date

  UNION ALL

  -- Collections per day (uses `route_collections.collection_date` + `route_collections.amount_collected`)
  SELECT 
    collection_date::date AS day, 
    0::numeric AS expense_total, 
    SUM(amount_collected) AS collection_total, 
    0::numeric AS payment_total,
    0::numeric AS stock_loss_total
  FROM public.route_collections
  GROUP BY collection_date::date

  UNION ALL

  -- Payments per day (assumes `payments.payment_date` + `payments.amount` exist)
  SELECT 
    payment_date::date AS day, 
    0::numeric AS expense_total, 
    0::numeric AS collection_total, 
    SUM(amount) AS payment_total,
    0::numeric AS stock_loss_total
  FROM public.payments
  GROUP BY payment_date::date

  UNION ALL

  -- Stock losses per day (calculates loss value from products table)
  SELECT
    loss_date::date AS day,
    0::numeric AS expense_total,
    0::numeric AS collection_total,
    0::numeric AS payment_total,
    SUM(sl.quantity * COALESCE(p.unit_cost, 0)) AS stock_loss_total
  FROM public.stock_losses sl
  LEFT JOIN public.products p ON p.id = sl.product_id
  GROUP BY sl.loss_date::date
) AS t
GROUP BY day
ORDER BY day DESC;

-- Notes:
-- - net_profit = total_collections - total_expenses - total_stock_loss
-- - stock_loss_total = sum(quantity * unit_cost) for all stock losses in a day
-- - This view unifies daily totals from `expenses`, `route_collections`, `payments`, and `stock_losses`
-- - The stock_losses table is automatically created if it doesn't exist
-- - The unit_cost column is added to products if it doesn't exist
-- - Views cannot have indexes in PostgreSQL, but the underlying tables are indexed
