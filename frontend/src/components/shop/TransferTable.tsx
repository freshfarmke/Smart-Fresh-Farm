'use client';

import { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';

interface TransferTableProps {
  onTransfer?: (product: string, quantity: number) => void;
}

export function TransferTable({ onTransfer }: TransferTableProps) {
  const productionStock = {
    bread: 320,
    queenCakes: 125,
    buns: 200,
  };

  const products = [
    { id: 'bread', label: 'Bread' },
    { id: 'queenCakes', label: 'Queen Cakes' },
    { id: 'buns', label: 'Buns' },
  ];

  const [transferQuantities, setTransferQuantities] = useState({
    bread: 0,
    queenCakes: 0,
    buns: 0,
  });

  const handleIncrement = (product: string) => {
    setTransferQuantities((prev) => ({
      ...prev,
      [product]: Math.min(
        prev[product as keyof typeof prev] + 10,
        productionStock[product as keyof typeof productionStock]
      ),
    }));
  };

  const handleDecrement = (product: string) => {
    setTransferQuantities((prev) => ({
      ...prev,
      [product]: Math.max(prev[product as keyof typeof prev] - 10, 0),
    }));
  };

  const handleChange = (product: string, value: string) => {
    const quantity = Math.max(
      0,
      Math.min(
        parseInt(value) || 0,
        productionStock[product as keyof typeof productionStock]
      )
    );
    setTransferQuantities((prev) => ({
      ...prev,
      [product]: quantity,
    }));
  };

  const handleConfirmTransfer = (product: string) => {
    const quantity = transferQuantities[product as keyof typeof transferQuantities];
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
                    {productionStock[product.id as keyof typeof productionStock]} units
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
                      max={productionStock[product.id as keyof typeof productionStock]}
                      value={transferQuantities[product.id as keyof typeof transferQuantities]}
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
                    disabled={
                      transferQuantities[product.id as keyof typeof transferQuantities] <= 0
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      transferQuantities[product.id as keyof typeof transferQuantities] > 0
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
