"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import type { Product, CreateProductInput } from "@/types/database";
import { createProduct, updateProduct, deleteProduct } from "@/lib/api/products";

interface Props {
  initialData: Product[];
}

export default function ProductsManager({ initialData }: Props) {
  const [products, setProducts] = useState<Product[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CreateProductInput>({ name: "", unit_price: 0, cost_per_unit: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!form.name) throw new Error("Name is required");
      const res = await createProduct(form);
      if (!res.success) throw new Error(res.error.message);
      setProducts((p) => [res.data, ...p]);
      setSuccess("Product created");
      setForm({ name: "", unit_price: 0, cost_per_unit: 0 });
    } catch (err: any) {
      setError(err?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    setIsLoading(true);
    try {
      const res = await deleteProduct(id);
      if (!res.success) throw new Error(res.error.message);
      setProducts((p) => p.filter((x) => x.id !== id));
      setSuccess("Product deleted");
    } catch (err: any) {
      setError(err?.message || "Failed to delete");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleUpdate = async (id: string) => {
    const name = prompt("New name") || undefined;
    if (!name) return;
    setIsLoading(true);
    try {
      const res = await updateProduct(id, { name });
      if (!res.success) throw new Error(res.error.message);
      setProducts((p) => p.map((it) => (it.id === id ? res.data : it)));
      setSuccess("Product updated");
    } catch (err: any) {
      setError(err?.message || "Failed to update");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Unit Price"
          type="number"
          value={String(form.unit_price)}
          onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })}
        />
        <Input
          label="Cost Per Unit"
          type="number"
          value={String(form.cost_per_unit)}
          onChange={(e) => setForm({ ...form, cost_per_unit: Number(e.target.value) })}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCreate} disabled={isLoading} variant="primary">
          {isLoading ? "Saving..." : "Create"}
        </Button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </div>

      <div className="overflow-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.unit_price}</td>
                <td className="p-3">{p.cost_per_unit}</td>
                <td className="p-3 flex gap-2">
                  <Button onClick={() => handleUpdate(p.id)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(p.id)} variant="outline" className="text-red-600 hover:bg-red-50">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
