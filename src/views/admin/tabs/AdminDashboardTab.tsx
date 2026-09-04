import React, { useState } from 'react';
import {
  User,
  Store,
  Product,
  Order,
  P2PPayment,
  DynamicPlan,
} from '../../../types';
import {
  TrendingUp,
  Users,
  Store as StoreIcon,
  Package,
  ShoppingBag,
  CreditCard,
  Crown,
  Clock,
  AlertCircle,
  ShieldCheck,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { UserGrowthChart } from '../components/UserGrowthChart';

interface AdminDashboardTabProps {
  users: User[];
  stores: Store[];
  products: Product[];
  orders: Order[];
  p2pPayments: P2PPayment[];
  plans: DynamicPlan[];
  onNavigateTab: (tab: string) => void;
  formatMoney: (amount: number) => string;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  users,
  stores,
  products,
  orders,
  p2pPayments,
  plans,
  onNavigateTab,
  formatMoney,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Filter calculations based on time period
  const now = new Date();
  const getFilterThreshold = () => {
    switch (timeFilter) {
      case 'today':
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return startOfToday.getTime();
      case '7days':
        return now.getTime() - 7 * 24 * 60 * 60 * 1000;
      case '30days':
        return now.getTime() - 30 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const threshold = getFilterThreshold();

  const filteredUsers = users.filter((u) => new Date(u.createdAt).getTime() >= threshold);
  const filteredOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= threshold);
  const filteredProducts = products.filter((p) => new Date(p.createdAt).getTime() >= threshold);

  // Metrics
  const totalUsers = users.length;
  const newUsersToday = users.filter((u) => {
    const d = new Date(u.createdAt);
    return d.toDateString() === now.toDateString();
  }).length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length;

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.published !== false).length;
  const suspendedStores = stores.filter((s) => s.published === false).length;

  const totalProducts = products.length;
  const flaggedProducts = products.filter((p) => (p as any).moderationStatus === 'flagged').length;

  const totalOrders = filteredOrders.length;
  const totalGMV = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const platformRevenueEst = filteredOrders.reduce((sum, o) => sum + (o.total || 0) * 0.02, 0); // 2% platform fee

  // Subscriptions breakdown
  const proUsers = users.filter((u) => u.plan === 'pro').length;
  const businessUsers = users.filter((u) => u.plan === 'business').length;
  const customUsers = users.filter((u) => u.plan === 'custom').length;
  const trialUsers = users.filter((u) => u.plan === 'trial' || u.plan === 'free').length;
  const pendingP2P = p2pPayments.filter((p) => p.status === 'pending').length;

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Korsatkich', 'Qiymat'],
      ['Jami Foydalanuvchilar', totalUsers],
      ['Bugungi Yangi Foydalanuvchilar', newUsersToday],
      ['Faol Dokonlar', activeStores],
      ['Jami Mahsulotlar', totalProducts],
      ['Jami Buyurtmalar', totalOrders],
      ['Jami Savdo Hajmi (UZS)', totalGMV],
      ['Platforma Daromadi (UZS)', platformRevenueEst],
      ['PRO Obunachilar', proUsers],
      ['BUSINESS Obunachilar', businessUsers],
      ['Sinov davridagi a\'zolar', trialUsers],
      ['Kutilayotgan P2P Tolovlar', pendingP2P],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sellnex_admin_statistika_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Jonli Tizim Telemetriyasi</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Platforma Boshqaruv Markazi</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            O'zbekiston bo'ylab barcha savdogarlar, buyurtmalar va obunalarni markaziy monitoring qilish
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            {(
              [
                { id: 'today', label: 'Bugun' },
                { id: '7days', label: '7 kun' },
                { id: '30days', label: '30 kun' },
                { id: 'all', label: 'Barcha vaqt' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setTimeFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  timeFilter === item.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>CSV Yuklab Olish</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Bar for Pending Items */}
      {pendingP2P > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Diqqat talab:</span> {pendingP2P} ta P2P karta to'lovi tasdiqlash uchun kutmoqda (chek tekshiruvi).
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('payments')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer shrink-0"
          >
            To'lovlarni ko'rish →
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Jami Foydalanuvchilar</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalUsers}</div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-emerald-400 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +{newUsersToday} bugun
            </span>
            <span className="text-slate-500">{activeUsers} ta faol</span>
          </div>
        </div>

        {/* Active Stores */}
        <div
          onClick={() => onNavigateTab('stores')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Faol Do'konlar</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <StoreIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activeStores}</div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-400">{totalStores} jami ochilgan</span>
            <span className="text-amber-400">{suspendedStores} nofaol</span>
          </div>
        </div>

        {/* Total GMV */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Jami Savdo Aylanmasi</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white truncate">{formatMoney(totalGMV)}</div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-indigo-400 font-medium">{totalOrders} ta buyurtma</span>
          </div>
        </div>

        {/* Platform Revenue */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Taxminiy Platforma Daromadi</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 truncate">{formatMoney(platformRevenueEst)}</div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-400">2% xizmat ulushi</span>
            <span className="text-emerald-400 font-medium">Avto-hisoblash</span>
          </div>
        </div>
      </div>

      {/* USER GROWTH CHART - DEDICATED PROMINENT SECTION */}
      <UserGrowthChart
        users={users}
        stores={stores}
        title="Foydalanuvchilar va Do'konlar O'sish Dinamikasi"
        subtitle="Platformaga yangi qo'shilganlar, pulli obunalar va do'kon ochilish statistikasi"
      />

      {/* Secondary Metric Grid: Subscriptions, Products, P2P Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Obuna Tariflari Taqsimoti</span>
              </h3>
              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Boshqarish →
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-slate-300 font-medium">BUSINESS Tarifi</span>
                </div>
                <span className="text-white font-bold">{businessUsers} ta savdogar</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-300 font-medium">PRO Tarifi</span>
                </div>
                <span className="text-white font-bold">{proUsers} ta savdogar</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-slate-300 font-medium">Sinov / Bepul A'zolar</span>
                </div>
                <span className="text-white font-bold">{trialUsers} ta a'zo</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Kutilayotgan P2P to'lovlar:</span>
            <span className={`font-bold ${pendingP2P > 0 ? 'text-amber-400 font-mono' : 'text-slate-400'}`}>
              {pendingP2P} ta
            </span>
          </div>
        </div>

        {/* Global Catalog Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Mahsulotlar Katalogi Nazorati</span>
              </h3>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Katalog →
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Faol Sotuvdagi Mahsulotlar</span>
                <span className="text-emerald-400 font-bold">{totalProducts} ta</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Shubhali / Tekshiruvdagilar</span>
                <span className={`font-bold ${flaggedProducts > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {flaggedProducts} ta
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Har bir do'konga o'rtacha</span>
                <span className="text-white font-bold">
                  {totalStores > 0 ? Math.round(totalProducts / totalStores) : 0} ta mahsulot
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            AliExpress, 1688 va Abu Saxiy bozorlari bilan to'liq integratsiya.
          </div>
        </div>

        {/* Quick Nav Shortcut Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Tezkor Boshqaruv Modullari</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onNavigateTab('users')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400 mb-1.5" />
              <div className="font-bold text-white">Foydalanuvchilar</div>
              <div className="text-[10px] text-slate-400">Tariflar & bloklash</div>
            </button>

            <button
              onClick={() => onNavigateTab('payments')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-400 mb-1.5" />
              <div className="font-bold text-white">P2P To'lovlar</div>
              <div className="text-[10px] text-slate-400">Cheklarni tasdiqlash</div>
            </button>

            <button
              onClick={() => onNavigateTab('promos')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400 mb-1.5" />
              <div className="font-bold text-white">Promokodlar</div>
              <div className="text-[10px] text-slate-400">Chegirmalar & aksiya</div>
            </button>

            <button
              onClick={() => onNavigateTab('audit')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400 mb-1.5" />
              <div className="font-bold text-white">Audit Jurnali</div>
              <div className="text-[10px] text-slate-400">Xavfsizlik tarixi</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

