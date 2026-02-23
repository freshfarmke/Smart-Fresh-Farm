'use client';

import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseBreakdownProps {
  data?: Array<{
    name: string;
    value: number;
  }>;
}

const DEFAULT_DATA = [
  { name: 'Raw Materials', value: 45 },
  { name: 'Utilities', value: 25 },
  { name: 'Wages', value: 12 },
  { name: 'Transport', value: 10 },
  { name: 'Other', value: 8 },
];

const COLORS = ['#7C4D2A', '#D97706', '#16A34A', '#DC2626', '#FBBF24'];

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ data = DEFAULT_DATA }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-900 mb-6">Expense Category Distribution</h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              label={({ name, value }: any) => `${name} ${value}%`}
            >
              {data.map((_, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
