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
  PendingRegistration,
} from '../types';
import {
  INITIAL_SUPPLIERS,
  INITIAL_AUTOMATION,
  INITIAL_INTEGRATIONS,
} from '../data/initialData';

const KEYS = {
  CURRENT_USER: 'sellnex_current_user',
  PENDING_REG: 'sellnex_pending_registration',
  USERS: 'sellnex_users',
  STORE: 'sellnex_store',
  STORES: 'sellnex_stores',
  ACTIVE_STORE_ID: 'sellnex_active_store_id',
  PRODUCTS: 'sellnex_products',
  ORDERS: 'sellnex_orders',
  CUSTOMERS: 'sellnex_customers',
  SUPPLIERS: 'sellnex_suppliers',
  AUTOMATION: 'sellnex_automation',
  PARTNER_LINKS: 'sellnex_partner_links',
  INTEGRATIONS: 'sellnex_integrations',
  NOTIFICATIONS: 'sellnex_notifications',
  CART: 'sellnex_cart',
};

const memoryStore: Record<string, string> = {};

function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const data = window.localStorage.getItem(key);
      if (data) return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`SafeStorage: Error reading ${key} from localStorage, using memory fallback:`, err);
  }
  if (memoryStore[key]) {
    try {
      return JSON.parse(memoryStore[key]);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function safeSet<T>(key: string, value: T): void {
  const serialized = JSON.stringify(value);
  memoryStore[key] = serialized;
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, serialized);
    }
  } catch (err) {
    console.warn(`SafeStorage: Error saving ${key} to localStorage:`, err);
  }
}

function safeRemove(key: string): void {
  delete memoryStore[key];
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`SafeStorage: Error removing ${key} from localStorage:`, err);
  }
}

export const Storage = {
  getCurrentUser: (): User | null => safeGet<User | null>(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => safeSet(KEYS.CURRENT_USER, user),

  getPendingRegistration: (): PendingRegistration | null => safeGet<PendingRegistration | null>(KEYS.PENDING_REG, null),
  setPendingRegistration: (data: PendingRegistration | null) => safeSet(KEYS.PENDING_REG, data),

  getUsers: (): User[] => safeGet<User[]>(KEYS.USERS, []),
  setUsers: (users: User[]) => safeSet(KEYS.USERS, users),

  getStore: (): Store | null => safeGet<Store | null>(KEYS.STORE, null),
  setStore: (store: Store | null) => safeSet(KEYS.STORE, store),

  getStores: (): Store[] => safeGet<Store[]>(KEYS.STORES, []),
  setStores: (stores: Store[]) => safeSet(KEYS.STORES, stores),

  getActiveStoreId: (): string | null => safeGet<string | null>(KEYS.ACTIVE_STORE_ID, null),
  setActiveStoreId: (storeId: string | null) => safeSet(KEYS.ACTIVE_STORE_ID, storeId),

  getProducts: (): Product[] => safeGet<Product[]>(KEYS.PRODUCTS, []),
  setProducts: (products: Product[]) => safeSet(KEYS.PRODUCTS, products),

  getOrders: (): Order[] => safeGet<Order[]>(KEYS.ORDERS, []),
  setOrders: (orders: Order[]) => safeSet(KEYS.ORDERS, orders),

  getCustomers: (): Customer[] => safeGet<Customer[]>(KEYS.CUSTOMERS, []),
  setCustomers: (customers: Customer[]) => safeSet(KEYS.CUSTOMERS, customers),

  getSuppliers: (): Supplier[] => safeGet<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
  setSuppliers: (suppliers: Supplier[]) => safeSet(KEYS.SUPPLIERS, suppliers),

  getAutomation: (): AutomationSettings => safeGet<AutomationSettings>(KEYS.AUTOMATION, INITIAL_AUTOMATION),
  setAutomation: (settings: AutomationSettings) => safeSet(KEYS.AUTOMATION, settings),

  getPartnerLinks: (): PartnerLink[] => safeGet<PartnerLink[]>(KEYS.PARTNER_LINKS, []),
  setPartnerLinks: (links: PartnerLink[]) => safeSet(KEYS.PARTNER_LINKS, links),

  getIntegrations: (): Record<string, IntegrationCredentials> =>
    safeGet<Record<string, IntegrationCredentials>>(KEYS.INTEGRATIONS, INITIAL_INTEGRATIONS),
  setIntegrations: (integrations: Record<string, IntegrationCredentials>) =>
    safeSet(KEYS.INTEGRATIONS, integrations),

  getNotifications: (): NotificationItem[] => safeGet<NotificationItem[]>(KEYS.NOTIFICATIONS, []),
  setNotifications: (notifs: NotificationItem[]) => safeSet(KEYS.NOTIFICATIONS, notifs),

  getCart: (): CartItem[] => safeGet<CartItem[]>(KEYS.CART, []),
  setCart: (cart: CartItem[]) => safeSet(KEYS.CART, cart),

  clearUserSession: () => {
    safeRemove(KEYS.CURRENT_USER);
    safeRemove(KEYS.STORE);
    safeRemove(KEYS.STORES);
    safeRemove(KEYS.ACTIVE_STORE_ID);
    safeRemove(KEYS.PRODUCTS);
    safeRemove(KEYS.ORDERS);
    safeRemove(KEYS.CUSTOMERS);
    safeRemove(KEYS.PARTNER_LINKS);
    safeRemove(KEYS.NOTIFICATIONS);
    safeRemove(KEYS.PENDING_REG);
  },

  resetToDemo: () => {
    Storage.clearUserSession();
  },
};
