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
  CreateProductionBatchInput,
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
          batch_number: input.batch_number,
          production_date: input.production_date,
          notes: input.notes,
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

/**
 * Production-specific batches (production_batches table)
 */
export async function getAllProductionBatches(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*, batch_products(*, product:products(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: { message: 'Failed to fetch production batches', details: error instanceof Error ? { error: error.message } : undefined },
    };
  }
}

export async function createProductionBatch(input: CreateProductionBatchInput): Promise<ApiResponse<any>> {
  try {
    const payload = {
      product_id: input.product_id,
      batch_code: input.batch_code ?? `PB-${Date.now()}`,
      quantity_produced: input.quantity_produced,
      quantity_remaining: input.quantity_remaining ?? input.quantity_produced,
      expiry_date: input.expiry_date ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('production_batches')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: { message: 'Failed to create production batch', details: error instanceof Error ? { error: error.message } : undefined },
    };
  }
}

export async function updateProductionBatch(batchId: string, updates: Partial<CreateProductionBatchInput>): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .update(updates)
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: 'Failed to update production batch', details: error instanceof Error ? { error: error.message } : undefined } };
  }
}

export async function deleteProductionBatch(batchId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('production_batches')
      .delete()
      .eq('id', batchId);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: { message: 'Failed to delete production batch', details: error instanceof Error ? { error: error.message } : undefined } };
  }
}
