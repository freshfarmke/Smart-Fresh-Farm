'use client';

import { DollarSign, TrendingUp, AlertTriangle, Clock, Receipt, Plus } from 'lucide-react';
import { FinanceKPI } from '@/components/finance/FinanceKPI';
import { RevenueChart } from '@/components/finance/RevenueChart';
import { ExpenseBreakdown } from '@/components/finance/ExpenseBreakdown';
import { FinanceActivityTable } from '@/components/finance/FinanceActivityTable';

/**
 * Finance Dashboard
 * 
 * Displays financial metrics and trends:
 * - Total revenue and expenses KPIs
 * - Revenue vs expenses bar chart (last 7 days)
 * - Expense category breakdown pie chart
 * - Recent financial activities table
 * - Quick action buttons
 * 
 * Structure inspired by Production dashboard with modular components
 */
export default function FinanceDashboard() {
  return (
    <div className="space-y-6">
      {/* Header - renamed to Overview with Finance Dashboard subtitle */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600 text-sm mt-1">Finance Dashboard — Monitor your bakery's financial performance</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          Record Transaction
        </button>
      </div>

      {/* KPI Cards - 5 Columns */}
      <div className="grid grid-cols-5 gap-6">
        <FinanceKPI
          title="Total Revenue"
          value="$2,847"
          icon={DollarSign}
          positive
          trend="+12% from last week"
        />
        <FinanceKPI
          title="Total Expenses"
          value="$1,234"
          icon={Receipt}
          trend="+8% from last week"
        />
        <FinanceKPI
          title="Net Profit"
          value="$1,613"
          icon={TrendingUp}
          positive
          trend="+15% from last week"
        />
        <FinanceKPI
          title="Outstanding Debts"
          value="$3,456"
          icon={Clock}
          trend="3 pending invoices"
        />
        <FinanceKPI
          title="Stock Losses"
          value="$156"
          icon={AlertTriangle}
          trend="8.2% of revenue"
        />
      </div>

      {/* Charts - 2/3 and 1/3 Layout */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RevenueChart />
        </div>
        <div>
          <ExpenseBreakdown />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <FinanceActivityTable />
      </div>

    </div>
  );
}
