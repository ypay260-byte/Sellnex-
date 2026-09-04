import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Store as StoreIcon,
  ExternalLink,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  ShieldAlert,
  User,
  Plus,
  ArrowLeft,
  Smartphone,
  Monitor,
  Check,
  Globe,
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { DeviceSelectorModal } from './DeviceSelectorModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CreateStoreModal } from './CreateStoreModal';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, onOpenSearch, onOpenNotifications }) => {
  const {
    store,
    userStores,
    switchStore,
    currentUser,
    notifications,
    setIsSearchOpen,
    navigateTo,
    navigateBack,
    currentRoute,
    logout,
    t,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false);
  const [createStoreModalOpen, setCreateStoreModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleNotifClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setNotifOpen(true);
    }
  };

  return (
    <>
      <header
        id="dashboard-topbar"
        className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs"
      >
        {/* Left Side: Back button (if inside subpage) & Mobile Hamburger & Search Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0 max-w-xl">
          {currentRoute !== 'dashboard' && (
            <button
              id="topbar-back-btn"
              onClick={navigateBack}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 min-h-[40px] transition-colors border border-slate-200 shadow-2xs"
              title="Orqaga qaytish"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline font-semibold">Orqaga</span>
            </button>
          )}

          <button
            id="mobile-menu-trigger"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar */}
          <button
            id="topbar-search-trigger"
            onClick={handleSearchClick}
            className="w-full max-w-md flex items-center justify-between px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs font-medium transition-colors border border-slate-200/60 text-left group min-h-[40px]"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">{t('search_placeholder', 'Search products, orders...')}</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-2xs shrink-0">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right Side: Quick Actions, Store Badge, Language, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Import Product CTA */}
          <button
            id="topbar-quick-import-btn"
            onClick={() => navigateTo('import-product')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold border border-blue-200/60 transition-colors min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('topbar_import_btn', 'Import Product')}</span>
          </button>

          {/* Store Switcher Dropdown */}
          <div className="relative hidden sm:block">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs min-h-[38px]">
              <button
                id="topbar-store-dropdown-btn"
                type="button"
                onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
                className="flex items-center gap-1.5 text-left hover:text-blue-600 transition-colors"
              >
                <StoreIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-800 truncate max-w-[110px]">
                  {store?.name || 'My Store'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <button
                id="topbar-preview-store"
                onClick={() => navigateTo('public-store', { storeSlug: store?.slug || store?.id })}
                title={t('nav_view_store', 'Open public storefront')}
                className="text-blue-600 hover:text-blue-700 ml-1 p-0.5 min-h-[28px] min-w-[28px] flex items-center justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {storeSwitcherOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStoreSwitcherOpen(false)}
                />
                <div
                  id="topbar-stores-menu"
                  className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Your Stores</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {userStores.length} {userStores.length === 1 ? 'Store' : 'Stores'}
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto py-1">
                    {userStores.map((s) => {
                      const isActive = s.id === store.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            setStoreSwitcherOpen(false);
                            switchStore(s.id);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {s.name.charAt(0)}
                            </div>
                            <span className="truncate">{s.name}</span>
                          </div>
                          {isActive && (
                            <span className="text-[10px] text-blue-600 font-bold">Active</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 p-1.5">
                    <button
                      id="topbar-create-store-btn"
                      onClick={() => {
                        setStoreSwitcherOpen(false);
                        setCreateStoreModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create Another Store</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="compact" />

          {/* Device Mode Switcher CTA */}
          <button
            id="topbar-device-switch-btn"
            type="button"
            onClick={() => setDeviceModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors min-h-[38px]"
            title="Qurilma rejimini tanlash (Telefon / Kompyuter)"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600 sm:hidden" />
            <Monitor className="w-3.5 h-3.5 text-indigo-600 hidden sm:block" />
            <span className="hidden md:inline">{t('device_mode', 'Qurilma')}</span>
          </button>

          {/* Notification Bell */}
          <button
            id="topbar-notifications-btn"
            onClick={handleNotifClick}
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('topbar_notifications', 'Notifications')}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              id="topbar-profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
              aria-label="User Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser?.name || 'Seller'}</p>
                <p className="text-[10px] text-blue-600 font-mono mt-0.5">/#store/{store?.slug || 'store'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div
                  id="profile-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{currentUser?.name || 'Seller Account'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email || ''}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                        {currentUser?.plan || 'PRO'} Plan
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">● Verified Seller</span>
                    </div>
                  </div>

                  <button
                    id="dropdown-settings"
                    onClick={() => {
                      setProfileOpen(false);
                      navigateTo('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Store & Account Settings</span>
                  </button>

                  <button
                    id="dropdown-store-builder"
                    onClick={() => {
                      setProfileOpen(false);
                      navigateTo('store-builder');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <StoreIcon className="w-4 h-4 text-slate-400" />
                    <span>Customizer / Store Builder</span>
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      id="dropdown-admin"
                      onClick={() => {
                        setProfileOpen(false);
                        navigateTo('admin');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-700 hover:bg-amber-50 text-left"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Platform Admin Portal</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    id="dropdown-logout"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out notifications */}
      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      <DeviceSelectorModal forceOpen={deviceModalOpen} onClose={() => setDeviceModalOpen(false)} />
      <CreateStoreModal isOpen={createStoreModalOpen} onClose={() => setCreateStoreModalOpen(false)} />
    </>
  );
};
