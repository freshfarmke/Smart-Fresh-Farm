"use client";

import { MoreHorizontal, Edit2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function CollectionsPage() {
  const [sourceType, setSourceType] = useState<'rider'|'institution'>('rider');
  const [riders, setRiders] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [amountCollected, setAmountCollected] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [recentCollections, setRecentCollections] = useState<any[]>([]);

  useEffect(() => {
    fetchLookups();
    fetchCollections();
  }, []);

  async function fetchLookups() {
    try {
      const { data: ridersData } = await supabase.from('route_riders').select('*').limit(200).order('full_name');
      setRiders(ridersData || []);
    } catch (err) {
      console.error('Failed to load riders', err);
    }
    try {
      const { data: batchesData } = await supabase.from('production_batches').select('*').limit(200).order('production_date', { ascending: false });
      setBatches(batchesData || []);
    } catch (err) {
      console.error('Failed to load batches', err);
    }
    try {
      const { data: inst } = await supabase.from('institutions').select('*').limit(200).order('name');
      setInstitutions(inst || []);
    } catch (err) {
      // institutions table may not exist yet
    }
  }

  async function fetchCollections() {
    try {
      const { data } = await supabase.from('route_collections').select('*, dispatch:route_dispatch(id, rider_id)');
      setRecentCollections(data || []);
    } catch (err) {
      console.error('Failed to fetch collections', err);
    }
  }

  async function handleRecordCollection() {
    try {
      const payload: any = {
        dispatch_id: selectedBatch || null,
        amount_collected: parseFloat(amountCollected || '0'),
        collection_date: collectionDate,
        payment_method: paymentMethod || null,
        notes: null,
      };
      const { error } = await supabase.from('route_collections').insert([payload]);
      if (error) throw error;
      // refresh
      setAmountCollected(''); setSelectedBatch(''); setSelectedSource('');
      fetchCollections();
    } catch (err) {
      console.error('Failed to record collection', err);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">


      {/* Main */}
      <main className="flex-1 p-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Collections</h2>
          <p className="text-gray-500 text-sm">Record revenue from route riders and institutions</p>
        </div>

        {/* Summary Cards (basic totals from recent collections) */}
        <div className="grid grid-cols-4 gap-6">
          <SummaryCard title={`Today's Collections`} amount={`KSh ${recentCollections.reduce((s,c)=> s + Number(c.amount_collected||0),0)}`} />
          <SummaryCard title="Pending Collections" amount="KSh 0" />
          <SummaryCard title="Route Collections" amount={`KSh ${recentCollections.reduce((s,c)=> s + Number(c.amount_collected||0),0)}`} />
          <SummaryCard title="Institution Collections" amount="KSh 0" />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-3 gap-8">

          {/* New Collection Form */}
            <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">New Collection</h3>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Source Type</label>
              <select value={sourceType} onChange={e=> setSourceType(e.target.value as any)} className="w-full border rounded-xl px-4 py-2 text-sm">
                <option value="rider">Route Rider</option>
                <option value="institution">Institution</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Source</label>
              <select value={selectedSource} onChange={e=> setSelectedSource(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm">
                <option value="">Select source</option>
                {sourceType === 'rider' && riders.map(r=> <option key={r.id} value={r.id}>{r.full_name}</option>)}
                {sourceType === 'institution' && institutions.map(i=> <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Batch/Order</label>
              <select value={selectedBatch} onChange={e=> setSelectedBatch(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm">
                <option value="">Select batch/order</option>
                {batches.map(b=> <option key={b.id} value={b.id}>{b.batch_code || b.batch_number}</option>)}
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Products Sold</h4>

              <div className="text-sm space-y-1 text-gray-600">
                <Row label="White Bread (50 units)" value="KSh 2,500" />
                <Row label="Queen Cakes (30 units)" value="KSh 1,800" />
                <Row label="(100 units)" value="KSh 1,000" />
                <Row label="Total" value="KSh 5,300" bold />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Amount Collected</label>
              <input value={amountCollected} onChange={e=> setAmountCollected(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Payment Method</label>
              <select value={paymentMethod} onChange={e=> setPaymentMethod(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm">
                <option value="">Select method</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Collection Date</label>
              <input value={collectionDate} onChange={e=> setCollectionDate(e.target.value)} type="date" className="w-full border rounded-xl px-4 py-2 text-sm" />
            </div>

            <button onClick={handleRecordCollection} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium transition">
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
                  {recentCollections.map(c => (
                    <TableRow key={c.id} date={c.collection_date || c.created_at?.split('T')?.[0]} source={c.source || (c.dispatch ? c.dispatch.rider_id : '')} batch={c.dispatch_id || ''} amount={`KSh ${c.amount_collected}`} method={c.payment_method || ''} status="Confirmed" />
                  ))}
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
