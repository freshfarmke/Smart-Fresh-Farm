'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FinanceSidebar, ProductionSidebar } from '@/components/layout';
import { useEffect } from 'react';
import { getCurrentUser, canManageFinance } from '@/lib/auth';

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
  const router = useRouter();

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

  return (
    <div className="flex min-h-screen">
      {isFinance ? <FinanceSidebar currentPath={pathname} /> : <ProductionSidebar currentPath={pathname} />}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
