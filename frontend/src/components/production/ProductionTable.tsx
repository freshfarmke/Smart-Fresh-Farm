'use client';

import { CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';

export function ProductionTable() {
  const data = [
    { id: '#B001', product: 'White Bread', qty: 200, status: 'Completed', created_at: '2026-02-20 08:30' },
    { id: '#B002', product: 'Croissants', qty: 150, status: 'In Progress', created_at: '2026-02-20 09:15' },
    { id: '#B003', product: 'Muffins', qty: 300, status: 'Completed', created_at: '2026-02-20 07:45' },
    { id: '#B004', product: 'Bagels', qty: 180, status: 'Dispatched', created_at: '2026-02-20 10:00' },
    { id: '#B005', product: 'Chocolate Cake', qty: 80, status: 'Pending', created_at: '2026-02-20 10:30' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'Dispatched':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800';
      case 'Dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Production Overview</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Batch ID</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Product</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Quantity</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="py-4 px-4 font-medium text-gray-900">{item.id}</td>
              <td className="py-4 px-4 text-gray-700">{item.product}</td>
              <td className="py-4 px-4 text-gray-700 font-medium">{item.qty} units</td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-600 text-xs">{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
