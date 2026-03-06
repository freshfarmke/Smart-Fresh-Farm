'use client';

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaries.map((item, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-600">{item.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
