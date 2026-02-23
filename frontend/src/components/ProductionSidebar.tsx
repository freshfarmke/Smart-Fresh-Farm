"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LayoutDashboard, Package, Truck, Building2, FileText, Settings, LogOut } from 'lucide-react';

export default function ProductionSidebar() {
  const pathname = usePathname() || '/';

  const navItemClass = (href: string, isLanding = false) => {
    const active = isLanding ? pathname === href : (pathname === href || pathname.startsWith(href + '/'));
    return clsx(
      'flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200',
      active ? 'bg-[#a88b78] text-white' : 'text-gray-200 hover:bg-[#8b5a3c]'
    );
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#7a4a2c] text-white flex flex-col justify-between shadow-lg">
      <div>
        <div className="px-6 py-6 border-b border-[#8b5a3c]">
          <h1 className="text-2xl font-bold">BakeryOS</h1>
          <p className="text-sm text-gray-300">Management Suite</p>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
          <Link href="/production" className={navItemClass('/production', true)}><LayoutDashboard size={20} />Dashboard</Link>
          <Link href="/production/dispatch" className={navItemClass('/production/dispatch')}><Truck size={20} />Route Dispatch</Link>
          <Link href="/institutions" className={navItemClass('/institutions')}><Building2 size={20} />Institutions</Link>
          <Link href="/production/shop" className={navItemClass('/production/shop')}><FileText size={20} />Shop</Link>
        </nav>
      </div>

      <div className="p-4 border-t border-[#8b5a3c]">
          <Link href="/production/reports" className={navItemClass('/production/reports')}><FileText size={20} />Reports</Link>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-200 hover:bg-red-600 hover:text-white transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
