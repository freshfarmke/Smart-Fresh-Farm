'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';

interface FinanceActivity {
  id: string;
  date: string;
  type: 'collection' | 'expense' | 'loss';
  category: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

interface FinanceActivityTableProps {
  activities?: FinanceActivity[];
}

const DEFAULT_ACTIVITIES: FinanceActivity[] = [
  {
    id: '1',
    date: 'Jan 15, 2025',
    type: 'collection',
    category: 'Sales Revenue',
    description: 'Daily bread sales',
    amount: 2847,
    status: 'completed',
  },
  {
    id: '2',
    date: 'Jan 15, 2025',
    type: 'expense',
    category: 'Raw Materials',
    description: 'Flour and ingredients',
    amount: 856,
    status: 'completed',
  },
  {
    id: '3',
    date: 'Jan 14, 2025',
    type: 'loss',
    category: 'Wastage',
    description: 'Expired pastries',
    amount: 67,
    status: 'completed',
  },
  {
    id: '4',
    date: 'Jan 14, 2025',
    type: 'expense',
    category: 'Utilities',
    description: 'Electricity bill',
    amount: 450,
    status: 'completed',
  },
  {
    id: '5',
    date: 'Jan 13, 2025',
    type: 'collection',
    category: 'Bulk Order',
    description: 'Restaurant supply',
    amount: 3500,
    status: 'pending',
  },
];

const getTypeIcon = (type: string) => {
  if (type === 'collection') return <ArrowUpRight className="w-5 h-5 text-green-600" />;
  if (type === 'expense') return <ArrowDownLeft className="w-5 h-5 text-red-600" />;
  return <AlertCircle className="w-5 h-5 text-amber-600" />;
};

const getStatusColor = (status: string) => {
  if (status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export const FinanceActivityTable: React.FC<FinanceActivityTableProps> = ({
  activities = DEFAULT_ACTIVITIES,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Recent Financial Activity</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-gray-600 font-medium">Date</th>
              <th className="px-6 py-4 text-left text-gray-600 font-medium">Type</th>
              <th className="px-6 py-4 text-left text-gray-600 font-medium">Category</th>
              <th className="px-6 py-4 text-left text-gray-600 font-medium">Description</th>
              <th className="px-6 py-4 text-right text-gray-600 font-medium">Amount</th>
              <th className="px-6 py-4 text-left text-gray-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-900">{activity.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(activity.type)}
                    <span className="capitalize text-gray-700">{activity.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{activity.category}</td>
                <td className="px-6 py-4 text-gray-600">{activity.description}</td>
                <td
                  className={`px-6 py-4 text-right font-semibold ${
                    activity.type === 'collection' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {activity.type === 'collection' ? '+' : '-'}${activity.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
