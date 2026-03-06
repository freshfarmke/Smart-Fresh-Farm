'use client';

import { Clock } from 'lucide-react';

interface StockSummaryProps {
  bread: number;
  queenCakes: number;
  buns: number;
  mavin?: number;
}

export function StockSummary({ bread, queenCakes, buns, mavin = 0 }: StockSummaryProps) {
  const summaries = [
    { label: 'Total Bread in Shop', value: bread },
    { label: 'Total Queen Cakes in Shop', value: queenCakes },
    { label: 'Total Buns in Shop', value: buns },
    { label: 'Total Mavin in Shop', value: mavin },
  ];

  }
