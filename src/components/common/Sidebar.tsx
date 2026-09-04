import React from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Store as StoreIcon,
  Users,
  Truck,
  CreditCard,
  BarChart3,
  Sliders,
  Layers,
  Settings,
  ShieldAlert,
  ExternalLink,
  Bot,
  Link2,
  Sparkles,
  X,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentRoute,
    navigateTo,
    store,
    userStores,
    switchStore,
    orders,
    products,
    currentUser,
    logout,
    copyStoreLink,
    t,
  } = useApp();

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Paid').length;
  const publishedProductsCount = products.filter((p) => p.status === 'Published').length;

  const menuItems = [
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'products', label: t('nav_products', 'Products'), icon: Package, badge: publishedProductsCount },
    { id: 'import-product', label: t('nav_import_product', 'Import Product'), icon: PlusCircle, highlight: true },
    { id: 'orders', label: t('nav_orders', 'Orders'), icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'store-builder', label: t('nav_store_builder', 'Store Builder'), icon: StoreIcon },
    { id: 'customers', label: t('nav_customers', 'Customers'), icon: Users },
    { id: 'suppliers', label: t('nav_suppliers', 'Suppliers'), icon: Layers },
    { id: 'automation', label: t('nav_automation', 'Automation'), icon: Bot },
    { id: 'payments', label: t('nav_payments', 'Payments'), icon: CreditCard },
    { id: 'delivery', label: t('nav_delivery', 'Delivery'), icon: Truck },
    { id: 'analytics', label: t('nav_analytics', 'Analytics'), icon: BarChart3 },
    { id: 'partner-links', label: t('nav_partner_links', 'Partner Links'), icon: Link2 },
    { id: 'integrations', label: t('nav_integrations', 'Integrations'), icon: Sliders },
    { id: 'pricing', label: t('nav_pricing', 'Plans & Pricing'), icon: Sparkles },
    { id: 'settings', label: t('nav_settings', 'Settings'), icon: Settings },
  ];

  const handleNav = (routeId: string) => {
    navigateTo(routeId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="seller-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen w-72 max-w-[85vw] lg:w-64 bg-white border-r border-slate-200 text-slate-900 flex flex-col transition-transform duration-200 ease-in-out shadow-2xl lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 lg:px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
          <button
            id="sidebar-logo-btn"
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2.5 group text-left min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1 uppercase">
                SELLNEX
              </span>
            </div>
          </button>

          {/* Close Button for Mobile Drawer */}
          <button
            id="sidebar-mobile-close-btn"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Store Quick Status */}
      <div className="p-3 border-b border-slate-100 shrink-0 space-y-2">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                {(store?.name || 'M').charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">{store?.name || 'My Store'}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              id="sidebar-view-live-store"
              onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors group"
            >
              <span>Preview</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
            </button>
            <button
              id="sidebar-copy-store-link"
              onClick={() => copyStoreLink(store.slug || store.id)}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors"
            >
              <Link2 className="w-3 h-3 text-blue-600" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>

        {/* Subscription Plan Progress Mini Card */}
        <div
          onClick={() => handleNav('pricing')}
          className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100/70 hover:to-indigo-100/70 border border-blue-200 rounded-xl p-2.5 cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-blue-900 uppercase">
              {currentUser?.plan === 'starter'
                ? 'STARTER'
                : currentUser?.plan === 'full'
                ? 'FULL'
                : currentUser?.plan === 'premium'
                ? 'PREMIUM'
                : currentUser?.plan === 'premium_pro' || currentUser?.plan === 'pro' || currentUser?.plan === 'business'
                ? 'PREMIUM PRO'
                : '4-DAY TRIAL'}
            </span>
            <span className="font-mono font-bold text-blue-700">
              {products.length} / {currentUser?.plan === 'starter' ? 5 : currentUser?.plan === 'full' ? 50 : currentUser?.plan === 'premium' ? 100 : currentUser?.plan === 'premium_pro' ? 1000 : 50}
            </span>
          </div>
          <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (products.length /
                    (currentUser?.plan === 'starter'
                      ? 5
                      : currentUser?.plan === 'full'
                      ? 50
                      : currentUser?.plan === 'premium'
                      ? 100
                      : currentUser?.plan === 'premium_pro'
                      ? 1000
                      : 50)) *
                    100
                )}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-blue-800/80 font-medium">
            <span>Product limit used</span>
            <span className="font-bold underline text-blue-700">Upgrade &rarr;</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Integrations Header / Section */}
        <div className="pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3">
          Integrations
        </div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => handleNav('integrations')}>
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span>Click Payment</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => handleNav('integrations')}>
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span>Payme Gateway</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => handleNav('integrations')}>
          <div className="h-2 w-2 rounded-full bg-slate-300"></div>
          <span>Uzum Market</span>
        </div>

        {/* Admin Link - Only visible to authenticated system administrators */}
        {currentUser?.role === 'admin' && (
          <div className="pt-3 mt-2 border-t border-slate-100">
            <button
              id="sidebar-link-admin"
              onClick={() => handleNav('admin-panel')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === 'admin-panel' || currentRoute === 'admin'
                  ? 'bg-rose-50 text-rose-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Bosh Admin Panel</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                Admin
              </span>
            </button>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AK'}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="truncate text-xs font-bold text-slate-800">{currentUser?.name || 'Ali Karimov'}</p>
            <p className="truncate text-[10px] text-slate-500">{store.name} • {currentUser?.plan || 'Pro'}</p>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
};
