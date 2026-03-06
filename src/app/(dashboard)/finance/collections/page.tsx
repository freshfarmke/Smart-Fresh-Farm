'use client';

import { useEffect, useState } from 'react';
import { Save, ArrowLeft, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAllRouteRiders, getAllDispatches, getDispatchWithProducts } from '@/lib/api/routes';

/**
 * Finance: Collections Page - Multi-source Collections
 * Records money collected from:
 * 1. Route Riders (dispatches) - shows products from their dispatch
 * 2. Shop (transfers + good returns) - shows transferred items + good returns from riders
 * 3. Institutions (previous purchases) - shows only products previously purchased by that institution
 */
export default function CollectionsPage() {
  const router = useRouter();

  // Source type state
  const [sourceType, setSourceType] = useState<'rider' | 'shop' | 'institution'>('rider');

  // Shared form state
  const [collectionDate, setCollectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amountCollected, setAmountCollected] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Rider source data
  const [riders, setRiders] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [selectedDispatchId, setSelectedDispatchId] = useState<string>('');
  const [dispatchDetailsCache, setDispatchDetailsCache] = useState<Record<string, any>>({});
  const [productsSold, setProductsSold] = useState<Record<string, { quantity_sold: number }>>({});

  // Shop source data
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [shopProductsSold, setShopProductsSold] = useState<Record<string, { quantity_sold: number }>>({});

  // Institution source data
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [institutionData, setInstitutionData] = useState<{ name?: string; phone?: string; contact_person?: string } | null>(null);
  const [institutionProducts, setInstitutionProducts] = useState<any[]>([]);
  const [institutionProductsSold, setInstitutionProductsSold] = useState<Record<string, { quantity_sold: number }>>({});

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recentCollections, setRecentCollections] = useState<any[]>([]);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Load all data
  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load riders and dispatches for rider collections
      const ridersRes = await getAllRouteRiders();
      if (ridersRes.success) setRiders(ridersRes.data || []);

      const dispatchesRes = await getAllDispatches();
      if (dispatchesRes.success) {
        setDispatches(dispatchesRes.data || []);

        // Pre-cache dispatch details for rider collections
        const cache: Record<string, any> = {};
        for (const d of dispatchesRes.data || []) {
          const details = await getDispatchWithProducts(String(d.id));
          if (details.success) {
            cache[String(d.id)] = details.data;
          }
        }
        setDispatchDetailsCache(cache);
      }

      // Load shop products (transfers + good returns)
      await loadShopProducts();

      // Load institutions
      await loadInstitutions();

      // Load recent collections
      await loadRecentCollections();
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load shop products (transfers + good returns)
  const loadShopProducts = async () => {
    try {
      const { supabase } = await import('@/lib/supabase/client');

      // Get shop transfers
      const { data: transfers } = await supabase
        .from('shop_transfer_products')
        .select('*, transfer:shop_transfers(*), product:products(*)')
        .order('created_at', { ascending: false });

      // Get good returns from riders
      const { data: goodReturns } = await supabase
        .from('route_return_products')
        .select('*, return:route_returns(*), product:products(*)')
        .eq('condition', 'good')
        .order('created_at', { ascending: false });

      // Combine and deduplicate products
      const productsMap = new Map();

      // Add transferred products
      (transfers || []).forEach((t: any) => {
        const prodId = String(t.product_id);
        if (!productsMap.has(prodId)) {
          productsMap.set(prodId, {
            product_id: prodId,
            product_name: t.product?.name,
            retail_price: t.product?.retail_price,
            quantity_available: t.quantity_transferred,
            source: 'transfer',
          });
        } else {
          // Add to existing quantity
          productsMap.get(prodId).quantity_available += t.quantity_transferred;
        }
      });

      // Add good returns
      (goodReturns || []).forEach((r: any) => {
        const prodId = String(r.product_id);
        if (!productsMap.has(prodId)) {
          productsMap.set(prodId, {
            product_id: prodId,
            product_name: r.product?.name,
            retail_price: r.product?.retail_price,
            quantity_available: r.quantity_returned,
            source: 'return',
          });
        } else {
          // Add to existing quantity
          productsMap.get(prodId).quantity_available += r.quantity_returned;
        }
      });

      const allProducts = Array.from(productsMap.values());
      setShopProducts(allProducts);

      // Initialize products sold
      const initial: Record<string, { quantity_sold: number }> = {};
      allProducts.forEach((p: any) => {
        initial[String(p.product_id)] = { quantity_sold: 0 };
      });
      setShopProductsSold(initial);
    } catch (err) {
      console.error('Failed to load shop products:', err);
    }
  };

  // Load institutions
  const loadInstitutions = async () => {
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data } = await supabase
        .from('institutions')
        .select('*')
        .order('name');

      setInstitutions(data || []);
    } catch (err) {
      console.error('Failed to load institutions:', err);
    }
  };

  // Load institution's previous purchase history
  const loadInstitutionProducts = async (institutionId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase/client');

      // Get institution details
      const { data: inst } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single();

      if (inst) {
        setInstitutionData({
          name: inst.name,
          phone: inst.phone,
          contact_person: inst.contact_person,
        });
      }

      // Get institution's previous purchases from unified collections table
      const { data: previousCollections } = await supabase
        .from('collection_products')
        .select(`
          *,
          collection:collections(source_id, source_type),
          product:products(id, name, retail_price)
        `)
        .eq('collection.source_id', institutionId)
        .eq('collection.source_type', 'institution');

      // Extract unique products from purchase history
      const productsMap = new Map();
      previousCollections?.forEach((pc: any) => {
        if (!productsMap.has(String(pc.product_id))) {
          productsMap.set(String(pc.product_id), {
            product_id: pc.product_id,
            product_name: pc.product?.name,
            retail_price: pc.product?.retail_price,
          });
        }
      });

      const previousProducts = Array.from(productsMap.values());
      setInstitutionProducts(previousProducts);

      // Initialize products sold
      const initial: Record<string, { quantity_sold: number }> = {};
      previousProducts.forEach((p: any) => {
        initial[String(p.product_id)] = { quantity_sold: 0 };
      });
      setInstitutionProductsSold(initial);
    } catch (err) {
      console.error('Failed to load institution products:', err);
    }
  };

  // Load recent collections from unified table
  const loadRecentCollections = async () => {
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data } = await supabase
        .from('v_collections_detail')
        .select('*')
        .order('collection_date', { ascending: false })
        .limit(20);

      setRecentCollections(data || []);
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  };

  // Handle source type change
  const handleSourceTypeChange = (newSourceType: 'rider' | 'shop' | 'institution') => {
    setSourceType(newSourceType);
    resetForm();

    // Load source-specific data
    if (newSourceType === 'shop') {
      // Shop products already loaded in loadData
    } else if (newSourceType === 'institution') {
      // Will load when institution is selected
    }
  };

  // Handle dispatch selection for rider source
  const handleDispatchChange = (dispatchId: string) => {
    setSelectedDispatchId(dispatchId);
    setProductsSold({});

    const details = dispatchDetailsCache[dispatchId];
    if (details?.products) {
      const initial: Record<string, { quantity_sold: number }> = {};
      details.products.forEach((dp: any) => {
        const prodId = String(dp.product_id || dp.id);
        initial[prodId] = { quantity_sold: 0 };
      });
      setProductsSold(initial);
    }
  };

  // Handle institution selection
  const handleInstitutionChange = (institutionId: string) => {
    setSelectedInstitutionId(institutionId);
    setInstitutionProducts([]);
    setInstitutionProductsSold({});

    if (institutionId) {
      loadInstitutionProducts(institutionId);
    } else {
      setInstitutionData(null);
    }
  };

  // Handle save collection to unified table
  const handleSaveCollection = async () => {
    try {
      if (!amountCollected || parseFloat(amountCollected) <= 0) {
        toast.error('Enter a valid amount collected');
        return;
      }

      if (!paymentMethod) {
        toast.error('Select a payment method');
        return;
      }

      let sourceId: string | null = null;
      let dispatchId: string | null = null;
      let productsToSave: any[] = [];

      // Validate and prepare data based on source type
      if (sourceType === 'rider') {
        if (!selectedDispatchId) {
          toast.error('Select a dispatch');
          return;
        }

        const dispatchDetails = dispatchDetailsCache[selectedDispatchId];
        if (!dispatchDetails) {
          toast.error('Dispatch details not found');
          return;
        }

        sourceId = dispatchDetails.rider_id;
        dispatchId = selectedDispatchId;

        // Get products from dispatch
        productsToSave = Object.entries(productsSold)
          .filter(([, v]) => v.quantity_sold > 0)
          .map(([product_id, v]) => ({
            product_id,
            quantity_sold: v.quantity_sold,
            unit_price: dispatchDetails.products?.find((p: any) => String(p.product_id || p.id) === product_id)?.product?.retail_price || 0,
          }));

      } else if (sourceType === 'shop') {
        // Shop collections don't have a specific source_id
        sourceId = null;
        dispatchId = null;

        productsToSave = Object.entries(shopProductsSold)
          .filter(([, v]) => v.quantity_sold > 0)
          .map(([product_id, v]) => ({
            product_id,
            quantity_sold: v.quantity_sold,
            unit_price: shopProducts.find((p: any) => String(p.product_id) === product_id)?.retail_price || 0,
          }));

      } else if (sourceType === 'institution') {
        if (!selectedInstitutionId) {
          toast.error('Select an institution');
          return;
        }

        sourceId = selectedInstitutionId;
        dispatchId = null;

        productsToSave = Object.entries(institutionProductsSold)
          .filter(([, v]) => v.quantity_sold > 0)
          .map(([product_id, v]) => ({
            product_id,
            quantity_sold: v.quantity_sold,
            unit_price: institutionProducts.find((p: any) => String(p.product_id) === product_id)?.retail_price || 0,
          }));
      }

      if (productsToSave.length === 0) {
        toast.error('Enter quantities sold for at least one product');
        return;
      }

      setIsSaving(true);

      // Save to unified collections table
      const { supabase } = await import('@/lib/supabase/client');

      // Create collection record
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert([{
          source_type: sourceType,
          source_id: sourceId,
          dispatch_id: dispatchId,
          collection_date: collectionDate,
          amount_collected: parseFloat(amountCollected),
          payment_method: paymentMethod,
          notes: notes || null,
        }])
        .select()
        .single();

      if (collectionError) throw collectionError;

      // Insert collection products
      const collectionProducts = productsToSave.map((p) => ({
        collection_id: collection.id,
        product_id: p.product_id,
        quantity_sold: p.quantity_sold,
        unit_price: p.unit_price,
      }));

      const { error: productsError } = await supabase
        .from('collection_products')
        .insert(collectionProducts);

      if (productsError) throw productsError;

      toast.success(`✅ Collection of KSh ${amountCollected} recorded`);
      resetForm();
      loadRecentCollections();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to record collection');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedRiderId('');
    setSelectedDispatchId('');
    setAmountCollected('');
    setPaymentMethod('');
    setNotes('');
    setProductsSold({});
    setShopProductsSold({});
    setInstitutionProductsSold({});
    setSelectedInstitutionId('');
    setInstitutionData(null);
    setInstitutionProducts([]);
    setCollectionDate(new Date().toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  const filteredDispatches = dispatches.filter((d: any) => String(d.rider_id) === selectedRiderId);
  const dispatchDetails = dispatchDetailsCache[selectedDispatchId];
  const dispatchProducts = dispatchDetails?.products || [];

  const calculateExpectedRevenue = () => {
    if (sourceType === 'rider') {
      let total = 0;
      dispatchProducts.forEach((dp: any) => {
        const prodId = String(dp.product_id || dp.id);
        const product = dp.product;
        const quantitySold = productsSold[prodId]?.quantity_sold || 0;
        if (product?.retail_price) {
          total += quantitySold * product.retail_price;
        }
      });
      return total;
    } else if (sourceType === 'shop') {
      let total = 0;
      shopProducts.forEach((p: any) => {
        const quantitySold = shopProductsSold[String(p.product_id)]?.quantity_sold || 0;
        total += quantitySold * (p.retail_price || 0);
      });
      return total;
    } else if (sourceType === 'institution') {
      let total = 0;
      institutionProducts.forEach((p: any) => {
        const quantitySold = institutionProductsSold[String(p.product_id)]?.quantity_sold || 0;
        total += quantitySold * (p.retail_price || 0);
      });
      return total;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-orange-600" />
                Collections
              </h1>
              <p className="text-sm text-gray-600 mt-2">Record money collected from route riders, shops, and institutions</p>
            </div>
            <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collection Receipt Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">New Collection Receipt</h2>

              {/* Source Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Collection Source</label>
                <div className="space-y-2">
                  {([
                    { key: 'rider', label: 'Route Rider', desc: 'Products from rider dispatches' },
                    { key: 'shop', label: 'Shop', desc: 'Transferred items + good returns' },
                    { key: 'institution', label: 'Institution', desc: 'Previously purchased products' }
                  ] as const).map((type) => (
                    <label key={type.key} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => handleSourceTypeChange(type.key)}>
                      <input type="radio" name="sourceType" value={type.key} checked={sourceType === type.key} onChange={() => {}} className="w-4 h-4 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{type.label}</span>
                        <p className="text-xs text-gray-600">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rider Source */}
              {sourceType === 'rider' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Rider</label>
                    <select value={selectedRiderId} onChange={(e) => {
                      setSelectedRiderId(e.target.value);
                      setSelectedDispatchId('');
                      setProductsSold({});
                    }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">-- Select a rider --</option>
                      {riders.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.nickname || r.full_name || `Rider #${r.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRiderId && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Select Dispatch</label>
                      <select value={selectedDispatchId} onChange={(e) => handleDispatchChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">-- Select a dispatch --</option>
                        {filteredDispatches.map((d) => (
                          <option key={d.id} value={String(d.id)}>
                            {new Date(d.dispatch_date).toLocaleDateString()} - {d.status}
                          </option>
                        ))}
                      </select>
                      {filteredDispatches.length === 0 && (
                        <p className="text-xs text-red-600">No dispatches found for this rider</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Institution Source */}
              {sourceType === 'institution' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Institution</label>
                    <select value={selectedInstitutionId} onChange={(e) => handleInstitutionChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">-- Select an institution --</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={String(inst.id)}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {institutionData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">{institutionData.name}</p>
                      {institutionData.contact_person && (
                        <p className="text-xs text-blue-700">Contact: {institutionData.contact_person}</p>
                      )}
                      {institutionData.phone && (
                        <p className="text-xs text-blue-700">Phone: {institutionData.phone}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Amount & Payment */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amount Collected (KSh)</label>
                <input type="number" value={amountCollected} onChange={(e) => setAmountCollected(e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">-- Select method --</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Collection Date</label>
                <input type="date" value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>

              <button onClick={handleSaveCollection} disabled={isSaving || (sourceType === 'rider' && !selectedDispatchId) || (sourceType === 'institution' && !selectedInstitutionId)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Collection'}
              </button>
            </div>
          </div>

          {/* Products & Receipt Display */}
          <div className="lg:col-span-2 space-y-8">
            {/* Products Section (Rider) */}
            {sourceType === 'rider' && selectedDispatchId && (
              <ReceiptSection
                title="Products from Dispatch"
                products={dispatchProducts}
                productsSold={productsSold}
                onQuantityChange={(productId: string, qty: number) => setProductsSold((prev) => ({...prev, [productId]: { quantity_sold: Math.max(0, qty) }}))}
                expectedRevenue={calculateExpectedRevenue()}
                showDispatched={true}
              />
            )}

            {/* Products Section (Shop) */}
            {sourceType === 'shop' && (
              <ShopProductsSection
                products={shopProducts}
                productsSold={shopProductsSold}
                onQuantityChange={(productId: string, qty: number) => setShopProductsSold((prev) => ({...prev, [productId]: { quantity_sold: Math.max(0, qty) }}))}
                expectedRevenue={calculateExpectedRevenue()}
              />
            )}

            {/* Products Section (Institution) */}
            {sourceType === 'institution' && selectedInstitutionId && institutionProducts.length > 0 && (
              <InstitutionProductsSection
                title={`Products previously purchased by ${institutionData?.name || 'Institution'}`}
                products={institutionProducts}
                productsSold={institutionProductsSold}
                onQuantityChange={(productId: string, qty: number) => setInstitutionProductsSold((prev) => ({...prev, [productId]: { quantity_sold: Math.max(0, qty) }}))}
                expectedRevenue={calculateExpectedRevenue()}
              />
            )}

            {/* Institution No Products Message */}
            {sourceType === 'institution' && selectedInstitutionId && institutionProducts.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Institution Products</h3>
                <p className="text-sm text-gray-600">This institution hasn't purchased any products yet. You can still record a collection, but no specific products will be shown.</p>
              </div>
            )}

            {/* Recent Collections */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Collections</h3>

              {recentCollections.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No collections recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">Source</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentCollections.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="py-3 px-3 text-gray-900">{new Date(c.collection_date).toLocaleDateString()}</td>
                          <td className="py-3 px-3 text-gray-700">
                            {c.source_type === 'rider' && (c.rider_name || c.rider_nickname || 'Rider')}
                            {c.source_type === 'shop' && 'Shop'}
                            {c.source_type === 'institution' && (c.institution_name || 'Institution')}
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-900">KSh {c.amount_collected.toLocaleString()}</td>
                          <td className="py-3 px-3 text-gray-600 capitalize">{c.payment_method || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= SUB-COMPONENTS =============

function ReceiptSection({ title, products, productsSold, onQuantityChange, expectedRevenue, showDispatched = false }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">No products available</p>
      ) : (
        <div className="space-y-3">
          {products.map((dp: any) => {
            const productId = String(dp.product_id || dp.id);
            const product = dp.product || dp;
            const quantitySold = productsSold[productId]?.quantity_sold || 0;
            const revenue = quantitySold * (product?.retail_price || 0);
            const maxQuantity = showDispatched ? dp.quantity_dispatched : undefined;

            return (
              <div key={productId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">● {product?.name || `Product #${productId}`}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Price: KSh {product?.retail_price || 0}
                      {showDispatched && ` | Dispatched: ${dp.quantity_dispatched} units`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">KSh {revenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={maxQuantity}
                    value={quantitySold}
                    onChange={(e) => onQuantityChange(productId, parseInt(e.target.value) || 0)}
                    placeholder="Units sold"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  {showDispatched && (
                    <span className="text-xs text-gray-600 whitespace-nowrap">{quantitySold} / {dp.quantity_dispatched}</span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="border-t-2 border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">Expected Revenue Total:</p>
              <p className="text-xl font-bold text-orange-600">KSh {expectedRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopProductsSection({ products, productsSold, onQuantityChange, expectedRevenue }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Products (Transfers + Good Returns)</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">No products available in shop</p>
      ) : (
        <div className="space-y-3">
          {products.map((product: any) => {
            const productId = String(product.product_id);
            const quantitySold = productsSold[productId]?.quantity_sold || 0;
            const revenue = quantitySold * (product.retail_price || 0);

            return (
              <div key={productId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">● {product.product_name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Price: KSh {product.retail_price || 0} |
                      Available: {product.quantity_available} units |
                      Source: {product.source}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">KSh {revenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={product.quantity_available}
                    value={quantitySold}
                    onChange={(e) => onQuantityChange(productId, parseInt(e.target.value) || 0)}
                    placeholder="Units sold"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <span className="text-xs text-gray-600 whitespace-nowrap">{quantitySold} / {product.quantity_available}</span>
                </div>
              </div>
            );
          })}

          <div className="border-t-2 border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">Expected Revenue Total:</p>
              <p className="text-xl font-bold text-orange-600">KSh {expectedRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InstitutionProductsSection({ title, products, productsSold, onQuantityChange, expectedRevenue }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">No previous purchases found for this institution</p>
      ) : (
        <div className="space-y-3">
          {products.map((product: any) => {
            const productId = String(product.product_id);
            const quantitySold = productsSold[productId]?.quantity_sold || 0;
            const revenue = quantitySold * (product.retail_price || 0);

            return (
              <div key={productId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">● {product.product_name}</p>
                    <p className="text-xs text-gray-600 mt-1">Price: KSh {product.retail_price || 0} | Previously purchased by institution</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">KSh {revenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={quantitySold}
                    onChange={(e) => onQuantityChange(productId, parseInt(e.target.value) || 0)}
                    placeholder="Units sold"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>
            );
          })}

          <div className="border-t-2 border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">Expected Revenue Total:</p>
              <p className="text-xl font-bold text-orange-600">KSh {expectedRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
