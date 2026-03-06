/**
 * Route Riders Page - Manage delivery riders
 * 
 * Features:
 * - List all riders with contact info
 * - Add new rider
 * - Record fuel expenses
 * - View fuel history
 * - Export rider directory
 * 
 * API Functions Used:
 * - getAllRouteRiders()
 * - createRouteRider()
 * - recordFuelExpense()
 * - getRiderFuelRecords()
 */

'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllRouteRiders } from '@/lib/api/routes';
import { exportRouteRiders } from '@/lib/api/excel-export';

interface Rider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  created_at?: string;
}

export default function RouteRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await getAllRouteRiders();
        if (response.success) {
          // Map RouteRider to Rider interface: full_name -> name
          const mappedRiders = (response.data || []).map(r => ({
            id: String(r.id),
            name: r.full_name,
            phone: r.phone,
            email: undefined,
            status: r.status,
            created_at: r.created_at,
          }));
          setRiders(mappedRiders);
        } else {
          toast.error('Failed to load riders');
        }
      } catch (err) {
        console.error('Failed to load riders', err);
        toast.error('Failed to load riders');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await getAllRouteRiders();
      if (response.success) {
        // Map RouteRider to Rider interface: full_name -> name
        const mappedRiders = (response.data || []).map(r => ({
          id: String(r.id),
          name: r.full_name,
          phone: r.phone,
          email: undefined,
          status: r.status,
          created_at: r.created_at,
        }));
        setRiders(mappedRiders);
        toast.success('Rider list refreshed');
      }
    } catch (err) {
      toast.error('Failed to refresh rider list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = riders.map(r => ({
        name: r.name,
        phone: r.phone,
        email: r.email || 'N/A',
        status: r.status || 'Active',
      }));

      exportRouteRiders(exportData, `route_riders_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-3xl font-bold text-gray-900">Route Riders</h1>
          <p className="text-sm text-gray-600 mt-1">Manage delivery riders and contact information</p>
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
            disabled={isExporting || riders.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Riders Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading riders...</p>
          </div>
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No riders found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first delivery rider to get started</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{rider.name}</td>
                    <td className="px-6 py-4 text-gray-600">{rider.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{rider.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        {rider.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {rider.created_at ? new Date(rider.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Riders: <span className="font-semibold text-gray-900">{riders.length}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
