-- Phase 2 — Module 8: reports_views
-- Useful reporting views for dashboards and analytics

CREATE OR REPLACE VIEW public.v_dispatch_summary AS
SELECT
  d.id AS dispatch_id,
  d.dispatch_date::date AS dispatch_day,
  d.rider_id,
  r.full_name AS rider_name,
  COUNT(DISTINCT dp.product_id) AS distinct_products,
  COALESCE(SUM(dp.quantity_dispatched), 0) AS total_quantity
FROM public.route_dispatch d
LEFT JOIN public.route_dispatch_products dp ON dp.dispatch_id = d.id
LEFT JOIN public.route_riders r ON r.id = d.rider_id
GROUP BY d.id, d.dispatch_date, d.rider_id, r.full_name;

CREATE OR REPLACE VIEW public.v_rider_performance AS
SELECT
  r.id AS rider_id,
  r.full_name AS rider_name,
  COUNT(DISTINCT d.id) AS dispatch_count,
  COALESCE(SUM(dp.quantity_dispatched), 0) AS total_items_delivered,
  COALESCE(SUM(rc.amount_collected), 0) AS total_collections
FROM public.route_riders r
LEFT JOIN public.route_dispatch d ON d.rider_id = r.id
LEFT JOIN public.route_dispatch_products dp ON dp.dispatch_id = d.id
LEFT JOIN public.route_collections rc ON rc.dispatch_id = d.id
 GROUP BY r.id, r.full_name
ORDER BY dispatch_count DESC;

-- Notes:
-- - These views assume the presence of `route_dispatch`, `route_dispatch_products`, `route_riders`, `route_collections`.
-- - If your columns use different names (for example `collection_date` or `amount` fields), adapt the view definitions accordingly before running in production.
