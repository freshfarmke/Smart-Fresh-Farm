
/**
 * Route Management API functions
 * Handle route riders, dispatch, returns, and collections
 * 
 * Accessible to: production, admin for dispatch/returns
 * Finance can view collections
 */

import { supabase } from '@/lib/supabase/client';
import type {
  RouteRider,
  RouteRiderFuel,
  RouteDispatch,
  RouteDispatchProduct,
  RouteReturn,
  RouteReturnProduct,
  RouteCollection,
  RouteCollectionProduct,
  CreateRiderInput,
  RecordFuelInput,
  CreateDispatchInput,
  AddProductToDispatchInput,
  RecordReturnInput,
  RecordCollectionInput,
  ApiResponse,
  Product,
} from '@/types/database';

// ============= ROUTE RIDERS =============

/**
 * Get all route riders
 */
export async function getAllRouteRiders(): Promise<ApiResponse<RouteRider[]>> {
  try {
    const { data, error } = await supabase
      .from('route_riders')
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
        message: 'Failed to fetch route riders',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Create new route rider
 */
export async function createRouteRider(
  input: CreateRiderInput
): Promise<ApiResponse<RouteRider>> {
  try {
    const { data, error } = await supabase
      .from('route_riders')
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
        message: 'Failed to create route rider',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Record fuel expenses for rider
 */
export async function recordFuelExpense(
  input: RecordFuelInput
): Promise<ApiResponse<RouteRiderFuel>> {
  try {
    const { data, error } = await supabase
      .from('route_rider_fuel')
      .insert([input])
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
        message: 'Failed to record fuel expense',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get fuel records for a rider
 */
export async function getRiderFuelRecords(
  riderId: string
): Promise<ApiResponse<RouteRiderFuel[]>> {
  try {
    const { data, error } = await supabase
      .from('route_rider_fuel')
      .select('*')
      .eq('rider_id', riderId)
      .order('date_recorded', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch fuel records',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

// ============= ROUTE DISPATCH =============

/**
 * Get all route dispatches
 */
export async function getAllDispatches(): Promise<ApiResponse<RouteDispatch[]>> {
  try {
    const { data, error } = await supabase
      .from('route_dispatch')
      .select('*')
      .order('dispatch_date', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch dispatches',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get dispatch with products
 */
export async function getDispatchWithProducts(
  dispatchId: string
): Promise<ApiResponse<RouteDispatch & { products: RouteDispatchProduct[] }>> {
  try {
    const { data: dispatch, error: dispatchError } = await supabase
      .from('route_dispatch')
      .select('*')
      .eq('id', dispatchId)
      .single();

    if (dispatchError) throw dispatchError;

    const { data: products, error: productsError } = await supabase
      .from('route_dispatch_products')
      .select('*, product:products(*)')
      .eq('dispatch_id', dispatchId);

    if (productsError) throw productsError;

    return {
      success: true,
      data: {
        ...dispatch,
        products: products || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch dispatch details',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Create new route dispatch
 */
export async function createDispatch(
  userId: string,
  input: CreateDispatchInput
): Promise<ApiResponse<RouteDispatch>> {
  try {
    const { data, error } = await supabase
      .from('route_dispatch')
      .insert([
        {
          ...input,
          created_by: userId,
          status: 'pending',
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
        message: 'Failed to create dispatch',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Add product to dispatch
 */
export async function addProductToDispatch(
  input: AddProductToDispatchInput
): Promise<ApiResponse<RouteDispatchProduct>> {
  try {
    const { data, error } = await supabase
      .from('route_dispatch_products')
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
        message: 'Failed to add product to dispatch',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Update dispatch status
 */
export async function updateDispatchStatus(
  dispatchId: string,
  status: 'pending' | 'in_transit' | 'completed' | 'returned'
): Promise<ApiResponse<RouteDispatch>> {
  try {
    const { data, error } = await supabase
      .from('route_dispatch')
      .update({ status })
      .eq('id', dispatchId)
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
        message: 'Failed to update dispatch status',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

// ============= ROUTE RETURNS =============

/**
 * Record product returns from route
 */
export async function recordRouteReturn(
  input: RecordReturnInput
): Promise<ApiResponse<RouteReturn>> {
  try {
    const { products, ...returnData } = input;

    // Create return record
    const { data: returnRecord, error: returnError } = await supabase
      .from('route_returns')
      .insert([returnData])
      .select()
      .single();

    if (returnError) throw returnError;

    // Insert return products
    const returnProducts = products.map((p) => ({
      return_id: returnRecord.id,
      ...p,
    }));

    const { error: productsError } = await supabase
      .from('route_return_products')
      .insert(returnProducts);

    if (productsError) throw productsError;

    return {
      success: true,
      data: returnRecord,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to record returns',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get returns for dispatch
 */
export async function getDispatchReturns(
  dispatchId: string
): Promise<ApiResponse<(RouteReturn & { products: RouteReturnProduct[] })[]>> {
  try {
    const { data: returns, error: returnsError } = await supabase
      .from('route_returns')
      .select('*')
      .eq('dispatch_id', dispatchId);

    if (returnsError) throw returnsError;

    const withProducts = await Promise.all(
      (returns || []).map(async (ret: RouteReturn) => {
        const { data: products, error: productsError } = await supabase
          .from('route_return_products')
          .select('*, product:products(*)')
          .eq('return_id', ret.id);

        if (productsError) throw productsError;

        return {
          ...ret,
          products: products || [],
        };
      })
    );

    return {
      success: true,
      data: withProducts,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch returns',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

// ============= ROUTE COLLECTIONS =============

/**
 * Record collection from route
 */
export async function recordRouteCollection(
  input: RecordCollectionInput
): Promise<ApiResponse<RouteCollection>> {
  try {
    const { products, ...collectionData } = input;

    // Create collection record
    const { data: collection, error: collectionError } = await supabase
      .from('route_collections')
      .insert([collectionData])
      .select()
      .single();

    if (collectionError) throw collectionError;

    // Insert collection products
    const collectionProducts = products.map((p) => ({
      collection_id: collection.id,
      ...p,
    }));

    const { error: productsError } = await supabase
      .from('route_collection_products')
      .insert(collectionProducts);

    if (productsError) throw productsError;

    return {
      success: true,
      data: collection,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to record collection',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}

/**
 * Get collections for dispatch
 */
export async function getDispatchCollections(
  dispatchId: string
): Promise<ApiResponse<(RouteCollection & { products: RouteCollectionProduct[] })[]>> {
  try {
    const { data: collections, error: collectionsError } = await supabase
      .from('route_collections')
      .select('*')
      .eq('dispatch_id', dispatchId)
      .order('collection_date', { ascending: false });

    if (collectionsError) throw collectionsError;

    const withProducts = await Promise.all(
      (collections || []).map(async (col: RouteCollection) => {
        const { data: products, error: productsError } = await supabase
          .from('route_collection_products')
          .select('*, product:products(*)')
          .eq('collection_id', col.id);

        if (productsError) throw productsError;

        return {
          ...col,
          products: products || [],
        };
      })
    );

    return {
      success: true,
      data: withProducts,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to fetch collections',
        details: error instanceof Error ? { error: error.message } : undefined,
      },
    };
  }
}
