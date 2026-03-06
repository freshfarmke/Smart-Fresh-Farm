'use client';

import { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';


interface TransferTableProps {
  onTransfer?: (productKey: string, quantity: number) => void;
  products: { id: string; label: string }[];
  productionStock: Record<string, number>;
}

export function TransferTable({ onTransfer, products, productionStock }: TransferTableProps) {
  const [transferQuantities, setTransferQuantities] = useState<Record<string, number>>(
    () => products.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );

  const handleIncrement = (product: string) => {
    setTransferQuantities((prev) => ({
      ...prev,
      [product]: Math.min(prev[product] + 10, productionStock[product] ?? 0),
    }));
  };

  const handleDecrement = (product: string) => {
    setTransferQuantities((prev) => ({
      ...prev,
      [product]: Math.max(prev[product] - 10, 0),
    }));
  };

  const handleChange = (product: string, value: string) => {
    const quantity = Math.max(0, Math.min(parseInt(value) || 0, productionStock[product] ?? 0));
    setTransferQuantities((prev) => ({
      ...prev,
      [product]: quantity,
    }));
  };

  const handleConfirmTransfer = (product: string) => {
    const quantity = transferQuantities[product];
    if (quantity > 0) {
      onTransfer?.(product, quantity);
      setTransferQuantities((prev) => ({
        ...prev,
        [product]: 0,
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transfer From Production</h3>
        <p className="text-sm text-gray-600 mt-1">Move stock from production to shop</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Available in Production
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Transfer to Shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-700" />
                    </div>
                    <span className="font-medium text-gray-900">{product.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {productionStock[product.id] ?? 0} units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(product.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={productionStock[product.id] ?? 0}
                      value={transferQuantities[product.id] ?? 0}
                      onChange={(e) => handleChange(product.id, e.target.value)}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                    <button
                      onClick={() => handleIncrement(product.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleConfirmTransfer(product.id)}
                    disabled={transferQuantities[product.id] <= 0}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      (transferQuantities[product.id] ?? 0) > 0
                        ? 'bg-amber-700 text-white hover:bg-amber-800'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
