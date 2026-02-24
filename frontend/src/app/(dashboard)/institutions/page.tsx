'use client';

import { useEffect, useState } from 'react';
import {
  Phone,
  MapPin,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { getAllInstitutions, createInstitution, getAllInstitutionOrders, createInstitutionOrder } from '@/lib/api/institutions';
import { getAllProducts } from '@/lib/api/products';

interface Institution {
  id: number | string;
  name: string;
  contact_person?: string | null;
  contactPerson?: string;
  phone?: string;
  address?: string;
  orders?: number;
  balance?: number;
  balanceStatus?: 'positive' | 'overdue';
  type?: string;
}

interface Order {
  id: string;
  institution_id?: number | string;
  institution?: string;
  products: { product_id?: string | number; name: string; quantity: number }[];
  total: number;
  status: 'delivered' | 'in-progress' | 'pending' | string;
  date?: string;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  unit?: string;
}

const InstitutionsManagement = () => {
  const [showAddInstitution, setShowAddInstitution] = useState(false);
  const [_showCreateOrder, _setShowCreateOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    address: ''
  });

  const [newOrder, setNewOrder] = useState<{ institution: string; products: Record<string, number>; deliveryDate: string; totalAmount: number }>({
    institution: '',
    products: {},
    deliveryDate: '',
    totalAmount: 0,
  });

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewInstitution({
      ...newInstitution,
      [e.target.name]: e.target.value
    });
  };

  const handleOrderProductChange = (productId: string | number, value: string) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    const updatedProducts = {
      ...newOrder.products,
      [String(productId)]: quantity,
    };

    // Calculate total
    const total = Object.entries(updatedProducts).reduce((sum, [key, qty]) => {
      const prod = products.find((p) => String(p.id) === key);
      return sum + (prod ? prod.price * Number(qty) : 0);
    }, 0);

    setNewOrder({
      ...newOrder,
      products: updatedProducts,
      totalAmount: total,
    });
  };

  const handleSaveInstitution = () => {
    (async () => {
      try {
        const payload = {
          name: newInstitution.name,
          contact_person: newInstitution.contactPerson || newInstitution.contact_person || null,
          phone: newInstitution.phone || null,
          address: newInstitution.address || null,
        };

        const res = await createInstitution(payload as any);
        if (!res.success) throw new Error(res.error?.message || 'Failed to create institution');
        // prepend new institution
        setInstitutions((prev) => [res.data as any, ...prev]);
        setShowAddInstitution(false);
        setNewInstitution({ name: '', contactPerson: '', phone: '', address: '' });
      } catch (err) {
        console.error('Create institution failed', err);
        alert(err instanceof Error ? err.message : 'Failed to create institution');
      }
    })();
  };

  const handleCreateOrder = async () => {
    try {
      if (!newOrder.institution) return alert('Select an institution');

      const productsPayload = Object.entries(newOrder.products)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([product_id, quantity]) => {
          const prod = products.find((p) => String(p.id) === String(product_id));
          return {
            product_id: product_id,
            quantity_ordered: Number(quantity),
            unit_price: prod ? Number(prod.price) : 0,
          };
        });

      const payload = {
        institution_id: String(newOrder.institution),
        order_date: newOrder.deliveryDate || new Date().toISOString().slice(0, 10),
        total_amount: Number(newOrder.totalAmount || 0),
        products: productsPayload,
      } as any;

      const res = await createInstitutionOrder(payload as any);
      if (!res.success) throw new Error(res.error?.message || 'Failed to create order');
      // refresh recent orders list
      setRecentOrders((prev) => [{ id: String(res.data.id), institution: institutions.find(i => String(i.id) === String(newOrder.institution))?.name || '', products: productsPayload.map(p => ({ product_id: p.product_id, name: String(p.product_id), quantity: p.quantity_ordered })), total: payload.total_amount, status: 'pending', date: payload.order_date }, ...prev]);
      _setShowCreateOrder(false);
      setNewOrder({ institution: '', products: {}, deliveryDate: '', totalAmount: 0 });
    } catch (err) {
      console.error('Create order failed', err);
      alert(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const getBalanceColor = (balance: number, status: string) => {
    if (status === 'overdue' || balance < 0) return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.contactPerson || inst.contact_person || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.address || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [insRes, prodRes, ordersRes] = await Promise.all([
          getAllInstitutions(),
          getAllProducts(),
          getAllInstitutionOrders(),
        ]);

        if (mounted) {
              if (insRes.success) setInstitutions(insRes.data || []);
              if (prodRes.success) {
                // Map product shape to include `price` (use retail_price as default)
                const mapped = (prodRes.data || []).map((p:any) => ({
                  id: p.id,
                  name: p.name,
                  price: Number(p.retail_price ?? p.wholesale_price ?? 0),
                  unit: p.weight ?? undefined,
                  // keep original fields if needed
                  retail_price: p.retail_price,
                  wholesale_price: p.wholesale_price,
                }));

                setProducts(mapped);
              }
              if (ordersRes.success) setRecentOrders((ordersRes.data || []).slice(0, 20).map((o:any) => ({ id: String(o.id), institution_id: o.institution_id, institution: '', products: [], total: Number(o.total_amount || 0), status: o.status || 'pending', date: o.order_date })));
            }
      } catch (err) {
        console.error('Failed to load institutions data', err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Institutions Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage institutions, orders and relationships</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Institution Details Form */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Institution Details</h2>
              <p className="text-sm text-gray-600 mt-0.5">Add or edit institution information</p>
            </div>
            <button
              onClick={() => setShowAddInstitution(!showAddInstitution)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>

          {showAddInstitution && (
            <div className="p-6 space-y-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newInstitution.name}
                    onChange={handleInstitutionChange}
                    placeholder="Enter institution name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={newInstitution.contactPerson}
                    onChange={handleInstitutionChange}
                    placeholder="Enter contact person"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={newInstitution.phone}
                    onChange={handleInstitutionChange}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newInstitution.address}
                    onChange={handleInstitutionChange}
                    placeholder="Enter full address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddInstitution(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInstitution}
                  className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
                >
                  Save Institution
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Institutions List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Institutions List</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInstitutions.map((institution) => (
                  <tr key={institution.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{institution.name}</div>
                        <div className="text-xs text-gray-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {institution.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 font-medium">{institution.contactPerson || institution.contact_person || ''}</div>
                        <div className="text-xs text-gray-600 flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {institution.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{institution.orders} Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${getBalanceColor(Number(institution.balance || 0), institution.balanceStatus || '')}`}>
                        {institution.balance !== undefined && institution.balance !== null ? `KES ${Math.abs(Number(institution.balance)).toLocaleString()}` : '—'}
                        {Number(institution.balance || 0) < 0 && ' (Overdue)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create New Order and Recent Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Order */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Order</h2>
              <p className="text-sm text-gray-600 mt-0.5">Place a new order for an institution</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Select Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Institution
                </label>
                <select
                  value={newOrder.institution}
                  onChange={(e) => setNewOrder({ ...newOrder, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Choose institution...</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id.toString()}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products
                </label>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">
                        {product.name} <span className="text-gray-500">(KES {Number(product.price).toLocaleString()}{product.unit ? `/${product.unit}` : ''})</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={newOrder.products[String(product.id)] || 0}
                        onChange={(e) => handleOrderProductChange(product.id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={newOrder.deliveryDate}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Total Amount */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-xl font-bold text-amber-900">
                    KES {Number(newOrder.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-600 mt-0.5">Latest orders from institutions</p>
              </div>
              <button className="text-sm text-amber-700 hover:text-amber-900 font-semibold transition-colors">
                View All
              </button>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{order.institution}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{order.id}</p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          {order.products.map((product, idx) => (
                            <span key={idx}>
                              {product.name} (<span className="font-medium">{product.quantity}</span>)
                              {idx < order.products.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-sm font-bold text-gray-900">
                        KES {Number(order.total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstitutionsManagement;
