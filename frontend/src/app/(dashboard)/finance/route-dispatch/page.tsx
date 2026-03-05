'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, ArrowLeft, Package, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  getAllBatches
} from '@/lib/api/production';
import { createRouteRider, getAllDispatches, getDispatchWithProducts } from '@/lib/api/routes';

/**
 * Finance: Route Dispatch & Riders
 * - Create Route Riders
 * - View Dispatch Records
 * - Bread returns are now on a separate page (/route-dispatch/bread-returns)
 *
 * Reuses the existing layout, spacing and form patterns.
 */
export default function RouteDispatchPage() {
  const router = useRouter();
  
  // Navigation
  const [activeSection, setActiveSection] = useState<'riders' | 'dispatches'>('dispatches');
  const ridersRef = useRef<HTMLDivElement>(null);
  const dispatchesRef = useRef<HTMLDivElement>(null);
  const [_batches, _setBatches] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [dispatchDetailsCache, setDispatchDetailsCache] = useState<Record<string, any>>({});

  const [_selectedBatch, _setSelectedBatch] = useState('');
  const [_notes, _setNotes] = useState('');
  const [_dispatchDate, _setDispatchDate] = useState<string>(new Date().toISOString().slice(0, 10));
  // Create Route Rider form state
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderNickname, setNewRiderNickname] = useState('');
  
  const [newRiderStatus, setNewRiderStatus] = useState<'active' | 'inactive'>('active');
  const [newRiderError, setNewRiderError] = useState<string | null>(null);
  const [isCreatingRider, setIsCreatingRider] = useState(false);

  const scrollToSection = (section: 'riders' | 'dispatches') => {
    setActiveSection(section);
    setTimeout(() => {
      const ref = section === 'riders' ? ridersRef : dispatchesRef;
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  useEffect(() => {
    async function load() {
      const b = await getAllBatches();
      if (b.success) _setBatches(b.data || []);
      const d = await getAllDispatches();
      if (d.success) {
        setDispatches(d.data || []);
        // Fetch products for each dispatch
        const cache: Record<string, any> = {};
        for (const dispatch of d.data || []) {
          const details = await getDispatchWithProducts(String(dispatch.id));
          if (details.success) {
            cache[String(dispatch.id)] = details.data;
          }
        }
        setDispatchDetailsCache(cache);
      }
    }
    load();
  }, []);

  // const handleAllocationChange = (productId: string, value: string) => {
  //   setAllocations((prev) => ({ ...prev, [productId]: Math.max(0, parseInt(value || '0')) }));
  // };

  // Finance no longer creates dispatches. Dispatch creation occurs in Production.
  // Finance is responsible for creating/managing Route Riders (see handleCreateRouteRider below).

  const handleCreateRouteRider = async (payload: { name: string; phone: string; status?: string; nickname?: string }) => {
    setIsCreatingRider(true);
    setNewRiderError(null);
    try {
      const res = await createRouteRider({ name: payload.name, phone: payload.phone, nickname: payload.nickname || null, status: payload.status === 'active' ? 'active' : 'inactive' } as any);
      if (!res.success) {
        // capture full error for debugging
        console.error('createRouteRider failed', res.error);
        const msg: string = (res.error?.message as string) || (res.error?.details && (typeof res.error.details.error === 'string' ? res.error.details.error : JSON.stringify(res.error.details))) || 'Failed creating rider';
        setNewRiderError(msg);
        return;
      }

      // success
      setNewRiderError(null);
    } catch (e: any) {
      console.error(e);
      setNewRiderError(e?.message || 'Failed to create route rider');
    } finally {
      setIsCreatingRider(false);
    }
  };
  
  const handleSubmitRider = async () => {
    setNewRiderError(null);
    if (!newRiderName || !newRiderPhone) { 
      const msg = 'Provide name and phone';
      setNewRiderError(msg);
      toast.error(msg);
      return; 
    }
    await handleCreateRouteRider({ name: newRiderName, phone: newRiderPhone, nickname: newRiderNickname, status: newRiderStatus } as any);
    if (!newRiderError) {
      toast.success('Route rider created successfully');
      setNewRiderName(''); 
      setNewRiderPhone(''); 
      setNewRiderNickname(''); 
      setNewRiderStatus('active');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Route Dispatch & Returns</h1>
              <p className="text-sm text-gray-600 mt-1">Manage route riders, dispatches, and bread returns</p>
            </div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5" />Back</button>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex gap-1 border-t border-gray-100 pt-3">
            <button
              onClick={() => scrollToSection('riders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeSection === 'riders'
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 border-t-2 border-amber-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Route Riders
            </button>
            <button
              onClick={() => scrollToSection('dispatches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeSection === 'dispatches'
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 border-t-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Dispatches
            </button>
            <button
              onClick={() => router.push('/finance/route-dispatch/bread-returns')}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              Bread Returns
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
        
        {/* Route Riders Section */}
        <div ref={ridersRef} className="scroll-mt-40">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b">
              <h2 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Route Rider
              </h2>
              <p className="text-sm text-amber-800 mt-1">Finance: add and manage delivery riders</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rider Name</label>
                  <input value={newRiderName} onChange={(e) => setNewRiderName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input value={newRiderPhone} onChange={(e) => setNewRiderPhone(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nickname</label>
                  <input value={newRiderNickname} onChange={(e) => setNewRiderNickname(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select value={newRiderStatus} onChange={(e) => setNewRiderStatus(e.target.value as any)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button onClick={handleSubmitRider} disabled={isCreatingRider} className="flex items-center space-x-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"><Plus className="w-4 h-4" /><span>{isCreatingRider ? 'Creating…' : 'Create Rider'}</span></button>
                <button onClick={() => { setNewRiderName(''); setNewRiderPhone(''); setNewRiderNickname(''); setNewRiderStatus('active'); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">Reset</button>
              </div>
              {newRiderError ? <div className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg">{newRiderError}</div> : null}
            </div>
          </div>
        </div>

        {/* Dispatches Section */}
        <div ref={dispatchesRef} className="scroll-mt-40">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Dispatch Records
              </h2>
              <p className="text-sm text-blue-800 mt-1">Daily dispatch summary: rider, products, date, status</p>
            </div>
            <div className="p-6 space-y-4">
              {dispatches.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">No dispatches yet</p>
              ) : (
                dispatches.map((d: any) => (
                  <div key={d.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {(d as any).rider?.nickname || (d as any).rider?.full_name || `Rider #${d.rider_id}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {new Date(d.dispatch_date).toLocaleDateString()} · Status: <span className={`font-medium ${d.status === 'completed' ? 'text-green-600' : d.status === 'in_transit' ? 'text-blue-600' : 'text-amber-600'}`}>{d.status}</span>
                        </p>
                      </div>
                      <span className="text-xs bg-gray-700 text-white px-3 py-1 rounded-full">ID: {d.id}</span>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 uppercase mb-2 tracking-wide">📦 Products Dispatched</p>
                      {dispatchDetailsCache[d.id]?.products && dispatchDetailsCache[d.id].products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {dispatchDetailsCache[d.id].products.map((dp: any) => (
                            <div key={dp.id} className="flex justify-between text-sm bg-white p-3 rounded border-l-4 border-blue-500">
                              <span className="text-gray-700 font-medium">{dp.product?.name || `Product #${dp.product_id}`}</span>
                              <span className="text-blue-700 font-semibold">{dp.quantity_dispatched} units</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No products loaded</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
