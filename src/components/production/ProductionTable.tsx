"use client";

import { useEffect, useState } from 'react';
import { getAllProductionBatches } from '@/lib/api/production';

export function ProductionTable() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const resp = await getAllProductionBatches();
        if (!mounted) return;
        if (!resp.success) {
          setBatches([]);
        } else {
          // Filter to batches created today (by created_at)
          const today = new Date().toDateString();
          const todays = (resp.data || []).filter((b: any) => {
            const created = b.created_at ? new Date(b.created_at).toDateString() : null;
            return created === today;
          });
          setBatches(todays);
        }
      } catch (err) {
        console.error('Failed to load production batches', err);
        setBatches([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);


  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Production Overview</h3>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Batch Code</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Product(s)</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Produced</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Remaining</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Created At</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No production batches created today</td>
              </tr>
            ) : (
              batches.map((b) => {
                // Support two shapes: production_batches with batch_products join, or older single-product rows
                const batchProducts = b.batch_products || b.products || [];
                const productNames = batchProducts.length > 0
                  ? batchProducts.map((bp: any) => bp.product?.name || bp.product_id).join(', ')
                  : (b.product?.name ?? b.product_id ?? '—');

                const totalProduced = batchProducts.length > 0
                  ? batchProducts.reduce((s: number, bp: any) => s + Number(bp.quantity_produced || 0), 0)
                  : (Number(b.quantity_produced || 0));

                const totalRemaining = batchProducts.length > 0
                  ? batchProducts.reduce((s: number, bp: any) => s + Number(bp.quantity_remaining || 0 || 0), 0)
                  : (Number(b.quantity_remaining || 0));

                return (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4 font-medium text-gray-900">{b.batch_code || b.batch_number || b.id}</td>
                    <td className="py-4 px-4 text-gray-700">{productNames}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{totalProduced || '—'}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{(totalRemaining || totalRemaining === 0) ? totalRemaining : '—'}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{b.created_at ? new Date(b.created_at).toLocaleTimeString() : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
