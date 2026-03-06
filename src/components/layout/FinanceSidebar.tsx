"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LayoutDashboard, TrendingUp, Boxes, DollarSign, BarChart3, Settings, LogOut, Store, Truck } from 'lucide-react';

export function FinanceSidebar({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname() || currentPath || '/';

  const navItems = [
    { name: 'Overview', href: '/finance', icon: LayoutDashboard },
    { name: 'Expenses', href: '/finance/expenses', icon: TrendingUp },
    { name: 'Products', href: '/finance/products', icon: Store },
    { name: 'Route Dispatch', href: '/finance/route-dispatch', icon: Truck },
    { name: 'Collections', href: '/finance/collections', icon: DollarSign },
    { name: 'Stock Loss', href: '/finance/stock-loss', icon: Boxes },
  ];

  const bottomItems = [
    { name: 'Reports', href: '/finance/reports', icon: BarChart3 },
    { name: 'Settings', href: '/finance/settings', icon: Settings },
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
    <aside className="w-full h-full bg-[#F5F2EE] border-r border-gray-200 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 bg-white sticky top-0">
          <div className="bg-[#6B3E26] text-white p-2 rounded-lg flex-shrink-0">
            <Store size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-[#6B3E26] truncate">FreshFarm</h1>
            <p className="text-xs text-gray-500">Finance</p>
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Make 'Overview' active only on exact match, not for all /finance/* routes
            const isOverview = item.href === '/finance';
            const active = isOverview ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap',
                  active
                    ? 'bg-[#F3E6DA] text-[#D9822B] font-medium border-r-4 border-[#D9822B]'
                    : 'text-gray-600 hover:bg-[#EFEAE4]'
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pb-6 space-y-2 border-t border-gray-200 pt-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap',
                active ? 'bg-[#F3E6DA] text-[#D9822B] font-medium' : 'text-gray-600 hover:bg-[#EFEAE4]'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-[#EAD8C6] text-[#C1442E] hover:bg-[#E3CBB6] transition-all whitespace-nowrap"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default FinanceSidebar;
