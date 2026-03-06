'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FinanceSidebar, ProductionSidebar } from '@/components/layout';
import { useEffect, useState } from 'react';
import { getCurrentUser, canManageFinance } from '@/lib/auth';
import { Menu, X } from 'lucide-react';

/**
 * Dashboard Layout - Responsive
 * Client component with mobile-aware sidebar toggle
 * Architecture: Responsive flex layout with collapsible navigation
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isFinance = pathname?.startsWith('/finance');

  // simple client-side guard for finance area
  useEffect(() => {
    if (!isFinance) return;
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const allowed = await canManageFinance(user.id);
      if (!allowed) {
        router.replace('/unauthorized');
      }
    })();
  }, [isFinance, router]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:z-50">
        {isFinance ? <FinanceSidebar currentPath={pathname} /> : <ProductionSidebar currentPath={pathname} />}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
            {isFinance ? <FinanceSidebar currentPath={pathname} /> : <ProductionSidebar currentPath={pathname} />}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col w-full lg:ml-64">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Page Content - Responsive Padding */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
