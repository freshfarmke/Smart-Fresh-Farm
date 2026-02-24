"use client";

import { useEffect, useState } from 'react';
import { getAllProductionBatches, createProductionBatch, deleteProductionBatch } from '@/lib/api/production';
import { getAllProducts } from '@/lib/api/products';
import { Input, Button } from '@/components/ui';
import { Trash2, Plus } from 'lucide-react';

export default function ProductionBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ product_id: '', batch_code: '', quantity_produced: '', expiry_date: '' });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [bResp, pResp] = await Promise.all([getAllProductionBatches(), getAllProducts()]);
      if (bResp.success) setBatches(bResp.data || []);
      if (pResp.success) setProducts(pResp.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      if (!form.product_id || !form.quantity_produced) {
        setError('Please select product and enter quantity');
        return;
      }

      const resp = await createProductionBatch({
        product_id: form.product_id,
        batch_code: form.batch_code || undefined,
        quantity_produced: Number(form.quantity_produced),
        expiry_date: form.expiry_date || undefined,
      });

      if (!resp.success) {
        setError(resp.error?.message || 'Failed to create');
        return;
      }

      setForm({ product_id: '', batch_code: '', quantity_produced: '', expiry_date: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this production batch?')) return;
    try {
      const resp = await deleteProductionBatch(id);
      if (!resp.success) throw new Error(resp.error?.message || 'Delete failed');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production — Product Batches</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-700">Product</label>
            <select value={form.product_id} onChange={(e) => setForm(s => ({ ...s, product_id: e.target.value }))} className="w-full p-2 border rounded">
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">Batch Code</label>
            <Input value={form.batch_code} onChange={(e) => setForm(s => ({ ...s, batch_code: e.target.value }))} placeholder="auto or provide code" />
          </div>

          <div>
            <label className="text-sm text-gray-700">Quantity Produced</label>
            <Input type="number" value={form.quantity_produced} onChange={(e) => setForm(s => ({ ...s, quantity_produced: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm text-gray-700">Expiry Date</label>
            <Input type="date" value={form.expiry_date} onChange={(e) => setForm(s => ({ ...s, expiry_date: e.target.value }))} />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" variant="primary" isLoading={creating}><Plus className="w-4 h-4 mr-2" />Create Batch</Button>
          </div>
          {error && <div className="md:col-span-4 text-red-600">{error}</div>}
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        {loading ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Batch Code</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Produced</th>
                <th className="px-4 py-3 text-left">Remaining</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No production batches found</td></tr>
              ) : (
                batches.map(b => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-3">{b.batch_code}</td>
                    <td className="px-4 py-3">{b.product?.name ?? b.product_id}</td>
                    <td className="px-4 py-3">{b.quantity_produced}</td>
                    <td className="px-4 py-3">{b.quantity_remaining}</td>
                    <td className="px-4 py-3">{b.expiry_date ?? '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
