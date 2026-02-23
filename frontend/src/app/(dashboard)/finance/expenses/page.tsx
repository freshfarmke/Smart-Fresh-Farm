"use client";

"use client";

import Link from 'next/link';
import ExpensesManagement from '@/components/finance/ExpensesManagement';
import { ChevronLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FinanceExpensesPage() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance" className="flex items-center gap-2 text-sm text-amber-700 hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Overview
          </Link>
          <h2 className="text-lg font-semibold">Expenses</h2>
        </div>

        <div>
          <Link href={`${pathname}?add=1`} className="px-3 py-1.5 bg-[#8B5E3C] text-white rounded-md hover:bg-[#765033]">Add Expense</Link>
        </div>
      </div>

      <div>
        <ExpensesManagement />
      </div>
    </div>
  );
}
