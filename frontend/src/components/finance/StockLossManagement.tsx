"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
  Package,
  AlertTriangle,
  ChevronDown,
  Calendar,
  Filter,
  Plus,
  Clock,
  Archive,
  BarChart4,
  Download,
  Eye,
  RefreshCw,
  FileText,
  Trash2,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { FinanceSidebar } from '@/components/layout';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const StockLossManagement: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedReason, setSelectedReason] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [lossDate, setLossDate] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // reasons still static for now, but could also live in a DB table
  const lossReasons = [
    { value: 'all', label: 'All Reasons' },
    { value: 'expired', label: 'Expired' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'unsold', label: 'Unsold' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'production', label: 'Production Error' },
  ];

  // data fetched from API
  const { data: lossesData, mutate: mutateLosses } = useSWR('/api/finance/stock-loss?pageSize=100', fetcher);
  const losses: any[] = lossesData?.data || [];

  const { data: productsData } = useSWR('/api/products', fetcher);
  const products = productsData?.data || [];

  const { data: batchesData } = useSWR('/api/production/batches', fetcher);
  const batches = batchesData?.data || [];

  // derive stats from losses
  const stats = React.useMemo(() => {
    const counts: any = { expired: 0, damaged: 0, unsold: 0, total: 0 };
    losses.forEach((r: any) => {
      const t = r.reason?.toLowerCase();
      if (t && counts[t] !== undefined) counts[t] += Number(r.quantity || 0);
      counts.total += Number(r.quantity || 0);
    });
    return [
      { id: 'expired', label: 'Expired', value: counts.expired, icon: Clock, color: 'amber', trend: '', trendUp: false },
      { id: 'damaged', label: 'Damaged', value: counts.damaged, icon: AlertTriangle, color: 'rose', trend: '', trendUp: false },
      { id: 'unsold', label: 'Unsold', value: counts.unsold, icon: Archive, color: 'blue', trend: '', trendUp: false },
      { id: 'total', label: 'Total Loss', value: counts.total, icon: Package, color: 'primary', trend: '', trendUp: false },
    ];
  }, [losses]);

  const getReasonDetails = (reason: string) => {
    switch (reason) {
      case 'Expired':
        return { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      case 'Damaged':
        return { icon: AlertTriangle, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
      case 'Unsold':
        return { icon: Archive, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
      default:
        return { icon: Package, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };
    }
  };

  const getStatColors = (color: string) => {
    switch (color) {
      case 'amber':
        return { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100', icon: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' };
      case 'rose':
        return { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100', icon: 'text-rose-600', gradient: 'from-rose-500 to-rose-600' };
      case 'blue':
        return { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', icon: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' };
      case 'primary':
        return { bg: 'bg-primary-50', text: 'text-primary-600', iconBg: 'bg-primary-100', icon: 'text-primary-600', gradient: 'from-primary-500 to-primary-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', iconBg: 'bg-gray-100', icon: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const handleRecordLoss = () => {
    setFormError('');
    
    // Validation
    if (!selectedBatch) {
      setFormError('Please select a batch');
      return;
    }
    if (!selectedProduct) {
      setFormError('Please select a product');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }
    if (!lossReason) {
      setFormError('Please select a reason');
      return;
    }
    if (!lossDate) {
      setFormError('Please select a loss date');
      return;
    }

    setIsSubmitting(true);
    
    fetch('/api/finance/stock-loss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batch_id: selectedBatch,
        product_id: selectedProduct,
        quantity: Number(quantity),
        reason: lossReason,
        loss_date: lossDate,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          mutateLosses();
          setShowRecordForm(false);
          setSelectedBatch('');
          setSelectedProduct('');
          setQuantity('');
          setLossReason('');
          setLossDate('');
          setFormError('');
          toast.success('Loss record created successfully', {
            duration: 4000,
            position: 'bottom-right',
            style: {
              background: '#10b981',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
            },
          });
        } else {
          const errMsg = data.error?.message || 'Failed to create loss record';  
          setFormError(errMsg);
          toast.error(errMsg, {
            duration: 4000,
            position: 'bottom-right',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
            },
          });
        }
      })
      .catch(err => {
        const errMsg = 'Error creating loss record: ' + err.message;
        setFormError(errMsg);
        toast.error(errMsg, {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = (_id: string) => {
    toast(
      (t) => (
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Delete Record?</p>
            <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                fetch(`/api/finance/stock-loss?id=${_id}`, {
                  method: 'DELETE',
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data.success) {
                      mutateLosses();
                      toast.success('Record deleted successfully', {
                        duration: 3000,
                        style: {
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '500',
                        },
                      });
                    } else {
                      toast.error(data.error?.message || 'Failed to delete record', {
                        duration: 3000,
                        style: {
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '500',
                        },
                      });
                    }
                  })
                  .catch(err => {
                    toast.error('Error deleting record: ' + err.message, {
                      duration: 3000,
                      style: {
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                      },
                    });
                  });
              }}
              className="px-3 py-1 text-white bg-rose-600 rounded hover:bg-rose-700 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: '#fff',
          color: '#000',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
      }
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      {/* Mobile overlay: render the shared FinanceSidebar for small screens when open */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <FinanceSidebar currentPath="/finance/stock-loss" />
          </div>
        </div>
      )}

      <div className="lg:pl-0">
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 lg:px-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu className="w-5 h-5" /></button>
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Loss Management</h1>
                <p className="text-sm text-gray-500 mt-0.5">Track and manage product losses</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCw className="w-5 h-5 text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Download className="w-5 h-5 text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><BarChart4 className="w-5 h-5 text-gray-600" /></button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const colors = getStatColors(stat.color);
              const Icon = stat.icon as any;
              return (
                <div key={stat.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2 text-gray-900">{formatNumber(stat.value)}</p>
                      <div className="flex items-center mt-2">
                        <span className={clsx('text-xs font-medium flex items-center', stat.trendUp ? 'text-success-600' : 'text-error-600')}>{stat.trendUp ? '↑' : '↓'} {stat.trend}</span>
                        <span className="text-xs text-gray-400 ml-2">vs last month</span>
                      </div>
                    </div>
                    <div className={clsx('p-3 rounded-2xl', colors.iconBg)}>
                      <Icon className={clsx('w-6 h-6', colors.icon)} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Units Lost</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b cursor-pointer hover:bg-gray-50/80 transition-colors" onClick={() => setShowRecordForm(!showRecordForm)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-xl"><Plus className="w-5 h-5 text-primary-600" /></div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Record Stock Loss</h2>
                    <p className="text-sm text-gray-500">Add a new loss record to the system</p>
                  </div>
                </div>
                <ChevronDown className={clsx('w-5 h-5 text-gray-400 transition-transform duration-300', showRecordForm && 'transform rotate-180')} />
              </div>
            </div>

            {showRecordForm && (
              <div className="p-4 bg-white">
                {formError && (
                  <div className="mb-4 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2"><Package className="w-4 h-4 text-gray-400" /><span>Batch ID</span></label>
                    <div className="relative">
                      <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none">
                        <option value="">Select Batch</option>
                        {batches.map((batch: any) => (<option key={batch.id} value={batch.id}>{batch.id} - {batch.name}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2"><Package className="w-4 h-4 text-gray-400" /><span>Product</span></label>
                    <div className="relative">
                      <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none">
                        <option value="">Select Product</option>
                        {products.map((product: any) => (<option key={product.id} value={product.id}>{product.name}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2"><BarChart4 className="w-4 h-4 text-gray-400" /><span>Quantity Lost</span></label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-gray-400" /><span>Reason</span></label>
                    <div className="relative">
                      <select value={lossReason} onChange={(e) => setLossReason(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none">
                        <option value="">Select Reason</option>
                        {lossReasons.slice(1).map((reason) => (<option key={reason.value} value={reason.value}>{reason.label}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>Loss Date</span></label>
                    <input type="date" value={lossDate} onChange={(e) => setLossDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>

                  <div className="flex items-end">
                    <button onClick={handleRecordLoss} disabled={isSubmitting} className="w-full px-6 py-3 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white rounded-xl hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 text-base"><Plus className="w-5 h-5" /><span>{isSubmitting ? 'Recording...' : 'Record Loss'}</span></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-xl"><FileText className="w-5 h-5 text-primary-600" /></div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Loss Records</h2>
                    <p className="text-sm text-gray-500">Complete history of all stock losses</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-b bg-white">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-1 min-w-[180px]"><input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="From Date" /></div>
                  <span className="text-gray-600">to</span>
                  <div className="flex-1 min-w-[180px]"><input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="To Date" /></div>
                </div>

                <div className="w-48">
                  <div className="relative">
                    <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none">
                      {lossReasons.map((reason) => (<option key={reason.value} value={reason.value}>{reason.label}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <button className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2 shadow-sm"><Filter className="w-4 h-4" /><span>Filter</span></button>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCw className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recorded By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {losses.map((record, index) => {
                    const details = getReasonDetails(record.reason);
                    const Icon = details.icon as any;
                    return (
                      <tr key={record.id} className={clsx('hover:bg-gray-50 transition-colors group', index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30')}>
                        <td className="px-4 py-3 whitespace-nowrap"><div className="flex items-center space-x-3"><Calendar className="w-4 h-4 text-gray-400" /><div><div className="text-sm font-medium text-gray-900">{record.loss_date || record.date}</div></div></div></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">{record.batch_id}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-700">{record.product_id || record.product}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm font-semibold text-gray-900">{record.quantity}</span><span className="text-xs text-gray-500 ml-1">units</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><div className={clsx('flex items-center space-x-2 px-3 py-1 rounded-full w-fit', details.bg)}><Icon className={clsx('w-4 h-4', details.text)} /><span className={clsx('text-xs font-medium', details.text)}>{record.reason}</span></div></td>
                        <td className="px-4 py-3 whitespace-nowrap"><div className="flex items-center space-x-2"><div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-xs font-medium text-primary-700">{record.recorded_by?.split(' ').map((n:string) => n[0]).join('')}</span></div><span className="text-sm text-gray-600">{record.recorded_by}</span></div></td>
                        <td className="px-4 py-3 whitespace-nowrap"><div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-1 hover:bg-gray-200 rounded-lg transition-colors"><Eye className="w-4 h-4 text-gray-500" /></button><button onClick={() => handleDelete(record.id)} className="p-1 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-rose-500" /></button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Showing <span className="font-medium">1-{losses.length}</span> of <span className="font-medium">{losses.length}</span> records</p>
                {/* TODO: implement real pagination controls */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StockLossManagement;
