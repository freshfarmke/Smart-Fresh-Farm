-- ============================================
-- BAKERY OS - SUPABASE DATABASE SCHEMA
-- Production Dashboard
-- ============================================

-- ============================================
-- 1. USERS TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'production', 'finance')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_type VARCHAR(50) NOT NULL DEFAULT 'pieces',
  unit_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- ============================================
-- 3. BATCHES TABLE (Production)
-- ============================================
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dispatched')),
  total_quantity INT DEFAULT 0,
  total_units INT DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  dispatched_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. BATCH PRODUCTS TABLE (Products in a batch)
-- ============================================
CREATE TABLE IF NOT EXISTS public.batch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_planned INT NOT NULL DEFAULT 0,
  quantity_produced INT NOT NULL DEFAULT 0,
  quantity_dispatched INT NOT NULL DEFAULT 0,
  quantity_returned INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(batch_id, product_id)
);

-- ============================================
-- 5. DISPATCH LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.routes(id),
  institution_id UUID REFERENCES public.institutions(id),
  quantity_dispatched INT NOT NULL,
  dispatch_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dispatched_by UUID NOT NULL REFERENCES public.users(id),
  dispatch_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 6. RETURN LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.return_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id UUID NOT NULL REFERENCES public.dispatch_logs(id),
  batch_id UUID NOT NULL REFERENCES public.batches(id),
  quantity_returned INT NOT NULL,
  return_reason VARCHAR(255),
  condition VARCHAR(50) CHECK (condition IN ('good', 'damaged', 'expired', 'other')),
  return_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  returned_by UUID NOT NULL REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 7. ROUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name VARCHAR(255) NOT NULL,
  route_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 8. INSTITUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  institution_type VARCHAR(100),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 9. ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  action VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_batches_batch_date ON public.batches(batch_date);
CREATE INDEX idx_batches_created_by ON public.batches(created_by);
CREATE INDEX idx_batch_products_batch_id ON public.batch_products(batch_id);
CREATE INDEX idx_dispatch_logs_batch_id ON public.dispatch_logs(batch_id);
CREATE INDEX idx_dispatch_logs_dispatch_date ON public.dispatch_logs(dispatch_date);
CREATE INDEX idx_return_logs_batch_id ON public.return_logs(batch_id);
CREATE INDEX idx_return_logs_return_date ON public.return_logs(return_date);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own profile, admins can read all
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Batches: Production and admin can view all, others can view their own
CREATE POLICY "Users can view batches"
  ON public.batches FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

CREATE POLICY "Production can create batches"
  ON public.batches FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production') AND created_by = auth.uid());

CREATE POLICY "Production can update batches"
  ON public.batches FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

-- Batch Products: Same as batches
CREATE POLICY "Users can view batch products"
  ON public.batch_products FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

CREATE POLICY "Production can manage batch products"
  ON public.batch_products FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

CREATE POLICY "Production can update batch products"
  ON public.batch_products FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

-- Dispatch Logs: Production and admin can access
CREATE POLICY "Users can view dispatch logs"
  ON public.dispatch_logs FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production', 'finance'));

CREATE POLICY "Production can create dispatch logs"
  ON public.dispatch_logs FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

-- Return Logs: Production and finance can access
CREATE POLICY "Users can view return logs"
  ON public.return_logs FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production', 'finance'));

CREATE POLICY "Production can create return logs"
  ON public.return_logs FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'production'));

-- Routes and Institutions: Everyone can read, only admins can write
CREATE POLICY "Everyone can view routes"
  ON public.routes FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage routes"
  ON public.routes FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Everyone can view institutions"
  ON public.institutions FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage institutions"
  ON public.institutions FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Activity Logs: Users can view only their own, admins can view all
CREATE POLICY "Users can view own activity"
  ON public.activity_logs FOR SELECT
  USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Log activities (application-side)"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert sample products
INSERT INTO public.products (name, description, unit_type) VALUES
  ('White Bread', 'Standard white loaf bread', 'loaves'),
  ('Whole Wheat Bread', 'Healthy whole wheat bread', 'loaves'),
  ('Croissants', 'Buttery French croissants', 'pieces'),
  ('Bagels', 'New York style bagels', 'pieces'),
  ('Muffins', 'Assorted flavored muffins', 'pieces'),
  ('Donuts', 'Glazed and frosted donuts', 'pieces')
ON CONFLICT (id) DO NOTHING;

-- Insert sample routes
INSERT INTO public.routes (route_name, route_code, description) VALUES
  ('North Route', 'NRT-001', 'Northern sector delivery route'),
  ('South Route', 'SRT-002', 'Southern sector delivery route'),
  ('East Route', 'ERT-003', 'Eastern sector delivery route'),
  ('West Route', 'WRT-004', 'Western sector delivery route'),
  ('Central Route', 'CRT-005', 'Central business district route')
ON CONFLICT (id) DO NOTHING;
