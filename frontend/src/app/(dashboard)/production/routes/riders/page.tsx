/**
 * Route Riders Page - Manage delivery riders
 * 
 * Features:
 * - List all riders
 * - Add new rider
 * - Record fuel expenses
 * - View fuel history
 * 
 * API Functions Used:
 * - getAllRouteRiders()
 * - createRouteRider()
 * - recordFuelExpense()
 * - getRiderFuelRecords()
 */

import { getAllRouteRiders } from '@/lib/api/routes';

export default async function RouteRidersPage() {
  const ridersResponse = await getAllRouteRiders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Route Riders</h1>
        {/* TODO: Add Button for adding new rider */}
      </div>

      {ridersResponse.success ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* TODO: Implement Table showing:
             - Name
             - Phone
             - Status
             - Actions (view fuel history, edit, deactivate)
          */}
          <div className="p-6">
            <p className="text-gray-600">
              Total Riders: {ridersResponse.data.length}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          {ridersResponse.error.message}
        </div>
      )}
    </div>
  );
}
