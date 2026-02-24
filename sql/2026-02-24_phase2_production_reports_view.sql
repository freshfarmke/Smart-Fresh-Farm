-- Phase 2 — Production reports view
-- Aggregates daily totals for production, dispatch and returns

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE VIEW public.production_reports_daily AS
SELECT
  date(pb.created_at) as report_date,
  count(distinct pb.id) as batches_count,
  coalesce(sum(bp.quantity_produced), 0) as units_produced,
  coalesce(sum(rd.qty_dispatched), 0) as units_dispatched,
  coalesce(sum(rr.qty_returned), 0) as units_returned
FROM public.production_batches pb
LEFT JOIN public.batch_products bp ON bp.batch_id = pb.id
LEFT JOIN (
  SELECT r.dispatch_id, sum(r.quantity) as qty_dispatched
  FROM public.route_dispatch_products r
  GROUP BY r.dispatch_id
) rd ON rd.dispatch_id = pb.id
LEFT JOIN (
  SELECT rt.return_id, sum(rt.quantity) as qty_returned
  FROM public.route_return_products rt
  GROUP BY rt.return_id
) rr ON rr.return_id = pb.id
GROUP BY date(pb.created_at)
ORDER BY date(pb.created_at) DESC;

-- Notes:
-- This view provides daily aggregates for quick production-focused reporting in Supabase.
