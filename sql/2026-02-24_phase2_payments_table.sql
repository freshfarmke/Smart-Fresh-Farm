-- Phase 2 — Module 7: payments
-- Payments table to record external payments if UI requires separate payments tracking
-- Some UIs use `route_collections` for payments; this table is for other payment records (optional)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT now(),
  method text,
  notes text,
  related_type text, -- option to link to 'institution_order', 'collection', etc.
  related_id uuid,    -- nullable, application-level link
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_related_type ON public.payments(related_type);

-- Notes:
-- - `payments` is optional where the UI needs a separate payments ledger. If the app uses `route_collections` for collections
--   and institution payments are tracked with `institution_orders`, you may not need this table.
-- - Columns are generic to allow linking to other entities via `related_type` + `related_id`.
