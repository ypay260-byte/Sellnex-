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
  Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage, auth } from './firebase';
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
  OnboardingData,
  DeviceLog,
  P2PPayment,
  PromoCode,
  AuditLog,
  Dispute,
  DynamicPlan,
  AdminSettings,
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_SUPPLIERS,
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
} as const;

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
    try {
      const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'general');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as AdminSettings;
      }
      return {
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
    } catch (err) {
      console.error('Error fetching admin settings:', err);
      return {
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
    }
  },

  async saveAdminSettings(settings: AdminSettings): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'general');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
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

