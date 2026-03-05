/**
 * Finance API functions
 * Handle expenses and stock losses
 * 
 * Accessible to: finance, admin
 */

import { supabase } from '@/lib/supabase/client';
import type {
  Expense,
  StockLoss,
  RecordExpenseInput,
  RecordStockLossInput,
  ApiResponse,
} from '@/types/database';

export type FinanceSummary = {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_stock_loss: number;
  expense_breakdown: Record<string, number>;
  recent_activities: Array<{
    type: string;
    description: string;
    amount?: number;
    date: string;
  }>;
};

export type RecentActivities = {
  new_route_riders: number;
  new_expenses: number;
  stock_losses: number;
  new_production_batches: number;
  new_dispatches: number;
  new_returns: number;
};

// ============= FINANCE SUMMARY =============

/**
 * Get finance summary with KPIs and recent activities
 */
export async function getFinanceSummary(): Promise<ApiResponse<FinanceSummary>> {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get total collections (revenue) from unified collections table
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('amount_collected')
      .gte('collection_date', last30Days);

    if (collectionsError) throw collectionsError;

    const totalRevenue = (collections || []).reduce((sum, c) => sum + (c.amount_collected || 0), 0);

    // Get total expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', last30Days);

    if (expensesError) throw expensesError;

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0);

    // Get total stock losses (in monetary value, assuming we need to calculate)
    let totalStockLoss = 0;
    try {
      const { data: stockLosses, error: lossesError } = await supabase
        .from('stock_losses')
        .select('quantity_lost, product:products(retail_price)')
        .gte('loss_date', last30Days);

      if (!lossesError && stockLosses && Array.isArray(stockLosses)) {
        totalStockLoss = (stockLosses || []).reduce((sum: number, loss: any) => {
          const price = loss.product?.[0]?.retail_price || 0;
          return sum + (loss.quantity_lost * price);
        }, 0);
      }
    } catch (error) {
      console.error('Error calculating total stock loss:', error);
    }

    const netProfit = totalRevenue - totalExpenses - totalStockLoss;

    // Expense breakdown by category
    const { data: expenseCategories, error: categoriesError } = await supabase
      .from('expenses')
      .select('category, amount')
      .gte('expense_date', last30Days);

    if (categoriesError) throw categoriesError;

    const expenseBreakdown: Record<string, number> = {};
    (expenseCategories || []).forEach((exp) => {
      expenseBreakdown[exp.category] = (expenseBreakdown[exp.category] || 0) + exp.amount;
    });

    // Recent activities (last 7 days)
    const recentActivities: Array<{ type: string; description: string; amount?: number; date: string }> = [];

    // Recent expenses
    try {
      const { data: recentExpenses, error: recentExpError } = await supabase
        .from('expenses')
        .select('description, amount, expense_date')
        .gte('expense_date', last7Days)
        .order('expense_date', { ascending: false })
        .limit(5);

      if (!recentExpError && recentExpenses) {
        recentExpenses.forEach((exp) => {
          recentActivities.push({
            type: 'expense',
            description: `Expense: ${exp.description}`,
            amount: exp.amount,
            date: exp.expense_date,
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent expenses:', error);
    }

    // Recent stock losses
    try {
      const { data: recentLosses, error: recentLossError } = await supabase
        .from('stock_losses')
        .select('quantity_lost, reason, loss_date, product:products(name)')
        .gte('loss_date', last7Days)
        .order('loss_date', { ascending: false })
        .limit(5);

      if (!recentLossError && recentLosses) {
        recentLosses.forEach((loss: any) => {
          const productName = Array.isArray(loss.product) ? loss.product[0]?.name : loss.product?.name || 'Unknown';
          recentActivities.push({
            type: 'stock_loss',
            description: `Stock Loss: ${loss.quantity_lost} ${productName} (${loss.reason})`,
            date: loss.loss_date,
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent stock losses:', error);
    }

    // Recent collections
    try {
      const { data: recentCollections, error: recentCollError } = await supabase
        .from('route_collections')
        .select('amount_collected, collection_date')
        .gte('collection_date', last7Days)
        .order('collection_date', { ascending: false })
        .limit(5);

      if (!recentCollError && recentCollections) {
        recentCollections.forEach((coll) => {
          recentActivities.push({
            type: 'collection',
            description: 'Collection received',
            amount: coll.amount_collected,
            date: coll.collection_date,
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent collections:', error);
    }

    // Sort recent activities by date
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const summary: FinanceSummary = {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      total_stock_loss: totalStockLoss,
      expense_breakdown: expenseBreakdown,
      recent_activities: recentActivities.slice(0, 10), // Limit to 10
    };

    return { success: true, data: summary };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch finance summary',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to delete expense',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get recent activities counts for pie chart
 */
export async function getRecentActivities(): Promise<ApiResponse<RecentActivities>> {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // New route riders in last 7 days
    const { count: newRouteRiders, error: ridersError } = await supabase
      .from('route_riders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days);

    if (ridersError) throw ridersError;

    // New expenses in last 7 days
    const { count: newExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days);

    if (expensesError) throw expensesError;

    // Stock losses in last 7 days
    const { count: stockLosses, error: lossesError } = await supabase
      .from('stock_losses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days);

    if (lossesError) throw lossesError;

    // New production batches in last 7 days
    const { count: newBatches, error: batchesError } = await supabase
      .from('production_batches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days);

    if (batchesError) throw batchesError;

    // New dispatches in last 7 days
    const { count: newDispatches, error: dispatchesError } = await supabase
      .from('route_dispatches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days);

    if (dispatchesError) throw dispatchesError;

    // New returns in last 7 days
    const { count: newReturns, error: returnsError } = await supabase
      .from('route_returns')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days);

    if (returnsError) throw returnsError;

    const activities = {
      new_route_riders: newRouteRiders || 0,
      new_expenses: newExpenses || 0,
      stock_losses: stockLosses || 0,
      new_production_batches: newBatches || 0,
      new_dispatches: newDispatches || 0,
      new_returns: newReturns || 0,
    };

    return { success: true, data: activities };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch recent activities',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

// ============= EXPENSES =============

/**
 * Get all expenses
 */
export async function getAllExpenses(): Promise<ApiResponse<Expense[]>> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch expenses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get expenses by date range
 */
export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<ApiResponse<Expense[]>> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch expenses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get expenses by category
 */
export async function getExpensesByCategory(
  category: string
): Promise<ApiResponse<Expense[]>> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('category', category)
      .order('expense_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch expenses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Record new expense
 */
// NOTE: the server automatically adds a `recorded_by` field based on
// the authenticated user.  Clients should *not* send the user id or name.
export async function recordExpense(
  input: RecordExpenseInput
): Promise<ApiResponse<Expense>> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          description: input.description,
          amount: input.amount,
          category: input.category,
          expense_date: input.expense_date,
          notes: input.notes || null,
          recorded_by: input.recorded_by || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to record expense',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Calculate total expenses for date range
 */
export async function getTotalExpenses(
  startDate: string,
  endDate: string
): Promise<ApiResponse<number>> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);

    if (error) throw error;

    const total = (data || []).reduce((sum, exp) => sum + exp.amount, 0);

    return {
      success: true,
      data: total,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to calculate total expenses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

// ============= STOCK LOSSES =============

/**
 * Get all stock losses
 */
export async function getAllStockLosses(): Promise<ApiResponse<StockLoss[]>> {
  try {
    const { data, error } = await supabase
      .from('stock_losses')
      .select('*')
      .order('loss_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch stock losses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get stock losses by product
 */
export async function getStockLossesByProduct(
  productId: string
): Promise<ApiResponse<StockLoss[]>> {
  try {
    const { data, error } = await supabase
      .from('stock_losses')
      .select('*')
      .eq('product_id', productId)
      .order('loss_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch stock losses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get stock losses by reason
 */
export async function getStockLossesByReason(
  reason: 'expired' | 'damaged' | 'theft' | 'other'
): Promise<ApiResponse<StockLoss[]>> {
  try {
    const { data, error } = await supabase
      .from('stock_losses')
      .select('*')
      .eq('reason', reason)
      .order('loss_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch stock losses',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Record stock loss
 */
export async function recordStockLoss(
  input: RecordStockLossInput
): Promise<ApiResponse<StockLoss>> {
  try {
    const { data, error } = await supabase
      .from('stock_losses')
      .insert([
        {
          product_id: input.product_id, // UUID string
          quantity_lost: input.quantity_lost,
          reason: input.reason,
          loss_date: input.loss_date,
          notes: input.notes || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to record stock loss',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get stock loss summary by reason
 */
export async function getStockLossSummary(
  startDate: string,
  endDate: string
): Promise<ApiResponse<Record<string, number>>> {
  try {
    const { data, error } = await supabase
      .from('stock_losses')
      .select('reason, quantity_lost')
      .gte('loss_date', startDate)
      .lte('loss_date', endDate);

    if (error) throw error;

    const summary: Record<string, number> = {
      expired: 0,
      damaged: 0,
      theft: 0,
      other: 0,
    };

    (data || []).forEach((loss) => {
      summary[loss.reason] += loss.quantity_lost;
    });

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to get stock loss summary',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}
