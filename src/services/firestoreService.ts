import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, storage, auth } from './firebase';
import {
  User,
  Store,
  Product,
  Order,
  Customer,
  Supplier,
  SupplierReview,
  AutomationSettings,
  PartnerLink,
  IntegrationCredentials,
  NotificationItem,
  CartItem,
  PendingRegistration,
  OnboardingData,
  DeviceLog,
  P2PPayment,
  PromoCode,
  AuditLog,
  Dispute,
  DynamicPlan,
  AdminSettings,
  RestaurantProfile,
  MenuItem,
  CafeCategory,
  RestaurantOrder,
  RestaurantOrderStatus,
  ProductReview,
  ReviewModerationStatus,
  BulkImportProductRow,
  BulkImportSummary,
  CafeTable,
  DropshippingCategory,
  DropshippingCatalogProduct,
  OrderStatus,
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_REVIEWS,
  INITIAL_AUTOMATION,
  INITIAL_INTEGRATIONS,
} from '../data/initialData';

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  STORES: 'stores',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  PARTNER_LINKS: 'partner_links',
  SUPPLIERS: 'suppliers',
  SUPPLIER_REVIEWS: 'supplier_reviews',
  AUTOMATION: 'automation',
  INTEGRATIONS: 'integrations',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTIONS: 'subscriptions',
  DEVICE_LOGS: 'device_logs',
  P2P_PAYMENTS: 'p2p_payments',
  PROMO_CODES: 'promo_codes',
  AUDIT_LOGS: 'audit_logs',
  DISPUTES: 'disputes',
  ADMIN_SETTINGS: 'admin_settings',
  ADMIN_NOTIFICATIONS: 'admin_notifications',
  RESTAURANTS: 'restaurants',
  MENU_ITEMS: 'menu_items',
  CAFE_CATEGORIES: 'cafe_categories',
  RESTAURANT_ORDERS: 'restaurant_orders',
  PRODUCT_REVIEWS: 'product_reviews',
  CAFE_TABLES: 'cafe_tables',
  DROPSHIPPING_CATEGORIES: 'dropshipping_categories',
  DROPSHIPPING_CATALOG: 'dropshipping_catalog',
} as const;

// === In-Memory Multi-Tenant Isolation Cache for Café ===
interface CafeCacheEntry<T> {
  data: T;
  timestamp: number;
}

const CAFE_CACHE_TTL_MS = 60 * 1000; // 60s TTL for background staleness; instantaneous in-session switches

const cafeMemoryCache = {
  profileByOwner: new Map<string, CafeCacheEntry<RestaurantProfile>>(),
  profileById: new Map<string, CafeCacheEntry<RestaurantProfile>>(),
  categories: new Map<string, CafeCacheEntry<CafeCategory[]>>(),
  menuItems: new Map<string, CafeCacheEntry<MenuItem[]>>(),
};

// Helper to strip undefined fields for Firestore setDoc / updateDoc compatibility
function isFirestoreSentinel(val: any): boolean {
  if (!val || typeof val !== 'object') return false;
  if (val.constructor?.name === 'FieldValueImpl' || (val as any)._methodName || typeof (val as any).isEqual === 'function' || val instanceof Date) {
    return true;
  }
  return false;
}

function sanitizeData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (isFirestoreSentinel(value)) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item !== null && typeof item === 'object') {
          if (isFirestoreSentinel(item)) return item;
          return sanitizeData(item);
        }
        return item;
      });
    } else if (value !== null && typeof value === 'object') {
      result[key] = sanitizeData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const firestoreService = {
  // === USER OPERATIONS ===
  async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
        } as User;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user from Firestore:', err);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (!email) return null;
      const clean = email.trim().toLowerCase();
      const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', clean));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as User;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user by email from Firestore:', err);
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as User[];
    } catch (err) {
      console.error('Error fetching all users from Firestore:', err);
      return [];
    }
  },

  async setUser(userId: string, user: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const cleaned = sanitizeData({ ...user, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const cleaned = sanitizeData({ ...updates, updatedAt: new Date().toISOString() });
    await updateDoc(docRef, cleaned);
  },

  // === STORE OPERATIONS ===
  async getAllStores(): Promise<Store[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.STORES));
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Store[];
    } catch (err) {
      console.error('Error fetching all stores from Firestore:', err);
      return [];
    }
  },

  async updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STORES, storeId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  },

  async deleteStore(storeId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STORES, storeId);
    await deleteDoc(docRef);
  },

  async getStoreByOwner(ownerId: string): Promise<Store | null> {
    try {
      if (!ownerId) return null;
      // 1. Query by ownerId field
      const q = query(collection(db, COLLECTIONS.STORES), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Store;
      }

      // 2. Query by legacy userId field if any
      const qUser = query(collection(db, COLLECTIONS.STORES), where('userId', '==', ownerId));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        const docSnap = snapUser.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Store;
      }

      return null;
    } catch (err) {
      console.error('Error fetching store by owner from Firestore:', err);
      return null;
    }
  },

  async getStoresByOwnerId(ownerId: string): Promise<Store[]> {
    try {
      if (!ownerId) return [];
      const q = query(collection(db, COLLECTIONS.STORES), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Store[];
    } catch (err) {
      console.error('Error fetching stores by owner ID:', err);
      return [];
    }
  },

  async createDefaultStoreForUser(user: User): Promise<Store> {
    const rawName = user.name || (user.email ? user.email.split('@')[0] : 'Online') || 'My';
    const cleanName = `${rawName.charAt(0).toUpperCase() + rawName.slice(1)}'s Store`;
    const storeId = await this.generateUniqueStoreId();
    const baseSlug = (rawName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'store') + 'store';
    const uniqueSlug = await this.generateUniqueSlug(baseSlug, storeId);

    const defaultStore: Store = {
      id: storeId,
      storeId,
      ownerId: user.id,
      name: cleanName,
      storeName: cleanName,
      slug: uniqueSlug,
      visibility: 'PUBLIC',
      published: true,
      domain: `${uniqueSlug}.sellnex.uz`,
      currency: 'UZS',
      targetMarket: 'Uzbekistan',
      sellType: 'Dropshipping',
      logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: {
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        fontFamily: 'Plus Jakarta Sans',
        headerStyle: 'modern',
        bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
        bannerTitle: cleanName,
        bannerSubtitle: 'Sifatli mahsulotlar va Oʻzbekiston boʻylab tezkor yetkazib berish',
        buttonText: 'Barcha mahsulotlarni koʻrish',
        showAnnouncement: true,
        announcementText: '🔥 Toshkent va barcha viloyatlarga tezkor yetkazib berish xizmati!',
        productCardStyle: 'card',
        footerText: `© ${new Date().getFullYear()} ${cleanName}. Powered by Sellnex.`,
        phone: user.phone || '+998901234567',
      },
    };

    await this.saveStore(defaultStore);
    try {
      await this.updateUser(user.id, { storeId: defaultStore.id });
    } catch (err) {
      console.warn('Update user with default store note:', err);
    }
    return defaultStore;
  },

  async generateUniqueStoreId(): Promise<string> {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let attempt = 0; attempt < 10; attempt++) {
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await this.getStore(result);
      if (!existing) {
        return result;
      }
    }
    return `S${Date.now().toString(36).toUpperCase().slice(-5)}`;
  },

  async getStoreByIdOrSlug(idOrSlug: string): Promise<Store | null> {
    try {
      if (!idOrSlug) return null;
      const clean = idOrSlug.trim();
      const cleanLower = clean.toLowerCase();

      // 1. Direct document ID lookup
      const docRef = doc(db, COLLECTIONS.STORES, clean);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Store;
      }

      // 1b. Direct doc lookup lowercase
      if (clean !== cleanLower) {
        const docRefLower = doc(db, COLLECTIONS.STORES, cleanLower);
        const snapshotLower = await getDoc(docRefLower);
        if (snapshotLower.exists()) {
          return { id: snapshotLower.id, ...snapshotLower.data() } as Store;
        }
      }

      // 2. Query by slug
      const qSlug = query(collection(db, COLLECTIONS.STORES), where('slug', '==', cleanLower));
      const snapSlug = await getDocs(qSlug);
      if (!snapSlug.empty) {
        const docSnap = snapSlug.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Store;
      }

      // 3. Query by storeId field
      const qStoreId = query(collection(db, COLLECTIONS.STORES), where('storeId', '==', clean));
      const snapStoreId = await getDocs(qStoreId);
      if (!snapStoreId.empty) {
        const docSnap = snapStoreId.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Store;
      }

      // 4. Query by id field
      const qId = query(collection(db, COLLECTIONS.STORES), where('id', '==', clean));
      const snapId = await getDocs(qId);
      if (!snapId.empty) {
        const docSnap = snapId.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Store;
      }

      // 5. Query normalized slug (strip non-alphanumeric hyphens)
      const cleanAlpha = cleanLower.replace(/[^a-z0-9]/g, '');
      if (cleanAlpha && cleanAlpha !== cleanLower) {
        const qAlpha = query(collection(db, COLLECTIONS.STORES), where('slug', '==', cleanAlpha));
        const snapAlpha = await getDocs(qAlpha);
        if (!snapAlpha.empty) {
          const docSnap = snapAlpha.docs[0];
          return { id: docSnap.id, ...docSnap.data() } as Store;
        }
      }

      return null;
    } catch (err) {
      console.error('Error fetching store by ID or slug:', err);
      return null;
    }
  },

  async getStoreBySlug(slug: string): Promise<Store | null> {
    return this.getStoreByIdOrSlug(slug);
  },

  async getStore(storeId: string): Promise<Store | null> {
    try {
      const docRef = doc(db, COLLECTIONS.STORES, storeId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Store;
      }
      return null;
    } catch (err) {
      console.error('Error fetching store from Firestore:', err);
      return null;
    }
  },

  async isSlugAvailable(slug: string, currentStoreId?: string): Promise<boolean> {
    try {
      const cleanSlug = slug.toLowerCase().trim();
      const q = query(collection(db, COLLECTIONS.STORES), where('slug', '==', cleanSlug));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return true;
      if (currentStoreId && querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === currentStoreId) {
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error checking slug availability:', err);
      return true;
    }
  },

  async generateUniqueSlug(desiredSlug: string, currentStoreId?: string): Promise<string> {
    let clean = desiredSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'my-store';
    
    let isAvail = await this.isSlugAvailable(clean, currentStoreId);
    if (isAvail) return clean;

    // Append short random suffix if taken by another user
    for (let i = 0; i < 5; i++) {
      const candidate = `${clean}-${Math.random().toString(36).substring(2, 6)}`;
      isAvail = await this.isSlugAvailable(candidate, currentStoreId);
      if (isAvail) return candidate;
    }
    return `${clean}-${Date.now().toString(36).slice(-5)}`;
  },

  async saveStore(store: Store): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.STORES, store.id);
      const storePayload = {
        ...store,
        storeId: store.storeId || store.id,
        ownerId: store.ownerId,
        storeName: store.storeName || store.name,
        slug: store.slug,
        visibility: store.visibility || 'PUBLIC',
        published: store.published !== undefined ? store.published : true,
        updatedAt: new Date().toISOString(),
      };
      const cleaned = sanitizeData(storePayload);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err: any) {
      console.error('[Firestore saveStore Critical Error]:', {
        errorMessage: err?.message,
        errorCode: err?.code,
        storeId: store.id,
        ownerId: store.ownerId,
        authUid: auth.currentUser?.uid,
      });
      throw err;
    }
  },

  // === PRODUCTS OPERATIONS ===
  async getAllProducts(): Promise<Product[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Product[];
    } catch (err) {
      console.error('Error fetching all products from Firestore:', err);
      return [];
    }
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  },

  async getProductsByStore(storeId: string, fallbackSlug?: string): Promise<Product[]> {
    try {
      if (!storeId && !fallbackSlug) return [];
      const idsToSearch = Array.from(new Set([storeId, fallbackSlug].filter(Boolean) as string[]));
      
      const allDocs: Product[] = [];
      const seen = new Set<string>();

      for (const sId of idsToSearch) {
        const q = query(collection(db, COLLECTIONS.PRODUCTS), where('storeId', '==', sId));
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach((docSnap) => {
          if (!seen.has(docSnap.id)) {
            seen.add(docSnap.id);
            allDocs.push({ id: docSnap.id, ...docSnap.data() } as Product);
          }
        });
      }

      return allDocs;
    } catch (err) {
      console.error('Error fetching products from Firestore:', err);
      return [];
    }
  },

  async getProductsByOwner(ownerId: string): Promise<Product[]> {
    try {
      if (!ownerId) return [];
      const q = query(collection(db, COLLECTIONS.PRODUCTS), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Product[];
    } catch (err) {
      console.error('Error fetching products by owner from Firestore:', err);
      return [];
    }
  },

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Product;
      }
      return null;
    } catch (err) {
      console.error('Error fetching product by ID from Firestore:', err);
      return null;
    }
  },

  async saveProduct(product: Product): Promise<void> {
    // Database / backend level product limit check for new products
    try {
      const existingProduct = await this.getProductById(product.id);
      if (!existingProduct) {
        const ownerId = product.ownerId || auth.currentUser?.uid;
        if (ownerId) {
          const ownerUser = await this.getUser(ownerId);
          if (ownerUser && ownerUser.role !== 'admin') {
            // Check if subscription or trial is expired
            const expiry = ownerUser.endDate || ownerUser.subscriptionExpiresAt || ownerUser.trialEndsAt;
            if (expiry) {
              const isExpired =
                new Date(expiry).getTime() < Date.now() ||
                ownerUser.status === 'expired' ||
                ownerUser.subscriptionStatus === 'expired';
              if (isExpired) {
                throw new Error('Your subscription has expired.');
              }
            }

            const existingProducts = await this.getProductsByOwner(ownerId);
            const count = existingProducts.length;
            const plan = (ownerUser.plan === 'free' ? 'trial' : ownerUser.plan) || 'trial';

            if (plan === 'trial') {
              if (count >= 5) {
                throw new Error('You have reached your 5 product limit.');
              }
            } else if (plan === 'starter') {
              if (count >= 5) {
                throw new Error('You have reached your 5 product limit. Upgrade to Pro for up to 20 products.');
              }
            } else if (plan === 'pro' || plan === 'full') {
              if (count >= 20) {
                throw new Error('You have reached your 20 product limit. Upgrade to Business for up to 50 products.');
              }
            } else if (plan === 'business') {
              if (count >= 50) {
                throw new Error('You have reached your 50 product limit. Upgrade to Premium for up to 110 products.');
              }
            } else if (plan === 'premium' || plan === 'premium_pro') {
              if (count >= 110) {
                throw new Error('You have reached your 110 product limit on Premium.');
              }
            } else {
              const limit = ownerUser.productLimit || 5;
              if (count >= limit) {
                throw new Error(`You have reached your ${limit} product limit.`);
              }
            }
          }
        }
      }
    } catch (limitErr: any) {
      if (
        limitErr?.message?.includes('product limit') ||
        limitErr?.message?.includes('subscription has expired')
      ) {
        throw limitErr;
      }
      console.warn('Backend limit check notice:', limitErr);
    }

    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    const cleaned = sanitizeData({ ...product, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
  },

  async deleteProduct(productId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
  },

  // === ORDERS OPERATIONS ===
  async getAllOrders(): Promise<Order[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Order[];
    } catch (err) {
      console.error('Error fetching all orders from Firestore:', err);
      return [];
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const cleaned = sanitizeData({ ...updates, updatedAt: new Date().toISOString() });
    await updateDoc(docRef, cleaned);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      if (!orderId) return null;
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order by ID:', err);
      return null;
    }
  },

  onOrderSnapshot(orderId: string, callback: (order: Order | null) => void): Unsubscribe {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn('Error listening to order snapshot:', err);
      }
    );
  },

  async submitOrderReceipt(
    orderId: string,
    receiptUrl: string,
    receiptFileName: string,
    receiptFileType: string,
    txNumber?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    let existingTimeline: any[] = [];
    try {
      const existing = await this.getOrderById(orderId);
      if (existing?.timeline && Array.isArray(existing.timeline)) {
        existingTimeline = existing.timeline;
      }
    } catch (e) {
      console.warn('Notice: Proceeding with timeline update:', e);
    }

    const newTimeline = [
      ...existingTimeline,
      {
        status: 'Pending' as const,
        timestamp: new Date().toISOString(),
        title: "To'lov cheki yuklandi",
        description: `Mijoz to'lov chekini (${receiptFileName}) yukladi va tasdiqlashga yubordi.`,
      },
    ];

    const updatePayload = {
      receiptUrl,
      receiptFileName,
      receiptFileType,
      receiptTxNumber: txNumber || '',
      receiptUploadedAt: new Date().toISOString(),
      paymentStatus: 'pending_verification',
      orderStatus: 'pending_payment_verification',
      timeline: newTimeline,
      updatedAt: new Date().toISOString(),
    };

    // Use setDoc with merge to ensure atomic update and avoid not-found errors
    await setDoc(docRef, updatePayload, { merge: true });
  },

  async confirmOrderPayment(orderId: string, adminUidOrEmail?: string, fallbackEmail?: string): Promise<void> {
    if (!orderId) throw new Error('Order ID is required');
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    let existingTimeline: any[] = [];
    try {
      const existing = await this.getOrderById(orderId);
      if (existing?.timeline && Array.isArray(existing.timeline)) {
        existingTimeline = existing.timeline;
      }
    } catch (e) {
      console.warn('Notice: proceeding with timeline update in confirmOrderPayment:', e);
    }

    let currentAdminUid = auth.currentUser?.uid || 'admin_kamoliddin_5021';
    let currentAdminEmail = auth.currentUser?.email || 'ypay260@gmail.com';

    if (adminUidOrEmail) {
      if (adminUidOrEmail.includes('@')) {
        currentAdminEmail = adminUidOrEmail;
      } else {
        currentAdminUid = adminUidOrEmail;
      }
    }
    if (fallbackEmail && fallbackEmail.includes('@')) {
      currentAdminEmail = fallbackEmail;
    }

    const nowIso = new Date().toISOString();
    const newTimeline = [
      ...existingTimeline,
      {
        status: 'confirmed' as const,
        timestamp: nowIso,
        title: "To'lov tasdiqlandi (Admin)",
        description: `Sellnex platforma administratori (${currentAdminEmail || currentAdminUid}) to'lovni tasdiqladi.`,
      },
    ];

    const payload = sanitizeData({
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      verifiedBy: currentAdminUid,
      adminEmail: currentAdminEmail,
      verifiedAt: serverTimestamp(),
      verifiedAtIso: nowIso,
      timeline: newTimeline,
      updatedAt: nowIso,
    });

    // Use setDoc with merge to ensure atomic update and avoid not-found errors
    await setDoc(docRef, payload, { merge: true });
  },

  async rejectOrderPayment(orderId: string, param1?: string, param2?: string, param3?: string): Promise<void> {
    if (!orderId) throw new Error('Order ID is required');
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    let existingTimeline: any[] = [];
    try {
      const existing = await this.getOrderById(orderId);
      if (existing?.timeline && Array.isArray(existing.timeline)) {
        existingTimeline = existing.timeline;
      }
    } catch (e) {
      console.warn('Notice: proceeding with timeline update in rejectOrderPayment:', e);
    }

    let currentAdminUid = auth.currentUser?.uid || 'admin_kamoliddin_5021';
    let currentAdminEmail = auth.currentUser?.email || 'ypay260@gmail.com';
    let reason = "To‘lov cheki ma'lumotlari tasdiqlanmadi. Yangi chek talab qilinadi.";

    if (param1) {
      if (param1.includes('@')) {
        currentAdminEmail = param1;
        if (param2) reason = param2;
        if (param3) currentAdminUid = param3;
      } else {
        reason = param1;
        if (param2) {
          if (param2.includes('@')) {
            currentAdminEmail = param2;
          } else {
            currentAdminUid = param2;
          }
        }
        if (param3) {
          if (param3.includes('@')) {
            currentAdminEmail = param3;
          } else {
            currentAdminUid = param3;
          }
        }
      }
    }

    const nowIso = new Date().toISOString();
    const newTimeline = [
      ...existingTimeline,
      {
        status: 'Pending' as const,
        timestamp: nowIso,
        title: "To'lov cheki rad etildi (Admin)",
        description: reason,
      },
    ];

    const payload = sanitizeData({
      paymentStatus: 'rejected',
      orderStatus: 'rejected',
      receiptRejectedReason: reason,
      verifiedBy: currentAdminUid,
      adminEmail: currentAdminEmail,
      verifiedAt: serverTimestamp(),
      verifiedAtIso: nowIso,
      timeline: newTimeline,
      updatedAt: nowIso,
    });

    // Use setDoc with merge to ensure atomic update and avoid not-found errors
    await setDoc(docRef, payload, { merge: true });
  },

  async getOrdersByStore(storeId: string, onlyPaid: boolean = true): Promise<Order[]> {
    try {
      if (!storeId) return [];
      const q = query(collection(db, COLLECTIONS.ORDERS), where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Order[];
      if (onlyPaid) {
        // Business rule: Sellers only see orders where payment has been verified and marked as paid
        return orders.filter(
          (o) => o.paymentStatus === 'paid' || o.paymentStatus === 'Paid'
        );
      }
      return orders;
    } catch (err) {
      console.error('Error fetching orders from Firestore:', err);
      return [];
    }
  },

  async saveOrder(order: Order): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    const cleaned = sanitizeData({ ...order, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
  },

  // === CUSTOMERS OPERATIONS ===
  async getCustomersByStore(storeId: string): Promise<Customer[]> {
    try {
      if (!storeId) return [];
      const q = query(collection(db, COLLECTIONS.CUSTOMERS), where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Customer[];
    } catch (err) {
      console.error('Error fetching customers from Firestore:', err);
      return [];
    }
  },

  async saveCustomer(customer: Customer): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customer.id);
    const cleaned = sanitizeData({ ...customer, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
  },

  // === PARTNER LINKS OPERATIONS ===
  async getPartnerLinksByStore(storeId: string): Promise<PartnerLink[]> {
    try {
      if (!storeId) return [];
      const q = query(collection(db, COLLECTIONS.PARTNER_LINKS), where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as PartnerLink[];
    } catch (err) {
      console.error('Error fetching partner links from Firestore:', err);
      return [];
    }
  },

  async savePartnerLink(link: PartnerLink): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PARTNER_LINKS, link.id);
    await setDoc(docRef, { ...link, updatedAt: new Date().toISOString() }, { merge: true });
  },

  // === SUPPLIERS & SUPPLIER RATINGS ===
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.SUPPLIERS));
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as Supplier);
      }
      return INITIAL_SUPPLIERS;
    } catch (err) {
      console.warn('Error fetching suppliers from Firestore, using initial:', err);
      return INITIAL_SUPPLIERS;
    }
  },

  async saveSupplier(supplier: Supplier): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SUPPLIERS, supplier.id);
      await setDoc(docRef, { ...supplier, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Error saving supplier to Firestore:', err);
    }
  },

  async getSupplierReviews(supplierId?: string): Promise<SupplierReview[]> {
    try {
      let q = collection(db, COLLECTIONS.SUPPLIER_REVIEWS);
      let queryRef = supplierId
        ? query(q, where('supplierId', '==', supplierId))
        : query(q);
      const snapshot = await getDocs(queryRef);
      if (!snapshot.empty) {
        const reviews = snapshot.docs.map((d) => d.data() as SupplierReview);
        return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      if (supplierId) {
        return INITIAL_SUPPLIER_REVIEWS.filter((r) => r.supplierId === supplierId);
      }
      return INITIAL_SUPPLIER_REVIEWS;
    } catch (err) {
      console.warn('Error fetching supplier reviews from Firestore, using initial:', err);
      if (supplierId) {
        return INITIAL_SUPPLIER_REVIEWS.filter((r) => r.supplierId === supplierId);
      }
      return INITIAL_SUPPLIER_REVIEWS;
    }
  },

  async saveSupplierReview(review: SupplierReview): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SUPPLIER_REVIEWS, review.id);
      await setDoc(docRef, { ...review, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Error saving supplier review to Firestore:', err);
    }
  },

  // === FEATURE 1: PRODUCT RATINGS AND REVIEWS OPERATIONS ===
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      if (!productId) return [];
      const q = query(
        collection(db, COLLECTIONS.PRODUCT_REVIEWS),
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductReview[];

      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching product reviews:', err);
      return [];
    }
  },

  async getAllProductReviews(): Promise<ProductReview[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCT_REVIEWS));
      const reviews = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductReview[];
      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching all product reviews for admin:', err);
      return [];
    }
  },

  /**
   * Verified purchase check: Searches actual orders in Firestore for matching customer phone/email
   * and product ID. Never fabricates verified purchase badge (Requirement 7).
   */
  async checkVerifiedPurchase(
    productId: string,
    customerPhone: string,
    customerEmail?: string
  ): Promise<{ isVerified: boolean; orderId?: string }> {
    try {
      if (!productId || !customerPhone) return { isVerified: false };
      const cleanPhone = customerPhone.replace(/\D/g, '');

      const snapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
      for (const docSnap of snapshot.docs) {
        const order = docSnap.data() as Order;
        const orderPhone = (order.customerPhone || '').replace(/\D/g, '');
        const orderEmail = (order.customerEmail || '').toLowerCase().trim();
        const inputEmail = (customerEmail || '').toLowerCase().trim();

        const phoneMatches = orderPhone && cleanPhone && orderPhone.endsWith(cleanPhone.slice(-9));
        const emailMatches = orderEmail && inputEmail && orderEmail === inputEmail;

        if (phoneMatches || emailMatches) {
          const hasPurchasedProduct = order.items?.some((item) => item.productId === productId);
          const isSuccessfulOrder =
            order.paymentStatus === 'paid' ||
            order.paymentStatus === 'Paid' ||
            order.orderStatus === 'confirmed' ||
            order.orderStatus === 'Paid' ||
            order.orderStatus === 'Processing' ||
            order.orderStatus === 'Supplier Ordered' ||
            order.orderStatus === 'Shipped' ||
            order.orderStatus === 'Delivered';

          if (hasPurchasedProduct && isSuccessfulOrder) {
            return { isVerified: true, orderId: order.id };
          }
        }
      }
      return { isVerified: false };
    } catch (err) {
      console.warn('Error checking verified purchase:', err);
      return { isVerified: false };
    }
  },

  async addProductReview(
    reviewData: Omit<ProductReview, 'id' | 'createdAt'>
  ): Promise<ProductReview> {
    const cleanPhone = (reviewData.customerPhone || '').trim();
    const cleanEmail = (reviewData.customerEmail || '').trim().toLowerCase();

    // Prevent duplicate reviews from same customer for same product (Requirement 6)
    const existing = await this.getProductReviews(reviewData.productId);
    const isDuplicate = existing.some((r) => {
      const matchPhone = cleanPhone && r.customerPhone && r.customerPhone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '');
      const matchEmail = cleanEmail && r.customerEmail && r.customerEmail.toLowerCase().trim() === cleanEmail;
      const matchCustomer = reviewData.customerId && r.customerId === reviewData.customerId;
      return matchPhone || matchEmail || matchCustomer;
    });

    if (isDuplicate) {
      throw new Error('Siz ushbu mahsulotga allaqachon sharh qoldirgansiz. Har bir mijoz bitta sharh yozishi mumkin.');
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newReview: ProductReview = {
      ...reviewData,
      id: reviewId,
      status: reviewData.status || 'approved',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const docRef = doc(db, COLLECTIONS.PRODUCT_REVIEWS, reviewId);
    await setDoc(docRef, sanitizeData(newReview));

    // Recalculate average rating & review count for the product (Requirement 5)
    await this.recalculateProductRating(reviewData.productId);

    return newReview;
  },

  async moderateProductReview(
    reviewId: string,
    status: ReviewModerationStatus,
    productId: string,
    moderatedBy?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCT_REVIEWS, reviewId);
    const nowIso = new Date().toISOString();
    await updateDoc(docRef, {
      status,
      moderatedBy: moderatedBy || 'admin',
      moderatedAt: nowIso,
      updatedAt: nowIso,
    });

    // Recalculate product rating after moderation status change
    if (productId) {
      await this.recalculateProductRating(productId);
    }
  },

  async deleteProductReview(reviewId: string, productId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCT_REVIEWS, reviewId);
    await deleteDoc(docRef);

    if (productId) {
      await this.recalculateProductRating(productId);
    }
  },

  async recalculateProductRating(productId: string): Promise<{ rating: number; reviewCount: number }> {
    try {
      const reviews = await this.getProductReviews(productId);
      const approved = reviews.filter((r) => r.status === 'approved');

      let newRating = 5.0;
      let reviewCount = approved.length;

      if (approved.length > 0) {
        const sum = approved.reduce((acc, r) => acc + Number(r.rating || 5), 0);
        newRating = Math.round((sum / approved.length) * 10) / 10;
      }

      const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        await updateDoc(productRef, {
          rating: newRating,
          reviewCount: reviewCount,
          updatedAt: new Date().toISOString(),
        });
      }

      return { rating: newRating, reviewCount };
    } catch (err) {
      console.warn('Error recalculating product rating:', err);
      return { rating: 5.0, reviewCount: 0 };
    }
  },

  // === FEATURE 2: EXCEL / CSV BULK PRODUCT IMPORT ===
  async bulkImportProducts(
    storeId: string,
    ownerId: string,
    rows: BulkImportProductRow[],
    productLimit: number = 50,
    currentCount: number = 0
  ): Promise<BulkImportSummary> {
    if (!storeId || !ownerId) {
      throw new Error('Autentifikatsiya qilingan do‘kon yoki sotuvchi identifikatori topilmadi.');
    }

    const validRows = rows.filter((r) => r.isValid);
    const invalidRows = rows.filter((r) => !r.isValid);

    const summary: BulkImportSummary = {
      totalRows: rows.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
      importedCount: 0,
      skippedCount: 0,
      failedCount: invalidRows.length,
      errorMessages: invalidRows.flatMap((r) => r.errors),
    };

    if (validRows.length === 0) {
      return summary;
    }

    // Enforce subscription and product limits (Requirement 12)
    const allowedNewCount = Math.max(0, productLimit - currentCount);
    let rowsToImport = validRows;
    if (allowedNewCount < validRows.length) {
      const excess = validRows.length - allowedNewCount;
      rowsToImport = validRows.slice(0, allowedNewCount);
      summary.skippedCount += excess;
      summary.errorMessages.push(
        `Tarif limiti sababli ${excess} ta mahsulot yuklanmadi. Mavjud limit: ${productLimit}, amaldagi mahsulotlar: ${currentCount}.`
      );
    }

    // Process batched writes in chunks of 400 (Firestore max limit is 500 per batch)
    const CHUNK_SIZE = 400;
    for (let i = 0; i < rowsToImport.length; i += CHUNK_SIZE) {
      const chunk = rowsToImport.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const row of chunk) {
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);

        const newProduct: Product = {
          id: productId,
          storeId, // Guaranteed authenticated store ID (Requirement 11, 15)
          ownerId, // Guaranteed authenticated seller ID (Requirement 11, 15)
          title: row.name.trim(),
          description: row.description?.trim() || 'Sellnex do‘konidagi sifatli mahsulot.',
          category: row.category?.trim() || 'Umumiy',
          businessMode: 'personal',
          supplier: 'Local Warehouse',
          supplierCost: 0,
          shippingCost: 0,
          paymentFeePercent: 1.5,
          platformFeePercent: 0,
          profitType: 'fixed',
          profitValue: row.price,
          calculatedProfit: row.price,
          sellingPrice: row.price,
          stock: row.stock > 0 ? row.stock : 10,
          status: 'Published',
          sku: row.sku || `SL-${Math.floor(1000 + Math.random() * 9000)}`,
          images: row.imageUrl
            ? [row.imageUrl]
            : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
          variants: [{ id: 'v1', name: 'Standart', options: ['Standart'] }],
          rating: 5.0,
          reviewCount: 0,
          salesCount: 0,
          featured: false,
          createdAt: new Date().toISOString(),
        };

        batch.set(docRef, sanitizeData(newProduct));
        summary.importedCount++;
      }

      await batch.commit();
    }

    return summary;
  },

  // === FEATURE 4: SELLNEX CAFE - TABLE MANAGEMENT OPERATIONS ===
  async getCafeTables(restaurantId: string): Promise<CafeTable[]> {
    try {
      if (!restaurantId) return [];
      const q = query(
        collection(db, COLLECTIONS.CAFE_TABLES),
        where('restaurantId', '==', restaurantId)
      );
      const snap = await getDocs(q);
      const tables = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CafeTable);

      if (tables.length === 0) {
        // Initialize default tables for new cafe
        const defaults = ['Stol 1', 'Stol 2', 'Stol 3', 'Stol 4', 'VIP Stol'];
        const createdDefaults: CafeTable[] = [];
        for (const tNum of defaults) {
          const tId = `tbl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const tableObj: CafeTable = {
            id: tId,
            restaurantId,
            tableNumber: tNum,
            capacity: 4,
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, COLLECTIONS.CAFE_TABLES, tId), sanitizeData(tableObj));
          createdDefaults.push(tableObj);
        }
        return createdDefaults;
      }

      return tables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
    } catch (e) {
      console.error('Error fetching cafe tables:', e);
      return [];
    }
  },

  async saveCafeTable(table: CafeTable): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CAFE_TABLES, table.id);
      await setDoc(docRef, sanitizeData({ ...table, updatedAt: new Date().toISOString() }), { merge: true });
    } catch (e) {
      console.error('Error saving cafe table:', e);
      throw e;
    }
  },

  async deleteCafeTable(tableId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CAFE_TABLES, tableId);
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Error deleting cafe table:', e);
      throw e;
    }
  },

  // === AUTOMATION & INTEGRATIONS ===
  async getAutomationSettings(storeId: string): Promise<AutomationSettings> {
    try {
      if (!storeId) return INITIAL_AUTOMATION;
      const docRef = doc(db, COLLECTIONS.AUTOMATION, storeId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as AutomationSettings;
      }
      return INITIAL_AUTOMATION;
    } catch (err) {
      console.error('Error fetching automation settings from Firestore:', err);
      return INITIAL_AUTOMATION;
    }
  },

  async saveAutomationSettings(storeId: string, settings: AutomationSettings): Promise<void> {
    const docRef = doc(db, COLLECTIONS.AUTOMATION, storeId);
    await setDoc(docRef, settings, { merge: true });
  },

  async getIntegrations(storeId: string): Promise<Record<string, IntegrationCredentials>> {
    try {
      if (!storeId) return INITIAL_INTEGRATIONS;
      const docRef = doc(db, COLLECTIONS.INTEGRATIONS, storeId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as Record<string, IntegrationCredentials>;
      }
      return INITIAL_INTEGRATIONS;
    } catch (err) {
      console.error('Error fetching integrations from Firestore:', err);
      return INITIAL_INTEGRATIONS;
    }
  },

  async saveIntegrations(storeId: string, integrations: Record<string, IntegrationCredentials>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.INTEGRATIONS, storeId);
    await setDoc(docRef, integrations, { merge: true });
  },

  // === NOTIFICATIONS ===
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      if (!userId) return [];
      const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as NotificationItem[];
    } catch (err) {
      console.error('Error fetching notifications from Firestore:', err);
      return [];
    }
  },

  async saveNotification(userId: string, notification: NotificationItem): Promise<void> {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
    await setDoc(docRef, { ...notification, userId, updatedAt: new Date().toISOString() }, { merge: true });
  },

  // === DAILY DEVICE DETECTION LOGS ===
  async saveDeviceLog(log: DeviceLog): Promise<void> {
    try {
      const logId = log.id || `dev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const docRef = doc(db, COLLECTIONS.DEVICE_LOGS, logId);
      await setDoc(docRef, {
        ...log,
        id: logId,
        savedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error saving device detection log to Firestore:', err);
    }
  },

  // === P2P PAYMENT SYSTEM ===
  async getAllP2PPayments(): Promise<P2PPayment[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.P2P_PAYMENTS));
      const payments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as P2PPayment[];
      return payments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.error('Error fetching P2P payments from Firestore:', err);
      return [];
    }
  },

  async getP2PPaymentsByUser(userId: string): Promise<P2PPayment[]> {
    try {
      const q = query(collection(db, COLLECTIONS.P2P_PAYMENTS), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as P2PPayment[];
      return payments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.error('Error fetching user P2P payments:', err);
      return [];
    }
  },

  async createP2PPayment(payment: P2PPayment): Promise<void> {
    const docRef = doc(db, COLLECTIONS.P2P_PAYMENTS, payment.id);
    await setDoc(docRef, { ...payment, updatedAt: new Date().toISOString() });
  },

  async updateP2PPayment(paymentId: string, updates: Partial<P2PPayment>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.P2P_PAYMENTS, paymentId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  },

  // === PROMO CODE SYSTEM ===
  async getPromoCodes(): Promise<PromoCode[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.PROMO_CODES));
      const promos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as PromoCode[];
      return promos.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.error('Error fetching promo codes from Firestore:', err);
      return [];
    }
  },

  async savePromoCode(promo: PromoCode): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROMO_CODES, promo.id);
    await setDoc(docRef, { ...promo, updatedAt: new Date().toISOString() }, { merge: true });
  },

  async deletePromoCode(promoId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROMO_CODES, promoId);
    await deleteDoc(docRef);
  },

  async findPromoCode(code: string): Promise<PromoCode | null> {
    try {
      const cleanCode = code.toUpperCase().trim();
      const q = query(collection(db, COLLECTIONS.PROMO_CODES), where('code', '==', cleanCode));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as PromoCode;
      }
      return null;
    } catch (err) {
      console.error('Error finding promo code:', err);
      return null;
    }
  },

  async incrementPromoCodeUsage(promoId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PROMO_CODES, promoId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const currentCount = snapshot.data().usedCount || 0;
        await updateDoc(docRef, { usedCount: currentCount + 1, updatedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error('Error incrementing promo code usage:', err);
    }
  },

  // === AUDIT LOG SYSTEM ===
  async getAuditLogs(limitCount?: number): Promise<AuditLog[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
      const logs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as AuditLog[];
      const sorted = logs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      return limitCount ? sorted.slice(0, limitCount) : sorted;
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      return [];
    }
  },

  async logAdminAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const docRef = doc(db, COLLECTIONS.AUDIT_LOGS, logId);
      await setDoc(docRef, {
        ...log,
        id: logId,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      });
    } catch (err) {
      console.warn('Error recording admin audit log:', err);
    }
  },

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    return this.logAdminAction(log);
  },

  async deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
  },

  async getP2PPayments(): Promise<P2PPayment[]> {
    return this.getAllP2PPayments();
  },

  async createPromoCode(promo: PromoCode): Promise<void> {
    return this.savePromoCode(promo);
  },

  async updatePromoCode(promoId: string, updates: Partial<PromoCode>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PROMO_CODES, promoId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  },

  async saveDynamicPlan(plan: DynamicPlan): Promise<void> {
    const currentPlans = await this.getDynamicPlans();
    const existingIndex = currentPlans.findIndex((p) => p.id === plan.id);
    let updatedPlans: DynamicPlan[];
    if (existingIndex >= 0) {
      updatedPlans = currentPlans.map((p) => (p.id === plan.id ? { ...p, ...plan } : p));
    } else {
      updatedPlans = [...currentPlans, plan];
    }
    await this.saveDynamicPlans(updatedPlans);
  },

  // === DISPUTES & REFUNDS ===
  async getDisputes(): Promise<Dispute[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.DISPUTES));
      const disputes = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Dispute[];
      return disputes.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.error('Error fetching disputes:', err);
      return [];
    }
  },

  async saveDispute(dispute: Dispute): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DISPUTES, dispute.id);
    await setDoc(docRef, { ...dispute, updatedAt: new Date().toISOString() }, { merge: true });
  },

  async updateDispute(disputeId: string, updates: Partial<Dispute>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  },

  // === DYNAMIC SUBSCRIPTION PLANS ===
  async getDynamicPlans(): Promise<DynamicPlan[]> {
    try {
      const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'plans');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists() && snapshot.data().items) {
        return snapshot.data().items as DynamicPlan[];
      }
      return [];
    } catch (err) {
      console.error('Error fetching dynamic plans from Firestore:', err);
      return [];
    }
  },

  async saveDynamicPlans(plans: DynamicPlan[]): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'plans');
    await setDoc(docRef, { items: plans, updatedAt: new Date().toISOString() }, { merge: true });
  },

  // === ADMIN SETTINGS ===
  async getAdminSettings(): Promise<AdminSettings> {
    const defaultSettings: AdminSettings = {
      platformName: 'Sellnex Platform',
      supportEmail: 'support@sellnex.uz',
      supportPhone: '+998 71 200 00 00',
      defaultCurrency: 'UZS',
      trialDurationDays: 4,
      maintenanceMode: false,
      registrationEnabled: true,
      p2pCardNumber: '8600 3141 7549 7736',
      p2pCardHolder: 'Sellnex Bosh Administratsiyasi',
      p2pBankName: 'Milliy Bank / Uzcard Humo',
      p2pPhoneNumber: '+998 90 123 45 67',
      p2pInstructions: 'To‘lovni ko‘rsatilgan markaziy administratsiya karta raqamiga yuboring. To‘lov chekini skrinshot qilib yoki tranzaksiya raqamini kiritib buyurtmani tasdiqlang.',
    };

    // 1. Try local storage cache for instant response & offline resilience
    let cachedSettings: AdminSettings | null = null;
    try {
      const cached = localStorage.getItem('sellnex_admin_settings');
      if (cached) {
        cachedSettings = { ...defaultSettings, ...JSON.parse(cached) };
      }
    } catch {
      // ignore
    }

    try {
      const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'general');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const remoteSettings = { ...defaultSettings, ...snapshot.data() } as AdminSettings;
        try {
          localStorage.setItem('sellnex_admin_settings', JSON.stringify(remoteSettings));
        } catch {
          // ignore
        }
        return remoteSettings;
      }
      return cachedSettings || defaultSettings;
    } catch (err) {
      console.warn('Error fetching admin settings, using cache/fallback:', err);
      return cachedSettings || defaultSettings;
    }
  },

  async saveAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'general');
    const existing = await this.getAdminSettings();
    const updated: AdminSettings = {
      ...existing,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    // Immediately cache in localStorage and dispatch sync event
    try {
      localStorage.setItem('sellnex_admin_settings', JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-settings-changed', { detail: updated }));
      }
    } catch {
      // ignore
    }

    try {
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Failed to save admin settings to Firestore backend, saved to local cache:', err);
    }
  },

  // === ADMIN NOTIFICATIONS ===
  async getAdminNotifications(): Promise<NotificationItem[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ADMIN_NOTIFICATIONS));
      const notifs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as NotificationItem[];
      return notifs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
      return [];
    }
  },

  async createAdminNotification(notification: NotificationItem): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ADMIN_NOTIFICATIONS, notification.id);
      await setDoc(docRef, { ...notification, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Error saving admin notification:', err);
    }
  },

  async markAdminNotificationRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ADMIN_NOTIFICATIONS, notificationId);
      await updateDoc(docRef, { read: true, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('Error marking admin notification as read:', err);
    }
  },

  // === FIREBASE STORAGE FOR IMAGES & RECEIPTS ===
  async uploadImage(path: string, fileOrDataUrl: File | Blob | string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      if (typeof fileOrDataUrl === 'string') {
        if (fileOrDataUrl.startsWith('data:')) {
          const snapshot = await uploadString(storageRef, fileOrDataUrl, 'data_url');
          return await getDownloadURL(snapshot.ref);
        } else {
          // If it's already an external HTTP/HTTPS URL, return it directly
          return fileOrDataUrl;
        }
      } else {
        const snapshot = await uploadBytes(storageRef, fileOrDataUrl);
        return await getDownloadURL(snapshot.ref);
      }
    } catch (err) {
      console.warn('Firebase storage upload fallback:', err);
      if (typeof fileOrDataUrl === 'string') {
        return fileOrDataUrl;
      }
      if (typeof window !== 'undefined' && (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob)) {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(fileOrDataUrl);
        });
      }
      return '';
    }
  },

  async uploadReceipt(orderId: string, file: File): Promise<string> {
    console.log('[RECEIPT_SUBMISSION] Starting receipt optimization and upload for order:', orderId, 'file:', file.name, 'size:', file.size);

    // 1. Client-side compression to prevent browser/network bottlenecks
    let compressedDataUrl = '';
    try {
      compressedDataUrl = await compressReceiptFile(file, 1200, 0.78);
    } catch (compErr) {
      console.warn('[RECEIPT_SUBMISSION] Client compression fallback:', compErr);
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `receipt_${orderId}_${Date.now()}.${extension}`;
    const storagePath = `orders/${orderId}/receipts/${cleanFileName}`;

    // 2. Attempt Firebase Storage upload with a strict 4-second timeout
    try {
      const storageRef = ref(storage, storagePath);
      let payloadToUpload: Blob;

      if (compressedDataUrl && compressedDataUrl.startsWith('data:')) {
        const parts = compressedDataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        payloadToUpload = new Blob([u8arr], { type: mime });
      } else {
        payloadToUpload = file;
      }

      const uploadTask = uploadBytes(storageRef, payloadToUpload).then((snapshot) =>
        getDownloadURL(snapshot.ref)
      );

      const timeoutTask = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage timeout after 4s')), 4000)
      );

      const downloadUrl = await Promise.race([uploadTask, timeoutTask]);
      console.log('[RECEIPT_SUBMISSION] Firebase Storage upload succeeded:', downloadUrl);
      return downloadUrl;
    } catch (storageErr) {
      console.warn('[RECEIPT_SUBMISSION] Firebase Storage upload timed out or failed, using optimized payload fallback:', storageErr);
      if (compressedDataUrl) {
        return compressedDataUrl;
      }
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }
  },

  // === RESTAURANT & CAFÉ MODE CRUD & REALTIME (MULTI-TENANT ISOLATED) ===
  async generateUniqueCafeId(): Promise<string> {
    let attempts = 0;
    while (attempts < 5) {
      const candidate = `cafe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        const docSnap = await getDoc(doc(db, COLLECTIONS.RESTAURANTS, candidate));
        if (!docSnap.exists()) {
          return candidate;
        }
      } catch {
        return candidate;
      }
      attempts++;
    }
    return `cafe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  },

  async generateUniqueCafeSlug(baseName: string, cafeId: string): Promise<string> {
    const cleanBase = (baseName || 'cafe')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `cafe-${cafeId.slice(-6)}`;

    try {
      const q = query(collection(db, COLLECTIONS.RESTAURANTS), where('slug', '==', cleanBase));
      const snap = await getDocs(q);
      if (snap.empty) {
        return cleanBase;
      }
      // If already taken, append unique short suffix
      return `${cleanBase}-${cafeId.slice(-5)}`;
    } catch {
      return `${cleanBase}-${cafeId.slice(-5)}`;
    }
  },

  async createCafeForOwner(
    ownerId: string,
    initialData?: Partial<RestaurantProfile>
  ): Promise<RestaurantProfile> {
    const cafeId = initialData?.id || (await this.generateUniqueCafeId());
    const rawName = initialData?.name?.trim() || 'Mening Qahvaxonam';
    const uniqueSlug = await this.generateUniqueCafeSlug(initialData?.slug || rawName, cafeId);

    const profile: RestaurantProfile = {
      id: cafeId,
      ownerId: ownerId,
      name: rawName,
      slug: uniqueSlug,
      logo:
        initialData?.logo ||
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&auto=format&fit=crop&q=80',
      phone: initialData?.phone || '',
      address: initialData?.address || 'Toshkent sh.',
      workingHours: initialData?.workingHours || '09:00 - 23:00',
      deliveryFee: initialData?.deliveryFee !== undefined ? Number(initialData.deliveryFee) : 15000,
      description: initialData?.description || 'Mazali taomlar va tezkor yetkazib berish!',
      isOpen: initialData?.isOpen ?? true,
      storeType: 'cafe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...initialData,
    };

    // Save newly created isolated cafe
    await this.saveRestaurant(profile);

    // Save the relation ownerId -> cafeId in user record
    try {
      const userRef = doc(db, COLLECTIONS.USERS, ownerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(
          userRef,
          sanitizeData({
            restaurantId: cafeId,
            storeId: cafeId,
            businessType: 'restaurant',
            updatedAt: new Date().toISOString(),
          })
        );
      }
    } catch (relErr) {
      console.warn('Notice saving ownerId -> cafeId relation:', relErr);
    }

    return profile;
  },

  // Clear Cafe cache on user switch or sign out
  clearCafeCache(): void {
    cafeMemoryCache.profileByOwner.clear();
    cafeMemoryCache.profileById.clear();
    cafeMemoryCache.categories.clear();
    cafeMemoryCache.menuItems.clear();
  },

  async getRestaurantByOwner(ownerId: string, forceRefresh = false): Promise<RestaurantProfile | null> {
    if (!ownerId) return null;
    const now = Date.now();
    if (!forceRefresh) {
      const cached = cafeMemoryCache.profileByOwner.get(ownerId);
      if (cached && now - cached.timestamp < CAFE_CACHE_TTL_MS) {
        return cached.data;
      }
    }

    try {
      // 1. First check if user document directly references a restaurantId
      const userRef = doc(db, COLLECTIONS.USERS, ownerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const directCafeId =
          uData.restaurantId || (uData.businessType === 'restaurant' ? uData.storeId : null);
        if (directCafeId) {
          const directCafeDoc = await getDoc(doc(db, COLLECTIONS.RESTAURANTS, directCafeId));
          if (directCafeDoc.exists()) {
            const cafeData = { id: directCafeDoc.id, ...directCafeDoc.data() } as RestaurantProfile;
            if (cafeData.ownerId === ownerId) {
              cafeMemoryCache.profileByOwner.set(ownerId, { data: cafeData, timestamp: now });
              cafeMemoryCache.profileById.set(cafeData.id, { data: cafeData, timestamp: now });
              return cafeData;
            }
          }
        }
      }

      // 2. Query collection where ownerId == ownerId
      const q = query(collection(db, COLLECTIONS.RESTAURANTS), where('ownerId', '==', ownerId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const matching = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as RestaurantProfile))
          .filter((r) => r.ownerId === ownerId)
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime()
          );
        const result = matching[0] || null;
        if (result) {
          cafeMemoryCache.profileByOwner.set(ownerId, { data: result, timestamp: now });
          cafeMemoryCache.profileById.set(result.id, { data: result, timestamp: now });
        }
        return result;
      }
      return null;
    } catch (e) {
      console.error('Failed to get restaurant by owner', e);
      return null;
    }
  },

  async getRestaurantBySlug(slug: string): Promise<RestaurantProfile | null> {
    try {
      const cleanSlug = slug.toLowerCase().trim();
      const q = query(collection(db, COLLECTIONS.RESTAURANTS), where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as RestaurantProfile;
      }
      const docRef = doc(db, COLLECTIONS.RESTAURANTS, cleanSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as RestaurantProfile;
      }
      return null;
    } catch (e) {
      console.error('Failed to get restaurant by slug', e);
      return null;
    }
  },

  async getRestaurantById(id: string, forceRefresh = false): Promise<RestaurantProfile | null> {
    if (!id) return null;
    const now = Date.now();
    if (!forceRefresh) {
      const cached = cafeMemoryCache.profileById.get(id);
      if (cached && now - cached.timestamp < CAFE_CACHE_TTL_MS) {
        return cached.data;
      }
    }
    try {
      const docRef = doc(db, COLLECTIONS.RESTAURANTS, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const profile = { id: snap.id, ...snap.data() } as RestaurantProfile;
        cafeMemoryCache.profileById.set(id, { data: profile, timestamp: now });
        if (profile.ownerId) {
          cafeMemoryCache.profileByOwner.set(profile.ownerId, { data: profile, timestamp: now });
        }
        return profile;
      }
      return null;
    } catch (e) {
      console.error('Failed to get restaurant by ID', e);
      return null;
    }
  },

  async saveRestaurant(restaurant: RestaurantProfile): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.RESTAURANTS, restaurant.id);
      const payload = { ...restaurant, updatedAt: new Date().toISOString() };
      await setDoc(docRef, sanitizeData(payload), { merge: true });

      // Immediate cache sync
      const now = Date.now();
      cafeMemoryCache.profileById.set(restaurant.id, { data: payload, timestamp: now });
      if (restaurant.ownerId) {
        cafeMemoryCache.profileByOwner.set(restaurant.ownerId, { data: payload, timestamp: now });
      }
    } catch (e) {
      console.error('Failed to save restaurant', e);
      throw e;
    }
  },

  async getMenuItems(restaurantId: string, forceRefresh = false): Promise<MenuItem[]> {
    if (!restaurantId) return [];
    const now = Date.now();
    if (!forceRefresh) {
      const cached = cafeMemoryCache.menuItems.get(restaurantId);
      if (cached && now - cached.timestamp < CAFE_CACHE_TTL_MS) {
        return cached.data;
      }
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.MENU_ITEMS),
        where('restaurantId', '==', restaurantId)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => {
        const data = d.data();
        const img = data.imageUrl || data.image || '';
        return {
          id: d.id,
          ...data,
          image: img,
          imageUrl: img,
        } as MenuItem;
      });
      const sorted = items
        .filter((item) => item.restaurantId === restaurantId)
        .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      cafeMemoryCache.menuItems.set(restaurantId, { data: sorted, timestamp: now });
      return sorted;
    } catch (e) {
      console.error('Failed to get menu items', e);
      return [];
    }
  },

  async saveMenuItem(item: MenuItem): Promise<MenuItem> {
    try {
      const id = item.id || `dish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const docRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
      const finalImage = item.imageUrl || item.image || '';
      const payload: MenuItem = {
        ...item,
        id,
        image: finalImage,
        imageUrl: finalImage,
        storeType: 'cafe',
        updatedAt: new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeData(payload), { merge: true });

      // Immediate in-memory cache update
      if (payload.restaurantId) {
        const cached = cafeMemoryCache.menuItems.get(payload.restaurantId);
        let list = cached ? [...cached.data] : [];
        const idx = list.findIndex((x) => x.id === payload.id);
        if (idx > -1) {
          list[idx] = payload;
        } else {
          list.push(payload);
        }
        list.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        cafeMemoryCache.menuItems.set(payload.restaurantId, { data: list, timestamp: Date.now() });
      }

      return payload;
    } catch (e) {
      console.error('Failed to save menu item', e);
      throw e;
    }
  },

  async deleteMenuItem(id: string, restaurantId?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
      await deleteDoc(docRef);

      // Immediate in-memory cache update
      if (restaurantId) {
        const cached = cafeMemoryCache.menuItems.get(restaurantId);
        if (cached) {
          cafeMemoryCache.menuItems.set(restaurantId, {
            data: cached.data.filter((item) => item.id !== id),
            timestamp: Date.now(),
          });
        }
      } else {
        for (const [rId, entry] of cafeMemoryCache.menuItems.entries()) {
          cafeMemoryCache.menuItems.set(rId, {
            data: entry.data.filter((item) => item.id !== id),
            timestamp: Date.now(),
          });
        }
      }
    } catch (e) {
      console.error('Failed to delete menu item', e);
      throw e;
    }
  },

  // === CAFÉ CATEGORIES ===
  async getCafeCategories(restaurantId: string, forceRefresh = false): Promise<CafeCategory[]> {
    if (!restaurantId) return [];
    const now = Date.now();
    if (!forceRefresh) {
      const cached = cafeMemoryCache.categories.get(restaurantId);
      if (cached && now - cached.timestamp < CAFE_CACHE_TTL_MS) {
        return cached.data;
      }
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.CAFE_CATEGORIES),
        where('restaurantId', '==', restaurantId)
      );
      const snap = await getDocs(q);
      const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CafeCategory);
      const sorted = categories
        .filter((c) => c.restaurantId === restaurantId)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      cafeMemoryCache.categories.set(restaurantId, { data: sorted, timestamp: now });
      return sorted;
    } catch (e) {
      console.error('Failed to get cafe categories', e);
      return [];
    }
  },

  async saveCafeCategory(category: CafeCategory): Promise<CafeCategory> {
    try {
      const id = category.id || `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const docRef = doc(db, COLLECTIONS.CAFE_CATEGORIES, id);
      const payload: CafeCategory = {
        ...category,
        id,
        createdAt: category.createdAt || new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeData(payload), { merge: true });

      // Immediate in-memory cache update
      if (payload.restaurantId) {
        const cached = cafeMemoryCache.categories.get(payload.restaurantId);
        let list = cached ? [...cached.data] : [];
        const idx = list.findIndex((c) => c.id === payload.id);
        if (idx > -1) {
          list[idx] = payload;
        } else {
          list.push(payload);
        }
        list.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        cafeMemoryCache.categories.set(payload.restaurantId, { data: list, timestamp: Date.now() });
      }

      return payload;
    } catch (e) {
      console.error('Failed to save cafe category', e);
      throw e;
    }
  },

  async deleteCafeCategory(id: string, restaurantId?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CAFE_CATEGORIES, id);
      await deleteDoc(docRef);

      // Immediate in-memory cache update
      if (restaurantId) {
        const cached = cafeMemoryCache.categories.get(restaurantId);
        if (cached) {
          cafeMemoryCache.categories.set(restaurantId, {
            data: cached.data.filter((c) => c.id !== id),
            timestamp: Date.now(),
          });
        }
      } else {
        for (const [rId, entry] of cafeMemoryCache.categories.entries()) {
          cafeMemoryCache.categories.set(rId, {
            data: entry.data.filter((c) => c.id !== id),
            timestamp: Date.now(),
          });
        }
      }
    } catch (e) {
      console.error('Failed to delete cafe category', e);
      throw e;
    }
  },

  // === CAFÉ PRODUCT & LOGO IMAGE UPLOAD (STRICT PER-CAFÉ ISOLATION) ===
  /**
   * Uploads product image to isolated path: cafes/{cafeId}/products/{productId}/image_{timestamp}.{ext}
   * Enforces validation, client-side compression/resizing, and returns clean Firebase Storage download URL.
   */
  async uploadCafeProductImage(
    cafeId: string,
    productId: string,
    file: File | Blob,
    fileName?: string
  ): Promise<string> {
    const cleanCafeId = (cafeId || '').trim();
    const cleanProductId = (productId || '').trim();

    if (!cleanCafeId) {
      throw new Error('Café identifikatori (cafeId) ko‘rsatilmadi.');
    }
    if (!cleanProductId) {
      throw new Error('Mahsulot identifikatori (productId) ko‘rsatilmadi.');
    }

    // Validate MIME types & extensions (JPG, JPEG, PNG, WEBP)
    if (file instanceof File) {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
      const fileType = (file.type || '').toLowerCase();
      const extFromName = (fileName || file.name || '').split('.').pop()?.toLowerCase() || '';

      const isMimeValid = allowedMimes.includes(fileType);
      const isExtValid = allowedExts.includes(extFromName);
      const isImagePrefix = fileType.startsWith('image/');

      if (!isMimeValid && !isExtValid && !isImagePrefix) {
        throw new Error('Faqat JPG, JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi.');
      }
    }

    // Ensure user has auth token or anonymous token
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        console.warn('Anonymous session notice before storage upload:', authErr);
      }
    }

    // 1. Client-side compression & optimization (Requirement 9: resize large photos, retain high quality)
    let blobToUpload: Blob;
    let mimeType = 'image/jpeg';
    let dataUrlFallback = '';

    try {
      const compResult = await compressProductImageBlob(file, 1400, 0.88);
      blobToUpload = compResult.blob;
      mimeType = compResult.mimeType;
      dataUrlFallback = compResult.dataUrl;
    } catch (compErr) {
      console.warn('Image compression fallback to source file:', compErr);
      blobToUpload = file;
      mimeType = file.type || 'image/jpeg';
    }

    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const storagePath = `cafes/${cleanCafeId}/products/${cleanProductId}/image_${Date.now()}.${ext}`;

    if (!storage) {
      if (dataUrlFallback) return dataUrlFallback;
      throw new Error('Firebase Storage servisi mavjud emas.');
    }

    try {
      const imageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(imageRef, blobToUpload, {
        contentType: mimeType,
        customMetadata: {
          cafeId: cleanCafeId,
          productId: cleanProductId,
          originalName: fileName || (file instanceof File ? file.name : 'product.jpg'),
          uploadedAt: new Date().toISOString(),
        },
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (downloadUrl) {
        return downloadUrl;
      }
      throw new Error('Yuklangan rasm manzilini olib bo‘lmadi.');
    } catch (storageErr: any) {
      // Exact technical error logged for developer (Requirement 13)
      console.error('[Firebase Storage Technical Error in uploadCafeProductImage]:', storageErr);

      // If Firebase Storage encounters permissions, CORS or unprovisioned bucket, return the high-quality optimized Data URL
      if (dataUrlFallback) {
        console.warn('Firebase Storage offline or unprovisioned: Using optimized client image fallback for cafe product');
        return dataUrlFallback;
      }
      throw storageErr;
    }
  },

  /**
   * Uploads cafe logo to isolated path: cafes/{cafeId}/logo/logo_{timestamp}.{ext}
   */
  async uploadCafeLogo(cafeId: string, file: File | Blob): Promise<string> {
    const cleanCafeId = (cafeId || '').trim();
    if (!cleanCafeId) throw new Error('Café ID ko‘rsatilmadi.');

    const ext = (file instanceof File ? file.name.split('.').pop() : 'jpg') || 'jpg';
    const storagePath = `cafes/${cleanCafeId}/logo/logo_${Date.now()}.${ext}`;

    if (!storage) throw new Error('Firebase Storage mavjud emas');

    const imageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(imageRef, file);
    return getDownloadURL(snapshot.ref);
  },

  // Backwards compatibility wrapper
  async uploadCafeImage(file: File, cafeId?: string, productId?: string): Promise<string> {
    const targetCafeId = cafeId || 'default';
    const targetProductId = productId || `product_${Date.now()}`;
    return this.uploadCafeProductImage(targetCafeId, targetProductId, file, file.name);
  },

  async getRestaurantOrders(restaurantId: string): Promise<RestaurantOrder[]> {
    if (!restaurantId) return [];
    try {
      const q = query(
        collection(db, COLLECTIONS.RESTAURANT_ORDERS),
        where('restaurantId', '==', restaurantId)
      );
      const snap = await getDocs(q);
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RestaurantOrder);
      return orders
        .filter((o) => o.restaurantId === restaurantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('Failed to get restaurant orders', e);
      return [];
    }
  },

  async createRestaurantOrder(orderData: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<RestaurantOrder> {
    try {
      const id = `rorder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const orderNum = Math.floor(1000 + Math.random() * 9000).toString();
      const newOrder: RestaurantOrder = {
        ...orderData,
        id,
        orderNumber: orderNum,
        storeType: 'cafe',
        createdAt: new Date().toISOString(),
        status: orderData.status || 'new',
      };
      const docRef = doc(db, COLLECTIONS.RESTAURANT_ORDERS, id);
      await setDoc(docRef, sanitizeData(newOrder));
      return newOrder;
    } catch (e) {
      console.error('Failed to create restaurant order', e);
      throw e;
    }
  },

  async updateRestaurantOrderStatus(orderId: string, status: RestaurantOrderStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.RESTAURANT_ORDERS, orderId);
      await updateDoc(docRef, sanitizeData({ status, updatedAt: new Date().toISOString() }));
    } catch (e) {
      console.error('Failed to update restaurant order status', e);
      throw e;
    }
  },

  subscribeRestaurantOrders(restaurantId: string, callback: (orders: RestaurantOrder[]) => void): () => void {
    if (!restaurantId) return () => {};
    try {
      const q = query(
        collection(db, COLLECTIONS.RESTAURANT_ORDERS),
        where('restaurantId', '==', restaurantId)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const orders = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }) as RestaurantOrder)
            .filter((o) => o.restaurantId === restaurantId);
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(orders);
        },
        (err) => {
          console.warn('subscribeRestaurantOrders error:', err);
        }
      );
    } catch (e) {
      console.error('Failed to subscribe to restaurant orders', e);
      return () => {};
    }
  },

  async getAllRestaurants(): Promise<RestaurantProfile[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.RESTAURANTS));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as RestaurantProfile));
    } catch (e) {
      console.error('Failed to get all restaurants', e);
      return [];
    }
  },

  async getAllRestaurantOrders(): Promise<RestaurantOrder[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.RESTAURANT_ORDERS));
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as RestaurantOrder));
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('Failed to get all restaurant orders', e);
      return [];
    }
  },

  // === DROPSHIPPING SYSTEM (CATEGORIES & MASTER CATALOG) ===
  async getDropshippingCategories(activeOnly = false): Promise<DropshippingCategory[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.DROPSHIPPING_CATEGORIES));
      let categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DropshippingCategory);

      // If empty on first initial launch, populate clean default categories
      if (categories.length === 0) {
        const defaultCats: Omit<DropshippingCategory, 'id' | 'createdAt'>[] = [
          {
            name: 'Elektronika & Gadjetlar',
            description: 'Aqlli soatlar, quloqchinlar va telefon aksessuarlari',
            imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
            order: 1,
            isActive: true,
            productCount: 0,
          },
          {
            name: 'Go‘zallik & Parvarish',
            description: 'Parvarish vositalari, kosmetika va massaj uskunalari',
            imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
            order: 2,
            isActive: true,
            productCount: 0,
          },
          {
            name: 'Uy & Oshxona Buyumlari',
            description: 'Oshxona anjomlari, uy tozalash va qulaylik gadjetlari',
            imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
            order: 3,
            isActive: true,
            productCount: 0,
          },
          {
            name: 'Kiyim & Aksessuarlar',
            description: 'Sumkalar, hamyonlar, kamarlar va zamonaviy aksessuarlar',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            order: 4,
            isActive: true,
            productCount: 0,
          },
          {
            name: 'Sport & Salomatlik',
            description: 'Fitnes anjomlari, termo-idishlar va mashg‘ulot buyumlari',
            imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
            order: 5,
            isActive: true,
            productCount: 0,
          },
        ];

        const initialized: DropshippingCategory[] = [];
        for (const cat of defaultCats) {
          const catId = `dscat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const catObj: DropshippingCategory = {
            ...cat,
            id: catId,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, COLLECTIONS.DROPSHIPPING_CATEGORIES, catId), sanitizeData(catObj));
          initialized.push(catObj);
        }
        return initialized;
      }

      if (activeOnly) {
        categories = categories.filter((c) => c.isActive !== false);
      }

      return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (err) {
      console.error('Error fetching dropshipping categories:', err);
      return [];
    }
  },

  async saveDropshippingCategory(category: DropshippingCategory): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DROPSHIPPING_CATEGORIES, category.id);
    const cleaned = sanitizeData({
      ...category,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  },

  async deleteDropshippingCategory(categoryId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if products exist in this category before deleting (Section 2 Requirement)
      const q = query(
        collection(db, COLLECTIONS.DROPSHIPPING_CATALOG),
        where('categoryId', '==', categoryId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return {
          success: false,
          error: `Ushbu kategoriyada ${snap.docs.length} ta mahsulot mavjud. Kategoriyani o‘chirishdan oldin mahsulotlarni boshqa kategoriyaga o‘tkazing yoki faolsizlantiring.`,
        };
      }

      const docRef = doc(db, COLLECTIONS.DROPSHIPPING_CATEGORIES, categoryId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting dropshipping category:', err);
      return { success: false, error: err?.message || 'Kategoriyani o‘chirishda xatolik yuz berdi.' };
    }
  },

  async getDropshippingCatalog(options?: {
    activeOnly?: boolean;
    categoryId?: string;
  }): Promise<DropshippingCatalogProduct[]> {
    try {
      let qRef = collection(db, COLLECTIONS.DROPSHIPPING_CATALOG);
      const snap = await getDocs(qRef);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DropshippingCatalogProduct);

      // If empty on first run, create 6 high-quality initial dropshipping products
      if (items.length === 0) {
        const categories = await this.getDropshippingCategories();
        const defaultCat = categories[0] || { id: 'dscat_general', name: 'Umumiy' };
        const catElectronics = categories.find((c) => c.name?.includes('Elektronika')) || defaultCat;
        const catBeauty = categories.find((c) => c.name?.includes('Go‘zallik')) || defaultCat;
        const catHome = categories.find((c) => c.name?.includes('Uy')) || defaultCat;
        const catAccessories = categories.find((c) => c.name?.includes('Kiyim')) || defaultCat;

        const initialProducts: Omit<DropshippingCatalogProduct, 'id' | 'createdAt'>[] = [
          {
            title: 'Simsiz Shovqinni Bosuvchi Bluetooth Quloqchin Pro ANC',
            description: 'Yuqori sifatli faol shovqinni bosish (ANC) funksiyasi, 36 soatlik batareya muddati va quloqqa juda qulay joylashuv. Type-C tez quvvatlash.',
            images: [
              'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            ],
            categoryId: catElectronics.id,
            categoryName: catElectronics.name,
            supplierCost: 110000,
            recommendedPrice: 195000,
            minSellingPrice: 140000,
            stock: 85,
            isAvailable: true,
            deliveryInfo: 'Toshkent va viloyatlarga 1-2 kunda yetkazib beriladi',
            estimatedDeliveryDays: '1-2 kun',
            isActive: true,
            supplierName: 'Sahiy Distribyutsiya',
            supplierProductCode: 'SHY-ANC-908',
            supplierUrl: 'https://sahiy.uz',
            defaultDeliveryFee: 15000,
            commissionPercent: 5,
            sku: 'DP-ANC-908',
          },
          {
            title: 'Aqlli Fitnes Soat Smartwatch Ultra AMOLED Ekran',
            description: 'Yurak urishi, qon bosimi va uyqu sifatini o‘lchovchi aqlli soat. Suv o‘tkazmaydigan IP68 korpus, 100 dan ortiq sport rejimlari va bildirishnomalar.',
            images: [
              'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            ],
            categoryId: catElectronics.id,
            categoryName: catElectronics.name,
            supplierCost: 175000,
            recommendedPrice: 285000,
            minSellingPrice: 215000,
            stock: 60,
            isAvailable: true,
            deliveryInfo: 'Tezkor kuryer xizmati orqali to‘g‘ridan-to‘g‘ri manzilga',
            estimatedDeliveryDays: '1-3 kun',
            isActive: true,
            supplierName: 'Uzum Ombori',
            supplierProductCode: 'UZM-WATCH-012',
            supplierUrl: 'https://uzum.uz',
            defaultDeliveryFee: 15000,
            commissionPercent: 5,
            sku: 'DP-WCH-012',
          },
          {
            title: 'Portativ Mini Blender & Sharbat Siqgich USB Rechargeable',
            description: 'Har kuni yangi smuzi va meva sharbatlari tayyorlash uchun qulay simsiz mini blender. 6 tig‘li zanglamas po‘lat pichoq va kuchli batareya.',
            images: [
              'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
            ],
            categoryId: catHome.id,
            categoryName: catHome.name,
            supplierCost: 85000,
            recommendedPrice: 155000,
            minSellingPrice: 110000,
            stock: 120,
            isAvailable: true,
            deliveryInfo: 'Barcha 12 viloyat markazlariga 24 soat ichida',
            estimatedDeliveryDays: '1-2 kun',
            isActive: true,
            supplierName: 'Sahiy Distribyutsiya',
            supplierProductCode: 'SHY-BLN-441',
            supplierUrl: 'https://sahiy.uz',
            defaultDeliveryFee: 15000,
            commissionPercent: 5,
            sku: 'DP-BLN-441',
          },
          {
            title: 'Ko‘p Funksiyali Termo Qahva Choy Idishi (Harorat Indikatori Bilan)',
            description: 'Ichimlik haroratini sensorli ekranda ko‘rsatuvchi 500ml termos. 12 soat davomida issiq yoki muzdek saqlaydi. Oqmaydigan germetik qopqoq.',
            images: [
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
            ],
            categoryId: catHome.id,
            categoryName: catHome.name,
            supplierCost: 65000,
            recommendedPrice: 120000,
            minSellingPrice: 85000,
            stock: 95,
            isAvailable: true,
            deliveryInfo: 'Xavfsiz va ehtiyotkor qadoqda yetkaziladi',
            estimatedDeliveryDays: '1-3 kun',
            isActive: true,
            supplierName: 'Mahalliy Distribyutor',
            supplierProductCode: 'LCL-TRM-305',
            defaultDeliveryFee: 15000,
            commissionPercent: 5,
            sku: 'DP-TRM-305',
          },
          {
            title: 'Yuz Uchun Ultratovushli Skraber & Porlarni Tozalagich',
            description: 'Yuz terisini chuqur tozalash, qora nuqtalarni ketkazish va yoshartirish uchun salon darajasidagi uy kosmetik uskunasi.',
            images: [
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1512290900672-1f55b9e0237e?w=800&auto=format&fit=crop&q=80',
            ],
            categoryId: catBeauty.id,
            categoryName: catBeauty.name,
            supplierCost: 95000,
            recommendedPrice: 175000,
            minSellingPrice: 125000,
            stock: 75,
            isAvailable: true,
            deliveryInfo: 'Yetkazib berish butun O‘zbekiston bo‘ylab bepul',
            estimatedDeliveryDays: '1-2 kun',
            isActive: true,
            supplierName: 'Sahiy Distribyutsiya',
            supplierProductCode: 'SHY-SKN-712',
            supplierUrl: 'https://sahiy.uz',
            defaultDeliveryFee: 15000,
            commissionPercent: 5,
            sku: 'DP-SKN-712',
          },
          {
            title: 'Haqiqiy Teri Erkaklar Hamyoni (RFID Himoyasi Bilan)',
            description: '100% tabiiy charmdan tikilgan ixcham va ko‘rkam erkaklar hamyoni. Bank kartalari uchun masofaviy o‘g‘irlikdan himoyalovchi RFID blokeri mavjud.',
            images: [
              'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            ],
            categoryId: catAccessories.id,
            categoryName: catAccessories.name,
            supplierCost: 75000,
            recommendedPrice: 145000,
            minSellingPrice: 100000,
            stock: 110,
            isAvailable: true,
            deliveryInfo: 'Sovg‘abop chiroyli quti bilan yetkaziladi',
            estimatedDeliveryDays: '1-2 kun',
            isActive: true,
            supplierName: 'Charm Distribyutor',
            supplierProductCode: 'CHM-WLT-501',
            defaultDeliveryFee: 15000,
            commissionPercent: 5,
            sku: 'DP-WLT-501',
          },
        ];

        const initializedProducts: DropshippingCatalogProduct[] = [];
        for (const p of initialProducts) {
          const pId = `dscatprod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const pObj: DropshippingCatalogProduct = {
            ...p,
            id: pId,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, COLLECTIONS.DROPSHIPPING_CATALOG, pId), sanitizeData(pObj));
          initializedProducts.push(pObj);
        }
        items = initializedProducts;
      }

      if (options?.activeOnly) {
        items = items.filter((p) => p.isActive !== false && p.isAvailable !== false);
      }
      if (options?.categoryId && options.categoryId !== 'all') {
        items = items.filter((p) => p.categoryId === options.categoryId);
      }

      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('Error fetching dropshipping catalog:', err);
      return [];
    }
  },

  async getDropshippingProductById(productId: string): Promise<DropshippingCatalogProduct | null> {
    try {
      const docRef = doc(db, COLLECTIONS.DROPSHIPPING_CATALOG, productId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DropshippingCatalogProduct;
      }
      return null;
    } catch (err) {
      console.error('Error getting dropshipping product by ID:', err);
      return null;
    }
  },

  async saveDropshippingProduct(product: DropshippingCatalogProduct): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DROPSHIPPING_CATALOG, product.id);
    const cleaned = sanitizeData({
      ...product,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  },

  async deleteDropshippingProduct(productId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DROPSHIPPING_CATALOG, productId);
    await deleteDoc(docRef);
  },

  async addDropshippingProductToStore(
    catalogProduct: DropshippingCatalogProduct,
    store: Store,
    user: User,
    customSellingPrice: number
  ): Promise<Product> {
    // Enforce business rule: Price cannot be lower than minimum allowed selling price
    if (customSellingPrice < catalogProduct.minSellingPrice) {
      throw new Error(
        `Sotish narxi admin tomonidan belgilangan eng kam narxdan (${catalogProduct.minSellingPrice.toLocaleString()} so‘m) past bo‘lishi mumkin emas.`
      );
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const platformFee = Math.round(customSellingPrice * ((catalogProduct.commissionPercent || 5) / 100));
    const calculatedProfit = Math.max(
      0,
      customSellingPrice - catalogProduct.supplierCost - catalogProduct.defaultDeliveryFee - platformFee
    );

    const newProduct: Product = {
      id: newId,
      storeId: store.id,
      ownerId: user.id || store.ownerId,
      title: catalogProduct.title,
      description: catalogProduct.description,
      category: catalogProduct.categoryName,
      images: catalogProduct.images && catalogProduct.images.length > 0 ? catalogProduct.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      businessMode: 'dropshipping',
      dropshippingCatalogId: catalogProduct.id,
      supplier: (catalogProduct.supplierName as any) || 'Custom Supplier',
      supplierProductCode: catalogProduct.supplierProductCode,
      supplierUrl: catalogProduct.supplierUrl,
      supplierCost: catalogProduct.supplierCost,
      shippingCost: catalogProduct.defaultDeliveryFee,
      minSellingPrice: catalogProduct.minSellingPrice,
      paymentFeePercent: 1.5,
      platformFeePercent: catalogProduct.commissionPercent || 5,
      profitType: 'fixed',
      profitValue: calculatedProfit,
      calculatedProfit: calculatedProfit,
      sellingPrice: customSellingPrice,
      stock: catalogProduct.stock || 50,
      status: 'Published',
      sku: `${catalogProduct.sku || 'DP'}-${Math.floor(100 + Math.random() * 900)}`,
      variants: [{ id: 'v1', name: 'Standart', options: ['Standart'] }],
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      featured: false,
      deliveryInfo: catalogProduct.deliveryInfo,
      estimatedDeliveryDays: catalogProduct.estimatedDeliveryDays,
      createdAt: new Date().toISOString(),
    };

    await this.saveProduct(newProduct);
    return newProduct;
  },

  async updateSupplierOrder(
    orderId: string,
    supplierOrderData: NonNullable<Order['supplierOrder']>,
    newOrderStatus?: OrderStatus
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const existing = await this.getOrderById(orderId);
    let timeline = existing?.timeline ? [...existing.timeline] : [];

    const nowIso = new Date().toISOString();
    let statusDesc = `Yetkazib beruvchi (${supplierOrderData.supplierName}) buyurtmasi yangilandi.`;
    if (supplierOrderData.status === 'ordered') {
      statusDesc = `Yetkazib beruvchiga buyurtma berildi (Tashqi ID: ${supplierOrderData.externalOrderId || 'Mavjud emas'}).`;
    } else if (supplierOrderData.status === 'in_transit') {
      statusDesc = `Yetkazib beruvchi mahsulotni yo‘lga chiqardi.`;
    } else if (supplierOrderData.status === 'delivered_to_hub') {
      statusDesc = `Mahsulot yetkazib berish omboriga yetib keldi.`;
    }

    timeline.push({
      status: (newOrderStatus || existing?.orderStatus || 'Processing') as OrderStatus,
      timestamp: nowIso,
      title: 'Tashqi yetkazib beruvchi (Sahiy / Supplier) holati',
      description: statusDesc,
    });

    const payload: Partial<Order> = {
      supplierOrder: supplierOrderData,
      timeline,
      updatedAt: nowIso,
    };
    if (newOrderStatus) {
      payload.orderStatus = newOrderStatus;
    }

    await setDoc(docRef, sanitizeData(payload), { merge: true });
  },
};

/**
 * Client-side receipt compression helper.
 * Reduces 3-10MB mobile phone photos to ~70-130KB while keeping text legible.
 */
export async function compressReceiptFile(file: File, maxDimension = 1200, quality = 0.78): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  // If not an image (e.g. PDF), read as data URL directly
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve((e.target?.result as string) || '');
          return;
        }

        // Fill white background for transparent images
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side product image compression helper.
 * Supports JPG, JPEG, PNG, WebP.
 * Resizes down to maxDimension (e.g. 1200px) and outputs an optimized Blob.
 */
export async function compressProductImageBlob(
  file: File | Blob,
  maxDimension = 1200,
  quality = 0.85
): Promise<{ blob: Blob; mimeType: string; dataUrl: string }> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { blob: file, mimeType: file.type || 'image/jpeg', dataUrl: '' };
  }

  // Determine target output mime type
  const originalType = file.type?.toLowerCase() || '';
  const isPng = originalType.includes('png');
  const isWebp = originalType.includes('webp');
  const outputMime = isWebp ? 'image/webp' : isPng ? 'image/png' : 'image/jpeg';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(new Error('Faylni o‘qib bo‘lmadi'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Rasm ma‘lumotlarini ochib bo‘lmadi'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Rasm canvasini yaratib bo‘lmadi'));
          return;
        }

        // For non-PNG/non-WebP, fill white background
        if (!isPng && !isWebp) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, mimeType: outputMime, dataUrl });
            } else {
              // Fallback to dataUrl conversion
              const parts = dataUrl.split(',');
              const bstr = atob(parts[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const fallbackBlob = new Blob([u8arr], { type: outputMime });
              resolve({ blob: fallbackBlob, mimeType: outputMime, dataUrl });
            }
          },
          outputMime,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

