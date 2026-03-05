'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';

interface FinanceActivity {
  type: string;
  description: string;
  amount?: number;
  date: string;
}

interface FinanceActivityTableProps {
  activities?: FinanceActivity[];
}

// component will render activities passed via props; parent pages should
// fetch data (e.g. from /api/finance/activities) using SWR or other method.

const getTypeIcon = (type: string) => {
  if (type === 'collection') return <ArrowUpRight className="w-5 h-5 text-green-600" />;
  if (type === 'expense') return <ArrowDownLeft className="w-5 h-5 text-red-600" />;
  return <AlertCircle className="w-5 h-5 text-amber-600" />;
};

export const FinanceActivityTable: React.FC<FinanceActivityTableProps> = ({
  activities = [],
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
              <th className="px-6 py-4 text-left text-gray-600 font-medium">Description</th>
              <th className="px-6 py-4 text-right text-gray-600 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-900">
                  {new Date(activity.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(activity.type)}
                    <span className="capitalize text-gray-700">{activity.type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{activity.description}</td>
                <td
                  className={`px-6 py-4 text-right font-semibold ${
                    activity.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {activity.amount ? (
                    <>
                      {activity.type === 'expense' ? '-' : '+'}${activity.amount.toLocaleString()}
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
