import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import {
  User,
  Store,
  Product,
  Order,
  P2PPayment,
  DynamicPlan,
  PromoCode,
  Dispute,
  AuditLog,
  AdminSettings,
} from '../../types';
import {
  LayoutDashboard,
  Users,
  Store as StoreIcon,
  Package,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  Crown,
  Sparkles,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  ShieldAlert,
  Bell,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Megaphone,
  Boxes,
} from 'lucide-react';

// Tab components
import { AdminDashboardTab } from './tabs/AdminDashboardTab';
import { AdminUsersTab } from './tabs/AdminUsersTab';
import { AdminStoresTab } from './tabs/AdminStoresTab';
import { AdminProductsTab } from './tabs/AdminProductsTab';
import { AdminDropshippingTab } from './tabs/AdminDropshippingTab';
import { AdminOrdersTab } from './tabs/AdminOrdersTab';
import { AdminPaymentsTab } from './tabs/AdminPaymentsTab';
import { AdminSubscriptionsTab } from './tabs/AdminSubscriptionsTab';
import { AdminPromoCodesTab } from './tabs/AdminPromoCodesTab';
import { AdminBloggersTab } from './tabs/AdminBloggersTab';
import { AdminDisputesTab } from './tabs/AdminDisputesTab';
import { AdminAnalyticsTab } from './tabs/AdminAnalyticsTab';
import { AdminAuditLogsTab } from './tabs/AdminAuditLogsTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import { AdminAdsTab } from './tabs/AdminAdsTab';
import { AdminReviewsTab } from './tabs/AdminReviewsTab';

export const AdminView: React.FC = () => {
  const { currentUser, logout, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Platform Data Collections
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [p2pPayments, setP2pPayments] = useState<P2PPayment[]>([]);
  const [plans, setPlans] = useState<DynamicPlan[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  // Toast Notification System
  const [toast, setToast] = useState<{ title: string; desc?: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatMoney = (amount: number = 0) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  // Load all admin platform data with guaranteed resilience & server fallback
  const loadAllAdminData = async (forceServer = false) => {
    setIsLoading(true);
    let loadedUsersCount = 0;
    let loadedStoresCount = 0;

    try {
      if (!forceServer) {
        const results = await Promise.allSettled([
          firestoreService.getAllUsers(),
          firestoreService.getAllStores(),
          firestoreService.getAllProducts(),
          firestoreService.getAllOrders(),
          firestoreService.getP2PPayments(),
          firestoreService.getDynamicPlans(),
          firestoreService.getPromoCodes(),
          firestoreService.getDisputes(),
          firestoreService.getAuditLogs(100),
          firestoreService.getAdminSettings(),
        ]);

        if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
          setUsers(results[0].value);
          loadedUsersCount = results[0].value.length;
        }
        if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
          setStores(results[1].value);
          loadedStoresCount = results[1].value.length;
        }
        if (results[2].status === 'fulfilled') setProducts(results[2].value || []);
        if (results[3].status === 'fulfilled') setOrders(results[3].value || []);
        if (results[4].status === 'fulfilled') setP2pPayments(results[4].value || []);
        if (results[5].status === 'fulfilled') setPlans(results[5].value || []);
        if (results[6].status === 'fulfilled') setPromoCodes(results[6].value || []);
        if (results[7].status === 'fulfilled') setDisputes(results[7].value || []);
        if (results[8].status === 'fulfilled') setAuditLogs(results[8].value || []);
        if (results[9].status === 'fulfilled') setSettings(results[9].value || null);
      }

      // If client-side Firestore returned 0 users or forceServer requested, fetch directly from server API
      if (loadedUsersCount === 0 || forceServer) {
        try {
          const srvRes = await fetch('/api/admin/overview-data');
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData.success) {
              if (Array.isArray(srvData.users) && srvData.users.length > 0) {
                setUsers(srvData.users);
                loadedUsersCount = srvData.users.length;
              }
              if (Array.isArray(srvData.stores) && srvData.stores.length > 0) {
                setStores(srvData.stores);
                loadedStoresCount = srvData.stores.length;
              }
              if (Array.isArray(srvData.products)) setProducts(srvData.products);
              if (Array.isArray(srvData.orders)) setOrders(srvData.orders);
              if (Array.isArray(srvData.p2pPayments)) setP2pPayments(srvData.p2pPayments);
              if (Array.isArray(srvData.promoCodes)) setPromoCodes(srvData.promoCodes);
              if (Array.isArray(srvData.auditLogs)) setAuditLogs(srvData.auditLogs);
            }
          }
        } catch (serverErr) {
          console.warn('Backend overview-data query notice:', serverErr);
        }
      }

      if (forceServer) {
        showToast(
          'Maʼlumotlar yangilandi',
          `${loadedUsersCount} ta foydalanuvchi va ${loadedStoresCount} ta doʻkon sinxronlandi.`,
          'success'
        );
      }
    } catch (err: any) {
      console.warn('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAllAdminData();
    }
  }, [currentUser]);

  // Security Check: If not admin, completely lock out and reveal nothing
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-500 flex items-center justify-center mb-6 shadow-2xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">RUXSAT CHEKLANGAN</h1>
        <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
          Sellnex Bosh Administratori huquqi talab qilinadi. Barcha ruxsatsiz urinishlar audit jurnalida qayd etiladi.
        </p>
        <button
          onClick={() => {
            window.location.hash = '#admin-panel';
            window.location.reload();
          }}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg cursor-pointer"
        >
          Admin Tizimiga Kirish
        </button>
      </div>
    );
  }

  const pendingP2PCount = p2pPayments.filter((p) => p.status === 'pending').length;
  const openDisputesCount = disputes.filter((d) => d.status === 'open').length;

  const navigationItems = [
    { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'stores', label: "Do'konlar & Savdogarlar", icon: StoreIcon },
    { id: 'products', label: 'Mahsulotlar Nazorati', icon: Package },
    { id: 'dropshipping', label: 'Dropshipping Tizimi', icon: Boxes, badge: 'Katalog' },
    { id: 'reviews', label: 'Mahsulot Sharhlari', icon: MessageSquare },
    { id: 'orders', label: 'Platforma Buyurtmalari', icon: ShoppingBag },
    { id: 'payments', label: "P2P To'lovlar", icon: CreditCard, badge: pendingP2PCount },
    { id: 'subscriptions', label: 'Tariflar & Obunalar', icon: Crown },
    { id: 'promos', label: 'Promokodlar & Kuponlar', icon: Sparkles },
    { id: 'bloggers', label: 'Bloggerlar & Hamkorlar', icon: Users, badge: 'Yangi' },
    { id: 'ads', label: 'Reklama & Slayder', icon: Megaphone },
    { id: 'disputes', label: 'Nizolar & Shikoyatlar', icon: AlertTriangle, badge: openDisputesCount },
    { id: 'analytics', label: 'Makro Analitika', icon: BarChart3 },
    { id: 'audit', label: 'Xavfsizlik Jurnali', icon: ShieldCheck },
    { id: 'settings', label: 'Tizim Sozlamalari', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                : 'bg-slate-900/90 text-slate-200 border-slate-700'
            }`}
          >
            <div>
              <div className="font-bold text-xs">{toast.title}</div>
              {toast.desc && <div className="text-[11px] opacity-80">{toast.desc}</div>}
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-current opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-black text-white text-sm shadow-md">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm tracking-tight">Sellnex</span>
                <span className="px-1.5 py-0.5 rounded-md bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-mono font-bold uppercase">
                  BOSH ADMIN
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Firestore Connection Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Baza:</span>
            <span className="text-emerald-400 font-bold">{users.length} ta aʼzo</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-bold">{stores.length} doʻkon</span>
          </div>

          <button
            onClick={() => loadAllAdminData(true)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Barcha maʼlumotlarni qayta sinxronlash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
            <span className="hidden md:inline">Yangilash</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Admin Identity Info */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-400 font-bold text-xs flex items-center justify-center">
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-none">{currentUser.email}</div>
              <div className="text-[10px] text-slate-500 leading-tight">Super Administrator</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              if (typeof window !== 'undefined') {
                window.location.hash = '';
              }
            }}
            className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Admin sessiyasini yakunlash"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main Body with Persistent Admin Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Boshqaruv Menusi
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-white text-rose-600'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Sellnex Tizimi</span>
              <span className="font-mono text-slate-400">v4.8.0-uz</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ma'lumotlar bazasi</span>
              <span className="text-emerald-400 font-bold">Ulangan</span>
            </div>
          </div>
        </aside>

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {isLoading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Synchronizing Sellnex Platform Ledger...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboardTab
                  users={users}
                  stores={stores}
                  products={products}
                  orders={orders}
                  p2pPayments={p2pPayments}
                  plans={plans}
                  formatMoney={formatMoney}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'users' && (
                <AdminUsersTab
                  users={users}
                  stores={stores}
                  plans={plans}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                />
              )}

              {activeTab === 'stores' && (
                <AdminStoresTab
                  stores={stores}
                  users={users}
                  products={products}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'products' && (
                <AdminProductsTab
                  products={products}
                  stores={stores}
                  users={users}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'dropshipping' && (
                <AdminDropshippingTab
                  orders={orders}
                  stores={stores}
                  users={users}
                  adminEmail={currentUser.email}
                  adminUid={currentUser.id || (currentUser as any).uid}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'reviews' && (
                <AdminReviewsTab
                  adminEmail={currentUser.email}
                  showToast={showToast}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrdersTab
                  orders={orders}
                  stores={stores}
                  users={users}
                  adminEmail={currentUser.email}
                  adminUid={currentUser.id || (currentUser as any).uid}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'payments' && (
                <AdminPaymentsTab
                  p2pPayments={p2pPayments}
                  settings={settings}
                  plans={plans}
                  users={users}
                  orders={orders}
                  stores={stores}
                  adminEmail={currentUser.email}
                  adminUid={currentUser.id || (currentUser as any).uid}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'subscriptions' && (
                <AdminSubscriptionsTab
                  plans={plans}
                  settings={settings}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'promos' && (
                <AdminPromoCodesTab
                  promoCodes={promoCodes}
                  plans={plans}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'bloggers' && (
                <AdminBloggersTab
                  adminEmail={currentUser.email}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'ads' && (
                <AdminAdsTab showToast={showToast} />
              )}

              {activeTab === 'disputes' && (
                <AdminDisputesTab
                  disputes={disputes}
                  orders={orders}
                  stores={stores}
                  users={users}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'analytics' && (
                <AdminAnalyticsTab
                  users={users}
                  stores={stores}
                  products={products}
                  orders={orders}
                  p2pPayments={p2pPayments}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'audit' && (
                <AdminAuditLogsTab
                  auditLogs={auditLogs}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                />
              )}

              {activeTab === 'settings' && (
                <AdminSettingsTab
                  settings={settings}
                  adminEmail={currentUser.email}
                  onRefresh={loadAllAdminData}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
