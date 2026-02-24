'use client';

import { CheckCircle2, Truck, AlertCircle, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllProductionBatches } from '@/lib/api/production';
import { getAllDispatches } from '@/lib/api/routes';
import { supabase } from '@/lib/supabase/client';

type Activity = { type: string; message: string; time: string; ts: string; icon: any };

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const results: Activity[] = [];

        // Production batches (created/completed)
        const pb = await getAllProductionBatches();
        if (pb.success) {
          (pb.data || []).slice(0, 10).forEach((b: any) => {
            const ts = b.created_at || b.production_date || null;
            results.push({
              type: b.status === 'completed' ? 'completed' : 'info',
              message: `Batch ${b.batch_code || b.batch_number || b.id} (${b.product?.name ?? b.product_id}) - ${b.status || 'created'}`,
              time: ts ? new Date(ts).toLocaleString() : '—',
              ts: ts ? new Date(ts).toISOString() : new Date().toISOString(),
              icon: b.status === 'completed' ? CheckCircle2 : MessageSquare,
            });
          });
        }

        // Dispatches
        const d = await getAllDispatches();
        if (d.success) {
          (d.data || []).slice(0, 10).forEach((disp: any) => {
            const ts = disp.dispatch_date || disp.created_at || null;
            results.push({
              type: 'dispatched',
              message: `Dispatch ${disp.id} assigned to ${disp.rider?.nickname || disp.rider?.full_name || disp.rider?.name || disp.rider?.id || 'Rider'}`,
              time: ts ? new Date(ts).toLocaleString() : '—',
              ts: ts ? new Date(ts).toISOString() : new Date().toISOString(),
              icon: Truck,
            });
          });
        }

        // Returns
        const { data: returnsData, error: returnsError } = await supabase
          .from('route_returns')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!returnsError && returnsData) {
          returnsData.forEach((r: any) => {
            const ts = r.created_at || r.return_date || null;
            results.push({
              type: 'alert',
              message: `Return recorded for dispatch ${r.dispatch_id || r.id}`,
              time: ts ? new Date(ts).toLocaleString() : '—',
              ts: ts ? new Date(ts).toISOString() : new Date().toISOString(),
              icon: AlertCircle,
            });
          });
        }

        // Sort by timestamp desc and take top 6
        results.sort((a, b) => (a.ts < b.ts ? 1 : -1));
        if (mounted) setActivities(results.slice(0, 6));
      } catch (err) {
        console.error('Failed to load activity feed', err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const getIconColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'dispatched':
        return 'text-blue-600 bg-blue-50';
      case 'alert':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity Feed</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const IconComponent = activity.icon;
          return (
            <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(activity.type)}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <div className="text-gray-500">No recent activity</div>
        )}
      </div>
    </div>
  );
}
