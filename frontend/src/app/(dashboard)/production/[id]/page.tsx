'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function BatchDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id;

  const [batch, setBatch] = useState(null);
  const [batchProducts, setBatchProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId]);

  const fetchBatchDetails = async () => {
    try {
      // Fetch batch
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select(`
          id,
          batch_number,
          batch_date,
          status,
          total_quantity,
          total_units,
          notes,
          created_by,
          created_at,
          updated_at,
          completed_at,
          dispatched_at,
          users:created_by(name)
        `)
        .eq('id', batchId)
        .single();

      if (batchError) throw batchError;
      setBatch(batchData);

      // Fetch batch products
      const { data: productsData, error: productsError } = await supabase
        .from('batch_products')
        .select(`
          id,
          batch_id,
          product_id,
          quantity_planned,
          quantity_produced,
          quantity_dispatched,
          quantity_returned,
          products:product_id(name)
        `)
        .eq('batch_id', batchId);

      if (productsError) throw productsError;
      setBatchProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updateData = {
        status: newStatus
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (newStatus === 'dispatched') {
        updateData.dispatched_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('batches')
        .update(updateData)
        .eq('id', batchId);

      if (error) throw error;

      setBatch({ ...batch, status: newStatus });
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating batch status:', error);
      alert('Failed to update batch status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      dispatched: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      dispatched: 'Dispatched'
    };
    return labels[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'dispatched'
    };
    return flow[currentStatus];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-600">Batch not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Go back →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{batch.batch_number}</h1>
              <p className="text-gray-500 mt-1">
                Date: {new Date(batch.batch_date).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(batch.status)}`}>
                {getStatusLabel(batch.status)}
              </span>
              {batch.status !== 'dispatched' && (
                <button
                  onClick={() => {
                    setSelectedStatus(getNextStatus(batch.status));
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Update Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
            <div className="p-6">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{batch.total_quantity}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Total Units Planned</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{batch.total_units}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Created By</p>
              <p className="text-lg font-medium text-gray-900 mt-2">{batch.users?.name || 'Unknown'}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-sm text-gray-900 mt-2">{new Date(batch.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Products in Batch</h2>
          </div>

          {batchProducts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No products added to this batch
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Planned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Produced
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Dispatched
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Returned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {batchProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.products?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity_planned}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity_produced || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity_dispatched || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity_returned || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notes */}
        {batch.notes && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{batch.notes}</p>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Batch Status
            </h3>
            <p className="text-gray-600 mb-6">
              Change status from <strong>{getStatusLabel(batch.status)}</strong> to{' '}
              <strong>{getStatusLabel(selectedStatus)}</strong>?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(selectedStatus)}
                disabled={updatingStatus}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium inline-flex items-center justify-center"
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
