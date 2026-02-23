/**
 * Product API functions
 * CRUD operations for products
 * 
 * Accessible to: admin, all authenticated users for viewing
 * Editable by: admin only
 */

import { supabase } from '@/lib/supabase/client';
import type {
  Product,
  CreateProductInput,
  ApiResponse,
} from '@/types/database';

/**
 * Get all products
 */
export async function getAllProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch products',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(productId: string): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
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
        message: 'Failed to fetch product',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Create new product (admin only)
 */
export async function createProduct(
  product: CreateProductInput
): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
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
        message: 'Failed to create product',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Update product (admin only)
 */
export async function updateProduct(
  productId: string,
  updates: Partial<CreateProductInput>
): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
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
        message: 'Failed to update product',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(productId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to delete product',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Search products by name
 */
export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to search products',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}
