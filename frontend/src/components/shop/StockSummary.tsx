'use client';

import { Clock } from 'lucide-react';

interface StockSummaryProps {
  bread: number;
  queenCakes: number;
  buns: number;
  mavin?: number;
}

export function StockSummary({ bread, queenCakes, buns, mavin = 0 }: StockSummaryProps) {
  const summaries = [
    { label: 'Total Bread in Shop', value: bread },
    { label: 'Total Queen Cakes in Shop', value: queenCakes },
    { label: 'Total Buns in Shop', value: buns },
    { label: 'Total Mavin in Shop', value: mavin },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Current Shop Stock Summary</h3>
        <p className="text-sm text-gray-600 mt-1">Real-time inventory levels</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border border-amber-200"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-semibold text-amber-900">{item.label}</p>
                <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs font-semibold rounded">
                  Live
                </span>
              </div>
              <p className="text-4xl font-bold text-amber-900">{item.value}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-amber-700">
                <Clock className="w-4 h-4" />
                <span>Updated now</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
