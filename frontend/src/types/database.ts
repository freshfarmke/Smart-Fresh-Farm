/**
 * Database type definitions
 * Mirrors Supabase table schemas for type safety
 */

// User & Auth related types
export interface UserProfile {
  id: string;
  user_id: string;
  role: 'production' | 'finance' | 'admin';
  name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

// Products
export interface Product {
  id: number; // bigint
  name: string;
  weight: string | null; // e.g. "500g"
  wholesale_price: number;
  retail_price: number;
  active: boolean;
  created_at: string | null;
  updated_at?: string | null;
}

export interface CreateProductInput {
  name: string;
  weight?: string;
  wholesale_price: number;
  retail_price: number;
  active?: boolean;
}

// Institutions
export interface Institution {
  id: number; // bigint
  name: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateInstitutionInput {
  name: string;
  contact_person?: string;
  phone?: string;
  address?: string;
}

// Production
export interface ProductionBatch {
  id: number; // bigint
  batch_number: string;
  batch_code?: string;
  status: 'draft' | 'active' | 'completed' | 'closed';
  production_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchProduct {
  id: number; // bigint
  batch_id: number; // bigint
  product_id: number; // bigint
  quantity_produced: number;
  created_at: string;
  product?: Product;
}

export interface CreateBatchInput {
  batch_number: string;
  production_date: string;
  notes?: string;
}

export interface AddProductToBatchInput {
  batch_id: number; // bigint
  product_id: number; // bigint
  quantity_produced: number;
}

// Raw Materials
export interface RawMaterial {
  id: number; // bigint
  name: string;
  unit: string; // kg, liters, etc.
  unit_cost: number;
  reorder_level: number | null;
  current_stock: number;
  created_at: string;
  updated_at?: string;
}

export interface RawMaterialUsage {
  id: number; // bigint
  material_id: number; // bigint
  batch_id: number; // bigint
  quantity_used: number;
  created_at: string;
}

// Route Riders
export interface RouteRider {
  id: number; // bigint
  full_name: string;
  nickname?: string | null;
  phone: string;
  address: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface RouteRiderFuel {
  id: number; // bigint
  rider_id: number; // bigint
  amount_spent: number;
  fuel_type: string;
  date_recorded: string;
  notes: string | null;
  created_at: string;
}

export interface CreateRiderInput {
  name: string;
  nickname?: string;
  phone: string;
  address?: string;
}

export interface RecordFuelInput {
  rider_id: number; // bigint
  amount_spent: number;
  fuel_type: string;
  date_recorded: string;
  notes?: string;
}

// Route Dispatch
export interface RouteDispatch {
  id: number; // bigint
  rider_id: number; // bigint
  batch_id?: number | null; // bigint
  dispatch_date: string;
  status: 'pending' | 'in_transit' | 'completed' | 'returned';
  notes: string | null;
  created_at: string;
  updated_at: string;
  rider?: {
    nickname?: string | null;
    full_name?: string | null;
  };
}

export interface RouteDispatchProduct {
  id: number; // bigint
  dispatch_id: number; // bigint
  product_id: number | string; // Can be bigint or UUID string
  quantity_dispatched: number;
  quantity_sold?: number;
  quantity_returned?: number;
  created_at: string;
  product?: Product;
}

export interface CreateDispatchInput {
  rider_id: number; // bigint
  batch_id?: number | null; // bigint
  dispatch_date: string;
  notes?: string;
}

export interface AddProductToDispatchInput {
  dispatch_id: number; // bigint
  product_id: number; // bigint
  quantity_dispatched: number;
}

// Route Returns
export interface RouteReturn {
  id: number; // bigint
  dispatch_id: number; // bigint
  return_date: string;
  notes: string | null;
  created_at: string;
}

export interface RouteReturnProduct {
  id: number; // bigint
  return_id: number; // bigint
  product_id: number; // bigint
  quantity_returned: number;
  reason: 'good' | 'expired' | 'unsold' | 'damaged' | 'other';
  created_at: string;
  product?: Product;
}

export interface RecordReturnInput {
  dispatch_id: number; // bigint
  return_date: string;
  products: Array<{
    product_id: number | string; // Can be bigint or UUID string
    quantity_returned: number;
    reason: 'good' | 'expired' | 'unsold' | 'damaged';
  }>;
  notes?: string;
}

// Route Collections
export interface RouteCollection {
  id: string; // UUID
  dispatch_id: string; // UUID
  amount_collected: number;
  collection_date: string;
  payment_method?: string;
  notes: string | null;
  created_at: string;
  dispatch?: {
    id: string;
    rider_id: string;
    batch_id: string;
    dispatch_date: string;
    status: string;
    rider?: {
      id: string;
      full_name: string;
      nickname?: string;
      phone?: string;
    };
  };
}

export interface RouteCollectionProduct {
  id: string; // UUID
  collection_id: string; // UUID
  product_id: string; // UUID
  quantity_sold: number;
  unit_price?: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    retail_price?: number;
  };
}

// Production-specific product batch (production_batches table)
export interface ProductionBatchRecord {
  id: number; // bigint
  product_id: number; // bigint
  batch_code: string;
  quantity_produced: number;
  quantity_remaining: number;
  expiry_date: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface CreateProductionBatchInput {
  product_id: number; // bigint
  batch_code?: string;
  quantity_produced: number;
  quantity_remaining?: number;
  expiry_date?: string | null;
}

export interface RecordCollectionInput {
  dispatch_id: string; // UUID
  amount_collected: number;
  collection_date: string;
  payment_method: string;
  products: Array<{
    product_id: string; // UUID
    quantity_sold: number;
  }>;
  notes?: string;
}

// Institutions
export interface Institution {
  id: number; // bigint
  name: string;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface InstitutionOrder {
  id: number; // bigint
  institution_id: number; // bigint
  order_date: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface InstitutionOrderProduct {
  id: number; // bigint
  order_id: number; // bigint
  product_id: number; // bigint
  quantity_ordered: number;
  unit_price: number;
  created_at: string;
}

export interface CreateInstitutionInput {
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
}

export interface CreateInstitutionOrderInput {
  institution_id: number; // bigint
  order_date: string;
  products: Array<{
    product_id: number; // bigint
    quantity_ordered: number;
  }>;
  notes?: string;
}

// Expenses
export interface Expense {
  id: number; // bigint
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes: string | null;
  recorded_by?: string | null; // name or email of user who logged the expense
  created_at: string;
  updated_at?: string;
}

export interface RecordExpenseInput {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes?: string;
  recorded_by?: string;
}

// Stock Losses
export interface StockLoss {
  id: number; // bigint
  product_id: number; // bigint
  quantity_lost: number;
  reason: 'expired' | 'damaged' | 'theft' | 'other';
  loss_date: string;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RecordStockLossInput {
  product_id: number; // bigint
  quantity_lost: number;
  reason: 'expired' | 'damaged' | 'theft' | 'other';
  loss_date: string;
  notes?: string;
}

// Finance Activity (unified type for activity feed)
export type FinanceActivity =
  | {
      type: 'expense';
      id: string;
      amount: number;
      category: string;
      description: string;
      created_at: string;
      recorded_by?: string;
    }
  | {
      type: 'collection';
      id: string;
      amount: number;
      dispatch_id: string;
      created_at: string;
      collected_by?: string;
    }
  | {
      type: 'stock_loss';
      id: string;
      quantity: number;
      product_id: string;
      reason: string;
      created_at: string;
      recorded_by?: string;
    };

/**
 * API Response types
 * Used for consistent error handling
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
