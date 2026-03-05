"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Filter,
  ArrowLeft,
  Menu,
  Wallet,
  TrendingDown,
  RefreshCw,
  Printer,
  Share2,
  ChevronDown,
  DollarSign,
  Box,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FinanceSidebar } from '@/components/layout';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const ReportsAnalytics: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });


  const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom Range'];

  // Fetch data from APIs
  const { data: revenueData } = useSWR(
    `/api/finance/reports?metric=revenue&days=${dateRange === 'Last 7 Days' ? 7 : dateRange === 'Last 30 Days' ? 30 : dateRange === 'Last 90 Days' ? 90 : 365}`,
    fetcher
  );
  const { data: profitData } = useSWR(
    `/api/finance/reports?metric=profit&days=${dateRange === 'Last 7 Days' ? 7 : dateRange === 'Last 30 Days' ? 30 : dateRange === 'Last 90 Days' ? 90 : 365}`,
    fetcher
  );
  const { data: stockLossData } = useSWR(
    `/api/finance/reports?metric=loss&days=${dateRange === 'Last 7 Days' ? 7 : dateRange === 'Last 30 Days' ? 30 : dateRange === 'Last 90 Days' ? 90 : 365}`,
    fetcher
  );
  const { data: expenseData } = useSWR('/api/finance/expenses?pageSize=1000', fetcher);
  const { data: summaryData } = useSWR('/api/finance/summary', fetcher);

  // Prepare chart data
  const revenueChartData = revenueData?.success ? (revenueData.data || []).map((d: any) => ({
    name: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value || 0,
  })) : [];

  const profitChartData = profitData?.success ? (profitData.data || []).map((d: any) => ({
    name: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value || 0,
  })) : [];

  const stockLossChartData = stockLossData?.success ? (stockLossData.data || []).map((d: any) => ({
    name: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value || 0,
  })) : [];

  const expenseCategories = React.useMemo(() => {
    const categories: { [key: string]: number } = {};
    (expenseData?.data || []).forEach((exp: any) => {
      categories[exp.category] = (categories[exp.category] || 0) + Number(exp.amount || 0);
    });
    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
      amount: value,
    }));
  }, [expenseData]);

  // KPI values from API
  const kpis = React.useMemo(() => {
    if (!summaryData?.success || !summaryData.data?.length) {
      return { revenue: 0, collections: 0, expenses: 0, loss: 0 };
    }
    const sum = summaryData.data[0];
    return {
      revenue: Number(sum.total_collections || 0) / 100,
      collections: Number(sum.total_collections || 0) / 100,
      expenses: Number(sum.total_expenses || 0) / 100,
      loss: Number(sum.total_stock_loss || 0) / 100,
    };
  }, [summaryData]);

  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5E3C', '#EF4444', '#6B7280'];

  const RevenueTrendChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={revenueChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }} />
        <Line type="monotone" dataKey="value" stroke="#8B5E3C" strokeWidth={2} dot={{ fill: '#8B5E3C', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  const ExpenseBreakdownChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie dataKey="value" data={expenseCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ name }) => name} strokeWidth={1}>
          {expenseCategories.map((_, idx) => (
            <Cell key={`Cell-${idx}`} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );

  const NetProfitTrendChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={profitChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }} />
        <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const CollectionsVsPendingChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={[
        { name: 'Collections', value: kpis.collections * 0.77 },
        { name: 'Pending', value: kpis.collections * 0.23 },
      ]}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }} />
        <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const StockLossTrendChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={stockLossChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }} />
        <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <FinanceSidebar currentPath="/finance/reports" />
          </div>
        </div>
      )}

      <div className="lg:pl-0">
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu className="w-5 h-5" /></button>
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500 mt-0.5">Data visualization for decision-making</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCw className="w-5 h-5 text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Printer className="w-5 h-5 text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Share2 className="w-5 h-5 text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Download className="w-5 h-5 text-gray-600" /></button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><Filter className="w-5 h-5 text-primary-600" /></div><h2 className="text-lg font-semibold text-gray-900">Filters</h2></div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</label><div className="relative"><select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-sm">{dateRanges.map(r => (<option key={r} value={r}>{r}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div></div>
                {dateRange === 'Custom Range' && (
                  <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">From</label><input type="date" value={customDateRange.from} onChange={(e) => setCustomDateRange({...customDateRange, from: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" /></div>
                )}
                {dateRange === 'Custom Range' && (
                  <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">To</label><input type="date" value={customDateRange.to} onChange={(e) => setCustomDateRange({...customDateRange, to: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" /></div>
                )}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-rose-100 rounded-xl"><PieChart className="w-5 h-5 text-rose-600" /></div><h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3></div><span className="text-sm text-gray-500">Total: KSh {(kpis.expenses / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k</span></div><ExpenseBreakdownChart /></div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-success-100 rounded-xl"><DollarSign className="w-5 h-5 text-success-600" /></div><h3 className="text-lg font-semibold text-gray-900">Net Profit Trend</h3></div><span className="text-sm text-gray-500">Year to date</span></div><NetProfitTrendChart /><div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span>↑ 23.5% vs last year</span><span>Total: KSh {((kpis.collections - kpis.expenses) / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k</span></div></div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-error-100 rounded-xl"><TrendingDown className="w-5 h-5 text-error-600" /></div><h3 className="text-lg font-semibold text-gray-900">Stock Loss Trend</h3></div><span className="text-sm text-gray-500">Last 12 weeks</span></div><StockLossTrendChart /><div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span>Peak: {Math.max(...((stockLossChartData as any[]).map((d: any) => d.value as number) || [0]))} units</span><span>Average: {Math.round(((stockLossChartData as any[]).reduce((a: number, b: any) => a + (b.value || 0), 0)) / ((stockLossChartData as any[]).length || 1))} units</span></div></div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-purple-100 rounded-xl"><Box className="w-5 h-5 text-purple-600" /></div><h3 className="text-lg font-semibold text-gray-900">By Category</h3></div><span className="text-sm text-gray-500">Expense distribution</span></div><div className="space-y-4 mt-4">{expenseCategories.map((item, i) => (<div key={i} className="flex items-center"><div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: colors[i % colors.length]}} /><div className="flex-1 flex items-center justify-between"><span className="text-sm text-gray-700">{item.name}</span><div className="flex items-center space-x-4"><div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden"><div style={{backgroundColor: colors[i % colors.length], width: `${item.value}%`}} className="h-full" /></div><span className="text-sm font-medium text-gray-900 w-12 text-right">{item.value}%</span></div></div></div>))}</div><div className="mt-4 pt-2 border-t border-gray-100"><div className="flex items-center justify-between text-sm"><span className="text-gray-500">Total Expenses</span><span className="text-lg font-bold text-gray-900">KSh {(kpis.expenses / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k</span></div></div></div>
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Loss</label><button className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left flex items-center justify-between hover:bg-gray-100 transition-colors"><span>Include Losses</span><div className="w-8 h-4 bg-primary-200 rounded-full relative"><div className="absolute right-0 w-4 h-4 bg-primary-600 rounded-full shadow" /></div></button></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-xl"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                </div>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              <RevenueTrendChart />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>↑ 15.3% vs last period</span>
                <span>Total: KSh {kpis.revenue.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-100 rounded-xl"><PieChart className="w-5 h-5 text-rose-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                </div>
                <span className="text-sm text-gray-500">Total: KSh {kpis.expenses.toLocaleString()}</span>
              </div>
              <ExpenseBreakdownChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success-100 rounded-xl"><DollarSign className="w-5 h-5 text-success-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-900">Net Profit Trend</h3>
                </div>
                <span className="text-sm text-gray-500">Year to date</span>
              </div>
              <NetProfitTrendChart />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>↑ 23.5% vs last year</span>
                <span>Total: KSh {(kpis.collections - kpis.expenses).toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><Wallet className="w-5 h-5 text-primary-600" /></div><h3 className="text-lg font-semibold text-gray-900">Collections vs Pending</h3></div><span className="text-sm text-gray-500">This month</span></div><CollectionsVsPendingChart /><div className="mt-2 grid grid-cols-2 gap-4"><div className="bg-primary-50 rounded-xl p-3"><p className="text-xs text-gray-500">Collection Rate</p><p className="text-lg font-bold text-primary-600">77.3%</p></div><div className="bg-warning-50 rounded-xl p-3"><p className="text-xs text-gray-500">Outstanding</p><p className="text-lg font-bold text-warning-600">22.7%</p></div></div></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-error-100 rounded-xl"><TrendingDown className="w-5 h-5 text-error-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-900">Stock Loss Trend</h3>
                </div>
                <span className="text-sm text-gray-500">Last 12 weeks</span>
              </div>
              <StockLossTrendChart />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Peak: {Math.max(...((stockLossChartData as any[]).map((d: any) => d.value as number) || [0]))} units</span>
                <span>Average: {Math.round(((stockLossChartData as any[]).reduce((a: number, b: any) => a + (b.value || 0), 0)) / ((stockLossChartData as any[]).length || 1))} units/week</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-xl"><Box className="w-5 h-5 text-purple-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-900">By Category</h3>
                </div>
                <span className="text-sm text-gray-500">Expense distribution</span>
              </div>
              <div className="space-y-4 mt-4">
                {expenseCategories.map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: colors[i % colors.length] }} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden"><div style={{ backgroundColor: colors[i % colors.length], width: `${item.value}%` }} className="h-full" /></div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Total Expenses</span><span className="text-lg font-bold text-gray-900">KSh {kpis.expenses.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  {/* Revenue */}
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
    <div className="h-1 w-full bg-primary-500 rounded-full mb-5" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">
          Total Revenue
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          KSh {(kpis.revenue / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k
        </p>
      </div>
      <div className="p-3 bg-primary-50 rounded-xl">
        <TrendingUp className="w-6 h-6 text-primary-600" />
      </div>
    </div>
    <p className="text-sm text-green-600 font-medium mt-4">
      ↑ 15.3% from last month
    </p>
  </div>

  {/* Collections */}
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
    <div className="h-1 w-full bg-green-500 rounded-full mb-5" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">
          Total Collections
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          KSh {(kpis.collections / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k
        </p>
      </div>
      <div className="p-3 bg-green-50 rounded-xl">
        <Wallet className="w-6 h-6 text-green-600" />
      </div>
    </div>
    <p className="text-sm text-green-600 font-medium mt-4">
      ↑ 8.7% from last month
    </p>
  </div>

  {/* Expenses */}
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
    <div className="h-1 w-full bg-amber-500 rounded-full mb-5" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">
          Total Expenses
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          KSh {(kpis.expenses / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k
        </p>
      </div>
      <div className="p-3 bg-amber-50 rounded-xl">
        <PieChart className="w-6 h-6 text-amber-600" />
      </div>
    </div>
    <p className="text-sm text-amber-600 font-medium mt-4">
      ↑ 5.2% from last month
    </p>
  </div>

  {/* Stock Loss */}
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
    <div className="h-1 w-full bg-red-500 rounded-full mb-5" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">
          Stock Loss Value
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          KSh {(kpis.loss / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k
        </p>
      </div>
      <div className="p-3 bg-red-50 rounded-xl">
        <TrendingDown className="w-6 h-6 text-red-600" />
      </div>
    </div>
    <p className="text-sm text-red-600 font-medium mt-4">
      ↓ 3.1% from last month
    </p>
  </div>

</div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
