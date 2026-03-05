/**
 * Production reports helpers
 * Aggregate production metrics: batches, produced units, dispatches, returns, top products
 */
import { supabase } from '@/lib/supabase/client';
import type { ApiResponse } from '@/types/database';

export type ProductionSummary = {
  total_batches: number;
  total_units_produced: number;
  total_dispatches: number;
  total_units_dispatched: number;
  total_returns: number;
  total_units_returned: number;
  top_products: Array<{ product_id: string; name: string; produced: number; dispatched: number; returned: number }>;
};

export async function getProductionSummary(): Promise<ApiResponse<ProductionSummary>> {
  try {
    // Fetch production batches with products
    const { data: batches, error: batchesError } = await supabase
      .from('production_batches')
      .select('id, created_at, batch_products(quantity_produced, product:products(id, name))');

    if (batchesError) throw batchesError;

    // Fetch dispatched products
    const { data: dispatchedProducts, error: dispatchedError } = await supabase
      .from('route_dispatch_products')
      .select('quantity, product:products(id, name)');

    if (dispatchedError) throw dispatchedError;

    // Fetch return products
    const { data: returnedProducts, error: returnedError } = await supabase
      .from('route_return_products')
      .select('quantity, product:products(id, name)');

    if (returnedError) throw returnedError;

    // Aggregate produced units and top product produced counts
    const productMap: Record<string, { name: string; produced: number; dispatched: number; returned: number }> = {};

    (batches || []).forEach((b:any) => {
      (b.batch_products || []).forEach((bp:any) => {
        const pid = String(bp.product?.id || bp.product_id || 'unknown');
        const name = bp.product?.name || 'Unknown';
        productMap[pid] = productMap[pid] || { name, produced: 0, dispatched: 0, returned: 0 };
        productMap[pid].produced += Number(bp.quantity_produced || 0);
      });
    });

    (dispatchedProducts || []).forEach((d:any) => {
      const pid = String(d.product?.id || d.product_id || 'unknown');
      const name = d.product?.name || 'Unknown';
      productMap[pid] = productMap[pid] || { name, produced: 0, dispatched: 0, returned: 0 };
      productMap[pid].dispatched += Number(d.quantity || 0);
    });

    (returnedProducts || []).forEach((r:any) => {
      const pid = String(r.product?.id || r.product_id || 'unknown');
      const name = r.product?.name || 'Unknown';
      productMap[pid] = productMap[pid] || { name, produced: 0, dispatched: 0, returned: 0 };
      productMap[pid].returned += Number(r.quantity || 0);
    });

    const top_products = Object.entries(productMap)
      .map(([product_id, v]) => ({ product_id, name: v.name, produced: v.produced, dispatched: v.dispatched, returned: v.returned }))
      .sort((a, b) => b.produced - a.produced)
      .slice(0, 10);

    const summary = {
      total_batches: (batches || []).length,
      total_units_produced: Object.values(productMap).reduce((s, x) => s + x.produced, 0),
      total_dispatches: Array.isArray(dispatchedProducts) ? dispatchedProducts.length : 0,
      total_units_dispatched: Object.values(productMap).reduce((s, x) => s + x.dispatched, 0),
      total_returns: Array.isArray(returnedProducts) ? returnedProducts.length : 0,
      total_units_returned: Object.values(productMap).reduce((s, x) => s + x.returned, 0),
      top_products,
    };

    return { success: true, data: summary };
  } catch (error) {
    return { success: false, error: { message: 'Failed to fetch production summary', details: error instanceof Error ? { error: error.message } : undefined } };
  }
}

export type RecentActivities = {
  new_route_riders: number;
  new_expenses: number;
  stock_losses: number;
  new_production_batches: number;
  new_dispatches: number;
  new_returns: number;
};

export async function getRecentActivities(): Promise<ApiResponse<RecentActivities>> {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
    return { success: false, error: { message: 'Failed to fetch recent activities', details: error instanceof Error ? { error: error.message } : undefined } };
  }
}
