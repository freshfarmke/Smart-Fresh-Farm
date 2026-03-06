'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Clock, Receipt, Plus } from 'lucide-react';
import { FinanceKPI } from '@/components/finance/FinanceKPI';
import { RevenueChart } from '@/components/finance/RevenueChart';
import { ExpenseBreakdown } from '@/components/finance/ExpenseBreakdown';
import { getFinanceSummary } from '@/lib/api/finance';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

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
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // load function
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const profile = await getUserProfile(currentUser.id);
        setUser(profile);
      }
      
      // Load summary
      const summaryRes = await getFinanceSummary();
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadData();

    // auto-refresh every 60s
    const id = setInterval(() => {
      if (mounted) loadData();
    }, 60000);

    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Process data
  let revenue = '$0', expenses = '$0', profit = '$0', loss = '$0';
  let revenueChartData: any[] = [];
  let expenseBreakdownData: any[] = [];

  if (summary) {
    revenue = `$${summary.total_revenue.toLocaleString()}`;
    expenses = `$${summary.total_expenses.toLocaleString()}`;
    profit = `$${summary.net_profit.toLocaleString()}`;
    loss = `$${summary.total_stock_loss.toLocaleString()}`;

    // For now, mock chart data - in a real app, you'd fetch daily data
    revenueChartData = [
      { name: 'Mon', revenue: summary.total_revenue * 0.1, expenses: summary.total_expenses * 0.1 },
      { name: 'Tue', revenue: summary.total_revenue * 0.15, expenses: summary.total_expenses * 0.12 },
      { name: 'Wed', revenue: summary.total_revenue * 0.12, expenses: summary.total_expenses * 0.18 },
      { name: 'Thu', revenue: summary.total_revenue * 0.18, expenses: summary.total_expenses * 0.15 },
      { name: 'Fri', revenue: summary.total_revenue * 0.2, expenses: summary.total_expenses * 0.2 },
      { name: 'Sat', revenue: summary.total_revenue * 0.15, expenses: summary.total_expenses * 0.15 },
      { name: 'Sun', revenue: summary.total_revenue * 0.1, expenses: summary.total_expenses * 0.1 },
    ];

    expenseBreakdownData = Object.entries(summary.expense_breakdown).map(([name, value]) => ({
      name,
      value,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600 text-sm mt-1">Finance Dashboard — Monitor your bakery's financial performance</p>
          {user && (
            <p className="text-lg text-gray-800 mt-2">Welcome back, <span className="font-bold">{user.name || user.email}</span>!</p>
          )}
        </div>
        <button className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          Record Transaction
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <FinanceKPI title="Total Revenue" value={revenue} icon={DollarSign} positive trend="+12% from last week" />
        <FinanceKPI title="Total Expenses" value={expenses} icon={Receipt} trend="+8% from last week" />
        <FinanceKPI title="Net Profit" value={profit} icon={TrendingUp} positive trend="+15% from last week" />
        <FinanceKPI title="Outstanding Debts" value="$3,456" icon={Clock} trend="3 pending invoices" />
        <FinanceKPI title="Stock Losses" value={loss} icon={AlertTriangle} trend="8.2% of revenue" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {revenueChartData.length > 0 ? <RevenueChart data={revenueChartData} /> : <div className="bg-white p-6 rounded text-gray-500">Loading chart...</div>}
        </div>
        <div>
          <ExpenseBreakdown data={expenseBreakdownData} />
        </div>
      </div>

      {/* Recent Activities - Detailed Text */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && summary && summary.recent_activities && summary.recent_activities.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {summary.recent_activities.map((activity: any, index: number) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      activity.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {activity.type === 'expense' ? '-' : '+'}${activity.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!loading && (!summary || !summary.recent_activities || summary.recent_activities.length === 0) && (
          <p className="text-sm text-gray-500">No recent activity data available.</p>
        )}
      </div>

    </div>
  );
}
