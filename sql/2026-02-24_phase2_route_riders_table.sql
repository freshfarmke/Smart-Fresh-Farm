-- Phase 2 — Module 5: route_riders and route_rider_fuel
-- Creates `route_riders` and `route_rider_fuel` tables used by Finance and Production
-- Columns mirror frontend field names and use UUID PKs (gen_random_uuid())

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.route_riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  nickname text,
  phone text UNIQUE,
  address text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.route_rider_fuel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES public.route_riders(id) ON DELETE CASCADE,
  amount_spent numeric(10,2) NOT NULL DEFAULT 0,
  fuel_type text,
  date_recorded date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_route_riders_phone ON public.route_riders(phone);
CREATE INDEX IF NOT EXISTS idx_route_riders_status ON public.route_riders(status);
CREATE INDEX IF NOT EXISTS idx_route_rider_fuel_rider_id ON public.route_rider_fuel(rider_id);
CREATE INDEX IF NOT EXISTS idx_route_rider_fuel_date ON public.route_rider_fuel(date_recorded);

-- Notes:
-- - Frontend fields referenced: full_name, nickname, phone, address, status, created_at, updated_at
-- - `route_rider_fuel` fields: rider_id, amount_spent, fuel_type, date_recorded, notes, created_at
-- - Confirm these column names with the frontend before running in Supabase.
