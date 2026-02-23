'use client';

import { useRouter } from 'next/navigation';
import { Plus, Layers, Package, Truck, RotateCcw } from 'lucide-react';
import { StatCard } from '@/components/production/StatCard';
import { ProductionTable } from '@/components/production/ProductionTable';
import { ActivityFeed } from '@/components/production/ActivityFeed';

/**
 * Production Dashboard
 * Clean activity-feed based dashboard for production operations
 */

export default function ProductionDashboard() {
  const router = useRouter();

  const handleCreateBatch = () => {
    router.push('/production/new-batch');
  };

  const handleDispatch = () => {
    router.push('/production/dispatch');
  };

  const handleRecordReturn = () => {
    router.push('/production/returns');
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Operational control center</p>
        </div>
        <button
          onClick={handleCreateBatch}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Batch
        </button>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Production Batches"
          value="12"
          icon={<Layers className="w-6 h-6" />}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Total Units Produced Today"
          value="2,456"
          icon={<Package className="w-6 h-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Dispatched Today"
          value="2,100"
          icon={<Truck className="w-6 h-6" />}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pending Returns"
          value="45"
          icon={<RotateCcw className="w-6 h-6" />}
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Main Content - 3 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Table - 2 columns */}
        <div className="lg:col-span-2">
          <ProductionTable />
        </div>

        {/* Quick Actions Sidebar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleCreateBatch}
              className="w-full bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Batch
              </div>
            </button>
            <button
              onClick={handleDispatch}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" />
                Dispatch to Route
              </div>
            </button>
        
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
}
