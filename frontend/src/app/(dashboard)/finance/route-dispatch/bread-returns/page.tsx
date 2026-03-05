'use client';

import { useEffect, useState } from 'react';
import { Save, ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAllRouteRiders, recordRouteReturn, getAllDispatches, getDispatchWithProducts } from '@/lib/api/routes';

/**
 * Finance: Bread Returns Page
 * - Record returned bread from routes
 * - Track good items (money) vs losses (expired, unsold, damaged)
 * - Auto-remove rider after returns recorded (24-hour rule)
 */
export default function BreadReturnsPage() {
  const router = useRouter();
  
  const [riders, setRiders] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [dispatchDetailsCache, setDispatchDetailsCache] = useState<Record<string, any>>({});

  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [selectedDispatch, setSelectedDispatch] = useState<string>('');
  const [returns, setReturns] = useState<Record<string, { quantity_returned: number; reason: string }>>({});

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const r = await getAllRouteRiders();
      if (r.success) setRiders(r.data || []);
      
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
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load riders and dispatches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReturnChange = (productId: string | number, field: 'quantity_returned' | 'reason', value: string) => {
    const pidStr = String(productId);
    setReturns((prev) => ({ ...prev, [pidStr]: { ...prev[pidStr], [field]: field === 'quantity_returned' ? Math.max(0, parseInt(value || '0')) : value } }));
  };

  const handleSaveReturns = async () => {
    try {
      if (!selectedRiderId) { toast.error('Select a route rider'); return; }
      if (!selectedDispatch) { toast.error('Select a dispatch'); return; }
      
      const productsToReturn = Object.entries(returns)
        .filter(([, v]) => v.quantity_returned > 0)
        .map(([product_id, v]: any) => {
          // Product ID can be string (UUID) or number - keep as-is
          if (!product_id || product_id === 'undefined') {
            throw new Error('Invalid product in return - missing product reference');
          }
          return {
            product_id: isNaN(Number(product_id)) ? product_id : Number(product_id), // Keep as string if UUID, convert if number
            quantity_returned: v.quantity_returned,
            reason: v.reason
          };
        });
      
      if (productsToReturn.length === 0) { toast.error('No returns to save'); return; }

      // Validate dispatch and product assignments
      let dispatchDetails = dispatchDetailsCache[selectedDispatch];
      if (!dispatchDetails) {
        const det = await getDispatchWithProducts(selectedDispatch);
        if (!det.success) { toast.error('Failed to fetch dispatch details for validation'); return; }
        dispatchDetails = det.data;
        setDispatchDetailsCache((prev) => ({ ...prev, [selectedDispatch]: dispatchDetails }));
      }

      // Ensure returned products belong to the dispatch and quantities do not exceed dispatched quantities
      const dispatchedMap: Record<string, number> = {};
      const dispatchProducts = dispatchDetails.products || [];
      
      if (dispatchProducts.length === 0) {
        toast.error('Dispatch has no products assigned');
        return;
      }

      dispatchProducts.forEach((p: any) => { 
        const prodId = String(p.product_id || p.id);
        dispatchedMap[prodId] = (dispatchedMap[prodId] || 0) + (p.quantity_dispatched || 0); 
      });

      // Validate each return with clear user-friendly messages
      for (const r of productsToReturn) {
        const prodIdStr = String(r.product_id);
        const allowed = dispatchedMap[prodIdStr];
        
        // Find product info for better error messages
        const prodInfo = dispatchProducts.find((p: any) => String(p.product_id || p.id) === prodIdStr);
        const prodName = prodInfo?.product?.name || 'Product';

        // Check if product was in dispatch
        if (allowed === undefined || allowed === null) {
          console.error(`❌ Product not found in dispatch`, {prodIdStr, prodName, dispatchDate: dispatchDetails?.dispatch_date});
          toast.error(`❌ Error: ${prodName} was not dispatched to this rider on this date`);
          return;
        }

        // Check if return quantity exceeds dispatched
        if (r.quantity_returned > allowed) {
          const over = r.quantity_returned - allowed;
          toast.error(`⚠️ ${prodName}: Cannot return ${r.quantity_returned} (only ${allowed} were dispatched). That's ${over} too many.`);
          return;
        }

        // Check if return quantity is valid (not negative)
        if (r.quantity_returned < 0) {
          toast.error(`⚠️ Return quantity cannot be negative`);
          return;
        }
      }

      const payload = { 
        dispatch_id: Number(selectedDispatch), 
        return_date: new Date().toISOString().slice(0,10), 
        products: productsToReturn 
      } as any;
      
      const res = await recordRouteReturn(payload);
      if (!res.success) throw new Error(res.error?.message || 'Failed to save returns');
      
      // Success! Show user friendly message
      const dispatchDate = new Date(dispatchDetails.dispatch_date).toLocaleDateString();
      toast.success(`✅ Returns recorded successfully for ${dispatchDate}`);
      
      // Remove this rider's dispatches for today (24-hour rule: can only record returns once per day)
      setDispatches((prev) => prev.filter((d: any) => {
        const sameRider = String(d.rider_id) === selectedRiderId;
        const sameDate = new Date(d.dispatch_date).toLocaleDateString() === new Date(dispatchDetails.dispatch_date).toLocaleDateString();
        return !(sameRider && sameDate); // Filter out dispatches from same rider/date that had returns recorded
      }));
      
      // Reset form
      setSelectedRiderId('');
      setSelectedDispatch('');
      setReturns({});
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to record returns');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-8 h-8 text-green-600" />
                Bread Returns to Finance
              </h1>
              <p className="text-sm text-gray-600 mt-2">Record returned bread from routes - only "Good" items count as money</p>
            </div>
            <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading riders and dispatches...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              {/* Rider & Dispatch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Route Rider</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" 
                    value={selectedRiderId} 
                    onChange={(e) => {
                      setSelectedRiderId(e.target.value);
                      setSelectedDispatch('');
                      setReturns({});
                    }}
                  >
                    <option value="">-- Choose a route rider --</option>
                    {riders.map((rider: any) => (
                      <option key={rider.id} value={String(rider.id)}>
                        {rider.nickname || rider.full_name || `Rider #${rider.id}`} {rider.phone ? `(${rider.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRiderId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Dispatch</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" 
                      value={selectedDispatch} 
                      onChange={(e) => { 
                        setSelectedDispatch(e.target.value); 
                        setReturns({}); 
                        const details = dispatchDetailsCache[e.target.value];
                        if (details?.products) {
                          const init: Record<string, any> = {};
                          details.products.forEach((dp: any) => {
                            const pid = String(dp.product_id || dp.id);
                            init[pid] = { quantity_returned: 0, reason: 'good' };
                          });
                          setReturns(init);
                        }
                      }}
                    >
                      <option value="">-- Choose a dispatch --</option>
                      {dispatches.filter((d: any) => String(d.rider_id) === selectedRiderId).map((d: any) => (
                        <option key={d.id} value={String(d.id)}>
                          {new Date(d.dispatch_date).toLocaleDateString()} - Status: {d.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              {selectedDispatch && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <div className="flex gap-2">
                    <Zap className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>💰 Money Returns:</strong> Only items marked as "Good" will be recorded as money owed by the rider.
                      <br />
                      <strong>🔄 Loss Returns:</strong> Expired, unsold, or damaged items are recorded as returns, with no payment obligation.
                    </div>
                  </div>
                </div>
              )}

              {/* Return Quantities */}
              {selectedDispatch && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Return Quantities by Product</h3>
                    {(() => {
                      const dispatchDetails = dispatchDetailsCache[selectedDispatch];
                      const dispatchProducts = dispatchDetails?.products || [];
                      
                      if (dispatchProducts.length === 0) {
                        return <p className="text-sm text-gray-500 py-4 text-center">No products found in this dispatch</p>;
                      }

                      return (
                        <div className="space-y-3">
                          {dispatchProducts.map((dp: any) => {
                            // IMPORTANT: Always use STRING keys for consistent state access
                            const productId = String(dp.product_id || dp.id);
                            if (productId === 'NaN' || productId === 'undefined') {
                              console.error('❌ Invalid product ID in dispatch products:', {dp, allProducts: dispatchProducts});
                              return null;
                            }
                            const productName = dp.product?.name || `Product #${productId}`;
                            const quantityDispatched = dp.quantity_dispatched || dp.quantity || 0;
                            const reason = returns[productId]?.reason || 'good';
                            const isMoneyReturn = reason === 'good';
                            const qty = returns[productId]?.quantity_returned || 0;
                            
                            return (
                              <div key={productId} className={`p-4 rounded-lg border-2 transition-all ${isMoneyReturn && qty > 0 ? 'border-green-300 bg-green-50' : qty > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start md:items-center">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{productName}</p>
                                    <p className="text-xs text-gray-600 mt-1">📦 Dispatched: {quantityDispatched} units</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">Quantity Returned</label>
                                    <input 
                                      type="number" 
                                      min={0} 
                                      max={quantityDispatched} 
                                      value={qty} 
                                      onChange={(e) => handleReturnChange(productId, 'quantity_returned', e.target.value)} 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                                    />
                                    {qty > quantityDispatched && <p className="text-xs text-red-600 mt-1">⚠️ Exceeds dispatched amount</p>}
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">Condition</label>
                                    <select 
                                      value={reason} 
                                      onChange={(e) => handleReturnChange(productId, 'reason', e.target.value)} 
                                      className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm font-medium ${isMoneyReturn ? 'border-green-300 bg-green-50 text-green-900' : 'border-red-300 bg-red-50 text-red-900'}`}
                                    >
                                      <option value="good" className="text-gray-900 bg-white">✓ Good (Money)</option>
                                      <option value="expired" className="text-gray-900 bg-white">✗ Expired (Loss)</option>
                                      <option value="unsold" className="text-gray-900 bg-white">📦 Unsold (Loss)</option>
                                      <option value="damaged" className="text-gray-900 bg-white">💥 Damaged (Loss)</option>
                                    </select>
                                  </div>
                                </div>
                                {qty > 0 && (
                                  <div className="mt-3 flex gap-2 flex-wrap">
                                    {isMoneyReturn ? (
                                      <div className="text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded-full">💰 Money Owed: {qty} units</div>
                                    ) : (
                                      <div className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-full">🔄 Loss Return: {qty} units</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t mt-8">
                    <button 
                      onClick={handleSaveReturns} 
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-base"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Returns</span>
                    </button>
                    <button 
                      onClick={() => { setSelectedDispatch(''); setReturns({}); }} 
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </>
              )}

              {/* Empty State */}
              {!selectedDispatch && selectedRiderId && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a dispatch to start recording returns</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
