'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { ShopStockCard } from '@/components/shop/StockCard';
import { TransferTable } from '@/components/shop/TransferTable';
import { StockSummary } from '@/components/shop/StockSummary';
import { TransferHistory } from '@/components/shop/TransferHistory';

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
  const [shopStock, setShopStock] = useState({
    bread: 245,
    queenCakes: 89,
    buns: 156,
  });

  const [transfers, setTransfers] = useState<TransferHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setShopStock((prev) => ({
        bread: Math.max(50, prev.bread + Math.floor(Math.random() * 5) - 2),
        queenCakes: Math.max(30, prev.queenCakes + Math.floor(Math.random() * 3) - 1),
        buns: Math.max(40, prev.buns + Math.floor(Math.random() * 4) - 1),
      }));
    }, 30000);

    return () => clearInterval(interval);
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
            <ShopStockCard title="Opening Bread Stock" quantity={shopStock.bread} />
            <ShopStockCard title="Opening Queen Cake Stock" quantity={shopStock.queenCakes} />
            <ShopStockCard title="Opening Buns Stock" quantity={shopStock.buns} />
          </div>
        </div>
      </div>

      {/* Transfer From Production Table */}
      <TransferTable onTransfer={handleTransfer} />

      {/* Stock Summary */}
      <StockSummary
        bread={shopStock.bread}
        queenCakes={shopStock.queenCakes}
        buns={shopStock.buns}
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
