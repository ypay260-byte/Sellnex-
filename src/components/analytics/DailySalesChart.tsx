import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailySalesDataPoint } from '../../services/analyticsService';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Layers,
  ArrowUpRight,
  BarChart3,
  Activity,
  Award,
} from 'lucide-react';

interface DailySalesChartProps {
  data: DailySalesDataPoint[];
  formatMoney: (val: number) => string;
  dateRange: '7d' | '30d' | '90d';
  onDateRangeChange: (range: '7d' | '30d' | '90d') => void;
}

type MetricMode = 'all' | 'revenue' | 'profit' | 'orders';
type ChartStyle = 'area' | 'bar';

export const DailySalesChart: React.FC<DailySalesChartProps> = ({
  data,
  formatMoney,
  dateRange,
  onDateRangeChange,
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('all');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');

  // Compute 30-day aggregate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        avgDailyRevenue: 0,
        avgTicket: 0,
        peakDay: null as DailySalesDataPoint | null,
        marginPercent: 0,
      };
    }

    const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
    const totalProfit = data.reduce((acc, d) => acc + d.profit, 0);
    const totalOrders = data.reduce((acc, d) => acc + d.ordersCount, 0);
    const avgDailyRevenue = Math.round(totalRevenue / data.length);
    const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const marginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    let peakDay = data[0];
    for (const d of data) {
      if (d.revenue > peakDay.revenue) {
        peakDay = d;
      }
    }

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      avgDailyRevenue,
      avgTicket,
      peakDay,
      marginPercent,
    };
  }, [data]);

  // Formatter for Y-axis (Compact notation: 1.5M, 700K)
  const formatYAxis = (val: number) => {
    if (metricMode === 'orders') {
      return `${val}`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`;
    }
    return `${val}`;
  };

  // Custom rich Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const current = payload[0]?.payload as DailySalesDataPoint;
    if (!current) return null;

    const profitMargin = current.revenue > 0 ? Math.round((current.profit / current.revenue) * 100) : 0;

    return (
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2.5 min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div>
            <p className="font-extrabold text-slate-900">{current.dayLabel}</p>
            <p className="text-[10px] text-slate-400 font-medium">{current.dayOfWeek}, {current.date}</p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
            {current.ordersCount} orders
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Gross Sales:
            </span>
            <span className="font-bold text-slate-900 font-mono">{formatMoney(current.revenue)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Net Profit:
            </span>
            <span className="font-bold text-emerald-700 font-mono">
              {formatMoney(current.profit)} <span className="text-[10px] text-emerald-600 font-semibold">({profitMargin}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100 text-[11px]">
            <span>Average Ticket:</span>
            <span className="font-medium text-slate-700 font-mono">{formatMoney(current.averageTicket)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="daily-sales-chart-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header with title, metric toggles, and chart style switcher */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Sales Performance</h3>
              <p className="text-xs text-slate-500">
                Track revenue dynamics, net margin trajectories, and daily order volumes over time
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              id="btn-metric-all"
              type="button"
              onClick={() => setMetricMode('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                metricMode === 'all' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Sales & Profit
            </button>
            <button
              id="btn-metric-revenue"
              type="button"
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1.5 rounded-lg transition ${
                metricMode === 'revenue' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Sales
            </button>
            <button
              id="btn-metric-profit"
              type="button"
              onClick={() => setMetricMode('profit')}
              className={`px-3 py-1.5 rounded-lg transition ${
                metricMode === 'profit' ? 'bg-white text-emerald-600 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Profit
            </button>
            <button
              id="btn-metric-orders"
              type="button"
              onClick={() => setMetricMode('orders')}
              className={`px-3 py-1.5 rounded-lg transition ${
                metricMode === 'orders' ? 'bg-white text-amber-600 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Chart Style Switcher (Area vs Bar) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              id="btn-chart-style-area"
              type="button"
              onClick={() => setChartStyle('area')}
              className={`p-1.5 rounded-lg transition ${
                chartStyle === 'area' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Area Gradient View"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-chart-style-bar"
              type="button"
              onClick={() => setChartStyle('bar')}
              className={`p-1.5 rounded-lg transition ${
                chartStyle === 'bar' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                id={`btn-daily-sales-range-${range}`}
                type="button"
                onClick={() => onDateRangeChange(range)}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  dateRange === range
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlights Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 bg-slate-50/50 border-b border-slate-100">
        <div className="p-4 space-y-1">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            {dateRange === '30d' ? '30-Day Gross Sales' : `${dateRange.toUpperCase()} Sales`}
          </p>
          <p className="text-lg font-black text-slate-900">{formatMoney(stats.totalRevenue)}</p>
          <p className="text-[11px] text-slate-400">
            Daily avg: <span className="font-semibold text-slate-700">{formatMoney(stats.avgDailyRevenue)}</span>
          </p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            {dateRange === '30d' ? '30-Day Net Profit' : `${dateRange.toUpperCase()} Profit`}
          </p>
          <p className="text-lg font-black text-emerald-600">{formatMoney(stats.totalProfit)}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {stats.marginPercent}% Net seller margin
          </p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Volume</p>
          <p className="text-lg font-black text-slate-900">{stats.totalOrders} orders</p>
          <p className="text-[11px] text-slate-400">
            Avg ticket: <span className="font-semibold text-slate-700">{formatMoney(stats.avgTicket)}</span>
          </p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Peak Sales Day</p>
          <p className="text-lg font-black text-blue-600">
            {stats.peakDay ? stats.peakDay.dayLabel : '—'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            {stats.peakDay ? formatMoney(stats.peakDay.revenue) : '—'}
          </p>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="p-4 sm:p-6">
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* Revenue Gradient */}
                  <linearGradient id="salesRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Profit Gradient */}
                  <linearGradient id="salesProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Orders Gradient */}
                  <linearGradient id="salesOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  interval={data.length > 20 ? 3 : 1}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={formatYAxis}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Render Areas depending on selected metric */}
                {(metricMode === 'all' || metricMode === 'revenue') && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Sales"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesRevenueGradient)"
                  />
                )}

                {(metricMode === 'all' || metricMode === 'profit') && (
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#salesProfitGradient)"
                  />
                )}

                {metricMode === 'orders' && (
                  <Area
                    type="monotone"
                    dataKey="ordersCount"
                    name="Orders Count"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesOrdersGradient)"
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  interval={data.length > 20 ? 3 : 1}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={formatYAxis}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} />

                {(metricMode === 'all' || metricMode === 'revenue') && (
                  <Bar
                    dataKey="revenue"
                    name="Gross Sales"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                )}

                {(metricMode === 'all' || metricMode === 'profit') && (
                  <Bar
                    dataKey="profit"
                    name="Net Profit"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                )}

                {metricMode === 'orders' && (
                  <Bar
                    dataKey="ordersCount"
                    name="Orders Count"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend beneath the chart */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            {(metricMode === 'all' || metricMode === 'revenue') && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                Gross Sales (so‘m)
              </span>
            )}
            {(metricMode === 'all' || metricMode === 'profit') && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                Net Seller Profit (so‘m)
              </span>
            )}
            {metricMode === 'orders' && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                Daily Orders Volume
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Daily data aggregated from store checkout transactions • Sellnex Analytics
          </span>
        </div>
      </div>
    </div>
  );
};
