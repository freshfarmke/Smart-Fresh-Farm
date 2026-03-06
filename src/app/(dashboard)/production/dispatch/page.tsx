'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  ArrowLeft,
  Search,
  Phone
} from 'lucide-react';
import { getAllBatches } from '@/lib/api/production';
import { getAllRouteRiders, createDispatch, addProductToDispatch } from '@/lib/api/routes';
import { getAllProducts } from '@/lib/api/products';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

/**
 * Routes & Dispatch Management Page
 * Part of Production Dashboard
 * Manages rider assignments and dispatch tracking
 */
export default function RoutesDispatch() {
  const router = useRouter();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedRider, setSelectedRider] = useState('');
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [isCreatingDispatch, setIsCreatingDispatch] = useState(false);
  const [stats, setStats] = useState({
    activeRiders: 0,
    endingDispatches: 0,
    completedToday: 0
  });

  

  

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const b = await getAllBatches();
        const r = await getAllRouteRiders();
        const p = await getAllProducts();
        const { data: dispatchData } = await supabase.from('route_dispatch').select('*');

        if (!mounted) return;

        if (b.success) setBatches(b.data || []);
        if (r.success) {
          setRiders(r.data || []);
          // Calculate active riders
          const activeCount = (r.data || []).filter((rider: any) => 
            rider.status === 'active' || rider.status === 'Active' || rider.status === 'Available' || !rider.status
          ).length;
          
          // Calculate dispatch stats
          const today = new Date().toDateString();
          let completedCount = 0;
          let endingCount = 0;
          
          (dispatchData || []).forEach((dispatch: any) => {
            const dispatchDate = dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toDateString() : 
                                (dispatch.created_at ? new Date(dispatch.created_at).toDateString() : null);
            
            if (dispatchDate === today) {
              if (dispatch.status === 'completed' || dispatch.status === 'Completed') {
                completedCount += 1;
              } else if (!dispatch.status || dispatch.status === 'pending' || dispatch.status === 'Pending') {
                endingCount += 1;
              }
            }
          });
          
          setStats({
            activeRiders: activeCount,
            endingDispatches: endingCount,
            completedToday: completedCount
          });
        }
        
        if (p.success) {
          setProducts(p.data || []);
          const initAlloc: Record<string, number> = {};
          (p.data || []).forEach((prd: any) => { initAlloc[prd.id] = 0; });
          setAllocations(initAlloc);
        }
      } catch (err) {
        console.error('Failed to load dispatch data', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleAllocationChange = (productId: string, value: string) => {
    const parsed = Math.max(0, parseInt(value || '0'));
    setAllocations(prev => ({ ...prev, [productId]: parsed }));
  };

  

  const handleCreateDispatch = async () => {
    try {
      setIsCreatingDispatch(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('Not authenticated');
      if (!selectedBatch || !selectedRider) throw new Error('Select batch and rider');

      const payload = {
        batch_id: selectedBatch || null,
        rider_id: selectedRider || null,
        dispatch_date: new Date().toISOString().slice(0, 10),
        notes: undefined,
      } as any;
      const res = await createDispatch(payload as any);
      if (!res.success) throw new Error(res.error?.message || 'Failed creating dispatch');
      const dispatchId = res.data.id;
      for (const [productId, qty] of Object.entries(allocations)) {
        const n = Number(qty || 0);
        if (n > 0) {
          await addProductToDispatch({ dispatch_id: dispatchId, product_id: productId, quantity_dispatched: n } as any);
        }
      }
      toast.success('Dispatch created successfully');
      // reset allocations
      setAllocations(products.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 0 }), {}));
      setSelectedBatch(''); setSelectedRider('');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to create dispatch');
    } finally {
      setIsCreatingDispatch(false);
    }
  };

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700';
      case 'On Route':
        return 'bg-yellow-100 text-yellow-700';
      case 'Assigned':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Routes & Dispatch</h1>
              <p className="text-sm text-gray-500">Manage riders, create dispatches, and track deliveries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Riders</p>
                  <p className="text-2xl font-semibold mt-1 text-gray-900">{stats.activeRiders}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Users className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ending Dispatches</p>
                  <p className="text-2xl font-semibold mt-1 text-yellow-600">{stats.endingDispatches}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-semibold mt-1 text-green-600">{stats.completedToday}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Create Dispatch (Production is authoritative for creating dispatches) */}
          <div className="bg-white rounded-lg border">
            <div className="px-5 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Create New Dispatch</h2>
              <p className="text-sm text-gray-500 mt-0.5">Assign batch and rider for delivery</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
                  <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600">
                    <option value="">Choose a batch...</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>{batch.batch_code || batch.batch_number || batch.id} - {batch.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Rider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Rider</label>
                  <select value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600">
                    <option value="">Choose a rider...</option>
                    {riders.filter((r:any) => r.status === 'active' || r.status === 'Available' || !r.status).map((rider) => (
                      <option key={rider.id} value={rider.id}>{rider.nickname || rider.full_name || rider.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opening Stock Allocation */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Opening Stock Allocation</h3>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <div className="w-1/4"><span className="text-sm font-medium text-gray-700">{product.name}</span></div>
                      <div className="w-1/4"><span className="text-sm text-gray-500">Available: {product.available ?? '—'} units</span></div>
                      <div className="w-1/4">
                        <input type="number" min={0} max={product.available || undefined} value={allocations[product.id] || 0} onChange={(e) => handleAllocationChange(product.id, e.target.value)} className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" placeholder="0" />
                      </div>
                      <div className="w-1/4"><span className="text-sm text-gray-500">units</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleCreateDispatch} disabled={isCreatingDispatch} className="flex items-center space-x-2 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-4 h-4" /><span>{isCreatingDispatch ? 'Creating…' : 'Create Dispatch'}</span></button>
            </div>
          </div>

          {/* Route Riders Table */}
          <div className="bg-white rounded-lg border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Route Riders</h2>
                <p className="text-sm text-gray-500 mt-0.5">Available riders for dispatch assignment</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <Search className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <Filter className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rider Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {riders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-amber-900">{rider.avatar}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{rider.nickname || rider.full_name || rider.id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{rider.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rider.status)}`}>
                          {rider.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button className="px-3 py-1 text-sm text-amber-700 hover:text-amber-900 font-medium border border-amber-200 rounded-md hover:bg-amber-50">
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returns moved to Finance - removed from Production */}
        </main>
    </div>
  );
}

