import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FinanceKPIProps {
  title: string;
  value: string;
  icon: LucideIcon;
  positive?: boolean;
  trend?: string;
}

export const FinanceKPI: React.FC<FinanceKPIProps> = ({
  title,
  value,
  icon: Icon,
  positive = false,
  trend,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${
            positive ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
