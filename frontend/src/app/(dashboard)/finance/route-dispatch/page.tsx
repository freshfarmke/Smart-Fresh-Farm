'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getAllBatches
} from '@/lib/api/production';
import { getAllRouteRiders, createRouteRider, recordRouteReturn, getAllDispatches, getDispatchWithProducts } from '@/lib/api/routes';
import { getAllProducts } from '@/lib/api/products';

/**
 * Finance: Route Dispatch
 * - Create Dispatch (form moved from Production)
 * - Bread Return to Finance (record returns)
 *
 * Reuses the existing layout, spacing and form patterns.
 */
export default function RouteDispatchPage() {
  const router = useRouter();
  const [_batches, _setBatches] = useState<any[]>([]);
  const [_riders, _setRiders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [dispatchDetailsCache, setDispatchDetailsCache] = useState<Record<string, any>>({});

  const [_selectedBatch, _setSelectedBatch] = useState('');
  const [_selectedRider, _setSelectedRider] = useState('');
  const [_allocations, setAllocations] = useState<Record<string, number>>({});
  const [_notes, _setNotes] = useState('');
  const [_dispatchDate, _setDispatchDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [selectedDispatch, setSelectedDispatch] = useState('');
  const [returns, setReturns] = useState<Record<string, { quantity_returned: number; reason: string }>>({});
  // Create Route Rider form state
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderAssignedRoute, setNewRiderAssignedRoute] = useState('');
  const [newRiderStatus, setNewRiderStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    async function load() {
      const b = await getAllBatches();
      if (b.success) _setBatches(b.data || []);
      const r = await getAllRouteRiders();
      if (r.success) _setRiders(r.data || []);
      const p = await getAllProducts();
      if (p.success) {
        setProducts(p.data || []);
        // init allocations/returns for product ids
        const initAlloc: Record<string, number> = {};
        const initReturns: Record<string, any> = {};
        (p.data || []).forEach((prd: any) => { initAlloc[prd.id] = 0; initReturns[prd.id] = { quantity_returned: 0, reason: 'good' }; });
        setAllocations(initAlloc);
        setReturns(initReturns);
      }
      const d = await getAllDispatches();
      if (d.success) setDispatches(d.data || []);
    }
    load();
  }, []);

  // const handleAllocationChange = (productId: string, value: string) => {
  //   setAllocations((prev) => ({ ...prev, [productId]: Math.max(0, parseInt(value || '0')) }));
  // };

  const handleReturnChange = (productId: string, field: 'quantity_returned' | 'reason', value: string) => {
    setReturns((prev) => ({ ...prev, [productId]: { ...prev[productId], [field]: field === 'quantity_returned' ? Math.max(0, parseInt(value || '0')) : value } }));
  };

  // Finance no longer creates dispatches. Dispatch creation occurs in Production.
  // Finance is responsible for creating/managing Route Riders (see handleCreateRouteRider below).

  const handleCreateRouteRider = async (payload: { name: string; phone: string; assigned_route?: string; status?: string }) => {
    try {
      const res = await createRouteRider({ name: payload.name, phone: payload.phone, assigned_route: payload.assigned_route || null, status: payload.status === 'active' ? 'active' : 'inactive' } as any);
      if (!res.success) throw new Error(res.error?.message || 'Failed creating rider');
      alert('Route rider created');
      const r = await getAllRouteRiders();
      if (r.success) _setRiders(r.data || []);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to create route rider');
    }
  };
  const handleSaveReturns = async () => {
    try {
      if (!selectedDispatch) { alert('Select a dispatch'); return; }
      const productsToReturn = Object.entries(returns).filter(([, v]) => v.quantity_returned > 0).map(([product_id, v]: any) => ({ product_id, quantity_returned: v.quantity_returned, reason: v.reason }));
      if (productsToReturn.length === 0) { alert('No returns to save'); return; }

      // Validate dispatch and product assignments
      let dispatchDetails = dispatchDetailsCache[selectedDispatch];
      if (!dispatchDetails) {
        const det = await getDispatchWithProducts(selectedDispatch);
        if (!det.success) { alert('Failed to fetch dispatch details for validation'); return; }
        dispatchDetails = det.data;
        setDispatchDetailsCache((prev) => ({ ...prev, [selectedDispatch]: dispatchDetails }));
      }

      // Ensure returned products belong to the dispatch and quantities do not exceed dispatched quantities
      const dispatchedMap: Record<string, number> = {};
      (dispatchDetails.products || []).forEach((p: any) => { dispatchedMap[p.product_id || p.product?.id || p.id] = (dispatchedMap[p.product_id || p.product?.id || p.id] || 0) + (p.quantity_dispatched || p.quantity || 0); });

      for (const r of productsToReturn) {
        const allowed = dispatchedMap[r.product_id];
        if (!allowed) { alert(`Product ${r.product_id} was not part of dispatch ${selectedDispatch}`); return; }
        if (r.quantity_returned > allowed) { alert(`Returned quantity for product ${r.product_id} exceeds dispatched amount (${allowed})`); return; }
      }

      const payload = { dispatch_id: selectedDispatch, return_date: new Date().toISOString().slice(0,10), products: productsToReturn } as any;
      const res = await recordRouteReturn(payload);
      if (!res.success) throw new Error(res.error?.message || 'Failed to save returns');
      alert('Returns recorded');
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to record returns');
    }
  };

  const handleSubmitRider = async () => {
    if (!newRiderName || !newRiderPhone) { alert('Provide name and phone'); return; }
    await handleCreateRouteRider({ name: newRiderName, phone: newRiderPhone, assigned_route: newRiderAssignedRoute, status: newRiderStatus });
    setNewRiderName(''); setNewRiderPhone(''); setNewRiderAssignedRoute(''); setNewRiderStatus('active');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Dispatch</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create dispatches and record bread returns</p>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5" />Back</button>
      </div>

      {/* Create Route Rider (Finance responsibility) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create Route Rider</h2>
          <p className="text-sm text-gray-500 mt-0.5">Finance: add and manage route riders</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rider Name</label>
              <input value={newRiderName} onChange={(e) => setNewRiderName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input value={newRiderPhone} onChange={(e) => setNewRiderPhone(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={newRiderStatus} onChange={(e) => setNewRiderStatus(e.target.value as any)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSubmitRider} className="flex items-center space-x-2 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"><Plus className="w-4 h-4" /><span>Create Rider</span></button>
            <button onClick={() => { setNewRiderName(''); setNewRiderPhone(''); setNewRiderAssignedRoute(''); setNewRiderStatus('active'); }} className="px-4 py-2 border rounded-md">Reset</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
          <h2 className="text-lg font-semibold text-gray-900">Dispatch Records</h2>
          <p className="text-sm text-gray-500 mt-0.5">View dispatches created by Production</p>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dispatches.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><span className="text-sm text-gray-900">{d.id}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-700">{d.rider_id || d.rider || '—'}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-700">{new Date(d.dispatch_date).toLocaleDateString()}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-700">{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bread Returns Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
          <h2 className="text-lg font-semibold text-gray-900">Bread Return to Finance</h2>
          <p className="text-sm text-gray-500 mt-0.5">Record returned bread from routes</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Dispatch</label>
            <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Enter dispatch id (e.g. #D-2024-045)" value={selectedDispatch} onChange={(e) => setSelectedDispatch(e.target.value)} />
          </div>

          <div className="space-y-3">
            {products.map((prd:any) => (
              <div key={prd.id} className="flex items-center space-x-4">
                <div className="w-1/3"><span className="text-sm font-medium text-gray-700">{prd.name}</span></div>
                <div className="w-1/3"><input type="number" min={0} value={returns[prd.id]?.quantity_returned || 0} onChange={(e) => handleReturnChange(prd.id, 'quantity_returned', e.target.value)} className="w-28 px-2 py-1 border rounded-md" /></div>
                <div className="w-1/3">
                  <select value={returns[prd.id]?.reason || 'good'} onChange={(e) => handleReturnChange(prd.id, 'reason', e.target.value)} className="px-3 py-1 border rounded-md">
                    <option value="good">Good</option>
                    <option value="expired">Expired</option>
                    <option value="unsold">Unsold</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSaveReturns} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"><Save className="w-4 h-4" /><span>Save Returns</span></button>
            <button onClick={() => setReturns(products.reduce((acc:any, p:any) => ({ ...acc, [p.id]: { quantity_returned: 0, reason: 'good' } }), {}))} className="px-4 py-2 border rounded-md">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
