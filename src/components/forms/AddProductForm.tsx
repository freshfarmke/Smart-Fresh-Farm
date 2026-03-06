"use client";

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { createProduct } from '@/lib/api/products';

export default function AddProductForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [wholesale, setWholesale] = useState('');
  const [retail, setRetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const wholesale_price = Number(wholesale);
      const retail_price = Number(retail);
      if (!name || Number.isNaN(wholesale_price) || Number.isNaN(retail_price)) {
        setError('Please provide valid name and prices');
        return;
      }

      const resp = await createProduct({
        name,
        weight: weight || undefined,
        wholesale_price,
        retail_price,
        active: true,
      });

      if (!resp.success) {
        setError(resp.error?.message || 'Failed to create product');
        return;
      }

      setName('');
      setWeight('');
      setWholesale('');
      setRetail('');

      if (onCreated) onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border-b">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 500g" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Wholesale Price" type="number" value={wholesale} onChange={(e) => setWholesale(e.target.value)} required />
        <Input label="Retail Price" type="number" value={retail} onChange={(e) => setRetail(e.target.value)} required />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading}>Add Product</Button>
      </div>
    </form>
  );
}
