import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

export async function adminApproveOrder(orderId: string, adminUid = 'admin_kamoliddin_5021', adminEmail = 'ypay260@gmail.com') {
  if (!orderId) throw new Error('Order ID is required');
  const db = getAdminFirestore();
  const docRef = doc(db, 'orders', orderId);
  const snap = await getDoc(docRef);

  let existingTimeline: any[] = [];
  let existingData: any = {};
  if (snap.exists()) {
    existingData = snap.data();
    if (Array.isArray(existingData.timeline)) {
      existingTimeline = existingData.timeline;
    }
  }

  const nowIso = new Date().toISOString();
  const newTimeline = [
    ...existingTimeline,
    {
      status: 'confirmed',
      timestamp: nowIso,
      title: "To'lov tasdiqlandi (Admin)",
      description: `Sellnex platforma administratori (${adminEmail}) to'lovni tasdiqladi.`,
    },
  ];

  const updateData = {
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    verifiedBy: adminUid,
    adminEmail: adminEmail,
    verifiedAt: nowIso,
    verifiedAtIso: nowIso,
    timeline: newTimeline,
    updatedAt: nowIso,
  };

  try {
    await updateDoc(docRef, updateData);
  } catch {
    await setDoc(docRef, { ...existingData, ...updateData }, { merge: true });
  }

  // Record audit log
  try {
    const auditRef = doc(collection(db, 'audit_logs'));
    await setDoc(auditRef, {
      adminEmail,
      action: 'confirm_order_payment',
      targetType: 'order',
      targetId: orderId,
      oldValue: { paymentStatus: existingData.paymentStatus || 'pending' },
      newValue: { paymentStatus: 'paid', orderStatus: 'confirmed' },
      details: `Order payment confirmed via Admin Server API by ${adminEmail}`,
      timestamp: nowIso,
    });
  } catch (auditErr) {
    console.warn('Audit log write error:', auditErr);
  }

  return { id: orderId, ...existingData, ...updateData };
}

export async function adminRejectOrder(orderId: string, reason = 'To‘lov cheki tasdiqlanmadi', adminUid = 'admin_kamoliddin_5021', adminEmail = 'ypay260@gmail.com') {
  if (!orderId) throw new Error('Order ID is required');
  const db = getAdminFirestore();
  const docRef = doc(db, 'orders', orderId);
  const snap = await getDoc(docRef);

  let existingTimeline: any[] = [];
  let existingData: any = {};
  if (snap.exists()) {
    existingData = snap.data();
    if (Array.isArray(existingData.timeline)) {
      existingTimeline = existingData.timeline;
    }
  }

  const nowIso = new Date().toISOString();
  const newTimeline = [
    ...existingTimeline,
    {
      status: 'rejected',
      timestamp: nowIso,
      title: "To'lov cheki rad etildi (Admin)",
      description: reason,
    },
  ];

  const updateData = {
    paymentStatus: 'rejected',
    orderStatus: 'rejected',
    receiptRejectedReason: reason,
    verifiedBy: adminUid,
    adminEmail: adminEmail,
    verifiedAt: nowIso,
    verifiedAtIso: nowIso,
    timeline: newTimeline,
    updatedAt: nowIso,
  };

  try {
    await updateDoc(docRef, updateData);
  } catch {
    await setDoc(docRef, { ...existingData, ...updateData }, { merge: true });
  }

  // Record audit log
  try {
    const auditRef = doc(collection(db, 'audit_logs'));
    await setDoc(auditRef, {
      adminEmail,
      action: 'reject_order_payment',
      targetType: 'order',
      targetId: orderId,
      oldValue: { paymentStatus: existingData.paymentStatus || 'pending' },
      newValue: { paymentStatus: 'rejected', reason },
      details: `Order payment rejected via Admin Server API by ${adminEmail}. Reason: ${reason}`,
      timestamp: nowIso,
    });
  } catch (auditErr) {
    console.warn('Audit log write error:', auditErr);
  }

  return { id: orderId, ...existingData, ...updateData };
}

export async function adminApproveP2PPayment(paymentId: string, adminEmail = 'ypay260@gmail.com') {
  if (!paymentId) throw new Error('Payment ID is required');
  const db = getAdminFirestore();
  const payRef = doc(db, 'p2p_payments', paymentId);
  const paySnap = await getDoc(payRef);
  if (!paySnap.exists()) {
    throw new Error(`P2P Payment with ID ${paymentId} not found.`);
  }

  const paymentData: any = paySnap.data();
  const nowIso = new Date().toISOString();

  await setDoc(
    payRef,
    {
      status: 'approved',
      approvedBy: adminEmail,
      approvedAt: nowIso,
      updatedAt: nowIso,
    },
    { merge: true }
  );

  // Activate User Subscription
  const targetUserId = paymentData.userId;
  if (targetUserId) {
    const userRef = doc(db, 'users', targetUserId);
    const planRequested = paymentData.planRequested || 'pro';
    const durationDays = planRequested === 'starter' ? 90 : (paymentData.durationMonths ? paymentData.durationMonths * 30 : 30);
    const newExpiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const productLimit =
      planRequested === 'starter' ? 5 : planRequested === 'pro' ? 20 : planRequested === 'business' ? 50 : 110;

    await setDoc(
      userRef,
      {
        plan: planRequested,
        status: 'active',
        subscriptionStatus: 'active',
        startDate: nowIso,
        endDate: newExpiry,
        subscriptionExpiresAt: newExpiry,
        productLimit,
        updatedAt: nowIso,
      },
      { merge: true }
    );
  }

  // Record audit log
  try {
    const auditRef = doc(collection(db, 'audit_logs'));
    await setDoc(auditRef, {
      adminEmail,
      action: 'approve_p2p_payment',
      targetType: 'p2p_payment',
      targetId: paymentId,
      oldValue: { status: paymentData.status || 'pending' },
      newValue: { status: 'approved', plan: paymentData.planRequested },
      details: `Subscription P2P payment approved by ${adminEmail}`,
      timestamp: nowIso,
    });
  } catch (err) {
    console.warn('Audit error in approve payment:', err);
  }

  return { success: true };
}

export async function adminRejectP2PPayment(paymentId: string, reason = 'Check verification failed', adminEmail = 'ypay260@gmail.com') {
  if (!paymentId) throw new Error('Payment ID is required');
  const db = getAdminFirestore();
  const payRef = doc(db, 'p2p_payments', paymentId);
  const paySnap = await getDoc(payRef);
  if (!paySnap.exists()) {
    throw new Error(`P2P Payment with ID ${paymentId} not found.`);
  }

  const paymentData: any = paySnap.data();
  const nowIso = new Date().toISOString();

  await setDoc(
    payRef,
    {
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: adminEmail,
      approvedAt: nowIso,
      updatedAt: nowIso,
    },
    { merge: true }
  );

  // Record audit log
  try {
    const auditRef = doc(collection(db, 'audit_logs'));
    await setDoc(auditRef, {
      adminEmail,
      action: 'reject_p2p_payment',
      targetType: 'p2p_payment',
      targetId: paymentId,
      oldValue: { status: paymentData.status || 'pending' },
      newValue: { status: 'rejected', reason },
      details: `Subscription P2P payment rejected by ${adminEmail}`,
      timestamp: nowIso,
    });
  } catch (err) {
    console.warn('Audit error in reject payment:', err);
  }

  return { success: true };
}
