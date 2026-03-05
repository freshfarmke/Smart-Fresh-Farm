-- Phase 2 — Module 6: expenses
-- Creates `expenses` table to back Finance expenses UI

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  category text,
  expense_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Notes:
-- - Matches frontend fields: description, amount, category, expense_date, notes
-- - Use `expenses` table in frontend API calls for recordExpense
--
-- *Later migrations (see 2026-03-03_phase3_finance_schema.sql) added a
-- `recorded_by` column to track which user created each row, as well as
-- indexes on `recorded_by` and `created_at`.*
