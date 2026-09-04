import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyticsService } from '../services/analyticsService';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  PlusCircle,
  Store as StoreIcon,
  ExternalLink,
  Bot,
  Zap,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Layers,
  Percent,
  Link2,
  Share2,
  Boxes,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    store,
    products,
    orders,
    customers,
    navigateTo,
    formatMoney,
    getStoreUrl,
    copyStoreLink,
    openShareModal,
    currentUser,
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'profit'>('revenue');

  const summary = analyticsService.getSummary();
  const timeline = analyticsService.getTimelineData();

  const recentOrders = orders.slice(0, 6);
  const bestSellingProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 4);

  const maxChartValue = Math.max(...timeline.map((d) => (activeChartTab === 'revenue' ? d.revenue : d.profit)));

  return (
    <div id="seller-dashboard-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Row with Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Seller Dashboard</h1>
            <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              {currentUser?.plan?.toUpperCase() || 'STARTER'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, {currentUser?.name || 'Seller'}. Manage your store operations, orders, and public links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-btn-view-storefront"
            onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs min-h-[40px]"
          >
            <span>Open Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            id="dash-btn-add-product"
            onClick={() => navigateTo('products')}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add / Import Product</span>
          </button>
        </div>
      </div>

      {/* Public Store Live Link Bar (Instagram / TikTok / Telegram ready) */}
      <div className="bg-white border-2 border-blue-600/30 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <StoreIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold text-slate-900">Your Live Public Store Link</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                Online & No-Login Required
              </span>
            </div>
            <p className="text-xs text-blue-700 font-mono font-bold mt-0.5 select-all truncate">
              {getStoreUrl(store.slug)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="dash-copy-store-link"
            onClick={() => copyStoreLink(store.slug)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 min-h-[38px]"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Copy Store Link</span>
          </button>
          <button
            id="dash-share-store-link"
            onClick={() =>
              openShareModal({
                title: 'Share Your Sellnex Store',
                subtitle: 'Add this link to your Instagram bio, TikTok, or Telegram channel.',
                url: getStoreUrl(store.slug),
              })
            }
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs min-h-[38px]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on Social</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner for fresh store / 0 products */}
      {products.length === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your Store is Ready</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Welcome to your new Sellnex Store!</h2>
            <p className="text-xs text-blue-100 max-w-xl">
              Your public store is live. Choose between <strong>Personal Products</strong> (your own stock) or <strong>Dropshipping</strong> (Uzum Market / AliExpress) to start selling.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigateTo('products')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
            <button
              onClick={() => navigateTo('store-builder')}
              className="px-4 py-2.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <StoreIcon className="w-4 h-4" />
              <span>Customize Store</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-500">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900">
            {formatMoney(summary.totalRevenue || 0)}
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>{orders.length > 0 ? '+12.5% this week' : '0 orders this week'}</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-500">Total Orders</p>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <ShoppingBag className="h-3 w-3" />
            <span>{orders.filter((o) => o.orderStatus === 'Pending').length} pending processing</span>
          </div>
        </div>

        {/* Card 3: Est. Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-500">Est. Net Profit</p>
          <p className="text-2xl font-black text-emerald-600">
            +{formatMoney(summary.totalProfit || 0)}
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span>{summary.profitMarginPercent || 0}% Average margin</span>
          </div>
        </div>

        {/* Card 4: Catalog & Plan Limits */}
        <div
          onClick={() => navigateTo('pricing')}
          className="rounded-2xl border border-blue-600 bg-blue-600 p-6 text-white shadow-lg shadow-blue-500/10 space-y-2 cursor-pointer transition-all hover:bg-blue-700"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Catalog Usage</p>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Manage &rarr;</span>
          </div>
          <p className="text-2xl font-black text-white">
            {products.length} <span className="text-xs font-medium text-blue-200">items</span>
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-blue-100">
            <Package className="w-3.5 h-3.5" />
            <span>
              Plan: {currentUser?.plan?.toUpperCase() || 'STARTER'} ({products.length} /{' '}
              {currentUser?.plan === 'starter'
                ? 5
                : currentUser?.plan === 'full'
                ? 50
                : currentUser?.plan === 'premium'
                ? 100
                : currentUser?.plan === 'premium_pro'
                ? 1000
                : 50}{' '}
              max)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders & Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
            <button
              id="dash-view-all-orders-btn"
              onClick={() => navigateTo('orders')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View All Orders
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentOrders.map((order) => {
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{order.orderNumber}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.orderStatus === 'Paid'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{formatMoney(order.totalAmount)}</td>
                        <td className="px-6 py-4 text-emerald-600 font-black">+{formatMoney(order.totalProfit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No orders received yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your public store link on Instagram, TikTok, or Telegram. Orders placed by customers will appear here in real-time.
                </p>
                <button
                  onClick={() => copyStoreLink(store.slug)}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Copy and share store link</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Store Status Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Store Quick Status</h2>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 bg-slate-50/50">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-2xs">
                <StoreIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{store.name}</p>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Storefront is Active & Public
                </p>
              </div>
              <button
                onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
                className="text-slate-400 hover:text-blue-600 p-1"
                title="Open storefront"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Modes</span>
                <span className="text-[10px] font-bold text-slate-700">{products.length} Products</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Personal</span>
                    <span className="font-black text-slate-800">
                      {products.filter((p) => p.businessMode === 'personal' || !p.businessMode).length} items
                    </span>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Dropship</span>
                    <span className="font-black text-slate-800">
                      {products.filter((p) => p.businessMode === 'dropshipping').length} items
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="dash-open-store-builder"
                onClick={() => navigateTo('store-builder')}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <StoreIcon className="w-4 h-4" />
                <span>Open Storefront Customizer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Dynamics Chart & Best Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Revenue & Profit Dynamics Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Profit Overview</h3>
              <p className="text-xs text-slate-500">Performance across Click, Payme, and Uzum Bank</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                id="tab-chart-revenue"
                type="button"
                onClick={() => setActiveChartTab('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'revenue' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revenue (UZS)
              </button>
              <button
                id="tab-chart-profit"
                type="button"
                onClick={() => setActiveChartTab('profit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'profit' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Net Profit (UZS)
              </button>
            </div>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {timeline.map((point, i) => {
              const currentVal = activeChartTab === 'revenue' ? point.revenue : point.profit;
              const heightPercent = maxChartValue > 0 ? Math.round((currentVal / maxChartValue) * 100) : 30;
              const barColor =
                activeChartTab === 'revenue'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700';

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-700 transition-opacity whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    {formatMoney(currentVal)}
                  </div>
                  <div
                    style={{ height: `${Math.max(10, heightPercent)}%` }}
                    className={`w-full max-w-[36px] rounded-t-lg transition-all ${barColor}`}
                  />
                  <span className="text-[10px] text-slate-400 font-medium mt-1">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Best Selling Products with Direct Share Links */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Top Products</h3>
            <button
              onClick={() => navigateTo('products')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              All Products
            </button>
          </div>

          <div className="space-y-3">
            {bestSellingProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate leading-snug">{prod.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{formatMoney(prod.sellingPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyStoreLink(store.slug)}
                    title="Copy Store Link"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      openShareModal({
                        title: `Share "${prod.title}"`,
                        url: `${getStoreUrl(store.slug)}/product/${prod.id}`,
                        productTitle: prod.title,
                        productPrice: prod.sellingPrice,
                        productImage: prod.images[0],
                      })
                    }
                    title="Share"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
