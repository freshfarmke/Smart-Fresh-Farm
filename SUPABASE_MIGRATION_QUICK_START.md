# Quick Start - Apply Changes to Supabase

## Step 1: Copy This SQL

⚠️ **IMPORTANT**: Copy ONLY the SQL code below (between the ``` markers), NOT the markdown formatting.

Go to your Supabase Dashboard → SQL Editor and paste this script:

```sql
-- Migration: Enhanced finance summary with stock_loss and net_profit
-- Date: March 6, 2026
-- Purpose: Add stock_loss and net_profit calculations to the finance summary view

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

  -- Collections per day
  SELECT 
    collection_date::date AS day, 
    0::numeric AS expense_total, 
    SUM(amount_collected) AS collection_total, 
    0::numeric AS payment_total,
    0::numeric AS stock_loss_total
  FROM public.route_collections
  GROUP BY collection_date::date

  UNION ALL

  -- Payments per day
  SELECT 
    payment_date::date AS day, 
    0::numeric AS expense_total, 
    0::numeric AS collection_total, 
    SUM(amount) AS payment_total,
    0::numeric AS stock_loss_total
  FROM public.payments
  GROUP BY payment_date::date

  UNION ALL

  -- Stock losses per day
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
```

**Copy Instructions:**
1. Click on the SQL code block above
2. Highlight all the code between the backticks (starting with `--` and ending with the semicolon)
3. Copy it (Ctrl+C or Cmd+C)
4. Paste it into Supabase SQL Editor
5. Click "Execute" or press Ctrl+Enter

## Step 2: Verify It Worked

Run this query to see the new columns:

```sql
SELECT * FROM v_finance_summary LIMIT 5;
```

You should see columns:
- `day`
- `total_expenses`
- `total_collections`
- `total_payments`
- `total_stock_loss` ← NEW
- `net_profit` ← NEW

## Step 3: Test the API

In your browser, go to:
```
http://localhost:3000/api/finance/summary
```

You should get a response like:
```json
{
  "success": true,
  "data": [
    {
      "day": "2026-03-06",
      "total_expenses": 15000,
      "total_collections": 50000,
      "total_payments": 0,
      "total_stock_loss": 2000,
      "net_profit": 33000
    }
  ]
}
```

## Step 4: Test the Reports Page

Navigate to the Reports & Analytics page in your app. You should see:
- ✅ KPI cards with values (not NaN or undefined)
- ✅ Revenue trend chart with data
- ✅ Net profit chart with data
- ✅ Stock loss chart with data
- ✅ Expense breakdown pie chart
- ✅ Clean, well-spaced layout

## Troubleshooting

### Error: "relation 'stock_losses' does not exist"
**Already Fixed!** The migration now creates the `stock_losses` table automatically. Just run the migration script above and it will work.

### Error: "column unit_cost does not exist"
**Already Fixed!** The migration now adds this column automatically if it doesn't exist.

### Charts Show No Data
**Fix**: Insert sample data into the tables. Example:
```sql
-- Sample expense
INSERT INTO expenses (amount, category, expense_date) 
VALUES (5000, 'Feed', now());

-- Sample collection
INSERT INTO route_collections (amount_collected, collection_date) 
VALUES (10000, now());

-- Sample stock loss
INSERT INTO stock_losses (product_id, quantity, loss_date)
SELECT id, 5, now() FROM products LIMIT 1;
```

## What Changed in Frontend Code

1. **ReportsAnalytics.tsx**: Complete UI redesign with better spacing
2. **reports/route.ts API**: Added `days` parameter support
3. **No breaking changes** to existing functionality

All changes are backwards compatible!

---

**Questions?** Check `REPORTS_PAGE_IMPROVEMENTS_SUMMARY.md` for detailed documentation.
