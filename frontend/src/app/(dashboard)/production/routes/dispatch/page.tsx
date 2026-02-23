/**
 * Route Dispatch Page - Create and manage product dispatches
 * 
 * Features:
 * - List all dispatches
 * - Create new dispatch for rider
 * - Add products to dispatch
 * - Update dispatch status (pending -> in_transit -> completed)
 * - View dispatch details with products
 * 
 * API Functions Used:
 * - getAllDispatches()
 * - getDispatchWithProducts()
 * - createDispatch()
 * - addProductToDispatch()
 * - updateDispatchStatus()
 * - getDispatchReturns()
 * - getDispatchCollections()
 */

import { getAllDispatches } from '@/lib/api/routes';

export default async function DispatchPage() {
  const dispatchesResponse = await getAllDispatches();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Route Dispatch</h1>
        {/* TODO: Add Button for creating new dispatch */}
      </div>

      {dispatchesResponse.success ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* TODO: Implement Table showing:
             - Dispatch Date
             - Rider Name
             - Status (color-coded)
             - Product Count
             - Actions (add products, complete, view details)
          */}
          <div className="p-6">
            <p className="text-gray-600">
              Total Dispatches: {dispatchesResponse.data.length}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          {dispatchesResponse.error.message}
        </div>
      )}
    </div>
  );
}
