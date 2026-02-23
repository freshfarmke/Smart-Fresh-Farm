"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import type { ProductionBatch, CreateBatchInput, AddProductToBatchInput } from "@/types/database";
import { createBatch, addProductToBatch } from "@/lib/api/production";

interface Props {
  initialData: ProductionBatch[];
}

export default function ProductionManager({ initialData }: Props) {
  const [batches, setBatches] = useState<ProductionBatch[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CreateBatchInput>({ batch_number: "", production_date: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!form.batch_number) throw new Error("Batch number required");
      const res = await createBatch("", form); // userId will be set in real auth flow
      if (!res.success) throw new Error(res.error.message);
      setBatches((b) => [res.data, ...b]);
      setSuccess("Batch created");
    } catch (err: any) {
      setError(err?.message || "Failed to create batch");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleAddProduct = async () => {
    // minimal prompt-based flow for dev - replace with proper form later
    const batchId = prompt("Batch ID") || "";
    const productId = prompt("Product ID") || "";
    const qty = Number(prompt("Quantity") || "0");
    if (!batchId || !productId || qty <= 0) return alert("Invalid input");
    setIsLoading(true);
    try {
      const res = await addProductToBatch({ batch_id: batchId, product_id: productId, quantity_produced: qty });
      if (!res.success) throw new Error(res.error.message);
      setSuccess("Product added to batch");
    } catch (err: any) {
      setError(err?.message || "Failed to add");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Batch Number" value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} />
        <Input label="Production Date" type="date" value={form.production_date} onChange={(e) => setForm({ ...form, production_date: e.target.value })} />
        <div />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCreate} disabled={isLoading} variant="primary">{isLoading ? "Saving..." : "Create Batch"}</Button>
        <Button onClick={handleAddProduct} variant="secondary">Add Product to Batch</Button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </div>

      <div className="overflow-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-3">Batch #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3">{b.batch_number}</td>
                <td className="p-3">{b.production_date}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">{/* actions placeholder */}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
