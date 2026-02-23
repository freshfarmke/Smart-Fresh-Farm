/**
 * Products Page - List all products, add new products
 * 
 * Features:
 * - Display all products in a table
 * - Add new product form
 * - Edit/Delete functionality (admin only)
 * - Search/filter by product name
 * 
 * API Functions Used:
 * - getAllProducts()
 * - createProduct()
 * - updateProduct()
 * - deleteProduct()
 * - searchProducts()
 */

import { getAllProducts } from '@/lib/api/products';

export default async function ProductsPage() {
  const productsResponse = await getAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        {/* TODO: Add Button component for creating new product */}
      </div>

      {productsResponse.success ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* TODO: Implement Table component to display products */}
          {/* Headers: Name, Unit Price, Cost Per Unit, Actions */}
          {/* Use updateProduct() and deleteProduct() for actions */}
          <div className="p-6">
            <p className="text-gray-600">
              Total Products: {productsResponse.data.length}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          {productsResponse.error.message}
        </div>
      )}
    </div>
  );
}
