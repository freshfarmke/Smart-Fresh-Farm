"use client";

import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
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
import clsx from 'clsx';
import { FinanceSidebar } from '@/components/layout';

const ReportsAnalytics: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [selectedBatch, setSelectedBatch] = useState('All Batches');
  const [selectedRider, setSelectedRider] = useState('All Riders');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom Range'];
  const products = ['All Products', 'White Bread', 'Brown Bread', 'Croissants', 'Muffins', 'Cakes', 'Buns'];
  const batches = ['All Batches', 'Morning Batch', 'Afternoon Batch', 'Evening Batch', 'Special Order'];
  const riders = ['All Riders', 'John Doe', 'Jane Smith', 'Mike Wilson', 'Sarah Johnson', 'David Brown'];
  const categories = ['All Categories', 'Revenue', 'Expenses', 'Collections', 'Stock Loss'];

  const revenueLabels = ['Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'];
  const profitData = [4000, 5500, 7200, 8900, 10500, 11800];
  const profitLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const stockLossData = [45, 38, 52, 47, 63, 58, 42, 55, 48, 61, 53, 47];

  const legendItems = [
    { label: 'Raw Materials', color: 'bg-amber-500', value: '45%' },
    { label: 'Labor', color: 'bg-blue-500', value: '12%' },
    { label: 'Utilities', color: 'bg-green-500', value: '17%' },
    { label: 'Transport', color: 'bg-purple-500', value: '5%' },
    { label: 'Maintenance', color: 'bg-rose-500', value: '3%' },
    { label: 'Other', color: 'bg-gray-500', value: '3%' },
  ];

  const RevenueTrendChart = () => (
    <div className="relative h-48 mt-2">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-600 py-1">
        <span>22k</span>
        <span>20k</span>
        <span>18k</span>
        <span>16k</span>
        <span>14k</span>
      </div>
      <div className="ml-6 h-full">
        <div className="absolute inset-0 ml-6 mr-3">
          {[0, 1, 2, 3, 4].map((i) => (<div key={i} className="border-b border-gray-100 h-1/5" />))}
        </div>
        <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
          <polyline points="0,140 80,110 160,90 240,70 320,40 400,50 480,30" fill="none" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="140" r="4" fill="#8B5E3C" />
          <circle cx="80" cy="110" r="4" fill="#8B5E3C" />
          <circle cx="160" cy="90" r="4" fill="#8B5E3C" />
          <circle cx="240" cy="70" r="4" fill="#8B5E3C" />
          <circle cx="320" cy="40" r="4" fill="#8B5E3C" />
          <circle cx="400" cy="50" r="4" fill="#8B5E3C" />
          <circle cx="480" cy="30" r="4" fill="#8B5E3C" />
        </svg>
        <div className="flex justify-between mt-1 text-xs text-gray-600 px-2">
          {revenueLabels.map((label, i) => (<span key={i}>{label}</span>))}
        </div>
      </div>
    </div>
  );

  const ExpenseBreakdownChart = () => (
    <div className="flex items-center justify-center h-48 mt-2">
      <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
        <div className="absolute inset-0" style={{ background: 'conic-gradient(#F59E0B 0deg 162deg, #3B82F6 162deg 205deg, #10B981 205deg 266deg, #8B5E3C 266deg 284deg, #EF4444 284deg 295deg, #6B7280 295deg 306deg, #E5E7EB 306deg 360deg)' }} />
      </div>
      <div className="ml-4 space-y-2">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className={clsx('w-3 h-3 rounded-full', item.color)} />
            <span className="text-xs text-gray-600">{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const NetProfitTrendChart = () => (
    <div className="relative h-40 mt-2">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-600 py-1">
        <span>12k</span>
        <span>10k</span>
        <span>8k</span>
        <span>6k</span>
        <span>4k</span>
        <span>2k</span>
      </div>
      <div className="ml-6 h-full">
        <div className="absolute inset-0 ml-6 mr-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (<div key={i} className="border-b border-gray-100 h-1/6" />))}
        </div>
        <div className="flex items-end justify-around h-full px-2">
          {profitData.map((value, i) => {
            const height = (value / 12000) * 100;
            return (<div key={i} className="flex flex-col items-center w-8"><div className="w-6 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm" style={{ height: `${height}%` }} /></div>);
          })}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-600 px-2">
          {profitLabels.map((label, i) => (<span key={i}>{label}</span>))}
        </div>
      </div>
    </div>
  );

  const CollectionsVsPendingChart = () => (
    <div className="flex items-end justify-around h-40 mt-2 px-2">
      <div className="flex flex-col items-center w-24">
        <div className="w-14 bg-primary-500 rounded-t-lg" style={{ height: '100px' }} />
        <span className="text-xs font-medium mt-1 text-gray-700">Collections</span>
        <span className="text-xs text-gray-500">KSh 42,500</span>
      </div>
      <div className="flex flex-col items-center w-24">
        <div className="w-14 bg-warning-500 rounded-t-lg" style={{ height: '45px' }} />
        <span className="text-xs font-medium mt-1 text-gray-700">Pending</span>
        <span className="text-xs text-gray-500">KSh 12,500</span>
      </div>
    </div>
  );

  const StockLossTrendChart = () => (
    <div className="relative h-40 mt-2">
      <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-between text-xs text-gray-600 py-1">
        <span>80</span>
        <span>60</span>
        <span>40</span>
        <span>20</span>
        <span>0</span>
      </div>
      <div className="ml-4 h-full">
        <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
          <polyline points={stockLossData.map((v, i) => `${i * 40},${120 - (v * 1.5)}`).join(' ')} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="flex justify-between mt-1 text-xs text-gray-600 px-2"><span>W1</span><span>W3</span><span>W5</span><span>W7</span><span>W9</span><span>W11</span></div>
      </div>
    </div>
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
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</label><div className="relative"><select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-sm">{products.map(p => (<option key={p} value={p}>{p}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</label><div className="relative"><select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-sm">{batches.map(b => (<option key={b} value={b}>{b}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</label><div className="relative"><select value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-sm">{riders.map(r => (<option key={r} value={r}>{r}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label><div className="relative"><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-sm">{categories.map(c => (<option key={c} value={c}>{c}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Loss</label><button className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left flex items-center justify-between hover:bg-gray-100 transition-colors"><span>Include Losses</span><div className="w-8 h-4 bg-primary-200 rounded-full relative"><div className="absolute right-0 w-4 h-4 bg-primary-600 rounded-full shadow" /></div></button></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-amber-100 rounded-xl"><TrendingUp className="w-5 h-5 text-amber-600" /></div><h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3></div><span className="text-sm text-gray-500">Last 30 days</span></div><RevenueTrendChart /><div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span>↑ 15.3% vs last period</span><span>Total: KSh 245,800</span></div></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-rose-100 rounded-xl"><PieChart className="w-5 h-5 text-rose-600" /></div><h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3></div><span className="text-sm text-gray-500">Total: KSh 100,000</span></div><ExpenseBreakdownChart /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-success-100 rounded-xl"><DollarSign className="w-5 h-5 text-success-600" /></div><h3 className="text-lg font-semibold text-gray-900">Net Profit Trend</h3></div><span className="text-sm text-gray-500">Year to date</span></div><NetProfitTrendChart /><div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span>↑ 23.5% vs last year</span><span>Total: KSh 47,900</span></div></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><Wallet className="w-5 h-5 text-primary-600" /></div><h3 className="text-lg font-semibold text-gray-900">Collections vs Pending</h3></div><span className="text-sm text-gray-500">This month</span></div><CollectionsVsPendingChart /><div className="mt-2 grid grid-cols-2 gap-4"><div className="bg-primary-50 rounded-xl p-3"><p className="text-xs text-gray-500">Collection Rate</p><p className="text-lg font-bold text-primary-600">77.3%</p></div><div className="bg-warning-50 rounded-xl p-3"><p className="text-xs text-gray-500">Outstanding</p><p className="text-lg font-bold text-warning-600">22.7%</p></div></div></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-error-100 rounded-xl"><TrendingDown className="w-5 h-5 text-error-600" /></div><h3 className="text-lg font-semibold text-gray-900">Stock Loss Trend</h3></div><span className="text-sm text-gray-500">Last 12 weeks</span></div><StockLossTrendChart /><div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span>Peak: 63 units (Week 5)</span><span>Average: 51.2 units/week</span></div></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center space-x-3"><div className="p-2 bg-purple-100 rounded-xl"><Box className="w-5 h-5 text-purple-600" /></div><h3 className="text-lg font-semibold text-gray-900">By Category</h3></div><span className="text-sm text-gray-500">Expense distribution</span></div><div className="space-y-4 mt-4">{legendItems.map((item, i) => (<div key={i} className="flex items-center"><div className={clsx('w-3 h-3 rounded-full mr-3', item.color)} /><div className="flex-1 flex items-center justify-between"><span className="text-sm text-gray-700">{item.label}</span><div className="flex items-center space-x-4"><div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={clsx('h-full', item.color)} style={{ width: item.value }} /></div><span className="text-sm font-medium text-gray-900 w-12 text-right">{item.value}</span></div></div></div>))}</div><div className="mt-4 pt-2 border-t border-gray-100"><div className="flex items-center justify-between text-sm"><span className="text-gray-500">Total Expenses</span><span className="text-lg font-bold text-gray-900">KSh 100,000</span></div></div></div>
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
          KSh 245.8k
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
          KSh 178.5k
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
          KSh 100.0k
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
          KSh 12.4k
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
