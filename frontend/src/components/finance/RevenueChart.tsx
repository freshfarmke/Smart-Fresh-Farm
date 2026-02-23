'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  data?: Array<{
    name: string;
    revenue: number;
    expenses: number;
  }>;
}

const DEFAULT_DATA = [
  { name: 'Jan 9', revenue: 2100, expenses: 1200 },
  { name: 'Jan 10', revenue: 2300, expenses: 1450 },
  { name: 'Jan 11', revenue: 2900, expenses: 1550 },
  { name: 'Jan 12', revenue: 2500, expenses: 1350 },
  { name: 'Jan 13', revenue: 2700, expenses: 1250 },
  { name: 'Jan 14', revenue: 2400, expenses: 1100 },
  { name: 'Jan 15', revenue: 2800, expenses: 1200 },
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = DEFAULT_DATA }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-900 mb-6">Revenue vs Expenses (Last 7 Days)</h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#16A34A" name="Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#DC2626" name="Expenses" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
