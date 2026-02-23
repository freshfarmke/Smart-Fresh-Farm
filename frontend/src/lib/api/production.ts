/**
 * Production Batch API functions
 * Create batches, manage batch products, track production
 * 
 * Accessible to: production, admin
 */

import { supabase } from '@/lib/supabase/client';
import type {
  ProductionBatch,
  BatchProduct,
  CreateBatchInput,
  AddProductToBatchInput,
  ApiResponse,
} from '@/types/database';

/**
 * Get all production batches
 */
export async function getAllBatches(): Promise<ApiResponse<ProductionBatch[]>> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*')
      .order('production_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch batches',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get batch with all associated products
 */
export async function getBatchWithProducts(
  batchId: string
): Promise<ApiResponse<ProductionBatch & { products: BatchProduct[] }>> {
  try {
    const { data: batch, error: batchError } = await supabase
      .from('production_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError) throw batchError;

    const { data: products, error: productsError } = await supabase
      .from('batch_products')
      .select('*, product:products(*)')
      .eq('batch_id', batchId);

    if (productsError) throw productsError;

    return {
      success: true,
      data: {
        ...batch,
        products: products || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch batch details',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Create new production batch (production role required)
 */
export async function createBatch(
  userId: string,
  input: CreateBatchInput
): Promise<ApiResponse<ProductionBatch>> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .insert([
        {
          ...input,
          created_by: userId,
          status: 'draft',
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
        message: 'Failed to create batch',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Add product to batch
 */
export async function addProductToBatch(
  input: AddProductToBatchInput
): Promise<ApiResponse<BatchProduct>> {
  try {
    const { data, error } = await supabase
      .from('batch_products')
      .insert([input])
      .select('*, product:products(*)')
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
        message: 'Failed to add product to batch',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Update batch status
 */
export async function updateBatchStatus(
  batchId: string,
  status: 'draft' | 'active' | 'completed' | 'closed'
): Promise<ApiResponse<ProductionBatch>> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .update({ status })
      .eq('id', batchId)
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
        message: 'Failed to update batch',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Remove product from batch
 */
export async function removeProductFromBatch(
  batchProductId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('batch_products')
      .delete()
      .eq('id', batchProductId);

    if (error) throw error;

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to remove product from batch',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get batches by status
 */
export async function getBatchesByStatus(
  status: 'draft' | 'active' | 'completed' | 'closed'
): Promise<ApiResponse<ProductionBatch[]>> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*')
      .eq('status', status)
      .order('production_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch batches by status',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}
