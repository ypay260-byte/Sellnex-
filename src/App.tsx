/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TrialBanner } from './components/common/TrialBanner';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DeviceSelectorModal } from './components/common/DeviceSelectorModal';

// Views
import { LandingPage } from './views/LandingPage';
import { AuthPage } from './views/AuthPage';
import { OnboardingWizard } from './views/OnboardingWizard';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { ProductImportView } from './views/ProductImportView';
import { StoreBuilderView } from './views/StoreBuilderView';
import { PublicStoreView } from './views/PublicStoreView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { OrdersView } from './views/OrdersView';
import { AutomationView } from './views/AutomationView';
import { SuppliersView } from './views/SuppliersView';
import { IntegrationsView } from './views/IntegrationsView';
import { PartnerLinksView } from './views/PartnerLinksView';
import { AnalyticsView } from './views/AnalyticsView';
import { CustomersView } from './views/CustomersView';
import { DeliveryView } from './views/DeliveryView';
import { PricingView } from './views/PricingView';
import { SettingsView } from './views/SettingsView';
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminView } from './views/admin/AdminView';

const PUBLIC_ROUTES = [
  'landing',
  'auth',
  'onboarding',
  'public-store',
  'product-detail',
  'public-product',
  'checkout',
  'order-success',
  'pricing',
  'admin-panel',
  'admin',
  'store',
];

const MainAppContent: React.FC = () => {
  const { currentRoute, currentUser, isLoadingAuth, navigateTo } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // If user is not logged in and attempts to access protected seller views, route to landing
  const isProtectedRoute = !PUBLIC_ROUTES.includes(currentRoute);

  useEffect(() => {
    if (!isLoadingAuth && !currentUser && isProtectedRoute) {
      navigateTo('landing');
    }
  }, [currentUser, isLoadingAuth, isProtectedRoute, navigateTo]);

  // If a regular seller ever hits admin route, immediately steer them to their dashboard
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && (currentRoute === 'admin' || currentRoute === 'admin-panel')) {
      navigateTo('dashboard');
    }
  }, [currentUser, currentRoute, navigateTo]);

  // Completely separate Standalone Admin Panel
  if (currentRoute === 'admin-panel' || currentRoute === 'admin') {
    if (currentUser && currentUser.role === 'admin') {
      return (
        <div id="sellnex-admin-container" className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <AdminView />
        </div>
      );
    }

    // If logged in as regular seller, do NOT show admin panel
    if (currentUser && currentUser.role !== 'admin') {
      return (
        <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-white">
          <DashboardView />
          <DeviceSelectorModal />
          <ToastContainer />
        </div>
      );
    }

    return (
      <div id="sellnex-admin-container" className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <AdminLogin />
      </div>
    );
  }

  // Standalone public and full-screen flows
  if (currentRoute === 'landing' || (!currentUser && isProtectedRoute)) {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-white">
        <LandingPage />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'auth') {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-slate-50">
        <AuthPage />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'onboarding') {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-slate-50">
        <OnboardingWizard />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  if (
    currentRoute === 'public-store' ||
    currentRoute === 'store' ||
    currentRoute.startsWith('store/') ||
    currentRoute.startsWith('s/')
  ) {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-slate-50">
        <PublicStoreView />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'product-detail' || currentRoute === 'public-product') {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-slate-50">
        <ProductDetailView />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'checkout') {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-slate-50">
        <CheckoutView />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentRoute === 'order-success') {
    return (
      <div id="sellnex-app-container" className="w-full min-h-screen flex flex-col bg-slate-50">
        <OrderSuccessView />
        <DeviceSelectorModal />
        <ToastContainer />
      </div>
    );
  }

  // Back-office Merchant Shell Layout (For Authenticated Sellers)
  const renderDashboardRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'import-product':
        return <ProductImportView />;
      case 'store-builder':
        return <StoreBuilderView />;
      case 'orders':
        return <OrdersView />;
      case 'automation':
        return <AutomationView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'partner-links':
        return <PartnerLinksView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'customers':
        return <CustomersView />;
      case 'delivery':
        return <DeliveryView />;
      case 'pricing':
        return <PricingView />;
      case 'admin':
        return <AdminView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="sellnex-merchant-layout" className="w-full min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <TrialBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenNotifications={() => setNotificationsOpen(true)}
          />

          <main className="flex-1 pb-24 lg:pb-16 min-w-0">
            {renderDashboardRoute()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Overlays & Modals */}
      <DeviceSelectorModal />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
