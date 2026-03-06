"use client";
import { useEffect, useState } from 'react';
import { RefreshCw, Download, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductionSummary } from '@/lib/api/reports';
import { exportProductionReport } from '@/lib/api/excel-export';

export default function ProductionReportsPage() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);

  // load function so we can refresh on demand and auto-refresh
  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await getProductionSummary();
      if (res.success) {
        setSummary(res.data);
        toast.success('Production reports refreshed');
      } else {
        toast.error('Failed to load reports');
      }
    } catch (err) {
      console.error('Failed to load production reports', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadSummary();

    // auto-refresh every 60s
    const id = setInterval(() => {
      if (mounted) loadSummary();
    }, 60000);

    return () => { mounted = false; clearInterval(id); };
  }, []);

  const handleExport = async () => {
    if (!summary) {
      toast.error('No data to export');
      return;
    }

    setExporting(true);
    try {
      const exportData = {
        metrics: {
          total_batches: summary.total_batches,
          total_units_produced: summary.total_units_produced,
          total_dispatches: summary.total_dispatches,
          total_units_dispatched: summary.total_units_dispatched,
          total_returns: summary.total_returns,
          total_units_returned: summary.total_units_returned,
        },
        top_products: summary.top_products || [],
      };

      exportProductionReport(exportData, `production_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Report exported successfully');
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Overview of production activity, dispatches and returns (Distinct from Finance reports)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadSummary()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !summary}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-600">Total Batches</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '…' : summary?.total_batches || '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-600">Units Produced</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {loading ? '…' : summary?.total_units_produced || '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-600">Total Dispatches</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {loading ? '…' : summary?.total_dispatches || '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-600">Units Dispatched</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {loading ? '…' : summary?.total_units_dispatched || '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-600">Total Returns</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {loading ? '…' : summary?.total_returns || '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-600">Units Returned</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {loading ? '…' : summary?.total_units_returned || '0'}
          </p>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top Products by Production</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Performance breakdown by product</p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading production data...</p>
          </div>
        ) : summary && summary.top_products && summary.top_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Produced</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Dispatched</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Returned</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.top_products.map((p: any) => {
                  const remaining = (p.produced || 0) - (p.dispatched || 0) - (p.returned || 0);
                  return (
                    <tr key={p.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-right text-green-600 font-semibold">{p.produced || 0}</td>
                      <td className="px-6 py-4 text-right text-blue-600 font-semibold">{p.dispatched || 0}</td>
                      <td className="px-6 py-4 text-right text-orange-600 font-semibold">{p.returned || 0}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-semibold">{remaining}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-600">No production data available</p>
          </div>
        )}
      </div>

      {/* Data Insights */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <p className="text-sm font-medium text-green-900">Efficiency Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {summary.total_units_produced > 0 
                ? Math.round((summary.total_units_dispatched / summary.total_units_produced) * 100) 
                : 0}%
            </p>
            <p className="text-xs text-green-800 mt-2">Units dispatched vs produced</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <p className="text-sm font-medium text-blue-900">Return Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {summary.total_units_dispatched > 0
                ? Math.round((summary.total_units_returned / summary.total_units_dispatched) * 100)
                : 0}%
            </p>
            <p className="text-xs text-blue-800 mt-2">Return vs dispatch ratio</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <p className="text-sm font-medium text-purple-900">Active Stock</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {(summary.total_units_produced || 0) - (summary.total_units_dispatched || 0) - (summary.total_units_returned || 0)}
            </p>
            <p className="text-xs text-purple-800 mt-2">Units in production cycle</p>
          </div>
        </div>
      )}
    </div>
  );
}
