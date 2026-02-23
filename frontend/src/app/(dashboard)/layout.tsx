'use client';

import { usePathname } from 'next/navigation';
import { FinanceSidebar, ProductionSidebar } from '@/components/layout';

/**
 * Dashboard Layout
 * Client component because it uses usePathname hook
 * Architecture: Wraps dashboard pages with sidebar
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFinance = pathname?.startsWith('/finance');

  return (
    <div className="flex min-h-screen">
      {isFinance ? <FinanceSidebar currentPath={pathname} /> : <ProductionSidebar currentPath={pathname} />}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
