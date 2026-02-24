"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import {
  TrendingDown,
  Calendar,
  Filter,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Zap,
  Truck as TruckIcon,
  Coffee,
  ShoppingBag,
} from 'lucide-react';
import clsx from 'clsx';

const ExpensesManagement: React.FC = () => {
    const searchParams = useSearchParams();
    const [showAddExpense, setShowAddExpense] = useState<boolean>(() => {
      try {
        return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('add') === '1';
      } catch {
        return false;
      }
    });

    useEffect(() => {
      // also react to navigation-driven search param when mounted client-side
      if (!searchParams) return;
      if (searchParams.get('add') === '1') setShowAddExpense(true);
    }, [searchParams]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Live data
    const [expenses, setExpenses] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalExpenses: 0, monthlyAverage: 0, largestExpense: 0, categories: 0 });

    // Add expense form state
    const [formDate, setFormDate] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formRecordedBy, setFormRecordedBy] = useState('');
    const [formNotes, setFormNotes] = useState('');

    const categories = [
      'All Categories',
      'Salary',
      'Fuel',
      'Rent',
      'Utilities',
      'Miscellaneous',
      'Ingredients',
      'Equipment',
      'Marketing',
    ];

    useEffect(() => {
      fetchExpenses();
    }, []);

    async function fetchExpenses() {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false })
          .limit(100);

        if (error) throw error;
        const rows = data || [];
        setExpenses(rows);

        // Simple stats
        const total = rows.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
        const largest = rows.reduce((m: number, r: any) => Math.max(m, Number(r.amount || 0)), 0);
        const categoriesCount = Array.from(new Set(rows.map((r: any) => r.category))).length;
        const monthlyAvg = rows.length ? total / Math.max(1, new Date().getMonth() + 1) : 0;
        setStats({ totalExpenses: total, monthlyAverage: monthlyAvg, largestExpense: largest, categories: categoriesCount });
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      }
    }

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'Salary':
          return User;
        case 'Fuel':
          return TruckIcon;
        case 'Rent':
          return Calendar;
        case 'Utilities':
          return Zap;
        case 'Miscellaneous':
          return Coffee;
        case 'Ingredients':
          return ShoppingBag;
        default:
          return DollarSign;
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'Salary':
          return 'bg-purple-100 text-purple-700';
        case 'Fuel':
          return 'bg-orange-100 text-orange-700';
        case 'Rent':
          return 'bg-blue-100 text-blue-700';
        case 'Utilities':
          return 'bg-yellow-100 text-yellow-700';
        case 'Miscellaneous':
          return 'bg-gray-100 text-gray-700';
        case 'Ingredients':
          return 'bg-green-100 text-green-700';
        case 'Equipment':
          return 'bg-indigo-100 text-indigo-700';
        default:
          return 'bg-primary-100 text-primary-700';
      }
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleApplyFilters = () => {
      // For now refetch (could send params)
      fetchExpenses();
    };

    const handleEdit = (id: string) => {
      // TODO: edit expense (open modal)
    };
    const handleDelete = async (id: string) => {
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
        fetchExpenses();
      } catch (err) {
        console.error('Failed to delete expense', err);
      }
    };

    const handleSaveExpense = async () => {
      try {
        const payload = {
          description: formNotes || `${formCategory} expense`,
          amount: parseFloat(formAmount || '0'),
          category: formCategory,
          expense_date: formDate || new Date().toISOString().split('T')[0],
          notes: formNotes || null,
        };
        const { data, error } = await supabase.from('expenses').insert([payload]).select().single();
        if (error) throw error;
        // clear form
        setFormAmount(''); setFormCategory(''); setFormDate(''); setFormNotes(''); setFormRecordedBy('');
        setShowAddExpense(false);
        fetchExpenses();
      } catch (err) {
        console.error('Failed to save expense', err);
        setError('Failed to save expense');
      }
    };

    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <main className="p-4 lg:p-6 space-y-6">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses (MTD)</p>
                    <p className="text-2xl font-semibold mt-1 text-error-600">{formatCurrency(stats.totalExpenses)}</p>
                  </div>
                  <div className="p-3 bg-error-100 rounded-full"><TrendingDown className="w-6 h-6 text-error-600" /></div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                    <p className="text-2xl font-semibold mt-1 text-primary-600">{formatCurrency(stats.monthlyAverage)}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-full"><Calendar className="w-6 h-6 text-primary-600" /></div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Largest Expense</p>
                    <p className="text-2xl font-semibold mt-1 text-warning-600">{formatCurrency(stats.largestExpense)}</p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-full"><DollarSign className="w-6 h-6 text-warning-600" /></div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-semibold mt-1 text-success-600">{stats.categories}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-full"><Filter className="w-6 h-6 text-success-600" /></div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg border">
              <div className="px-5 py-4 border-b"><h2 className="text-lg font-semibold text-gray-900">Filters</h2></div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {categories.map((category) => (
                        <option key={category} value={category.toLowerCase()}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex space-x-2 w-full">
                      <button onClick={handleApplyFilters} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Apply Filters</span>
                      </button>
                      <button onClick={() => setShowAddExpense(true)} className="px-4 py-2 border rounded-md text-primary-700 hover:bg-primary-50">Add Expense</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Expense Form */}
            {showAddExpense && (
              <div className="bg-white rounded-lg border">
                <div className="px-5 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Add New Expense</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Record a new business expense</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Select category</option>
                        {categories.slice(1).map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" step="0.01" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recorded By</label>
                      <input type="text" value={formRecordedBy} onChange={e => setFormRecordedBy(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Your name" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea rows={3} value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter expense details..."></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={() => setShowAddExpense(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveExpense} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Save Expense</button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Expenses Table */}
            <div className="bg-white rounded-lg border">
              <div className="px-5 py-4 border-b"><h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2></div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expenses.map((expense) => {
                      const CategoryIcon = getCategoryIcon(expense.category);
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-900">{expense.expense_date}</span></div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2"><span className={clsx('p-1 rounded', getCategoryColor(expense.category))}><CategoryIcon className="w-4 h-4" /></span><span className="text-sm font-medium text-gray-900">{expense.category}</span></div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap"><span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(expense.amount) || 0)}</span></td>
                          <td className="px-5 py-4 whitespace-nowrap"><div className="flex items-center space-x-2"><div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-xs font-medium text-primary-700">EB</span></div><span className="text-sm text-gray-600">{expense.recorded_by || ''}</span></div></td>
                          <td className="px-5 py-4"><p className="text-sm text-gray-600 truncate max-w-xs">{expense.notes}</p></td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleEdit(expense.id)} className="p-1 hover:bg-secondary rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(expense.id)} className="p-1 hover:bg-secondary rounded text-error-600"><Trash2 className="w-4 h-4" /></button>
                              <button className="p-1 hover:bg-secondary rounded"><MoreVertical className="w-4 h-4 text-gray-600" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Showing {expenses.length} recent expenses</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-1"><ChevronLeft className="w-4 h-4" /><span>Previous</span></button>
                    <button className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">2</button>
                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">3</button>
                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-1"><span>Next</span><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

export default ExpensesManagement;
