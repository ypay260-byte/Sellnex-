import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { analyticsService, DailySalesDataPoint } from '../services/analyticsService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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
  Activity,
  Calendar,
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
    t,
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'profit' | 'both'>('revenue');

  const summary = analyticsService.getSummary();

  // 30-day daily sales & order revenue dataset
  const dailySalesData = useMemo(() => {
    return analyticsService.getDailySalesPerformance(30, orders);
  }, [orders]);

  // Aggregate statistics over the 30-day trend window
  const thirtyDayStats = useMemo(() => {
    if (!dailySalesData || dailySalesData.length === 0) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        avgDailyRevenue: 0,
        peakDay: null as DailySalesDataPoint | null,
      };
    }
    const totalRevenue = dailySalesData.reduce((acc, d) => acc + d.revenue, 0);
    const totalProfit = dailySalesData.reduce((acc, d) => acc + d.profit, 0);
    const totalOrders = dailySalesData.reduce((acc, d) => acc + d.ordersCount, 0);
    const avgDailyRevenue = Math.round(totalRevenue / dailySalesData.length);
    let peakDay = dailySalesData[0];
    for (const d of dailySalesData) {
      if (d.revenue > peakDay.revenue) {
        peakDay = d;
      }
    }
    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      avgDailyRevenue,
      peakDay,
    };
  }, [dailySalesData]);

  const recentOrders = orders.slice(0, 6);
  const bestSellingProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 4);

  const formatYAxis = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`;
    }
    return `${val}`;
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const current = payload[0]?.payload as DailySalesDataPoint;
    if (!current) return null;

    const profitMargin = current.revenue > 0 ? Math.round((current.profit / current.revenue) * 100) : 0;

    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2 min-w-[210px] z-50">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div>
            <p className="font-extrabold text-slate-900">{current.dayLabel}</p>
            <p className="text-[10px] text-slate-400 font-medium">{current.dayOfWeek}, {current.date}</p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
            {current.ordersCount} {t('nav_orders', 'buyurtma')}
          </span>
        </div>

        <div className="space-y-1.5">
          {(activeChartTab === 'revenue' || activeChartTab === 'both') && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                {t('dash_chart_tab_revenue', 'Tushum')}:
              </span>
              <span className="font-bold text-slate-900 font-mono">{formatMoney(current.revenue)}</span>
            </div>
          )}

          {(activeChartTab === 'profit' || activeChartTab === 'both') && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                {t('dash_chart_tab_profit', 'Foyda')}:
              </span>
              <span className="font-bold text-emerald-700 font-mono">
                {formatMoney(current.profit)} <span className="text-[10px] text-emerald-600 font-semibold">({profitMargin}%)</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100 text-[10px]">
            <span>{t('dash_stat_margin_avg', 'Oʻrtacha chek')}:</span>
            <span className="font-medium text-slate-700 font-mono">{formatMoney(current.averageTicket)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="seller-dashboard-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Row with Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {t('dash_title', 'Sotuvchi paneli')}
            </h1>
            <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              {currentUser?.plan?.toUpperCase() || 'STARTER'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dash_welcome', 'Xush kelibsiz, {name}. Doʻkoningiz, buyurtmalar va havolalarni boshqaring.').replace('{name}', currentUser?.name || 'Sotuvchi')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-btn-view-storefront"
            onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs min-h-[40px]"
          >
            <span>{t('dash_open_store', 'Doʻkonni ochish')}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            id="dash-btn-add-product"
            onClick={() => navigateTo('products')}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('dash_add_product', 'Mahsulot qoʻshish / Import')}</span>
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
              <p className="text-xs font-extrabold text-slate-900">
                {t('dash_live_link_title', 'Faol ommaviy doʻkoningiz havolasi')}
              </p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                {t('dash_live_badge', 'Online • Kirish talab etilmaydi')}
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
            <span>{t('dash_copy_link', 'Doʻkon havolasini nusxalash')}</span>
          </button>
          <button
            id="dash-share-store-link"
            onClick={() =>
              openShareModal({
                title: t('dash_share_social', 'Ijtimoiy tarmoqlarda ulashish'),
                subtitle: 'Add this link to your Instagram bio, TikTok, or Telegram channel.',
                url: getStoreUrl(store.slug),
              })
            }
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs min-h-[38px]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('dash_share_social', 'Ijtimoiy tarmoqlarda ulashish')}</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner for fresh store / 0 products */}
      {products.length === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('dash_store_active_badge', 'Doʻkoningiz tayyor')}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {t('dash_welcome_banner_title', 'Yangi Sellnex doʻkoningizga xush kelibsiz!')}
            </h2>
            <p className="text-xs text-blue-100 max-w-xl">
              {t('dash_welcome_banner_desc', 'Ommaviy doʻkoningiz faol. Shaxsiy mahsulotlar (oʻz omboringiz) yoki dropshipping (Uzum Market / AliExpress) orqali savdoni boshlang.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigateTo('products')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('dash_add_first_product', 'Birinchi mahsulotni qoʻshish')}</span>
            </button>
            <button
              onClick={() => navigateTo('store-builder')}
              className="px-4 py-2.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <StoreIcon className="w-4 h-4" />
              <span>{t('dash_customize_store', 'Doʻkonni sozlash')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            {t('dash_stat_revenue', 'Jami tushum')}
          </p>
          <p className="text-2xl font-black text-slate-900">
            {formatMoney(summary.totalRevenue || 0)}
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>{orders.length > 0 ? `+12.5% ${t('dash_this_week_change', 'bu hafta')}` : `0 ${t('dash_this_week_change', 'bu hafta')}`}</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            {t('dash_stat_orders', 'Jami buyurtmalar')}
          </p>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <ShoppingBag className="h-3 w-3" />
            <span>{orders.filter((o) => o.orderStatus === 'Pending').length} {t('dash_pending_processing', 'koʻrib chiqilmoqda')}</span>
          </div>
        </div>

        {/* Card 3: Est. Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            {t('dash_stat_profit', 'Sof foyda')}
          </p>
          <p className="text-2xl font-black text-emerald-600">
            +{formatMoney(summary.totalProfit || 0)}
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span>{summary.profitMarginPercent || 0}% {t('dash_stat_margin_avg', 'Oʻrtacha marja')}</span>
          </div>
        </div>

        {/* Card 4: Catalog & Plan Limits */}
        <div
          onClick={() => navigateTo('pricing')}
          className="rounded-2xl border border-blue-600 bg-blue-600 p-6 text-white shadow-lg shadow-blue-500/10 space-y-2 cursor-pointer transition-all hover:bg-blue-700"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              {t('dash_stat_catalog_usage', 'Katalogdan foydalanish')}
            </p>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Manage &rarr;</span>
          </div>
          <p className="text-2xl font-black text-white">
            {products.length} <span className="text-xs font-medium text-blue-200">{t('trial_products_count', 'ta mahsulot')}</span>
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-blue-100">
            <Package className="w-3.5 h-3.5" />
            <span>
              Tarif: {currentUser?.plan?.toUpperCase() || 'FREE TRIAL'} ({products.length} /{' '}
              {currentUser?.productLimit ||
                (currentUser?.plan === 'premium' || currentUser?.plan === 'premium_pro'
                  ? 110
                  : currentUser?.plan === 'business'
                  ? 50
                  : currentUser?.plan === 'pro' || currentUser?.plan === 'full'
                  ? 20
                  : 5)}{' '}
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
            <h2 className="text-sm font-bold text-slate-900">
              {t('dash_recent_orders_title', 'Mijozlarning soʻnggi buyurtmalari')}
            </h2>
            <button
              id="dash-view-all-orders-btn"
              onClick={() => navigateTo('orders')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              {t('dash_view_all_orders', 'Barcha buyurtmalar')}
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3">{t('dash_th_order_id', 'Buyurtma ID')}</th>
                    <th className="px-6 py-3">{t('dash_th_customer', 'Mijoz')}</th>
                    <th className="px-6 py-3">{t('dash_th_status', 'Holat')}</th>
                    <th className="px-6 py-3">{t('dash_th_amount', 'Summa')}</th>
                    <th className="px-6 py-3">{t('dash_th_profit', 'Foyda')}</th>
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
                <h3 className="text-sm font-bold text-slate-800">
                  {t('dash_no_orders_title', 'Hozircha buyurtmalar yoʻq')}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('dash_no_orders_desc', 'Doʻkoningiz havolasini Instagram, TikTok yoki Telegramda ulashing. Mijozlar bergan buyurtmalar bu yerda darhol aks etadi.')}
                </p>
                <button
                  onClick={() => copyStoreLink(store.slug)}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{t('dash_copy_link', 'Doʻkon havolasini nusxalash')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Store Status Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            {t('dash_quick_status_title', 'Doʻkon holati')}
          </h2>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 bg-slate-50/50">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-2xs">
                <StoreIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{store.name}</p>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('dash_store_active_badge', 'Doʻkoningiz faol va ochiq')}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('dash_business_modes', 'Biznes rejimlari')}
                </span>
                <span className="text-[10px] font-bold text-slate-700">{products.length} {t('trial_products_count', 'Mahsulot')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {t('dash_mode_personal', 'Shaxsiy')}
                    </span>
                    <span className="font-black text-slate-800">
                      {products.filter((p) => p.businessMode === 'personal' || !p.businessMode).length} {t('trial_products_count', 'ta')}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {t('dash_mode_dropship', 'Dropship')}
                    </span>
                    <span className="font-black text-slate-800">
                      {products.filter((p) => p.businessMode === 'dropshipping').length} {t('trial_products_count', 'ta')}
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
                <span>{t('dash_open_customizer', 'Doʻkon konstruktorini ochish')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Dynamics Chart & Best Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Revenue & Profit Dynamics Recharts Line Chart */}
        <div id="dash-revenue-trend-chart-card" className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('dash_chart_title', 'Tushum va foyda dinamikasi')}
                </h3>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                  {t('dash_chart_30d_badge', 'Oxirgi 30 kun')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t('dash_chart_subtitle', 'Oxirgi 30 kunlik buyurtmalar tushumi va toʻlovlar trendi')}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                id="tab-chart-revenue"
                type="button"
                onClick={() => setActiveChartTab('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'revenue'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dash_chart_tab_revenue', 'Tushum (UZS)')}
              </button>
              <button
                id="tab-chart-profit"
                type="button"
                onClick={() => setActiveChartTab('profit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'profit'
                    ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dash_chart_tab_profit', 'Sof foyda (UZS)')}
              </button>
              <button
                id="tab-chart-both"
                type="button"
                onClick={() => setActiveChartTab('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeChartTab === 'both'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dash_chart_tab_both', 'Ikkalasi')}
              </button>
            </div>
          </div>

          {/* 30-Day Aggregates Mini-Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {t('dash_chart_30d_total', '30 kunlik jami tushum')}
              </p>
              <p className="text-sm font-black text-slate-900">{formatMoney(thirtyDayStats.totalRevenue)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {t('dash_chart_daily_avg', 'Kunlik oʻrtacha')}
              </p>
              <p className="text-sm font-black text-blue-600">{formatMoney(thirtyDayStats.avgDailyRevenue)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {t('dash_chart_peak_day', 'Eng yuqori kun')}
              </p>
              <p className="text-sm font-black text-emerald-600 truncate">
                {thirtyDayStats.peakDay ? thirtyDayStats.peakDay.dayLabel : '—'}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {t('dash_stat_orders', 'Jami buyurtmalar')}
              </p>
              <p className="text-sm font-black text-slate-800">{thirtyDayStats.totalOrders} ta</p>
            </div>
          </div>

          {/* Recharts Line Chart Visualization */}
          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailySalesData}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="shortDate"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  interval={2}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={formatYAxis}
                  width={52}
                />
                <Tooltip content={<CustomChartTooltip />} />

                {(activeChartTab === 'revenue' || activeChartTab === 'both') && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name={t('dash_chart_tab_revenue', 'Tushum')}
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}

                {(activeChartTab === 'profit' || activeChartTab === 'both') && (
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name={t('dash_chart_tab_profit', 'Foyda')}
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray={activeChartTab === 'both' ? '4 4' : undefined}
                    dot={false}
                    activeDot={{ r: 5, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Footnote */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 font-semibold text-slate-600">
              {(activeChartTab === 'revenue' || activeChartTab === 'both') && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-600 rounded-full inline-block" />
                  {t('dash_chart_tab_revenue', 'Kunlik tushum')}
                </span>
              )}
              {(activeChartTab === 'profit' || activeChartTab === 'both') && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" />
                  {t('dash_chart_tab_profit', 'Sof foyda')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {t('dash_chart_footnote', 'Doʻkoningizdagi toʻlangan va qabul qilingan buyurtmalar asosida shakllangan')}
            </p>
          </div>
        </div>

        {/* Right 4 Cols: Best Selling Products with Direct Share Links */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {t('dash_top_products', 'Ommabop mahsulotlar')}
            </h3>
            <button
              onClick={() => navigateTo('products')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              {t('dash_all_products', 'Barcha mahsulotlar')}
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
                    title={t('dash_copy_link', 'Doʻkon havolasini nusxalash')}
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
