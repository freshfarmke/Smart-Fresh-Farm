/**
 * Institution Management API functions
 * Handle institutions and their orders
 * 
 * Accessible to: all authenticated users for viewing
 * Editable by: production, admin for creating orders
 */

import { supabase } from '@/lib/supabase/client';
import type {
  Institution,
  InstitutionOrder,
  InstitutionOrderProduct,
  CreateInstitutionInput,
  CreateInstitutionOrderInput,
  ApiResponse,
} from '@/types/database';

// ============= INSTITUTIONS =============

/**
 * Get all institutions
 */
export async function getAllInstitutions(): Promise<ApiResponse<Institution[]>> {
  try {
    const { data, error } = await supabase
      .from('institutions')
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
        message: 'Failed to fetch institutions',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get institution by ID
 */
export async function getInstitutionById(
  institutionId: string
): Promise<ApiResponse<Institution>> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
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
        message: 'Failed to fetch institution',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Create new institution
 */
export async function createInstitution(
  input: CreateInstitutionInput
): Promise<ApiResponse<Institution>> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .insert([{ ...input, status: 'active' }])
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
        message: 'Failed to create institution',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Update institution
 */
export async function updateInstitution(
  institutionId: string,
  updates: Partial<CreateInstitutionInput>
): Promise<ApiResponse<Institution>> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .update(updates)
      .eq('id', institutionId)
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
        message: 'Failed to update institution',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Change institution status
 */
export async function updateInstitutionStatus(
  institutionId: string,
  status: 'active' | 'inactive'
): Promise<ApiResponse<Institution>> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .update({ status })
      .eq('id', institutionId)
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
        message: 'Failed to update institution status',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

// ============= INSTITUTION ORDERS =============

/**
 * Get all institution orders
 */
export async function getAllInstitutionOrders(): Promise<
  ApiResponse<InstitutionOrder[]>
> {
  try {
    const { data, error } = await supabase
      .from('institution_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch orders',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get orders for specific institution
 */
export async function getInstitutionOrders(
  institutionId: string
): Promise<ApiResponse<InstitutionOrder[]>> {
  try {
    const { data, error } = await supabase
      .from('institution_orders')
      .select('*')
      .eq('institution_id', institutionId)
      .order('order_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch institution orders',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get order with products
 */
export async function getOrderWithProducts(
  orderId: string
): Promise<ApiResponse<InstitutionOrder & { products: InstitutionOrderProduct[] }>> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('institution_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: products, error: productsError } = await supabase
      .from('institution_order_products')
      .select('*, product:products(*)')
      .eq('order_id', orderId);

    if (productsError) throw productsError;

    return {
      success: true,
      data: {
        ...order,
        products: products || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch order details',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Create institution order
 */
export async function createInstitutionOrder(
  input: CreateInstitutionOrderInput
): Promise<ApiResponse<InstitutionOrder>> {
  try {
    const { products, ...orderData } = input;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('institution_orders')
      .insert([
        {
          ...orderData,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert products
    const orderProducts = products.map((p) => ({
      order_id: order.id,
      ...p,
    }));

    const { error: productsError } = await supabase
      .from('institution_order_products')
      .insert(orderProducts);

    if (productsError) throw productsError;

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to create order',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Update order status
 */
export async function updateInstitutionOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
): Promise<ApiResponse<InstitutionOrder>> {
  try {
    const { data, error } = await supabase
      .from('institution_orders')
      .update({ status })
      .eq('id', orderId)
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
        message: 'Failed to update order status',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Add product to institution order
 */
export async function addProductToInstitutionOrder(
  orderId: string,
  productId: string,
  quantity: number,
  unitPrice: number
): Promise<ApiResponse<InstitutionOrderProduct>> {
  try {
    const { data, error } = await supabase
      .from('institution_order_products')
      .insert([
        {
          order_id: orderId,
          product_id: productId,
          quantity_ordered: quantity,
          unit_price: unitPrice,
        },
      ])
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
        message: 'Failed to add product to order',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}
