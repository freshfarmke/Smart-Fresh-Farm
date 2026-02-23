# Bakery Management System - API Documentation

Complete guide to using the Supabase API functions for the bakery management system.

## Architecture Overview

```
src/
├── lib/
│   ├── supabase/client.ts          # Supabase client setup
│   ├── auth.ts                     # Auth helpers and role checking
│   ├── api/
│   │   ├── index.ts               # Centralized exports
│   │   ├── products.ts            # Product CRUD
│   │   ├── production.ts          # Production batches
│   │   ├── routes.ts              # Routes (riders, dispatch, returns, collections)
│   │   ├── institutions.ts        # Institutions and orders
│   │   └── finance.ts             # Expenses and stock losses
│   └── constants.ts               # Routes and configuration
├── types/
│   └── database.ts                # All type definitions
└── app/(dashboard)/               # Page structure
```

## Role-Based Access Control (RBAC)

### User Roles
- **admin**: Full access to all features
- **production**: Create batches, dispatch products, record returns
- **finance**: Record expenses, view profits, approve collections

### Permission Checking

```typescript
import { canProduceOrDispatch, canManageFinance } from '@/lib/auth';

// Check if user can produce/dispatch
if (await canProduceOrDispatch(userId)) {
  // Show production UI
}

// Check if user can manage finance
if (await canManageFinance(userId)) {
  // Show finance UI
}
```

## API Response Types

All API functions return a typed response:

```typescript
// Success response
{
  success: true,
  data: { /* typed data */ }
}

// Error response
{
  success: false,
  error: {
    message: "Error message",
    details?: { /* additional info */ }
  }
}
```

Handle responses like this:

```typescript
const response = await getAllProducts();

if (response.success) {
  // Use response.data
  console.log(response.data);
} else {
  // Handle error
  console.error(response.error.message);
}
```

## API Reference

### Products (`lib/api/products.ts`)

#### Get all products
```typescript
const response = await getAllProducts();
```

#### Get single product
```typescript
const response = await getProductById(productId);
```

#### Create product (admin only)
```typescript
const response = await createProduct({
  name: "Bread",
  unit_price: 50,
  cost_per_unit: 30,
  description: "Fresh bread"
});
```

#### Update product (admin only)
```typescript
const response = await updateProduct(productId, {
  unit_price: 55,
  cost_per_unit: 32
});
```

#### Delete product (admin only)
```typescript
const response = await deleteProduct(productId);
```

#### Search products
```typescript
const response = await searchProducts("bread");
```

### Production (`lib/api/production.ts`)

#### Get all batches
```typescript
const response = await getAllBatches();
```

#### Get batch with products
```typescript
const response = await getBatchWithProducts(batchId);
// Returns: { ...batch, products: [...] }
```

#### Create batch (production/admin only)
```typescript
const response = await createBatch(userId, {
  batch_number: "BATCH-001",
  production_date: "2025-02-17",
  notes: "Morning batch"
});
```

#### Add product to batch
```typescript
const response = await addProductToBatch({
  batch_id: batchId,
  product_id: productId,
  quantity_produced: 100
});
```

#### Update batch status
```typescript
const response = await updateBatchStatus(batchId, 'active');
// Status: 'draft' | 'active' | 'completed' | 'closed'
```

#### Remove product from batch
```typescript
const response = await removeProductFromBatch(batchProductId);
```

#### Get batches by status
```typescript
const response = await getBatchesByStatus('active');
```

### Routes (`lib/api/routes.ts`)

#### Route Riders

```typescript
// Get all riders
const response = await getAllRouteRiders();

// Create rider
const response = await createRouteRider({
  name: "John Rider",
  phone: "1234567890",
  address: "123 Street"
});

// Record fuel
const response = await recordFuelExpense({
  rider_id: riderId,
  amount_spent: 1000,
  fuel_type: "petrol",
  date_recorded: "2025-02-17",
  notes: "Morning fill-up"
});

// Get fuel records
const response = await getRiderFuelRecords(riderId);
```

#### Route Dispatch

```typescript
// Get all dispatches
const response = await getAllDispatches();

// Get dispatch with products
const response = await getDispatchWithProducts(dispatchId);
// Returns: { ...dispatch, products: [...] }

// Create dispatch
const response = await createDispatch(userId, {
  rider_id: riderId,
  dispatch_date: "2025-02-17",
  notes: "Morning dispatch"
});

// Add product to dispatch
const response = await addProductToDispatch({
  dispatch_id: dispatchId,
  product_id: productId,
  quantity_dispatched: 50
});

// Update dispatch status
const response = await updateDispatchStatus(dispatchId, 'in_transit');
// Status: 'pending' | 'in_transit' | 'completed' | 'returned'
```

#### Route Returns

```typescript
// Record returns
const response = await recordRouteReturn({
  dispatch_id: dispatchId,
  return_date: "2025-02-17",
  products: [
    {
      product_id: productId,
      quantity_returned: 10,
      reason: 'expired'  // 'good' | 'expired' | 'unsold' | 'damaged'
    }
  ],
  notes: "Items past due date"
});

// Get returns for dispatch
const response = await getDispatchReturns(dispatchId);
// Returns: [{ ...return, products: [...] }, ...]
```

#### Route Collections

```typescript
// Record collection
const response = await recordRouteCollection({
  dispatch_id: dispatchId,
  amount_collected: 5000,
  collection_date: "2025-02-17",
  payment_method: "cash",
  products: [
    {
      product_id: productId,
      quantity_sold: 40
    }
  ],
  notes: "Full collection"
});

// Get collections for dispatch
const response = await getDispatchCollections(dispatchId);
// Returns: [{ ...collection, products: [...] }, ...]
```

### Institutions (`lib/api/institutions.ts`)

#### Institutions

```typescript
// Get all institutions
const response = await getAllInstitutions();

// Get single institution
const response = await getInstitutionById(institutionId);

// Create institution
const response = await createInstitution({
  name: "School Name",
  address: "123 School Road",
  contact_person: "Principal",
  phone: "1234567890"
});

// Update institution
const response = await updateInstitution(institutionId, {
  name: "Updated Name"
});

// Update status
const response = await updateInstitutionStatus(institutionId, 'active');
// Status: 'active' | 'inactive'
```

#### Institution Orders

```typescript
// Get all orders
const response = await getAllInstitutionOrders();

// Get orders for specific institution
const response = await getInstitutionOrders(institutionId);

// Get order with products
const response = await getOrderWithProducts(orderId);
// Returns: { ...order, products: [...] }

// Create order
const response = await createInstitutionOrder({
  institution_id: institutionId,
  order_date: "2025-02-17",
  products: [
    {
      product_id: productId,
      quantity_ordered: 100
    }
  ],
  notes: "Weekly order"
});

// Update order status
const response = await updateInstitutionOrderStatus(orderId, 'confirmed');
// Status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'

// Add product to existing order
const response = await addProductToInstitutionOrder(
  orderId,
  productId,
  quantity,
  unitPrice
);
```

### Finance (`lib/api/finance.ts`)

#### Expenses

```typescript
// Get all expenses
const response = await getAllExpenses();

// Get expenses by date range
const response = await getExpensesByDateRange(
  "2025-02-01",
  "2025-02-28"
);

// Get expenses by category
const response = await getExpensesByCategory('fuel');

// Record expense (finance/admin only)
const response = await recordExpense(userId, {
  description: "Fuel purchase",
  amount: 1000,
  category: "fuel",
  expense_date: "2025-02-17",
  notes: "Morning fuel"
});

// Get total expenses for date range
const response = await getTotalExpenses(
  "2025-02-01",
  "2025-02-28"
);
// Returns: { success: true, data: 5000 }
```

#### Stock Losses

```typescript
// Get all stock losses
const response = await getAllStockLosses();

// Get losses for product
const response = await getStockLossesByProduct(productId);

// Get losses by reason
const response = await getStockLossesByReason('expired');
// Reason: 'expired' | 'damaged' | 'theft' | 'other'

// Record stock loss (finance/admin only)
const response = await recordStockLoss(userId, {
  product_id: productId,
  quantity_lost: 50,
  reason: 'expired',
  loss_date: "2025-02-17",
  notes: "Batch expired"
});

// Get loss summary for date range
const response = await getStockLossSummary(
  "2025-02-01",
  "2025-02-28"
);
// Returns: { expired: 150, damaged: 50, theft: 20, other: 0 }
```

## Authentication Helpers (`lib/auth.ts`)

```typescript
import {
  getCurrentUser,
  getUserProfile,
  hasRole,
  canProduceOrDispatch,
  canManageFinance,
  getUserRole,
  isAuthenticated,
  signOut
} from '@/lib/auth';

// Get current authenticated user
const user = await getCurrentUser();

// Get user's profile
const profile = await getUserProfile(userId);

// Check specific role
const isProduction = await hasRole(userId, 'production');

// Check if can produce
const canProduce = await canProduceOrDispatch(userId);

// Check if can manage finance
const canFinance = await canManageFinance(userId);

// Get user's role
const role = await getUserRole(userId);

// Check if authenticated
const authenticated = await isAuthenticated();

// Sign out
await signOut();
```

## Usage Examples

### Creating a Production Batch with Products

```typescript
'use client';

import { createBatch, addProductToBatch } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export async function handleCreateBatch(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  // 1. Create batch
  const batchResponse = await createBatch(user.id, {
    batch_number: formData.get('batchNumber') as string,
    production_date: formData.get('date') as string,
    notes: formData.get('notes') as string,
  });

  if (!batchResponse.success) {
    // Handle error
    return;
  }

  const batch = batchResponse.data;

  // 2. Add products to batch
  const productsData = JSON.parse(formData.get('products') as string);
  for (const product of productsData) {
    await addProductToBatch({
      batch_id: batch.id,
      product_id: product.id,
      quantity_produced: product.quantity,
    });
  }
}
```

### Recording Route Collection

```typescript
'use client';

import { recordRouteCollection, updateDispatchStatus } from '@/lib/api';

export async function handleRecordCollection(formData: FormData) {
  const response = await recordRouteCollection({
    dispatch_id: formData.get('dispatchId') as string,
    amount_collected: parseFloat(formData.get('amount') as string),
    collection_date: formData.get('date') as string,
    payment_method: formData.get('method') as string,
    products: JSON.parse(formData.get('products') as string),
    notes: formData.get('notes') as string,
  });

  if (response.success) {
    // Update dispatch status to completed
    await updateDispatchStatus(
      formData.get('dispatchId') as string,
      'completed'
    );
  }
}
```

## TODO Items

### Google OAuth Integration
```typescript
// In lib/auth.ts, implement:
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
```

### Subscription Management
```typescript
// Implement subscription checks:
export async function checkSubscriptionStatus(userId: string) {
  // Check subscription tier
  // Enforce feature limits based on plan
}
```

### Advanced Reports
- Daily/Weekly/Monthly revenue reports
- Production efficiency metrics
- Route performance analysis
- Loss analysis by product/reason
- Expense breakdown by category

## TypeScript Types

All database types are defined in `src/types/database.ts`:

```typescript
import {
  Product,
  ProductionBatch,
  BatchProduct,
  RouteRider,
  RouteDispatch,
  RouteReturn,
  RouteCollection,
  Institution,
  InstitutionOrder,
  Expense,
  StockLoss,
  // ... and many more
} from '@/types/database';
```

## Error Handling

```typescript
import { recordExpense } from '@/lib/api';

try {
  const response = await recordExpense(userId, expenseData);
  
  if (response.success) {
    console.log('Expense recorded:', response.data);
  } else {
    // Handle API error
    console.error('Error:', response.error.message);
    if (response.error.details) {
      console.error('Details:', response.error.details);
    }
  }
} catch (error) {
  // Handle unexpected error
  console.error('Unexpected error:', error);
}
```

## Best Practices

1. **Always check response.success** before using response.data
2. **Type your component props** using database types
3. **Use auth checks** before showing sensitive UI
4. **Handle errors gracefully** with user-friendly messages
5. **Cache responses** when appropriate for performance
6. **Use optimistic updates** for better UX
7. **Validate input** before sending to backend
8. **Log errors** for debugging

## Support

For issues or feature requests related to the API, check:
- Database schema in Supabase
- Auth configuration in Supabase
- Environment variables in `.env.local`
