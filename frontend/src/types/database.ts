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
  id: string;
  name: string;
  unit_price: number;
  cost_per_unit: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  unit_price: number;
  cost_per_unit: number;
  description?: string;
}

// Production
export interface ProductionBatch {
  id: string;
  batch_number: string;
  created_by: string;
  status: 'draft' | 'active' | 'completed' | 'closed';
  production_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchProduct {
  id: string;
  batch_id: string;
  product_id: string;
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
  batch_id: string;
  product_id: string;
  quantity_produced: number;
}

// Raw Materials
export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // kg, liters, etc.
  unit_cost: number;
  reorder_level: number | null;
  current_stock: number;
  created_at: string;
}

export interface RawMaterialUsage {
  id: string;
  material_id: string;
  batch_id: string;
  quantity_used: number;
  created_at: string;
}

// Route Riders
export interface RouteRider {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface RouteRiderFuel {
  id: string;
  rider_id: string;
  amount_spent: number;
  fuel_type: string;
  date_recorded: string;
  notes: string | null;
  created_at: string;
}

export interface CreateRiderInput {
  name: string;
  phone: string;
  address?: string;
}

export interface RecordFuelInput {
  rider_id: string;
  amount_spent: number;
  fuel_type: string;
  date_recorded: string;
  notes?: string;
}

// Route Dispatch
export interface RouteDispatch {
  id: string;
  rider_id: string;
  dispatch_date: string;
  status: 'pending' | 'in_transit' | 'completed' | 'returned';
  created_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RouteDispatchProduct {
  id: string;
  dispatch_id: string;
  product_id: string;
  quantity_dispatched: number;
  created_at: string;
  product?: Product;
}

export interface CreateDispatchInput {
  rider_id: string;
  dispatch_date: string;
  notes?: string;
}

export interface AddProductToDispatchInput {
  dispatch_id: string;
  product_id: string;
  quantity_dispatched: number;
}

// Route Returns
export interface RouteReturn {
  id: string;
  dispatch_id: string;
  return_date: string;
  notes: string | null;
  created_at: string;
}

export interface RouteReturnProduct {
  id: string;
  return_id: string;
  product_id: string;
  quantity_returned: number;
  reason: 'good' | 'expired' | 'unsold' | 'damaged';
  created_at: string;
  product?: Product;
}

export interface RecordReturnInput {
  dispatch_id: string;
  return_date: string;
  products: Array<{
    product_id: string;
    quantity_returned: number;
    reason: 'good' | 'expired' | 'unsold' | 'damaged';
  }>;
  notes?: string;
}

// Route Collections
export interface RouteCollection {
  id: string;
  dispatch_id: string;
  amount_collected: number;
  collection_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface RouteCollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  quantity_sold: number;
  created_at: string;
}

export interface RecordCollectionInput {
  dispatch_id: string;
  amount_collected: number;
  collection_date: string;
  payment_method: string;
  products: Array<{
    product_id: string;
    quantity_sold: number;
  }>;
  notes?: string;
}

// Institutions
export interface Institution {
  id: string;
  name: string;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface InstitutionOrder {
  id: string;
  institution_id: string;
  order_date: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total_amount: number | null;
  notes: string | null;
  created_at: string;
}

export interface InstitutionOrderProduct {
  id: string;
  order_id: string;
  product_id: string;
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
  institution_id: string;
  order_date: string;
  products: Array<{
    product_id: string;
    quantity_ordered: number;
  }>;
  notes?: string;
}

// Expenses
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  recorded_by: string;
  notes: string | null;
  created_at: string;
}

export interface RecordExpenseInput {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes?: string;
}

// Stock Losses
export interface StockLoss {
  id: string;
  product_id: string;
  quantity_lost: number;
  reason: 'expired' | 'damaged' | 'theft' | 'other';
  loss_date: string;
  recorded_by: string;
  notes: string | null;
  created_at: string;
}

export interface RecordStockLossInput {
  product_id: string;
  quantity_lost: number;
  reason: 'expired' | 'damaged' | 'theft' | 'other';
  loss_date: string;
  notes?: string;
}

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
