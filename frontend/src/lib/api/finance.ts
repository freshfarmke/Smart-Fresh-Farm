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
export async function recordExpense(
  userId: string,
  input: RecordExpenseInput
): Promise<ApiResponse<Expense>> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          ...input,
          recorded_by: userId,
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
  userId: string,
  input: RecordStockLossInput
): Promise<ApiResponse<StockLoss>> {
  try {
    const { data, error } = await supabase
      .from('stock_losses')
      .insert([
        {
          ...input,
          recorded_by: userId,
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
