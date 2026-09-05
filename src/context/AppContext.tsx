import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  User,
  Store,
  Product,
  Order,
  Customer,
  Supplier,
  AutomationSettings,
  PartnerLink,
  IntegrationCredentials,
  NotificationItem,
  CartItem,
  OrderStatus,
  PendingRegistration,
  OnboardingData,
  Language,
} from '../types';
import { authService, SignUpParams } from '../services/authService';
import { firestoreService } from '../services/firestoreService';
import { Storage } from '../services/storage';
import { telegramService } from '../services/telegramService';
import { subscriptionService } from '../services/subscriptionService';
import { translations, Translations } from '../data/translations';
import { ShareModal } from '../components/common/ShareModal';
import { PlanLimitModal } from '../components/common/PlanLimitModal';
import {
  INITIAL_SUPPLIERS,
  INITIAL_AUTOMATION,
  INITIAL_INTEGRATIONS,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

export interface ShareModalConfig {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  url: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
}

export interface LimitModalConfig {
  isOpen: boolean;
  currentCount: number;
  maxLimit: number;
  customMessage?: string;
}

const DEFAULT_EMPTY_STORE: Store = {
  id: '',
  ownerId: '',
  name: 'My Store',
  slug: 'mystore',
  domain: 'mystore.sellnex.uz',
  currency: 'UZS',
  targetMarket: 'Uzbekistan',
  sellType: 'Dropshipping',
  logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
  theme: {
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    fontFamily: 'Plus Jakarta Sans',
    headerStyle: 'modern',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
    bannerTitle: 'Welcome to Our Store',
    bannerSubtitle: 'Fast & Reliable Delivery Across Uzbekistan',
    buttonText: 'Shop All Products',
    showAnnouncement: true,
    announcementText: '🔥 Express Delivery Across Tashkent and All 12 Regions of Uzbekistan!',
    productCardStyle: 'card',
    footerText: `© ${new Date().getFullYear()} My Store. Powered by Sellnex.`,
  },
  published: true,
  createdAt: new Date().toISOString(),
};

interface CreateStoreParams {
  name?: string;
  storeName?: string;
  slug?: string;
  sellCategory?: string;
  sellMarket?: string;
  currency?: 'UZS' | 'USD';
  targetMarket?: 'Uzbekistan' | 'Central Asia' | 'Global';
  sellType?: 'Dropshipping' | 'My own products' | 'Both';
  theme?: Partial<Store['theme']>;
}

interface AppContextType {
  // Language & Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations | string, fallback?: string) => string;

  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  pendingRegistration: PendingRegistration | null;
  setPendingRegistration: (data: PendingRegistration | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  adminLogin: (email: string, password?: string, twoFactorCode?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (data: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoadingAuth: boolean;

  // Multi-Store Architecture (Shopify-Style)
  store: Store;
  userStores: Store[];
  switchStore: (storeId: string) => Promise<void>;
  createNewStore: (params: CreateStoreParams) => Promise<{ success: boolean; store?: Store; error?: string }>;
  updateStore: (updates: Partial<Store>) => Promise<void>;
  updateTheme: (updates: Partial<Store['theme']>) => Promise<void>;

  // Public Customer Storefront State & Strict Data Isolation
  publicStore: Store | null;
  publicProducts: Product[];
  publicStoreLoading: boolean;
  publicStoreStatus: 'ready' | 'loading' | 'not_found' | 'private' | 'suspended';
  publicActiveProduct: Product | null;
  loadPublicStoreData: (storeIdOrSlug: string, targetProductId?: string) => Promise<void>;

  // URL & Links Generation (Store & Product isolation by slug/id)
  getStoreUrl: (storeIdOrSlug?: string) => string;
  getProductUrl: (storeIdOrSlug?: string, productId?: string) => string;
  copyStoreLink: (storeIdOrSlug?: string) => Promise<boolean>;
  copyProductLink: (productId: string, storeIdOrSlug?: string) => Promise<boolean>;
  openShareModal: (config: Omit<ShareModalConfig, 'isOpen'>) => void;
  closeShareModal: () => void;

  // Plan Limit Modal
  openLimitModal: (currentCount: number, maxLimit: number, customMessage?: string) => void;
  closeLimitModal: () => void;

  // Products (Scoped to active store)
  products: Product[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  togglePublishProduct: (id: string) => Promise<void>;

  // Orders (Scoped to active store)
  orders: Order[];
  refreshOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;

  // Customers (Scoped to active store)
  customers: Customer[];

  // Suppliers
  suppliers: Supplier[];
  addCustomSupplier: (data: Omit<Supplier, 'id' | 'type'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  // Automation
  automation: AutomationSettings;
  updateAutomation: (updates: Partial<AutomationSettings>) => Promise<void>;

  // Partner links (Scoped to active store)
  partnerLinks: PartnerLink[];
  addPartnerLink: (title: string, slug: string, targetProductTitle?: string) => Promise<PartnerLink>;

  // Integrations
  integrations: Record<string, IntegrationCredentials>;
  updateIntegration: (service: string, creds: Partial<IntegrationCredentials>) => Promise<void>;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Image Upload helper
  uploadImage: (path: string, fileOrDataUrl: File | Blob | string) => Promise<string>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;

  // Global Navigation State
  currentRoute: string;
  navigateTo: (route: string, params?: Record<string, string>) => void;
  navigateBack: () => void;
  routeParams: Record<string, string>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Global search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Formatting helpers
  formatMoney: (amount: number) => string;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export interface ParsedRouteInfo {
  route: string;
  params: Record<string, string>;
  storeIdToLoad?: string;
  productIdToLoad?: string;
}

export function parseLocationRoute(
  rawPathname = typeof window !== 'undefined' ? window.location.pathname : '',
  rawHash = typeof window !== 'undefined' ? window.location.hash : '',
  rawSearch = typeof window !== 'undefined' ? window.location.search : ''
): ParsedRouteInfo {
  const cleanPath = (rawPathname || '').replace(/^\/+/, '').split('?')[0].replace(/\/+$/, '');
  const lowerPath = cleanPath.toLowerCase();

  const rawHashVal = rawHash || '';
  const hashWithoutHash = rawHashVal.replace(/^#\/?/, '').replace(/^\/+/, '');
  const cleanHash = hashWithoutHash.split('?')[0].split('&')[0].replace(/\/+$/, '');
  const lowerHash = cleanHash.toLowerCase();

  const searchParams = new URLSearchParams(rawSearch || '');
  const hashQueryIndex = rawHashVal.indexOf('?');
  const hashParams = hashQueryIndex !== -1 ? new URLSearchParams(rawHashVal.slice(hashQueryIndex)) : null;

  // 1. Direct Store Pathname matching: /store/:storeId, /store/:storeId/product/:productId, /s/:storeId
  if (lowerPath.startsWith('store/') || lowerPath.startsWith('s/')) {
    const parts = cleanPath.split('/').filter(Boolean);
    const rawStoreId = parts[1];
    const rawProdId = parts[2]?.toLowerCase() === 'product' ? parts[3] : undefined;

    if (rawStoreId) {
      const storeId = decodeURIComponent(rawStoreId).trim();
      const prodId = rawProdId ? decodeURIComponent(rawProdId).trim() : undefined;
      return {
        route: prodId ? 'product-detail' : 'public-store',
        params: { storeId, storeSlug: storeId, ...(prodId ? { productId: prodId } : {}) },
        storeIdToLoad: storeId,
        productIdToLoad: prodId,
      };
    }
  }

  // 2. Hash-based Store matching: /#store/:storeId, /#/store/:storeId
  if (lowerHash.startsWith('store/') || lowerHash.startsWith('s/')) {
    const parts = cleanHash.split('/').filter(Boolean);
    const rawStoreId = parts[1];
    const rawProdId = parts[2]?.toLowerCase() === 'product' ? parts[3] : undefined;

    if (rawStoreId) {
      const storeId = decodeURIComponent(rawStoreId).trim();
      const prodId = rawProdId ? decodeURIComponent(rawProdId).trim() : undefined;
      return {
        route: prodId ? 'product-detail' : 'public-store',
        params: { storeId, storeSlug: storeId, ...(prodId ? { productId: prodId } : {}) },
        storeIdToLoad: storeId,
        productIdToLoad: prodId,
      };
    }
  }

  // 3. Query params store matching: ?store=:storeId, ?s=:storeId
  const qStore =
    searchParams.get('store') ||
    searchParams.get('storeId') ||
    searchParams.get('s') ||
    hashParams?.get('store') ||
    hashParams?.get('storeId') ||
    hashParams?.get('s');

  const qProd =
    searchParams.get('product') ||
    searchParams.get('productId') ||
    searchParams.get('p') ||
    hashParams?.get('product') ||
    hashParams?.get('productId') ||
    hashParams?.get('p');

  if (qStore) {
    const storeId = decodeURIComponent(qStore).trim();
    const prodId = qProd ? decodeURIComponent(qProd).trim() : undefined;
    return {
      route: prodId ? 'product-detail' : 'public-store',
      params: { storeId, storeSlug: storeId, ...(prodId ? { productId: prodId } : {}) },
      storeIdToLoad: storeId,
      productIdToLoad: prodId,
    };
  }

  // 4. Admin Panel routes
  if (
    lowerHash === 'admin' ||
    lowerHash === 'admin-panel' ||
    lowerHash === 'administrator' ||
    lowerPath === 'admin' ||
    lowerPath === 'admin-panel' ||
    searchParams.get('route') === 'admin' ||
    searchParams.get('page') === 'admin'
  ) {
    return { route: 'admin-panel', params: {} };
  }

  // 5. Standard app routes
  const candidateRoute = cleanHash || cleanPath || 'landing';
  return { route: candidateRoute, params: {} };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sellnex_lang');
      if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'uz';
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('sellnex_lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = translations[language] || translations.uz;
      const val = (langDict as unknown as Record<string, string>)[key];
      if (val) return val;
      const fallbackUz = (translations.uz as unknown as Record<string, string>)[key];
      return fallbackUz || fallback || key;
    },
    [language]
  );

  // Authentication State
  const [currentUser, setCurrentUserState] = useState<User | null>(() => Storage.getCurrentUser());
  const [pendingRegistration, setPendingRegistrationState] = useState<PendingRegistration | null>(() => Storage.getPendingRegistration());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Multi-Store State
  const [userStores, setUserStoresState] = useState<Store[]>(() => Storage.getStores());
  const [store, setStoreState] = useState<Store>(() => Storage.getStore() || DEFAULT_EMPTY_STORE);

  // Active Store Data Scopes
  const [products, setProductsState] = useState<Product[]>(() => Storage.getProducts());
  const [orders, setOrdersState] = useState<Order[]>(() => Storage.getOrders());
  const [customers, setCustomersState] = useState<Customer[]>(() => Storage.getCustomers());
  const [suppliers, setSuppliersState] = useState<Supplier[]>(() => Storage.getSuppliers());
  const [automation, setAutomationState] = useState<AutomationSettings>(() => Storage.getAutomation());
  const [partnerLinks, setPartnerLinksState] = useState<PartnerLink[]>(() => Storage.getPartnerLinks());
  const [integrations, setIntegrationsState] = useState<Record<string, IntegrationCredentials>>(() => Storage.getIntegrations());
  const [notifications, setNotificationsState] = useState<NotificationItem[]>(() => Storage.getNotifications());
  const [cart, setCartState] = useState<CartItem[]>(() => Storage.getCart());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Modals state
  const [shareModalConfig, setShareModalConfig] = useState<ShareModalConfig | null>(null);
  const [limitModalConfig, setLimitModalConfig] = useState<LimitModalConfig | null>(null);

  // Synchronous URL Routing Parser for immediate First-Paint without redirects or flash
  const initialRouteInfo = useMemo(() => parseLocationRoute(), []);

  // Public Storefront Isolated State
  const [publicStore, setPublicStore] = useState<Store | null>(null);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [publicStoreLoading, setPublicStoreLoading] = useState<boolean>(() => {
    return initialRouteInfo.route === 'public-store' || initialRouteInfo.route === 'product-detail';
  });
  const [publicStoreStatus, setPublicStoreStatus] = useState<'ready' | 'loading' | 'not_found' | 'private' | 'suspended'>('loading');
  const [publicActiveProduct, setPublicActiveProduct] = useState<Product | null>(null);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>(initialRouteInfo.route);
  const [routeParams, setRouteParams] = useState<Record<string, string>>(initialRouteInfo.params);
  const [historyStack, setHistoryStack] = useState<{ route: string; params: Record<string, string> }[]>([]);

  // Toast system
  const showToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // URL Generation Helpers (Strictly unique per store using store.slug or store.id)
  // Generates clean standard web URLs (/store/:storeId) supported natively by Vercel rewrites
  const getStoreUrl = useCallback((storeIdOrSlug?: string) => {
    const target = (storeIdOrSlug || store.slug || store.id || 'store').trim();
    let origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin || origin.includes('google.com') || origin.includes('aistudio') || origin.includes('run.app')) {
      origin = 'https://sellnex-ten.vercel.app';
    }
    return `${origin}/store/${target}`;
  }, [store.id, store.slug]);

  const getProductUrl = useCallback((storeIdOrSlug?: string, productId?: string) => {
    const targetStore = (storeIdOrSlug || store.slug || store.id || 'store').trim();
    const pId = (productId || '').trim();
    let origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin || origin.includes('google.com') || origin.includes('aistudio') || origin.includes('run.app')) {
      origin = 'https://sellnex-ten.vercel.app';
    }
    return `${origin}/store/${targetStore}/product/${pId}`;
  }, [store.id, store.slug]);

  const copyStoreLink = async (storeIdOrSlug?: string): Promise<boolean> => {
    const url = getStoreUrl(storeIdOrSlug);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Store Link Copied!', url, 'success');
      return true;
    } catch {
      showToast('Store Link', url, 'info');
      return false;
    }
  };

  const copyProductLink = async (productId: string, storeIdOrSlug?: string): Promise<boolean> => {
    const url = getProductUrl(storeIdOrSlug, productId);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Product Link Copied!', url, 'success');
      return true;
    } catch {
      showToast('Product Link', url, 'info');
      return false;
    }
  };

  const openShareModal = (config: Omit<ShareModalConfig, 'isOpen'>) => {
    setShareModalConfig({ ...config, isOpen: true });
  };

  const closeShareModal = () => {
    setShareModalConfig(null);
  };

  const openLimitModal = (currentCount: number, maxLimit: number, customMessage?: string) => {
    setLimitModalConfig({
      isOpen: true,
      currentCount,
      maxLimit,
      customMessage,
    });
  };

  const closeLimitModal = () => {
    setLimitModalConfig(null);
  };

  // Load data for a specific store
  const loadActiveStoreData = useCallback(async (activeStore: Store, userId: string) => {
    try {
      setStoreState(activeStore);
      Storage.setStore(activeStore);
      Storage.setActiveStoreId(activeStore.id);

      const [storeProducts, ownerProducts, dbOrders, dbCustomers, dbAuto, dbInteg, dbLinks, dbNotifs] = await Promise.all([
        firestoreService.getProductsByStore(activeStore.id, activeStore.slug),
        firestoreService.getProductsByOwner(userId),
        firestoreService.getOrdersByStore(activeStore.id),
        firestoreService.getCustomersByStore(activeStore.id),
        firestoreService.getAutomationSettings(activeStore.id),
        firestoreService.getIntegrations(activeStore.id),
        firestoreService.getPartnerLinksByStore(activeStore.id),
        firestoreService.getNotifications(userId),
      ]);

      // Combine products and deduplicate by id (strictly belonging to active store)
      const productMap = new Map<string, Product>();
      (storeProducts || []).forEach((p) => productMap.set(p.id, p));
      (ownerProducts || []).forEach((p) => {
        const belongsToActiveStore =
          p.storeId === activeStore.id ||
          p.storeId === activeStore.slug ||
          p.storeId === activeStore.storeId;
        if (belongsToActiveStore && !productMap.has(p.id)) {
          productMap.set(p.id, p);
        }
      });
      const combinedProducts = Array.from(productMap.values());

      setProductsState(combinedProducts);
      Storage.setProducts(combinedProducts);

      setOrdersState(dbOrders);
      Storage.setOrders(dbOrders);

      setCustomersState(dbCustomers);
      Storage.setCustomers(dbCustomers);

      setAutomationState(dbAuto);
      Storage.setAutomation(dbAuto);

      setIntegrationsState(dbInteg);
      Storage.setIntegrations(dbInteg);

      setPartnerLinksState(dbLinks);
      Storage.setPartnerLinks(dbLinks);

      setNotificationsState(dbNotifs);
      Storage.setNotifications(dbNotifs);
    } catch (err) {
      console.error('Error loading store data:', err);
    }
  }, [getProductUrl]);

  // Load all stores owned by authenticated user
  const loadUserFirestoreData = useCallback(async (user: User) => {
    try {
      let ownedStores = await firestoreService.getStoresByOwnerId(user.id);

      // Check if user has a storeId that wasn't indexed by ownerId
      if (ownedStores.length === 0 && user.storeId) {
        const storeById = await firestoreService.getStore(user.storeId);
        if (storeById) {
          ownedStores = [storeById];
        }
      }

      // If still no store exists for the user, create an official default store in Firestore
      if (ownedStores.length === 0) {
        const defaultStore = await firestoreService.createDefaultStoreForUser(user);
        ownedStores = [defaultStore];
      }

      setUserStoresState(ownedStores);
      Storage.setStores(ownedStores);

      const savedActiveId = Storage.getActiveStoreId();
      const active = ownedStores.find((s) => s.id === savedActiveId || s.id === user.storeId) || ownedStores[0];
      await loadActiveStoreData(active, user.id);
    } catch (err) {
      console.warn('Error loading Firestore data on login:', err);
    }
  }, [loadActiveStoreData]);

  // Switch between user's stores
  const switchStore = async (storeId: string) => {
    const targetStore = userStores.find((s) => s.id === storeId);
    if (!targetStore || !currentUser) return;
    await loadActiveStoreData(targetStore, currentUser.id);
    showToast('Store Switched', `Active store changed to "${targetStore.name}"`, 'info');
  };

  // Create a brand new store for the current user
  const createNewStore = async ({
    name,
    storeName,
    slug,
    sellCategory,
    sellMarket,
    currency = 'UZS',
    targetMarket = 'Uzbekistan',
    sellType = 'My own products',
    theme,
  }: CreateStoreParams): Promise<{ success: boolean; store?: Store; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'User is not authenticated' };
    }

    try {
      const resolvedName = (storeName || name || 'My Online Store').trim();
      const storeId = await firestoreService.generateUniqueStoreId();
      const rawSlug = slug || resolvedName || storeId;
      const baseSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || storeId.toLowerCase();

      const uniqueSlug = await firestoreService.generateUniqueSlug(baseSlug, storeId);

      const newStore: Store = {
        id: storeId,
        storeId,
        ownerId: currentUser.id,
        name: resolvedName,
        storeName: resolvedName,
        slug: uniqueSlug,
        visibility: 'PUBLIC',
        published: true,
        domain: `${uniqueSlug}.sellnex.uz`,
        currency: currency || 'UZS',
        targetMarket: targetMarket || (sellMarket === 'International' ? 'Global' : 'Uzbekistan'),
        sellType: sellType || (sellCategory === 'Physical products' || sellCategory === 'My own products' ? 'My own products' : 'Dropshipping'),
        logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: {
          primaryColor: theme?.primaryColor || '#2563EB',
          secondaryColor: theme?.secondaryColor || '#10B981',
          fontFamily: theme?.fontFamily || 'Plus Jakarta Sans',
          headerStyle: theme?.headerStyle || 'modern',
          bannerImage: theme?.bannerImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
          bannerTitle: theme?.bannerTitle || resolvedName || 'Welcome to Our Store',
          bannerSubtitle: theme?.bannerSubtitle || 'Fast & Reliable Delivery Across Uzbekistan',
          buttonText: theme?.buttonText || 'Shop All Products',
          showAnnouncement: theme?.showAnnouncement !== undefined ? theme.showAnnouncement : true,
          announcementText: theme?.announcementText || '🔥 Express Delivery Across Tashkent and All 12 Regions of Uzbekistan!',
          productCardStyle: theme?.productCardStyle || 'card',
          footerText: theme?.footerText || `© ${new Date().getFullYear()} ${resolvedName}. Powered by Sellnex.`,
          phone: theme?.phone || currentUser.phone || '',
        },
      };

      await firestoreService.saveStore(newStore);
      await firestoreService.setUser(currentUser.id, { storeId: newStore.id });

      const updatedStores = [...userStores, newStore];
      setUserStoresState(updatedStores);
      Storage.setStores(updatedStores);

      await loadActiveStoreData(newStore, currentUser.id);

      showToast('New Store Created!', `"${newStore.name}" is ready and live.`, 'success');
      return { success: true, store: newStore };
    } catch (err: any) {
      console.error('Error creating new store:', err);
      return { success: false, error: err?.message || 'Failed to create new store.' };
    }
  };

  // Load public store data strictly from Firestore by storeId or slug (Zero Fallback / Strict Isolation)
  const loadPublicStoreData = useCallback(async (storeIdOrSlug: string, targetProductId?: string) => {
    if (!storeIdOrSlug) {
      setPublicStore(null);
      setPublicProducts([]);
      setPublicActiveProduct(null);
      setPublicStoreStatus('not_found');
      setPublicStoreLoading(false);
      return;
    }

    setPublicStoreLoading(true);
    setPublicStoreStatus('loading');

    try {
      const clean = storeIdOrSlug.trim();
      let fetchedStore = await firestoreService.getStoreByIdOrSlug(clean);

      // Local storage fallback for newly created stores or offline/preview testing
      if (!fetchedStore) {
        const cleanLower = clean.toLowerCase();
        const localStores = Storage.getStores();
        fetchedStore =
          localStores.find(
            (s) =>
              s.slug?.toLowerCase() === cleanLower ||
              s.id === clean ||
              s.storeId === clean
          ) || null;
      }

      if (!fetchedStore) {
        setPublicStore(null);
        setPublicProducts([]);
        setPublicActiveProduct(null);
        setPublicStoreStatus('not_found');
        setPublicStoreLoading(false);
        return;
      }

      // Check Store Privacy Settings - only private if explicitly flagged as private
      const isPrivate =
        fetchedStore.visibility?.toUpperCase() === 'PRIVATE' ||
        fetchedStore.status === 'private';

      const activeUser = currentUser || Storage.getCurrentUser();
      const isOwnerOrAdmin = activeUser && (activeUser.id === fetchedStore.ownerId || activeUser.role === 'admin');

      if (isPrivate && !isOwnerOrAdmin) {
        setPublicStore(fetchedStore);
        setPublicProducts([]);
        setPublicActiveProduct(null);
        setPublicStoreStatus('private');
        setPublicStoreLoading(false);
        return;
      }

      setPublicStore(fetchedStore);
      setPublicStoreStatus('ready');

      // Fetch products belonging strictly to this store
      const [storeProducts, ownerProducts] = await Promise.all([
        firestoreService.getProductsByStore(fetchedStore.id, fetchedStore.slug),
        firestoreService.getProductsByOwner(fetchedStore.ownerId),
      ]);

      const productMap = new Map<string, Product>();
      (storeProducts || []).forEach((p) => {
        if (p.status !== 'Draft') productMap.set(p.id, p);
        else if (isOwnerOrAdmin) productMap.set(p.id, p);
      });

      // Include owner products only if they strictly match this store (prevents cross-store leakage if seller owns multiple stores)
      (ownerProducts || []).forEach((p) => {
        const matchesThisStore =
          p.storeId === fetchedStore.id ||
          p.storeId === fetchedStore.slug ||
          p.storeId === fetchedStore.storeId;

        if (matchesThisStore && !productMap.has(p.id)) {
          if (p.status !== 'Draft') productMap.set(p.id, p);
          else if (isOwnerOrAdmin) productMap.set(p.id, p);
        }
      });

      // Include locally saved products if matching this store
      const localProducts = Storage.getProducts();
      localProducts.forEach((p) => {
        const matchesThisStore =
          p.storeId === fetchedStore.id ||
          p.storeId === fetchedStore.slug ||
          p.storeId === fetchedStore.storeId;

        if (matchesThisStore && !productMap.has(p.id)) {
          if (p.status !== 'Draft') productMap.set(p.id, p);
          else if (isOwnerOrAdmin) productMap.set(p.id, p);
        }
      });

      const allPublicProducts = Array.from(productMap.values());
      setPublicProducts(allPublicProducts);

      if (targetProductId) {
        const foundProd = allPublicProducts.find((p) => p.id === targetProductId);
        if (foundProd) {
          setPublicActiveProduct(foundProd);
        } else {
          // Direct lookup fallback if not in list
          const directProd = await firestoreService.getProductById(targetProductId);
          if (
            directProd &&
            (directProd.storeId === fetchedStore.id ||
              directProd.storeId === fetchedStore.slug ||
              directProd.ownerId === fetchedStore.ownerId)
          ) {
            setPublicActiveProduct(directProd);
          } else {
            setPublicActiveProduct(null);
          }
        }
      } else {
        setPublicActiveProduct(null);
      }
    } catch (err) {
      console.error('Error loading public store data:', err);
      setPublicStoreStatus('not_found');
    } finally {
      setPublicStoreLoading(false);
    }
  }, [currentUser]);

  // Listen to Auth State
  const loadUserFirestoreDataRef = useRef(loadUserFirestoreData);
  loadUserFirestoreDataRef.current = loadUserFirestoreData;

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
      setIsLoadingAuth(true);
      if (fbUser) {
        let profile = await firestoreService.getUser(fbUser.uid);
        if (!profile) {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Seller',
            email: fbUser.email || '',
            phone: '',
            role: 'seller',
            plan: 'free',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          await firestoreService.setUser(fbUser.uid, profile);
        }
        setCurrentUserState(profile);
        Storage.setCurrentUser(profile);
        await loadUserFirestoreDataRef.current(profile);
      } else {
        // Do not wipe out stored local session (phone login, demo session, or offline cache)
        const stored = Storage.getCurrentUser();
        if (stored) {
          setCurrentUserState(stored);
        } else {
          setCurrentUserState(null);
          Storage.setCurrentUser(null);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Synchronously track loaded store key to avoid duplicate fetches
  const lastLoadedStoreKeyRef = useRef<string>('');

  // 1. Initial Store Data Loading if URL matches on initial mount
  useEffect(() => {
    if (initialRouteInfo.storeIdToLoad) {
      const key = `${initialRouteInfo.storeIdToLoad}_${initialRouteInfo.productIdToLoad || ''}`;
      lastLoadedStoreKeyRef.current = key;
      loadPublicStoreData(initialRouteInfo.storeIdToLoad, initialRouteInfo.productIdToLoad);
    }
  }, [initialRouteInfo.storeIdToLoad, initialRouteInfo.productIdToLoad, loadPublicStoreData]);

  // 2. React to Browser URL Changes (Direct navigation, popstate, hashchange)
  useEffect(() => {
    const handleUrlRouting = () => {
      try {
        const routeInfo = parseLocationRoute();

        // 1. Check store route
        if (routeInfo.route === 'public-store' || routeInfo.route === 'product-detail') {
          setCurrentRoute(routeInfo.route);
          setRouteParams(routeInfo.params);

          if (routeInfo.storeIdToLoad) {
            const key = `${routeInfo.storeIdToLoad}_${routeInfo.productIdToLoad || ''}`;
            if (lastLoadedStoreKeyRef.current !== key) {
              lastLoadedStoreKeyRef.current = key;
              loadPublicStoreData(routeInfo.storeIdToLoad, routeInfo.productIdToLoad);
            }
          }

          // If hash had stale navigation state (e.g. #dashboard) while accessing clean URL /store/..., clean the hash
          if (typeof window !== 'undefined' && window.location.hash && !window.location.hash.toLowerCase().includes('store/')) {
            try {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch {
              // ignore
            }
          }
          return;
        }

        // 2. Strict Admin Panel Detection
        if (routeInfo.route === 'admin-panel') {
          const activeUser = Storage.getCurrentUser();
          if (activeUser && activeUser.role !== 'admin') {
            setCurrentRoute('dashboard');
            window.location.hash = 'dashboard';
            return;
          }
          setCurrentRoute('admin-panel');
          return;
        }

        // 3. Default routing for standard app routes
        const publicRoutes = ['landing', 'auth', 'onboarding', 'pricing', 'checkout', 'order-success', 'product-detail', 'public-store', 'admin-panel', 'admin', 'store'];
        const user = Storage.getCurrentUser();
        const routeName = routeInfo.route || 'landing';

        if (!user && !publicRoutes.includes(routeName)) {
          setCurrentRoute('landing');
          if (window.location.pathname === '/' || window.location.pathname === '') {
            window.location.hash = 'landing';
          }
        } else {
          if ((routeName === 'admin' || routeName === 'admin-panel') && user && user.role !== 'admin') {
            setCurrentRoute('dashboard');
            window.location.hash = 'dashboard';
            return;
          }
          setCurrentRoute(routeName === 'admin' ? 'admin-panel' : routeName);
        }
      } catch (err) {
        console.warn('Routing parse error:', err);
      }
    };

    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, [loadPublicStoreData]);

  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    const publicRoutes = ['landing', 'auth', 'onboarding', 'pricing', 'checkout', 'order-success', 'product-detail', 'public-store', 'admin-panel', 'admin', 'store'];
    const activeUser = currentUser || Storage.getCurrentUser();
    let targetRoute = route === 'admin' ? 'admin-panel' : route;

    // Block non-admin accounts from opening the admin panel
    if ((targetRoute === 'admin-panel' || targetRoute === 'admin') && activeUser && activeUser.role !== 'admin') {
      showToast('Kirish cheklangan', 'Admin panel faqat tizim boshqaruvchisi uchun.', 'warning');
      targetRoute = 'dashboard';
      params = {};
    }

    if (!activeUser && !publicRoutes.includes(route) && !route.startsWith('store/')) {
      targetRoute = 'auth';
      params = { mode: 'login' };
    }

    setHistoryStack((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].route === currentRoute) {
        return prev;
      }
      return [...prev, { route: currentRoute, params: routeParams }];
    });

    setRouteParams(params);
    setCurrentRoute(targetRoute);

    if (targetRoute === 'public-store') {
      const sId = params.storeId || params.storeSlug || store.slug || store.id;
      try {
        window.history.pushState(null, '', `/store/${sId}`);
      } catch {
        window.location.hash = `store/${sId}`;
      }
      lastLoadedStoreKeyRef.current = `${sId}_`;
      loadPublicStoreData(sId);
    } else if (targetRoute === 'public-product' || targetRoute === 'product-detail') {
      const sId = params.storeId || params.storeSlug || store.slug || store.id;
      const pId = params.productId || '';
      try {
        window.history.pushState(null, '', `/store/${sId}/product/${pId}`);
      } catch {
        window.location.hash = `store/${sId}/product/${pId}`;
      }
      lastLoadedStoreKeyRef.current = `${sId}_${pId}`;
      loadPublicStoreData(sId, pId);
    } else {
      try {
        if (window.location.pathname.startsWith('/store/') || window.location.pathname.startsWith('/s/')) {
          window.history.pushState(null, '', `/#${targetRoute}`);
        } else {
          window.location.hash = targetRoute;
        }
      } catch {
        window.location.hash = targetRoute;
      }
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateBack = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack((old) => old.slice(0, -1));
      setRouteParams(prev.params || {});
      setCurrentRoute(prev.route);
      if (prev.route === 'public-store') {
        const sId = prev.params?.storeId || prev.params?.storeSlug || store.slug || store.id;
        try {
          window.history.pushState(null, '', `/store/${sId}`);
        } catch {
          window.location.hash = `store/${sId}`;
        }
        loadPublicStoreData(sId);
      } else if (prev.route === 'public-product' || prev.route === 'product-detail') {
        const sId = prev.params?.storeId || prev.params?.storeSlug || store.slug || store.id;
        const pId = prev.params?.productId || '';
        try {
          window.history.pushState(null, '', `/store/${sId}/product/${pId}`);
        } catch {
          window.location.hash = `store/${sId}/product/${pId}`;
        }
        loadPublicStoreData(sId, pId);
      } else {
        try {
          if (window.location.pathname.startsWith('/store/') || window.location.pathname.startsWith('/s/')) {
            window.history.pushState(null, '', `/#${prev.route}`);
          } else {
            window.location.hash = prev.route;
          }
        } catch {
          window.location.hash = prev.route;
        }
      }
    } else {
      if (currentRoute === 'product-detail' || currentRoute === 'checkout' || currentRoute === 'order-success') {
        const sId = routeParams.storeId || routeParams.storeSlug || publicStore?.slug || publicStore?.id || store.slug || store.id;
        navigateTo('public-store', { storeId: sId, storeSlug: sId });
      } else if (currentRoute === 'public-store' || currentRoute === 'auth' || currentRoute === 'onboarding') {
        navigateTo('landing');
      } else if (currentRoute === 'dashboard') {
        navigateTo('landing');
      } else {
        navigateTo('dashboard');
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setPendingRegistration = (data: PendingRegistration | null) => {
    setPendingRegistrationState(data);
    Storage.setPendingRegistration(data);
  };

  const login = async (email: string, password?: string) => {
    const res = await authService.login({ email, password });
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      Storage.setCurrentUser(res.user);
      await loadUserFirestoreData(res.user);
      showToast('Xush kelibsiz!', `Kirildi: ${res.user.name}`, 'success');
      return { success: true, user: res.user };
    }
    showToast('Kirishda xatolik', res.error || 'Maʼlumotlarni tekshiring', 'error');
    return { success: false, error: res.error };
  };

  const adminLogin = async (email: string, password?: string, twoFactorCode?: string) => {
    const res = await authService.adminLogin({ email, password, twoFactorCode });
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      Storage.setCurrentUser(res.user);
      showToast('Administrator Access Granted', `Logged in as ${res.user.name}`, 'success');
      return { success: true, user: res.user };
    }
    showToast('Admin Access Denied', res.error || 'Invalid credentials or permissions', 'error');
    return { success: false, error: res.error };
  };

  const signUp = async (data: SignUpParams) => {
    const res = await authService.signUp(data);
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      Storage.setCurrentUser(res.user);
      if (res.pendingRegistration) {
        setPendingRegistrationState(res.pendingRegistration);
        Storage.setPendingRegistration(res.pendingRegistration);
      }
      showToast('Account Registered', `Welcome to Sellnex, ${res.user.name}!`, 'success');
      return { success: true };
    }
    showToast('Registration Error', res.error || 'Please review form', 'error');
    return { success: false, error: res.error };
  };

  const completeOnboarding = async (onboardingData: OnboardingData) => {
    try {
      const res = await authService.completeOnboarding({
        onboardingData,
        registration: pendingRegistration || undefined,
      });
      if (res.success && res.user && res.store) {
        setCurrentUserState(res.user);
        Storage.setCurrentUser(res.user);

        const newStoreList = [res.store];
        setUserStoresState(newStoreList);
        Storage.setStores(newStoreList);

        await loadActiveStoreData(res.store, res.user.id);

        setPendingRegistrationState(null);
        Storage.setPendingRegistration(null);

        showToast('Store Created!', `Welcome, ${res.user.name}! Your store "${res.store.name}" is live.`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to create store.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Something went wrong.' };
    }
  };

  const logout = async () => {
    await authService.logout();
    Storage.clearUserSession();
    setCurrentUserState(null);
    setUserStoresState([]);
    setStoreState(DEFAULT_EMPTY_STORE);
    setProductsState([]);
    setOrdersState([]);
    setCustomersState([]);
    setPartnerLinksState([]);
    setNotificationsState([]);
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    navigateTo('landing');
    showToast('Logged Out', 'You have been signed out successfully.', 'info');
  };

  // === STORE ACTIONS (FIRESTORE PERSISTENT) ===
  const updateStore = async (updates: Partial<Store>) => {
    const updated = { ...store, ...updates, ownerId: currentUser?.id || store.ownerId };
    setStoreState(updated);
    Storage.setStore(updated);

    const nextStores = userStores.map((s) => (s.id === updated.id ? updated : s));
    setUserStoresState(nextStores);
    Storage.setStores(nextStores);

    await firestoreService.saveStore(updated);
    showToast('Store Updated', 'Store configuration saved to Firebase.', 'success');
  };

  const updateTheme = async (updates: Partial<Store['theme']>) => {
    const updated: Store = {
      ...store,
      theme: { ...store.theme, ...updates },
    };
    setStoreState(updated);
    Storage.setStore(updated);

    const nextStores = userStores.map((s) => (s.id === updated.id ? updated : s));
    setUserStoresState(nextStores);
    Storage.setStores(nextStores);

    await firestoreService.saveStore(updated);
  };

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    Storage.setCurrentUser(user);
    if (user && user.id) {
      firestoreService.setUser(user.id, user).catch((err) => {
        console.warn('Error syncing user to Firestore:', err);
      });
    }
  }, []);

  // === PRODUCT ACTIONS (FIRESTORE PERSISTENT + PLAN LIMIT ENFORCEMENT) ===
  const refreshProducts = async () => {
    if (store.id || currentUser?.id) {
      const [storeProds, ownerProds] = await Promise.all([
        store.id ? firestoreService.getProductsByStore(store.id, store.slug) : Promise.resolve([]),
        currentUser?.id ? firestoreService.getProductsByOwner(currentUser.id) : Promise.resolve([]),
      ]);
      const pMap = new Map<string, Product>();
      storeProds.forEach((p) => pMap.set(p.id, p));
      ownerProds.forEach((p) => {
        if (!pMap.has(p.id)) pMap.set(p.id, p);
      });
      const combined = Array.from(pMap.values());
      setProductsState(combined);
      Storage.setProducts(combined);
    }
  };

  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'salesCount'>): Promise<Product> => {
    const activeUser = currentUser || Storage.getCurrentUser();
    const limitCheck = subscriptionService.checkCanAddProduct(activeUser, products.length);
    if (!limitCheck.allowed) {
      const msg = limitCheck.reason || `Your current plan allows up to ${limitCheck.limit} products. Upgrade your plan to add more products.`;
      openLimitModal(products.length, limitCheck.limit, msg);
      showToast('Product Limit Reached', msg, 'warning');
      throw new Error(msg);
    }

    let currentActiveStore = store;
    if (!currentActiveStore.id || currentActiveStore.id === '') {
      if (activeUser) {
        currentActiveStore = await firestoreService.createDefaultStoreForUser(activeUser);
        setStoreState(currentActiveStore);
        Storage.setStore(currentActiveStore);
        setUserStoresState([currentActiveStore]);
        Storage.setStores([currentActiveStore]);
      }
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const targetSlug = currentActiveStore.slug || store.slug || 'store';
    const productUrl = getProductUrl(targetSlug, newId);

    const newProduct: Product = {
      ...prodData,
      id: newId,
      storeId: currentActiveStore.id || store.id || 'default_store',
      ownerId: activeUser?.id || currentActiveStore.ownerId || store.ownerId || 'seller',
      productUrl,
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const nextProducts = [newProduct, ...products];
    setProductsState(nextProducts);
    Storage.setProducts(nextProducts);
    try {
      await firestoreService.saveProduct(newProduct);
    } catch (saveErr) {
      console.warn('Firestore saveProduct sync notice:', saveErr);
    }
    showToast('Product Added & Live', `"${newProduct.title}" is saved and published to your store link.`, 'success');
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = { ...products[index], ...updates };
    const nextProducts = [...products];
    nextProducts[index] = updated;
    setProductsState(nextProducts);
    Storage.setProducts(nextProducts);
    await firestoreService.saveProduct(updated);
    showToast('Product Updated', `Changes to "${updated.title}" saved`, 'success');
    return updated;
  };

  const deleteProduct = async (id: string) => {
    const nextProducts = products.filter((p) => p.id !== id);
    setProductsState(nextProducts);
    Storage.setProducts(nextProducts);
    await firestoreService.deleteProduct(id);
    showToast('Product Deleted', 'Item removed from catalog', 'info');
  };

  const duplicateProduct = async (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;

    const limitCheck = subscriptionService.checkCanAddProduct(currentUser, products.length);
    if (!limitCheck.allowed) {
      const msg = limitCheck.reason || `Your current plan allows up to ${limitCheck.limit} products. Upgrade your plan to add more products.`;
      openLimitModal(products.length, limitCheck.limit, msg);
      showToast('Product Limit Reached', msg, 'warning');
      return;
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const copy: Product = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      sku: `${original.sku}-CPY`,
      status: 'Draft',
      productUrl: getProductUrl(store.slug, newId),
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };
    const nextProducts = [copy, ...products];
    setProductsState(nextProducts);
    Storage.setProducts(nextProducts);
    await firestoreService.saveProduct(copy);
    showToast('Product Duplicated', `Created "${copy.title}"`, 'success');
  };

  const togglePublishProduct = async (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;
    const newStatus = original.status === 'Published' ? 'Draft' : 'Published';
    await updateProduct(id, { status: newStatus });
    if (newStatus === 'Published') {
      showToast('Product Published', 'Product is now live on your public store link!', 'success');
    } else {
      showToast('Product Unpublished', 'Item moved to Draft status', 'info');
    }
  };

  // === ORDERS ACTIONS (FIRESTORE PERSISTENT) ===
  const refreshOrders = async () => {
    if (store.id) {
      const [dbOrders, dbCustomers] = await Promise.all([
        firestoreService.getOrdersByStore(store.id),
        firestoreService.getCustomersByStore(store.id),
      ]);
      setOrdersState(dbOrders);
      Storage.setOrders(dbOrders);
      setCustomersState(dbCustomers);
      Storage.setCustomers(dbCustomers);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>): Promise<Order> => {
    const orderCount = orders.length + 1001;
    const orderNumber = `#SL-${orderCount}`;

    const initialTimeline = [
      {
        status: 'Pending' as OrderStatus,
        timestamp: new Date().toISOString(),
        title: 'Order Placed',
        description: `Customer placed order for ${orderData.items.length} item(s)`,
      },
    ];

    if (orderData.paymentStatus === 'Paid') {
      initialTimeline.push({
        status: 'Paid' as OrderStatus,
        timestamp: new Date().toISOString(),
        title: `Payment Confirmed (${orderData.paymentMethod})`,
        description: `Full payment of ${orderData.totalAmount.toLocaleString()} UZS confirmed.`,
      });
    }

    let initialStatus: OrderStatus = orderData.paymentStatus === 'Paid' ? 'Paid' : 'Pending';
    if (automation.autoSupplierOrder && orderData.paymentStatus === 'Paid') {
      initialStatus = 'Supplier Ordered';
      initialTimeline.push({
        status: 'Supplier Ordered',
        timestamp: new Date().toISOString(),
        title: 'Auto-Supplier Dispatch',
        description: 'Sellnex dropship engine sent order fulfillment dispatch to supplier.',
      });
    }

    let resolvedOwnerId = orderData.ownerId;
    const targetStoreId = orderData.storeId || publicStore?.id || store.id;
    if (!resolvedOwnerId) {
      if (publicStore && (publicStore.id === targetStoreId || publicStore.slug === targetStoreId)) {
        resolvedOwnerId = publicStore.ownerId;
      } else if (store.id === targetStoreId) {
        resolvedOwnerId = store.ownerId || currentUser?.id || '';
      }
    }

    const resolvedShippingAddress = orderData.shippingAddress || orderData.deliveryAddress || {
      fullName: orderData.customerName,
      phone: orderData.customerPhone,
      region: 'Toshkent shahri',
      district: '',
      streetAddress: '',
    };

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      storeId: targetStoreId,
      ownerId: resolvedOwnerId || store.ownerId || currentUser?.id || '',
      customerId: orderData.customerId || currentUser?.id || undefined,
      orderNumber,
      orderStatus: initialStatus,
      timeline: initialTimeline,
      quantity: orderData.quantity || orderData.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
      deliveryAddress: orderData.deliveryAddress || resolvedShippingAddress,
      shippingAddress: resolvedShippingAddress,
      createdAt: new Date().toISOString(),
    };

    const nextOrders = [newOrder, ...orders];
    setOrdersState(nextOrders);
    Storage.setOrders(nextOrders);
    await firestoreService.saveOrder(newOrder);

    // Sync Customer in Firestore
    const existingCust = customers.find(
      (c) => c.phone === newOrder.customerPhone || (newOrder.customerEmail && c.email === newOrder.customerEmail)
    );
    let updatedCust: Customer;
    if (existingCust) {
      updatedCust = {
        ...existingCust,
        ordersCount: existingCust.ordersCount + 1,
        totalSpent: existingCust.totalSpent + newOrder.totalAmount,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: existingCust.ordersCount + 1 >= 3 ? 'VIP' : 'Active',
      };
    } else {
      const regionText = newOrder.shippingAddress?.region || '';
      const districtText = newOrder.shippingAddress?.district || (newOrder.shippingAddress as any)?.city || '';
      updatedCust = {
        id: `cust_${Date.now()}`,
        storeId: newOrder.storeId,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        email: newOrder.customerEmail,
        city: districtText ? `${regionText} (${districtText})` : regionText,
        ordersCount: 1,
        totalSpent: newOrder.totalAmount,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      };
    }
    await firestoreService.saveCustomer(updatedCust);
    setCustomersState((prev) => {
      const filtered = prev.filter((c) => c.id !== updatedCust.id);
      return [updatedCust, ...filtered];
    });

    // Update Product Stock in Firestore
    for (const item of newOrder.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const nextStock = Math.max(0, prod.stock - item.quantity);
        const updatedProd: Product = {
          ...prod,
          stock: nextStock,
          salesCount: (prod.salesCount || 0) + item.quantity,
          status: nextStock === 0 ? 'Out of stock' : prod.status,
        };
        await firestoreService.saveProduct(updatedProd);
      }
    }
    if (store.id) {
      const refreshedProducts = await firestoreService.getProductsByStore(store.id, store.slug);
      setProductsState(refreshedProducts);
    }

    // Add Notification in Firestore
    if (currentUser?.id) {
      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'New Order Received!',
        message: `${orderNumber} by ${newOrder.customerName} (${newOrder.totalAmount.toLocaleString()} UZS). Profit: ${newOrder.totalProfit.toLocaleString()} UZS`,
        type: 'order',
        read: false,
        timestamp: 'Just now',
        link: 'orders',
      };
      await firestoreService.saveNotification(currentUser.id, newNotif);
      setNotificationsState((prev) => [newNotif, ...prev]);
    }

    // Send Telegram Notification
    telegramService.sendNewOrderAlert(newOrder, store.name).catch(() => {});

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return;
    const order = orders[index];
    const newTimeline = [...order.timeline];

    let desc = `Status updated to ${status}`;
    if (status === 'Paid') desc = 'Payment confirmed and credited to seller account';
    if (status === 'Supplier Ordered') desc = 'Dispatched to supplier warehouse for dropship fulfillment';
    if (status === 'Shipped') desc = `Package handed to courier. Tracking: ${trackingNumber || order.trackingNumber || 'UZ-EXP-TASHKENT'}`;
    if (status === 'Delivered') desc = 'Package successfully delivered to customer address';
    if (status === 'Cancelled') desc = 'Order was cancelled and items returned to stock';

    newTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      title: `${status} Status Update`,
      description: desc,
    });

    const updated: Order = {
      ...order,
      orderStatus: status,
      trackingNumber: trackingNumber || order.trackingNumber,
      paymentStatus: status === 'Delivered' || status === 'Paid' || status === 'Shipped' || status === 'Supplier Ordered' ? 'Paid' : order.paymentStatus,
      timeline: newTimeline,
    };

    const nextOrders = [...orders];
    nextOrders[index] = updated;
    setOrdersState(nextOrders);
    Storage.setOrders(nextOrders);
    await firestoreService.saveOrder(updated);
    showToast('Order Updated', `${updated.orderNumber} status changed to ${status}`, 'success');
  };

  // === SUPPLIER & AUTOMATION ACTIONS ===
  const addCustomSupplier = (data: Omit<Supplier, 'id' | 'type'>) => {
    const newSup: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      type: 'Custom Supplier',
    };
    const nextSuppliers = [...suppliers, newSup];
    setSuppliersState(nextSuppliers);
    Storage.setSuppliers(nextSuppliers);
    showToast('Supplier Connected', `"${newSup.name}" integrated successfully`, 'success');
    return newSup;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const nextSuppliers = suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSuppliersState(nextSuppliers);
    Storage.setSuppliers(nextSuppliers);
    showToast('Supplier Updated', 'Configuration saved', 'success');
  };

  const updateAutomation = async (updates: Partial<AutomationSettings>) => {
    const updated = { ...automation, ...updates };
    setAutomationState(updated);
    Storage.setAutomation(updated);
    if (store.id) {
      await firestoreService.saveAutomationSettings(store.id, updated);
    }
    showToast('Automation Saved', 'Dropshipping rules saved to Firebase', 'success');
  };

  const addPartnerLink = async (title: string, slug: string, targetProductTitle?: string): Promise<PartnerLink> => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newLink: PartnerLink = {
      id: `part_${Date.now()}`,
      storeId: store.id,
      title,
      slug: cleanSlug,
      url: `https://sellnex.uz/p/${cleanSlug}`,
      targetProductTitle,
      clicks: 0,
      visitors: 0,
      orders: 0,
      revenue: 0,
      profit: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextLinks = [newLink, ...partnerLinks];
    setPartnerLinksState(nextLinks);
    Storage.setPartnerLinks(nextLinks);
    await firestoreService.savePartnerLink(newLink);
    showToast('Partner Link Created', `Link: ${newLink.url}`, 'success');
    return newLink;
  };

  const updateIntegration = async (service: string, creds: Partial<IntegrationCredentials>) => {
    const updated = {
      ...integrations,
      [service]: {
        ...(integrations[service] || { service, connected: false, testMode: true }),
        ...creds,
      },
    };
    setIntegrationsState(updated);
    Storage.setIntegrations(updated);
    if (store.id) {
      await firestoreService.saveIntegrations(store.id, updated);
    }
    showToast('Integration Updated', `${service.toUpperCase()} connection saved`, 'success');
  };

  const markNotificationRead = async (id: string) => {
    const notifs = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotificationsState(notifs);
    Storage.setNotifications(notifs);
    const target = notifs.find((n) => n.id === id);
    if (target && currentUser?.id) {
      await firestoreService.saveNotification(currentUser.id, target);
    }
  };

  const markAllNotificationsRead = async () => {
    const notifs = notifications.map((n) => ({ ...n, read: true }));
    setNotificationsState(notifs);
    Storage.setNotifications(notifs);
    if (currentUser?.id) {
      for (const n of notifs) {
        await firestoreService.saveNotification(currentUser.id, n);
      }
    }
    showToast('Notifications Marked', 'All caught up!', 'info');
  };

  // Image Upload helper using Firebase Storage
  const uploadImage = async (path: string, fileOrDataUrl: File | Blob | string): Promise<string> => {
    return await firestoreService.uploadImage(path, fileOrDataUrl);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    const currentCart = [...cart];
    const existingIndex = currentCart.findIndex(
      (item) => item.product.id === product.id && item.selectedVariant === variant
    );

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({ product, quantity, selectedVariant: variant });
    }

    setCartState(currentCart);
    Storage.setCart(currentCart);
    showToast('Added to Cart', `${product.title} (${quantity}) added`, 'success');
  };

  const removeFromCart = (productId: string, variant?: string) => {
    const nextCart = cart.filter((item) => !(item.product.id === productId && item.selectedVariant === variant));
    setCartState(nextCart);
    Storage.setCart(nextCart);
  };

  const updateCartQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    const nextCart = cart.map((item) => {
      if (item.product.id === productId && item.selectedVariant === variant) {
        return { ...item, quantity };
      }
      return item;
    });
    setCartState(nextCart);
    Storage.setCart(nextCart);
  };

  const clearCart = () => {
    setCartState([]);
    Storage.setCart([]);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  const formatMoney = (amount: number): string => {
    if (store.currency === 'USD') {
      const usdAmount = amount / 12800;
      return `$${usdAmount.toFixed(2)}`;
    }
    return `${amount.toLocaleString()} UZS`;
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const resetDemoData = () => {
    Storage.resetToDemo();
    setCurrentUserState(Storage.getCurrentUser());
    setUserStoresState([]);
    setStoreState(DEFAULT_EMPTY_STORE);
    setProductsState([]);
    setOrdersState([]);
    setCustomersState([]);
    setSuppliersState(Storage.getSuppliers());
    setAutomationState(Storage.getAutomation());
    setPartnerLinksState([]);
    setIntegrationsState(Storage.getIntegrations());
    setNotificationsState([]);
    setCartState([]);
    showToast('Session Cleared', 'Logged out and local cache cleared.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        setCurrentUser,
        pendingRegistration,
        setPendingRegistration,
        completeOnboarding,
        login,
        adminLogin,
        signUp,
        logout,
        isLoadingAuth,
        store,
        stores: userStores,
        userStores,
        switchStore,
        createNewStore,
        updateStore,
        updateTheme,
        publicStore,
        publicProducts,
        publicStoreLoading,
        publicStoreStatus,
        publicActiveProduct,
        loadPublicStoreData,
        getStoreUrl,
        getProductUrl,
        copyStoreLink,
        copyProductLink,
        openShareModal,
        closeShareModal,
        openLimitModal,
        closeLimitModal,
        products,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        togglePublishProduct,
        orders,
        refreshOrders,
        createOrder,
        updateOrderStatus,
        customers,
        suppliers,
        addCustomSupplier,
        updateSupplier,
        automation,
        updateAutomation,
        partnerLinks,
        addPartnerLink,
        integrations,
        updateIntegration,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        uploadImage,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        currentRoute,
        navigateTo,
        navigateBack,
        routeParams,
        toasts,
        showToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        formatMoney,
        isDarkMode,
        toggleDarkMode,
        resetDemoData,
      }}
    >
      {children}

      {/* Global Share Modal */}
      {shareModalConfig && (
        <ShareModal
          isOpen={shareModalConfig.isOpen}
          onClose={closeShareModal}
          title={shareModalConfig.title}
          subtitle={shareModalConfig.subtitle}
          url={shareModalConfig.url}
          storeSlug={store.slug}
          productTitle={shareModalConfig.productTitle}
          productPrice={shareModalConfig.productPrice}
          productImage={shareModalConfig.productImage}
          formatMoney={formatMoney}
        />
      )}

      {/* Global Plan Limit Warning Modal */}
      {limitModalConfig && (
        <PlanLimitModal
          isOpen={limitModalConfig.isOpen}
          onClose={closeLimitModal}
          currentCount={limitModalConfig.currentCount}
          maxLimit={limitModalConfig.maxLimit}
          customMessage={limitModalConfig.customMessage}
        />
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
