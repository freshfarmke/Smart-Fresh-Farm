"use client";

import { MoreHorizontal, Edit2 } from 'lucide-react';

export default function CollectionsPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">


      {/* Main */}
      <main className="flex-1 p-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Collections</h2>
          <p className="text-gray-500 text-sm">Record revenue from route riders and institutions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6">
          <SummaryCard title="Today's Collections" amount="KSh 17,800" />
          <SummaryCard title="Pending Collections" amount="KSh 12,500" />
          <SummaryCard title="Route Collections" amount="KSh 9,500" />
          <SummaryCard title="Institution Collections" amount="KSh 21,250" />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-3 gap-8">

          {/* New Collection Form */}
          <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">New Collection</h3>

            <FormSelect label="Source Type" />
            <FormSelect label="Batch/Order" />

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Products Sold</h4>

              <div className="text-sm space-y-1 text-gray-600">
                <Row label="White Bread (50 units)" value="KSh 2,500" />
                <Row label="Queen Cakes (30 units)" value="KSh 1,800" />
                <Row label="(100 units)" value="KSh 1,000" />
                <Row label="Total" value="KSh 5,300" bold />
              </div>
            </div>

            <FormInput label="Amount Collected" placeholder="5300" />
            <FormSelect label="Payment Method" />
            <FormInput label="Collection Date" placeholder="mm/dd/yyyy" />

            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium transition">
              Record Collection
            </button>
          </div>

          {/* Recent Collections Table */}
          <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-700">Recent Collections</h3>

              <div className="flex gap-4">
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option>All Sources</option>
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option>Today</option>
                </select>
              </div>
            </div>

            <table className="w-full text-sm text-left">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="py-3">Date</th>
                  <th>Source</th>
                  <th>Batch/Order</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                <TableRow date="2024-02-19" source="John Doe" batch="BATCH-001" amount="KSh 5,300" method="M-Pesa" status="Confirmed" />
                <TableRow date="2024-02-19" source="St. Mary’s School" batch="ORDER-456" amount="KSh 12,500" method="Bank Transfer" status="Pending" />
                <TableRow date="2024-02-18" source="Jane Smith" batch="BATCH-002" amount="KSh 4,200" method="Cash" status="Confirmed" />
                <TableRow date="2024-02-18" source="City Hospital" batch="ORDER-789" amount="KSh 8,750" method="Card" status="Confirmed" />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Components */

// SidebarItem removed — not used in this page

function SummaryCard({ title, amount }:{title:string, amount:string}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h4 className="text-xl font-semibold text-gray-800 mt-2">{amount}</h4>
    </div>
  );
}

function FormSelect({ label }:{label:string}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">{label}</label>
      <select className="w-full border rounded-xl px-4 py-2 text-sm">
        <option>Select {label.toLowerCase()}</option>
      </select>
    </div>
  );
}

function FormInput({ label, placeholder }:{label:string, placeholder?:string}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">{label}</label>
      <input type="text" placeholder={placeholder} className="w-full border rounded-xl px-4 py-2 text-sm" />
    </div>
  );
}

function Row({ label, value, bold }:{label:string, value:string, bold?:boolean}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

function TableRow({ date, source, batch, amount, method, status }:{date:string, source:string, batch:string, amount:string, method:string, status:string}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4">{date}</td>
      <td>{source}</td>
      <td>{batch}</td>
      <td className="font-medium">{amount}</td>
      <td>{method}</td>
      <td>
        <span className={`px-3 py-1 rounded-full text-xs ${status === "Confirmed" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
          {status}
        </span>
      </td>
      <td className="flex gap-3 text-gray-500">
        <Edit2 size={16} />
        <MoreHorizontal size={16} />
      </td>
    </tr>
  );
}
