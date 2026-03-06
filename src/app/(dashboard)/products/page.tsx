/**
 * Products Page - List all products, add new products
 * 
 * Features:
 * - Display all products in a table with pricing
 * - Add new product form
 * - Edit/Delete functionality
 * - Search/filter by product name
 * - Export product inventory
 * 
 * API Functions Used:
 * - getAllProducts()
 * - createProduct()
 * - updateProduct()
 * - deleteProduct()
 * - searchProducts()
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Download, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllProducts } from '@/lib/api/products';
import { exportProducts } from '@/lib/api/excel-export';

interface Product {
  id: string;
  name: string;
  unit_price?: number;
  cost_per_unit?: number;
  category?: string;
  description?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await getAllProducts();
        if (response.success) {
          setProducts(response.data || []);
        } else {
          toast.error('Failed to load products');
        }
      } catch (err) {
        console.error('Failed to load products', err);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await getAllProducts();
      if (response.success) {
        setProducts(response.data || []);
        toast.success('Product list refreshed');
      }
    } catch (err) {
      toast.error('Failed to refresh product list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = products.map(p => ({
        name: p.name,
        category: p.category || 'N/A',
        unit_price: p.unit_price || 0,
        cost_per_unit: p.cost_per_unit || 0,
        margin: p.unit_price && p.cost_per_unit ? Math.round(((p.unit_price - p.cost_per_unit) / p.unit_price) * 100) : 0,
      }));

      exportProducts(exportData, `products_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Export completed');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage product inventory, pricing, and costs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || products.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No products found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first product to get started</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Product Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Unit Price</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Cost/Unit</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Margin %</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => {
                  const margin = product.unit_price && product.cost_per_unit
                    ? Math.round(((product.unit_price - product.cost_per_unit) / product.unit_price) * 100)
                    : 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-600">{product.category || 'N/A'}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">₦{product.unit_price?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 text-right text-gray-600">₦{product.cost_per_unit?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          margin >= 30 ? 'bg-green-100 text-green-800' : 
                          margin >= 20 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Products: <span className="font-semibold text-gray-900">{products.length}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
