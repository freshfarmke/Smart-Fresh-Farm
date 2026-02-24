"use client";

import { useEffect, useState } from 'react';
import { getAllProducts, updateProduct, deleteProduct } from '@/lib/api/products';
import AddProductForm from '@/components/forms/AddProductForm';
import { Edit3, Trash2, Save, X } from 'lucide-react';
import { Input, Button } from '@/components/ui';

export default function FinanceProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name?: string; weight?: string; wholesale_price?: string; retail_price?: string; active?: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getAllProducts();
      if (!resp.success) {
        setError(resp.error?.message || 'Failed to load products');
        setProducts([]);
      } else {
        setProducts(resp.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Finance — Products</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <AddProductForm onCreated={load} />

        {loading ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Weight</th>
                  <th className="px-4 py-3 text-left">Wholesale</th>
                  <th className="px-4 py-3 text-left">Retail</th>
                  <th className="px-4 py-3 text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">No products found</td>
                  </tr>
                ) : (
                  products.map((p: any) => (
                    <tr key={p.id} className="border-t">
                      {editingId === p.id ? (
                        <>
                          <td className="px-4 py-3">
                            <Input value={editValues?.name ?? ''} onChange={(e) => setEditValues((v) => ({ ...(v||{}), name: e.target.value }))} />
                          </td>
                          <td className="px-4 py-3">
                            <Input value={editValues?.weight ?? ''} onChange={(e) => setEditValues((v) => ({ ...(v||{}), weight: e.target.value }))} />
                          </td>
                          <td className="px-4 py-3">
                            <Input type="number" value={editValues?.wholesale_price ?? ''} onChange={(e) => setEditValues((v) => ({ ...(v||{}), wholesale_price: e.target.value }))} />
                          </td>
                          <td className="px-4 py-3">
                            <Input type="number" value={editValues?.retail_price ?? ''} onChange={(e) => setEditValues((v) => ({ ...(v||{}), retail_price: e.target.value }))} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={async () => {
                                // Save
                                try {
                                  const updates: any = {
                                    name: editValues?.name,
                                    weight: editValues?.weight ?? null,
                                    wholesale_price: Number(editValues?.wholesale_price) || 0,
                                    retail_price: Number(editValues?.retail_price) || 0,
                                  };
                                  const resp = await updateProduct(p.id, updates);
                                  if (!resp.success) throw new Error(resp.error?.message || 'Update failed');
                                  setEditingId(null);
                                  setEditValues(null);
                                  await load();
                                } catch (err) {
                                  console.error('Update error', err);
                                  alert(err instanceof Error ? err.message : 'Update failed');
                                }
                              }}>
                                <Save size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditValues(null); }}>
                                <X size={16} />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{p.name}</td>
                          <td className="px-4 py-3 text-gray-600">{p.weight ?? '-'}</td>
                          <td className="px-4 py-3">{formatCurrency(Number(p.wholesale_price))}</td>
                          <td className="px-4 py-3">{formatCurrency(Number(p.retail_price))}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingId(p.id); setEditValues({ name: p.name, weight: p.weight ?? '', wholesale_price: String(p.wholesale_price ?? ''), retail_price: String(p.retail_price ?? ''), active: p.active }); }} className="text-gray-600 hover:text-gray-800" aria-label="Edit">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={async () => {
                                if (!confirm('Delete this product?')) return;
                                try {
                                  const resp = await deleteProduct(p.id);
                                  if (!resp.success) throw new Error(resp.error?.message || 'Delete failed');
                                  await load();
                                } catch (err) {
                                  console.error('Delete error', err);
                                  alert(err instanceof Error ? err.message : 'Delete failed');
                                }
                              }} className="text-red-600 hover:text-red-800" aria-label="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
