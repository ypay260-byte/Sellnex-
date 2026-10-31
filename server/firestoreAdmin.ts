import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let adminDb: Firestore;

export function getAdminFirestore(): Firestore {
  if (!adminDb) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      adminDb = initializeFirestore(
        app,
        {
          experimentalForceLongPolling: true,
          ignoreUndefinedProperties: true,
        },
        firebaseConfig.firestoreDatabaseId
      );
    } catch {
      adminDb = firebaseConfig.firestoreDatabaseId
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    }
  }
  return adminDb;
}

export async function fetchAllPlatformData() {
  const db = getAdminFirestore();

  const [
    usersSnap,
    storesSnap,
    productsSnap,
    ordersSnap,
    paymentsSnap,
    promoCodesSnap,
    bloggersSnap,
    auditLogsSnap,
  ] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'stores')),
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'p2p_payments')),
    getDocs(collection(db, 'promo_codes')),
    getDocs(collection(db, 'bloggers')),
    getDocs(collection(db, 'audit_logs')),
  ]);

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const stores = storesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const p2pPayments = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const promoCodes = promoCodesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const bloggers = bloggersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const auditLogs = auditLogsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sort audit logs by timestamp desc
  auditLogs.sort((a: any, b: any) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  return {
    success: true,
    counts: {
      users: users.length,
      stores: stores.length,
      products: products.length,
      orders: orders.length,
      p2pPayments: p2pPayments.length,
      promoCodes: promoCodes.length,
      bloggers: bloggers.length,
      auditLogs: auditLogs.length,
    },
    users,
    stores,
    products,
    orders,
    p2pPayments,
    promoCodes,
    bloggers,
    auditLogs: auditLogs.slice(0, 100),
    timestamp: new Date().toISOString(),
  };
}
