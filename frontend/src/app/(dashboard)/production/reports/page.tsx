"use client";
import React, { useEffect, useState } from 'react';
import { getProductionSummary } from '@/lib/api/reports';

export default function ProductionReportsPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);

  // load function so we can refresh on demand and auto-refresh
  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await getProductionSummary();
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error('Failed to load production reports', err);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Reports (Operations)</h1>
        <p className="text-sm text-gray-600 mt-1">Overview of production activity, dispatches and returns. (Distinct from Finance reports)</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Batches</p>
          <p className="text-2xl font-bold text-amber-900">{loading ? '…' : summary ? summary.total_batches : '—'}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Units Produced</p>
          <p className="text-2xl font-bold text-amber-900">{loading ? '…' : summary ? summary.total_units_produced : '—'}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Dispatches</p>
          <p className="text-2xl font-bold text-amber-900">{loading ? '…' : summary ? summary.total_dispatches : '—'}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Units Returned</p>
          <p className="text-2xl font-bold text-amber-900">{loading ? '…' : summary ? summary.total_units_returned : '—'}</p>
        </div>
        </div>

        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={() => loadSummary()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              // build CSV from summary and top_products
              if (!summary) return alert('No data to export');
              const rows: string[] = [];
              // summary key-values
              rows.push('metric,value');
              rows.push(`total_batches,${summary.total_batches}`);
              rows.push(`total_units_produced,${summary.total_units_produced}`);
              rows.push(`total_dispatches,${summary.total_dispatches}`);
              rows.push(`total_units_dispatched,${summary.total_units_dispatched}`);
              rows.push(`total_returns,${summary.total_returns}`);
              rows.push(`total_units_returned,${summary.total_units_returned}`);
              rows.push('');
              // top products table
              rows.push('product_id,product_name,produced,dispatched,returned');
              summary.top_products.forEach((p:any) => {
                rows.push(`${p.product_id},"${(p.name || '').replace(/"/g,'""')}",${p.produced},${p.dispatched},${p.returned}`);
              });

              const csv = rows.join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `production_reports_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-amber-700 text-white rounded text-sm hover:bg-amber-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Products (Produced)</h2>
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && summary && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Product</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Produced</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Dispatched</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Returned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.top_products.map((p:any) => (
                  <tr key={p.product_id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-right">{p.produced}</td>
                    <td className="px-4 py-3 text-sm text-right">{p.dispatched}</td>
                    <td className="px-4 py-3 text-sm text-right">{p.returned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !summary && (
          <p className="text-sm text-gray-500">No production data available.</p>
        )}
      </div>
    </div>
  );
}
