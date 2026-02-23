/**
 * Institution Orders Page - Manage orders for institutions
 * 
 * Features:
 * - List all institution orders
 * - Create new order for specific institution
 * - Add products to order with quantities
 * - Update order status (pending -> confirmed -> delivered -> cancelled)
 * - Calculate order totals
 * 
 * API Functions Used:
 * - getAllInstitutionOrders()
 * - getInstitutionOrders()
 * - getOrderWithProducts()
 * - createInstitutionOrder()
 * - updateInstitutionOrderStatus()
 * - addProductToInstitutionOrder()
 */

import { getAllInstitutionOrders } from '@/lib/api/institutions';

export default async function InstitutionOrdersPage() {
  const ordersResponse = await getAllInstitutionOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Institution Orders</h1>
        {/* TODO: Add Button for creating new order */}
      </div>

      {ordersResponse.success ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* TODO: Implement Table showing:
             - Institution Name
             - Order Date
             - Status (color-coded)
             - Total Amount
             - Product Count
             - Actions (view details, update status, delete)
          */}
          <div className="p-6">
            <p className="text-gray-600">
              Total Orders: {ordersResponse.data.length}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          {ordersResponse.error.message}
        </div>
      )}
    </div>
  );
}
