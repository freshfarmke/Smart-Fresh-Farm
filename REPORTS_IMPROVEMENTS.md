# Reports & Analytics - UI & Functionality Improvements

## Summary of Changes

### 1. SQL Schema Updates ✅
**File**: `sql/2026-03-06_finance_summary_with_stock_loss.sql`

The `v_finance_summary` view has been updated to include:
- `total_stock_loss` - Calculated as SUM(quantity * unit_cost) for stock_losses table
- `net_profit` - Calculated as (total_collections - total_expenses - total_stock_loss)

**What this fixes:**
- The Reports component was trying to access `total_stock_loss` and `net_profit` that didn't exist
- Now KPI cards will display correct values

**SQL Changes:**
```sql
-- The view now properly aggregates stock losses from the stock_losses table
UNION ALL
SELECT
  loss_date::date AS day,
  0::numeric AS expense_total,
  0::numeric AS collection_total,
  0::numeric AS payment_total,
  SUM(sl.quantity * COALESCE(p.unit_cost, 0)) AS stock_loss_total
FROM public.stock_losses sl
LEFT JOIN public.products p ON p.id = sl.product_id
GROUP BY sl.loss_date::date
```

### 2. API Endpoint Improvements ✅
**File**: `src/app/api/finance/reports/route.ts`

**Improvements:**
- Added support for `days` query parameter (converts to date range)
- Added support for `loss` metric (in addition to `stock_loss`)
- Properly calculates date ranges for Last 7, 30, 90 days and This Year

**Example usage:**
```
GET /api/finance/reports?metric=revenue&days=7
GET /api/finance/reports?metric=profit&days=30
GET /api/finance/reports?metric=loss&days=90
```

### 3. UI/UX Refactoring ✅
**File**: `src/components/finance/ReportsAnalytics.tsx`

**Major Changes:**
- **Cleaned up filter section** - Now properly organized with clear label
- **Improved KPI cards layout** - 4-column grid with consistent spacing
- **Reorganized main content** - Charts now in separate sections:
  - Primary charts: Revenue Trend + Net Profit Trend (2 columns)
  - Secondary charts: Stock Loss Trend + Expenses by Category (2 columns)
- **Better spacing** - Increased padding and gap sizes
- **Removed inline JSX** - Minified inline code replaced with clean structure
- **Improved responsive design** - Better mobile layout with proper grid adjustments

**Key Layout Changes:**
- Filter section: `80px padding` vertically, `gap-4` between inputs
- KPI cards: `gap-6` between cards, `80px` spacing from filter section
- Main charts: `gap-8` between chart sections, consistent height (`250px`)
- All cards: Proper border, shadow, and hover effects


## What Needs to Be Done on Supabase

1. **Execute the SQL migration**:
   ```sql
   -- File: sql/2026-03-06_finance_summary_with_stock_loss.sql
   -- Run this in Supabase SQL Editor to update the v_finance_summary view
   ```

2. **Verify the tables exist**:
   - `stock_losses` - Must have `loss_date`, `quantity`, `product_id`
   - `products` - Must have `id`, `unit_cost`
   - `expenses` - Must have `expense_date`, `amount`, `category`
   - `route_collections` - Must have `collection_date`, `amount_collected`
   - `payments` - Must have `payment_date`, `amount`

3. **Check data**: Ensure there is test data in these tables to verify the views work correctly


## Component Data Flow

### KPI Cards
- Source: `/api/finance/summary` endpoint
- Data: `v_finance_summary` view (latest day)
- Calculates: `revenue`, `collections`, `expenses`, `loss`
- Format: Displayed in units of 1000 (e.g., 50000 → 50k)

### Revenue Trend Chart
- Source: `/api/finance/reports?metric=revenue&days=X`
- Data: Daily revenue aggregates from `v_finance_summary`
- Display: Line chart with 250px height

### Net Profit Trend Chart
- Source: `/api/finance/reports?metric=profit&days=X`  
- Data: Daily net_profit aggregates from `v_finance_summary`
- Display: Bar chart with 250px height

### Stock Loss Trend Chart
- Source: `/api/finance/reports?metric=loss&days=X`
- Data: Daily stock_loss sums from `v_finance_summary`
- Display: Line chart with statistics (peak, average)

### Expense Breakdown
- Source: `/api/finance/expenses?pageSize=1000`
- Data: All expense records grouped by category
- Display: Pie chart + category list with percentages

## Testing Checklist

- [ ] SQL migration applied successfully
- [ ] `/api/finance/summary` returns `total_stock_loss` and `net_profit`
- [ ] `/api/finance/reports?metric=loss&days=7` returns stock loss data
- [ ] Reports page loads without errors
- [ ] KPI cards display correct values
- [ ] Chart data loads and renders properly
- [ ] Date range filter works correctly
- [ ] Custom date range works
- [ ] Mobile responsive layout looks good
- [ ] All spacing and layout is clean (no crowding)

## Future Enhancements

1. Add dynamic trend indicators (% change from previous period)
2. Add export to PDF functionality
3. Add comparison charts (YoY, MoM)
4. Add forecasting based on historical data
5. Add drill-down capability from charts to detailed transactions
