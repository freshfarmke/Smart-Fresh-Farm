'use client';

import { Clock, Calendar, Filter } from 'lucide-react';

interface TransferHistoryItem {
  time: string;
  product: string;
  quantity: number;
  transferredBy: string;
}

interface TransferHistoryProps {
  transfers: TransferHistoryItem[];
}

export function TransferHistory({ transfers }: TransferHistoryProps) {
  const defaultTransfers: TransferHistoryItem[] = [
    { time: '08:30 AM', product: 'Bread', quantity: 50, transferredBy: 'John Baker' },
    { time: '09:15 AM', product: 'Queen Cakes', quantity: 25, transferredBy: 'Mike Wilson' },
    { time: '10:45 AM', product: 'Buns', quantity: 30, transferredBy: 'David Smith' },
    { time: '11:20 AM', product: 'Bread', quantity: 40, transferredBy: 'Sarah Johnson' },
    { time: '12:00 PM', product: 'Queen Cakes', quantity: 15, transferredBy: 'John Baker' },
  ];

  const displayTransfers = transfers.length > 0 ? transfers : defaultTransfers;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today's Transfer History</h3>
          <p className="text-sm text-gray-600 mt-1">Record of all stock transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Transferred By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayTransfers.map((transfer, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{transfer.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{transfer.product}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-medium">{transfer.quantity} units</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-amber-700">
                        {getInitials(transfer.transferredBy)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{transfer.transferredBy}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transfers.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            + {transfers.length} new transfer{transfers.length !== 1 ? 's' : ''} today
          </p>
        </div>
      )}
    </div>
  );
}
