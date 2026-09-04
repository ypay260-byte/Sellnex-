import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store as StoreIcon,
  MoreHorizontal,
  Users,
  Layers,
  CreditCard,
  Truck,
  BarChart3,
  Sliders,
  Settings,
  ShieldAlert,
  Bot,
  Link2,
  Sparkles,
  X,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentRoute, navigateTo, orders, products, store, currentUser } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Paid').length;
  const publishedProductsCount = products.filter((p) => p.status === 'Published').length;

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: publishedProductsCount },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'store-builder', label: 'Store', icon: StoreIcon },
  ];

  const moreItems = [
    { id: 'import-product', label: 'Import Product', icon: PlusCircle, highlight: true },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Layers },
    { id: 'integrations', label: 'Payments & Click/Payme', icon: CreditCard },
    { id: 'delivery', label: 'Delivery & Logistics', icon: Truck },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'automation', label: 'Auto Fulfillment', icon: Bot },
    { id: 'partner-links', label: 'Partner Links', icon: Link2 },
    { id: 'pricing', label: 'Plans & Pricing', icon: Sparkles },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    ...(currentUser?.role === 'admin'
      ? [{ id: 'admin', label: 'Platform Admin', icon: ShieldAlert, badge: 'ADMIN' }]
      : []),
  ];

  const handleNav = (routeId: string) => {
    navigateTo(routeId);
    setMoreOpen(false);
  };

  const isMoreActive = !mainTabs.some((t) => t.id === currentRoute);

  return (
    <>
      {/* Compact Mobile Bottom Bar (visible only on mobile/tablet < 1024px) */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-nav-btn-${tab.id}`}
              onClick={() => handleNav(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-center transition-colors relative min-h-[44px] ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          id="mobile-nav-btn-more"
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-center transition-colors relative min-h-[44px] ${
            isMoreActive || moreOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive || moreOpen ? 'text-blue-600' : 'text-slate-500'}`} />
            {isMoreActive && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none tracking-tight">More</span>
        </button>
      </nav>

      {/* "More" Bottom Sheet Drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto z-10 space-y-4">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sellnex Navigation</h3>
                <p className="text-xs text-slate-500">Quick access to all tools & settings</p>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Public Store Quick Link */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{store.name}</p>
                <p className="text-[11px] text-blue-600 font-mono font-medium truncate">/#store/{store.slug}</p>
              </div>
              <button
                onClick={() => {
                  navigateTo('public-store', { storeSlug: store.slug });
                  setMoreOpen(false);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <span>View Store</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Grid of Other Navigation Items */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-more-item-${item.id}`}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left text-xs font-semibold transition-colors border min-h-[48px] ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : item.highlight
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : item.highlight ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] uppercase px-1 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
