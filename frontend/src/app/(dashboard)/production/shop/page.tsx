'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { ShopStockCard } from '@/components/shop/StockCard';
import { TransferTable } from '@/components/shop/TransferTable';
import { StockSummary } from '@/components/shop/StockSummary';
import { TransferHistory } from '@/components/shop/TransferHistory';
import { getShopStock, getShopTransfers } from '@/lib/api/shop';
import { getAllProducts } from '@/lib/api/products';

interface TransferHistoryItem {
  time: string;
  product: string;
  quantity: number;
  transferredBy: string;
}

/**
 * Shop Management Page
 * Manages stock transfers from production to shop
 */
export default function ShopManagementPage() {
  const [shopStock, setShopStock] = useState<Record<string, number>>({});
  const [productionStock, setProductionStock] = useState<Record<string, number>>({});
  const [availableProducts, setAvailableProducts] = useState<{ id: string; label: string }[]>([]);

  const [transfers, setTransfers] = useState<TransferHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load shop and production stock + products
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [stockRes, transfersRes, prodRes] = await Promise.all([getShopStock(), getShopTransfers(), getAllProducts()]);

        if (!mounted) return;

        // helper to create a stable key from product name
        const slugKey = (name: string) =>
          name
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');

        // map products
        if (prodRes.success) {
          setAvailableProducts((prodRes.data || []).map((p:any) => ({ id: slugKey(p.name), label: p.name })));
        }

        if (stockRes.success) {
          // build shop and production stock maps keyed by normalized product name
          const shopMap: Record<string, number> = {};
          const prodMap: Record<string, number> = {};

          (stockRes.data || []).forEach((row:any) => {
            const name = row.product?.name || String(row.product_id);
            const key = slugKey(name);
            const qty = Number(row.quantity_available || 0);
            if (row.location === 'shop') shopMap[key] = qty;
            if (row.location === 'production') prodMap[key] = qty;
          });

          setShopStock(shopMap);
          setProductionStock(prodMap);
        }

        if (transfersRes.success) {
          // map transfers to UI shape using nested products when available
          setTransfers((transfersRes.data || []).map((t:any) => {
            const first = (t.shop_transfer_products || [])[0];
            return {
              time: new Date(t.created_at).toLocaleTimeString(),
              product: first?.product?.name || '',
              quantity: Number(first?.quantity || 0),
              transferredBy: '',
            };
          }));
        }
      } catch (err) {
        console.error('Failed to load shop data', err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setShopStock({
        bread: Math.floor(Math.random() * 100) + 200,
        queenCakes: Math.floor(Math.random() * 50) + 75,
        buns: Math.floor(Math.random() * 80) + 140,
      });
      setIsRefreshing(false);
    }, 500);
  };

  const handleTransfer = (product: string, quantity: number) => {
    // Update shop stock
    setShopStock((prev) => ({
      ...prev,
      [product]: prev[product as keyof typeof prev] + quantity,
    }));

    // Add to transfer history
    const productLabels: Record<string, string> = {
      bread: 'Bread',
      queenCakes: 'Queen Cakes',
      buns: 'Buns',
    };

    const newTransfer: TransferHistoryItem = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      product: productLabels[product],
      quantity,
      transferredBy: 'Current User',
    };

    setTransfers((prev) => [newTransfer, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Stock Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage daily stock transfer to shop</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Opening Shop Stock Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Opening Shop Stock</h2>
          <p className="text-sm text-gray-600 mt-1">Current inventory levels in shop</p>
        </div>

        <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const desired = ['Bread', 'Queen Cakes', 'Buns', 'Mavin'];
                const items = desired.map((label) => {
                  const key = label.toString().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                  return { key, label };
                });

                // render up to 3-4 prioritized items; fallback to availableProducts if missing
                return items.slice(0, 4).map((it) => (
                  <ShopStockCard key={it.key} title={`Opening ${it.label} Stock`} quantity={shopStock[it.key] ?? 0} />
                ));
              })()}
            </div>
        </div>
      </div>

      {/* Transfer From Production Table */}
        <TransferTable onTransfer={handleTransfer} products={availableProducts} productionStock={productionStock} />

      {/* Stock Summary */}
      <StockSummary
        bread={shopStock['bread'] ?? 0}
        queenCakes={shopStock['queencakes'] ?? 0}
        buns={shopStock['buns'] ?? 0}
        mavin={shopStock['mavin'] ?? 0}
      />

      {/* Transfer History */}
      <TransferHistory transfers={transfers} />

      {/* Quick Actions Footer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Create Transfer Batch
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            View Stock Reports
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Adjust Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
