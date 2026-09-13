import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { analyticsService } from '../services/analyticsService';
import { BackHeader } from '../components/common/BackHeader';
import { DailySalesChart } from '../components/analytics/DailySalesChart';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Users,
  ArrowUpRight,
  Globe2,
  PieChart,
  Calendar,
  Smartphone,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { formatMoney, orders, products } = useApp();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const summary = analyticsService.getSummary();
  const trafficSources = analyticsService.getTrafficSources();
  const regionStats = analyticsService.getRegionalStats();

  const daysNumber = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const dailySalesData = useMemo(() => {
    return analyticsService.getDailySalesPerformance(daysNumber, orders);
  }, [daysNumber, orders]);

  return (
    <div id="analytics-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Store Analytics & Profit Margins"
        subtitle="Real-time financial breakdown, customer conversion channels, and regional demand across Uzbekistan."
        fallbackRoute="dashboard"
        rightElement={
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                id={`btn-analytics-range-${r}`}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                  dateRange === r ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'Quarter'}
              </button>
            ))}
          </div>
        }
      />

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gross Merchandise Value (GMV)</p>
          <p className="text-2xl font-black text-slate-900">{formatMoney(summary.totalRevenue)}</p>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% vs previous period
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-2">
          <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Net Seller Profit</p>
          <p className="text-2xl font-black text-emerald-700">{formatMoney(summary.totalProfit)}</p>
          <span className="text-xs font-bold text-emerald-800">
            Average margin: {summary.profitMarginPercent}%
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Orders Completed</p>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          <span className="text-xs text-slate-500 font-medium">Avg. order value: {formatMoney(summary.averageOrderValue)}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Store Conversion Rate</p>
          <p className="text-2xl font-black text-blue-600">3.8%</p>
          <span className="text-xs text-emerald-600 font-semibold">Top 10% in Uzbekistan</span>
        </div>
      </div>

      {/* Daily Sales Performance Recharts Chart Component */}
      <DailySalesChart
        data={dailySalesData}
        formatMoney={formatMoney}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Traffic Sources & Regional Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Traffic Channels */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Traffic Acquisition Channels</h3>
          <p className="text-xs text-slate-500">Where your buyers discover your store</p>

          <div className="space-y-3 pt-2">
            {trafficSources.map((source, i) => (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">{source.channel}</span>
                  <span className="text-slate-900 font-mono">{source.sharePercent}% ({source.visitors.toLocaleString()} visits)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${source.sharePercent}%` }}
                    className="h-full bg-blue-600 rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: Regional Demand (Uzbekistan) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Orders by Region</h3>
          <p className="text-xs text-slate-500">Geographic customer distribution across Uzbekistan</p>

          <div className="space-y-3 pt-2">
            {regionStats.map((reg, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">{reg.region}</span>
                  <span className="text-slate-900 font-mono">{formatMoney(reg.sales)} ({reg.orders} orders)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(reg.sales / summary.totalRevenue) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
