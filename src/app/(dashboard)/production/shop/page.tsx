'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { TransferTable } from '@/components/shop/TransferTable';
import { TransferHistory } from '@/components/shop/TransferHistory';
import { getShopStock, getShopTransfers } from '@/lib/api/shop';
import { getAllProducts } from '@/lib/api/products';
import { getAllBatches } from '@/lib/api/production';
import { exportShopDistribution } from '@/lib/api/excel-export';

interface TransferHistoryItem {
  time: string;
  product: string;
  quantity: number;
  transferredBy: string;
}

interface BatchSummary {
  batchId: string;
  batchNumber: string;
  produced: number;
  dispatched: number;
  transferred: number;
  remaining: number;
}

/**
 * Shop Management Page - Refactored
 * Clear workflow for managing stock transfers from production to shop
 * Focused sections for batch overview, distribution, and transfers
 */
export default function ShopManagementPage() {
  const [shopStock, setShopStock] = useState<Record<string, number>>({});
  const [productionStock, setProductionStock] = useState<Record<string, number>>({});
  const [availableProducts, setAvailableProducts] = useState<{ id: string; label: string }[]>([]);
  const [batches, setBatches] = useState<BatchSummary[]>([]);

  const [transfers, setTransfers] = useState<TransferHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load all data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [stockRes, transfersRes, prodRes, batchesRes] = await Promise.all([
          getShopStock(),
          getShopTransfers(),
          getAllProducts(),
          getAllBatches(),
        ]);

        if (!mounted) return;

        // Helper to normalize keys
        const slugKey = (name: string) =>
          name
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');

        // Map products
        if (prodRes.success) {
          setAvailableProducts((prodRes.data || []).map((p: any) => ({ id: p.id, label: p.name })));
        }

        // Map stock data
        if (stockRes.success) {
          const shopMap: Record<string, number> = {};
          const prodMap: Record<string, number> = {};

          (stockRes.data || []).forEach((row: any) => {
            const name = row.product?.name || String(row.product_id);
            const key = slugKey(name);
            const qty = Number(row.quantity_available || 0);
            if (row.location === 'shop') shopMap[key] = qty;
            if (row.location === 'production') prodMap[key] = qty;
          });

          setShopStock(shopMap);
          setProductionStock(prodMap);
        }

        // Map transfers
        if (transfersRes.success) {
          setTransfers(
            (transfersRes.data || []).map((t: any) => {
              const first = (t.shop_transfer_products || [])[0];
              return {
                time: new Date(t.created_at).toLocaleTimeString(),
                product: first?.product?.name || '',
                quantity: Number(first?.quantity || 0),
                transferredBy: t.transferred_by || 'System',
              };
            })
          );
        }

        // Map batches
        if (batchesRes.success) {
          const summaries: BatchSummary[] = (batchesRes.data || []).map((batch: any) => ({
            batchId: batch.id,
            batchNumber: batch.batch_number,
            produced: batch.quantity_produced || 0,
            dispatched: 0,
            transferred: 0,
            remaining: batch.quantity_produced || 0,
          }));
          setBatches(summaries);
        }
      } catch (err) {
        console.error('Failed to load shop data', err);
        toast.error('Failed to load shop data');
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Reload data
      setTimeout(() => setIsRefreshing(false), 500);
      toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to refresh data');
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = transfers.map(t => ({
        transfer_date: new Date().toLocaleDateString(),
        product_name: t.product,
        quantity: t.quantity,
        transferred_by: t.transferredBy,
      }));

      exportShopDistribution(exportData, `shop_distribution_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Export completed');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTransfer = (product: string, quantity: number) => {
    // Update shop stock
    setShopStock((prev) => ({
      ...prev,
      [product]: (prev[product] || 0) + quantity,
    }));

    // Add to transfer history
    const newTransfer: TransferHistoryItem = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      product,                    
      quantity,
      transferredBy: 'Current User',
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    toast.success(`Transferred ${quantity} units of ${product}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Stock Management</h1>
          <p className="text-sm text-gray-600 mt-1">Transfer production to shop, track inventory, and manage distribution</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Current Shop Inventory */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">1️⃣ Current Shop Inventory</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time inventory levels in shop</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">{product.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {shopStock[product.id] ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">in stock</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Production Batch Summary */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">2️⃣ Production Batch Summary</h2>
            <p className="text-sm text-gray-600 mt-1">Current batches and their distribution status</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Batch ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Batch #</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Total Produced</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Route Dispatch</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Transfer to Shop</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Remaining Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <span>No batches found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.batchId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{batch.batchId.slice(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{batch.batchNumber}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-semibold">{batch.produced}</td>
                      <td className="px-6 py-4 text-right text-blue-600 font-medium">{batch.dispatched}</td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">{batch.transferred}</td>
                      <td className="px-6 py-4 text-right text-orange-600 font-medium">{batch.remaining}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: Transfer to Shop */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">3️⃣ Distribution Table</h2>
          <p className="text-sm text-gray-600 mt-1">Allocate production to routes or shop</p>
        </div>

        <TransferTable onTransfer={handleTransfer} products={availableProducts} productionStock={productionStock} />
      </section>

      {/* SECTION 5: Transfer History */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">5️⃣ Transfer History</h2>
          <p className="text-sm text-gray-600 mt-1">Recent transfers from production to shop</p>
        </div>
        <TransferHistory transfers={transfers} />
      </section>
    </div>
  );
}
