import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Star,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, formatMoney, navigateTo } = useApp();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="customers-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Customers CRM"
        subtitle="View customer purchase history, contact records, lifetime value, and regional locations."
        fallbackRoute="dashboard"
        rightElement={
          <div className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs min-h-[40px] flex items-center">
            Total Buyers: <span className="text-blue-600 font-extrabold ml-1">{customers.length}</span>
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone (+998), or province..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
          />
        </div>
      </div>

      {/* Customers Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-3">Phone & Email</th>
                <th className="py-3.5 px-3">Region</th>
                <th className="py-3.5 px-3">Orders</th>
                <th className="py-3.5 px-3">Total Spend (LTV)</th>
                <th className="py-3.5 px-3">Tier</th>
                <th className="py-3.5 px-4 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="font-medium text-slate-900">{c.phone}</p>
                    <p className="text-[11px] text-slate-400">{c.email}</p>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    {c.region}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                  </td>

                  <td className="py-3.5 px-3 font-extrabold text-blue-600">
                    {formatMoney(c.totalSpent)}
                  </td>

                  <td className="py-3.5 px-3">
                    {c.totalSpent > 1000000 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                        <Sparkles className="w-3 h-3 text-amber-600" /> VIP Gold
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Regular
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    {c.lastOrderDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card-based View */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filtered.map((c) => (
            <div key={c.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">ID: {c.id}</p>
                  </div>
                </div>

                {c.totalSpent > 1000000 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> VIP Gold
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Regular
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone</span>
                  <span className="font-medium text-slate-800">{c.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Region</span>
                  <span className="font-medium text-slate-800">{c.region}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Orders</span>
                  <span className="font-medium text-slate-800">{c.totalOrders} total</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Spend (LTV)</span>
                  <span className="font-black text-blue-600">{formatMoney(c.totalSpent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
