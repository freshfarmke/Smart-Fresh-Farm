/**
 * Shop API helpers
 * Fetch shop stock and transfers
 */
import { supabase } from '@/lib/supabase/client';
import type { ApiResponse } from '@/types/database';

type ShopStockRow = {
  id: string;
  product_id: string;
  quantity_available: number;
  location: string;
  product?: any;
};

type ShopTransferRow = {
  id: string;
  from_location: string;
  to_location: string;
  transfer_date: string;
  notes?: string;
  created_at: string;
};

export async function getShopStock(): Promise<ApiResponse<ShopStockRow[]>> {
  try {
    const { data, error } = await supabase
      .from('shop_stock')
      .select('*, product:products(*)');

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: false,
      error: { message: 'Failed to fetch shop stock', details: err instanceof Error ? { error: err.message } : undefined },
    };
  }
}

export async function getShopTransfers(): Promise<ApiResponse<ShopTransferRow[]>> {
  try {
    const { data, error } = await supabase
      .from('shop_transfers')
      .select('*, shop_transfer_products(quantity, product:products(*))')
      .order('transfer_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: false,
      error: { message: 'Failed to fetch shop transfers', details: err instanceof Error ? { error: err.message } : undefined },
    };
  }
}
