'use client';

import { CheckCircle2, Truck, AlertCircle, MessageSquare } from 'lucide-react';

export function ActivityFeed() {
  const activities = [
    { type: 'completed', message: 'Batch #B001 completed successfully', time: '10:30 AM', icon: CheckCircle2 },
    { type: 'dispatched', message: 'Dispatch completed for Route A-12', time: '09:45 AM', icon: Truck },
    { type: 'alert', message: 'Return recorded from Route B-05', time: '09:15 AM', icon: AlertCircle },
    { type: 'completed', message: 'Batch #B003 completed and logged', time: '08:30 AM', icon: CheckCircle2 },
    { type: 'info', message: 'New batch created: Croissants batch', time: '08:00 AM', icon: MessageSquare },
  ];

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
      </div>
    </div>
  );
}
