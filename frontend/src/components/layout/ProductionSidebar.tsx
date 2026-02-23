"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, Package, Truck, Building2, Store, BarChart3, Settings, LogOut } from 'lucide-react';

export function ProductionSidebar({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname() || currentPath || '/';

  const navItems = [
    { name: 'Dashboard', href: '/production', icon: Home },
    { name: 'Batches', href: '/production', icon: Package },
    { name: 'Routes', href: '/production/routes', icon: Truck },
    { name: 'Route Dispatch', href: '/production/dispatch', icon: Truck },
    { name: 'Institutions', href: '/institutions', icon: Building2 },
    { name: 'Shop', href: '/production/shop', icon: Store },
  ];

  const bottomItems = [
    { name: 'Reports', href: '/production/reports', icon: BarChart3 },
    { name: 'Settings', href: '/production/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase/client');
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Logout failed', e);
    }
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b">
          <div className="bg-[#6B3E26] text-white p-2 rounded-lg">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#6B3E26]">BakeryPro</h1>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isLanding = item.href === '/dashboard';
            const active = isLanding ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  active
                    ? 'bg-[#F3E6DA] text-[#D9822B] font-medium border-r-4 border-[#D9822B]'
                    : 'text-gray-600 hover:bg-[#F7F6F5]'
                )}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pb-6 space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                active ? 'bg-[#F3E6DA] text-[#D9822B] font-medium' : 'text-gray-600 hover:bg-[#F7F6F5]'
              )}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-[#EAD8C6] text-[#C1442E] hover:bg-[#E3CBB6] transition-all">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default ProductionSidebar;
