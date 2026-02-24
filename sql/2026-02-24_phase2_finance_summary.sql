-- Phase 2 — Module 7: finance_summary
-- Aggregated daily finance summary used by dashboard KPIs

CREATE OR REPLACE VIEW public.v_finance_summary AS
SELECT
  day,
  COALESCE(SUM(expense_total), 0) AS total_expenses,
  COALESCE(SUM(collection_total), 0) AS total_collections,
  COALESCE(SUM(payment_total), 0) AS total_payments
FROM (
  -- Expenses per day
  SELECT expense_date::date AS day, SUM(amount) AS expense_total, 0::numeric AS collection_total, 0::numeric AS payment_total
  FROM public.expenses
  GROUP BY expense_date

  UNION ALL

  -- Collections per day (uses `route_collections.collection_date` + `route_collections.amount_collected`)
  SELECT collection_date::date AS day, 0::numeric AS expense_total, SUM(amount_collected) AS collection_total, 0::numeric AS payment_total
  FROM public.route_collections
  GROUP BY collection_date

  UNION ALL

  -- Payments per day (assumes `payments.payment_date` + `payments.amount` exist)
  SELECT payment_date::date AS day, 0::numeric AS expense_total, 0::numeric AS collection_total, SUM(amount) AS payment_total
  FROM public.payments
  GROUP BY payment_date
) AS t
GROUP BY day
ORDER BY day DESC;

-- Notes:
-- - This view unifies daily totals from `expenses`, `route_collections`, and `payments` into a single row-per-day summary.
-- - If your `route_collections` or `payments` tables use different column names for the date/amount fields, adjust the SELECTs above accordingly.
