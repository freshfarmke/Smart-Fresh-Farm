'use client';

import { Package, Clock, RefreshCw } from 'lucide-react';

interface StockCardProps {
  title: string;
  quantity: number;
  isAutoFilled?: boolean;
}

export function ShopStockCard({ title, quantity, isAutoFilled = true }: StockCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{quantity} units</p>
        </div>
        {isAutoFilled && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
            Auto-filled
          </span>
        )}
      </div>
    </div>
  );
}
