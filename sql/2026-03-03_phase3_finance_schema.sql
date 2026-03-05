-- Phase 3 — Finance schema hardening (added March 3, 2026)
-- This migration ensures all tables required by the finance module exist
-- and that their columns/indexes match the frontend field names exactly.

-- enable UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----- expenses -----------------------------------------------------------
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS recorded_by text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_expenses_recorded_by ON public.expenses(recorded_by);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- ----- stock_losses -------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_stock_losses_product_id ON public.stock_losses(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_losses_batch_id ON public.stock_losses(batch_id);
CREATE INDEX IF NOT EXISTS idx_stock_losses_recorded_by ON public.stock_losses(recorded_by);
CREATE INDEX IF NOT EXISTS idx_stock_losses_created_at ON public.stock_losses(created_at);

-- ----- collections --------------------------------------------------------
-- The existing `route_collections` table is used by dispatch/production; finance
-- pages will query it directly.  To simplify UI queries we create a view named
-- `collections` that mirrors what the frontend expects (amount_collected,
-- collection_date, dispatch_id, collected_by).

CREATE OR REPLACE VIEW public.collections AS
SELECT
  id,
  dispatch_id,
  amount_collected AS amount,
  collection_date AS date,
  notes,
  created_at
FROM public.route_collections;

CREATE INDEX IF NOT EXISTS idx_collections_date ON public.collections(date);
CREATE INDEX IF NOT EXISTS idx_collections_dispatch_id ON public.collections(dispatch_id);

-- ----- dispatches (alias) -------------------------------------------------
-- `route_dispatch` already exists; expose simple view

CREATE OR REPLACE VIEW public.dispatches AS
SELECT * FROM public.route_dispatch;

-- ----- profiles ----------------------------------------------------------
-- ensure the profiles table exists and has the role column
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'finance',
  name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add role column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'finance';

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'finance' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Finance users can view expenses" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can update expenses" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can delete expenses" ON public.expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

-- Enable RLS on stock_losses table
ALTER TABLE public.stock_losses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stock_losses
CREATE POLICY "Finance users can view stock losses" ON public.stock_losses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can insert stock losses" ON public.stock_losses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can update stock losses" ON public.stock_losses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can delete stock losses" ON public.stock_losses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

-- ----- profiles ----------------------------------------------------------

-- ----- v_finance_summary --------------------------------------------------
-- extend existing view to include additional KPIs:
-- total_revenue, net_profit, total_stock_loss

CREATE OR REPLACE VIEW public.v_finance_summary AS
SELECT
  day,
  COALESCE(SUM(expense_total), 0) AS total_expenses,
  COALESCE(SUM(collection_total), 0) AS total_collections,
  COALESCE(SUM(payment_total), 0) AS total_payments,
  COALESCE(SUM(stock_loss_total), 0) AS total_stock_loss,
  (COALESCE(SUM(collection_total), 0) - COALESCE(SUM(expense_total), 0) - COALESCE(SUM(stock_loss_total),0)) AS net_profit
FROM (
  -- Expenses per day
  SELECT expense_date::date AS day, SUM(amount) AS expense_total, 0::numeric AS collection_total, 0::numeric AS payment_total, 0::numeric AS stock_loss_total
  FROM public.expenses
  GROUP BY expense_date

  UNION ALL

  -- Collections per day
  SELECT collection_date::date AS day, 0::numeric AS expense_total, SUM(amount_collected) AS collection_total, 0::numeric AS payment_total, 0::numeric AS stock_loss_total
  FROM public.route_collections
  GROUP BY collection_date

  UNION ALL

  -- Payments per day
  SELECT payment_date::date AS day, 0::numeric AS expense_total, 0::numeric AS collection_total, SUM(amount) AS payment_total, 0::numeric AS stock_loss_total
  FROM public.payments
  GROUP BY payment_date

  UNION ALL

  -- Stock losses per day
  SELECT loss_date::date AS day, 0::numeric AS expense_total, 0::numeric AS collection_total, 0::numeric AS payment_total, SUM(quantity) AS stock_loss_total
  FROM public.stock_losses
  GROUP BY loss_date
) AS t
GROUP BY day
ORDER BY day DESC;

-- ----- additional indexes -------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.route_collections(created_at);
CREATE INDEX IF NOT EXISTS idx_route_dispatch_created_at ON public.route_dispatch(created_at);

-- End of migration
