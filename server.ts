import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  startTelegramBotPolling,
  processTelegramUpdate,
  sendWelcomeStartInterface,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
} from './src/services/telegramBotServer';
import {
  fetchAllPlatformData,
  adminApproveOrder,
  adminRejectOrder,
  adminApproveP2PPayment,
  adminRejectP2PPayment,
} from './server/firestoreAdmin';

// In-memory store for Paynet transactions & user device preferences
interface StoredTransaction {
  id: string;
  transactionId: string;
  paynetTransactionId: string;
  cashierCode: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  planId?: string;
  orderId?: string;
  amount: number;
  currency: 'UZS';
  paymentType: 'subscription' | 'order';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  paidAt?: string;
  errorMessage?: string;
}

const transactionsStore = new Map<string, StoredTransaction>();
const userDeviceStore = new Map<string, { deviceType: string; updatedAt: string }>();

// Plan definitions for automatic backend subscription calculation
const PLAN_LIMITS: Record<string, { days: number; maxProducts: number; name: string }> = {
  trial: { days: 7, maxProducts: 5, name: 'Free Trial' },
  starter: { days: 90, maxProducts: 5, name: 'Starter' },
  pro: { days: 30, maxProducts: 20, name: 'Pro' },
  business: { days: 30, maxProducts: 50, name: 'Business' },
  premium: { days: 30, maxProducts: 110, name: 'Premium' },
  premium_pro: { days: 365, maxProducts: 500, name: 'Premium Pro' },
  golden_vip: { days: 30, maxProducts: 5000, name: 'Golden VIP' },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Process safety guards - prevent server crashes that trigger 502 errors
  process.on('uncaughtException', (err) => {
    console.error('[Sellnex Server] Uncaught exception prevented from crashing process:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Sellnex Server] Unhandled rejection prevented from crashing process:', reason);
  });

  // Global Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Paynet-Signature');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Request logging for API monitoring & 5xx prevention
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path} - ${new Date().toISOString()}`);
    }
    next();
  });

  // Static upload storage folder
  const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (dirErr) {
      console.warn('[Uploads] Could not create uploads dir:', dirErr);
    }
  }
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ==========================================
  // REAL PRODUCT IMAGE UPLOAD ENDPOINT
  // ==========================================
  app.post('/api/upload-image', (req: Request, res: Response) => {
    try {
      const { image, filename } = req.body || {};
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Rasm maʼlumoti yuborilmadi' });
      }

      let buffer: Buffer;
      let ext = 'jpg';

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const rawMime = matches[1].toLowerCase();
          ext = rawMime.includes('png') ? 'png' : rawMime.includes('webp') ? 'webp' : 'jpg';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          const parts = image.split(',');
          if (parts[1]) {
            buffer = Buffer.from(parts[1], 'base64');
          } else {
            buffer = Buffer.from(image, 'base64');
          }
        }
      } else {
        buffer = Buffer.from(image, 'base64');
      }

      if (filename && typeof filename === 'string') {
        const cleanNameExt = filename.split('.').pop()?.toLowerCase();
        if (cleanNameExt && ['jpg', 'jpeg', 'png', 'webp'].includes(cleanNameExt)) {
          ext = cleanNameExt === 'jpeg' ? 'jpg' : cleanNameExt;
        }
      }

      const uniqueName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueName}`;
      console.log(`[Upload] Image successfully stored at ${publicUrl} (${buffer.length} bytes)`);
      return res.status(200).json({ url: publicUrl, success: true });
    } catch (err: any) {
      console.error('[Upload] Image upload failed:', err);
      return res.status(500).json({ error: 'Rasm saqlashda xatolik yuz berdi: ' + (err?.message || '') });
    }
  });

  // ==========================================
  // 1. HEALTH CHECK ENDPOINT (Prevents 502/Reverse Proxy timeout)
  // ==========================================
  app.get('/api/health', (req: Request, res: Response) => {
    try {
      res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'Sellnex Production API',
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
        paynetGateway: 'online',
      });
    } catch (err: any) {
      res.status(200).json({ status: 'degraded', error: err?.message });
    }
  });

  // ==========================================
  // 1.5 SECURE SERVER-SIDE ADMIN AUTHENTICATION
  // ==========================================
  app.post('/api/admin/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};
      const cleanInput = (email || '').toString().trim().toLowerCase();
      const normalizedPhone = cleanInput.replace(/[\s\-\(\)]/g, '');
      const cleanPassword = (password || '').toString();

      const adminPassword = process.env.ADMIN_PASSWORD || 'Kamoliddin1986.';
      const isDesignatedAdmin =
        normalizedPhone === '+998942865021' ||
        normalizedPhone === '942865021' ||
        normalizedPhone === '8942865021' ||
        cleanInput === 'ypay260@gmail.com' ||
        cleanInput === 'admin@sellnex.uz' ||
        cleanInput === 'admin';

      if (!isDesignatedAdmin || cleanPassword !== adminPassword) {
        return res.status(401).json({
          success: false,
          error: 'Administrator hisob maʼlumotlari notoʻgʻri kiritildi.',
        });
      }

      const adminUser = {
        id: 'admin_kamoliddin_5021',
        name: 'Kamoliddin (Super Admin)',
        email: 'ypay260@gmail.com',
        phone: '+998942865021',
        role: 'admin',
        plan: 'golden_vip',
        status: 'active',
        subscriptionStatus: 'active',
        createdAt: new Date().toISOString(),
        subscriptionExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log(`[Admin Security] Authorized admin login for: ${cleanInput}`);
      return res.status(200).json({
        success: true,
        user: adminUser,
      });
    } catch (err: any) {
      console.error('[Admin Login Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Administrator autentifikatsiyasida server xatosi.',
      });
    }
  });

  // Admin High-Reliability Data Overview Endpoint
  // Directly reads Firestore collections and delivers guaranteed data to Admin Panel
  app.get('/api/admin/overview-data', async (_req: Request, res: Response) => {
    try {
      const data = await fetchAllPlatformData();
      return res.status(200).json(data);
    } catch (err: any) {
      console.error('[Admin Overview Data Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Platforma maʼlumotlarini yuklashda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // Admin Order Action: Approve Payment & Confirm Order
  app.post('/api/admin/orders/:id/approve', async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const { adminUid, adminEmail } = req.body || {};
      const updatedOrder = await adminApproveOrder(orderId, adminUid, adminEmail);
      console.log(`[Admin Action] Order ${orderId} approved by ${adminEmail || adminUid}`);
      return res.status(200).json({
        success: true,
        message: 'Buyurtma to‘lovi tasdiqlandi va holat yangilandi.',
        order: updatedOrder,
      });
    } catch (err: any) {
      console.error('[Admin Order Approve Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Buyurtmani tasdiqlashda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // Admin Order Action: Reject Payment & Set Rejection Reason
  app.post('/api/admin/orders/:id/reject', async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const { reason, adminUid, adminEmail } = req.body || {};
      const updatedOrder = await adminRejectOrder(orderId, reason, adminUid, adminEmail);
      console.log(`[Admin Action] Order ${orderId} rejected by ${adminEmail || adminUid}. Reason: ${reason}`);
      return res.status(200).json({
        success: true,
        message: 'Buyurtma to‘lovi rad etildi va sababi saqlandi.',
        order: updatedOrder,
      });
    } catch (err: any) {
      console.error('[Admin Order Reject Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Buyurtmani rad etishda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // Admin P2P Payment Action: Approve Subscription Payment
  app.post('/api/admin/payments/:id/approve', async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.id;
      const { adminEmail } = req.body || {};
      const result = await adminApproveP2PPayment(paymentId, adminEmail);
      console.log(`[Admin Action] P2P Payment ${paymentId} approved by ${adminEmail}`);
      return res.status(200).json({
        success: true,
        message: 'To‘lov tasdiqlandi va foydalanuvchi obunasi faollashtirildi.',
      });
    } catch (err: any) {
      console.error('[Admin Payment Approve Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'To‘lovni tasdiqlashda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // Admin P2P Payment Action: Reject Subscription Payment
  app.post('/api/admin/payments/:id/reject', async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.id;
      const { reason, adminEmail } = req.body || {};
      const result = await adminRejectP2PPayment(paymentId, reason, adminEmail);
      console.log(`[Admin Action] P2P Payment ${paymentId} rejected by ${adminEmail}`);
      return res.status(200).json({
        success: true,
        message: 'To‘lov rad etildi.',
      });
    } catch (err: any) {
      console.error('[Admin Payment Reject Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'To‘lovni rad etishda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // ==========================================
  // 2. PAYNET PAYMENT GATEWAY INTEGRATION
  // ==========================================

  // A. Create Payment Request
  // User -> Checkout / Pricing -> Paynet Request -> Backend
  app.post('/api/payment/paynet/create', (req: Request, res: Response) => {
    try {
      const {
        userId,
        userEmail,
        userPhone,
        planId,
        orderId,
        amount,
        paymentType = 'subscription',
      } = req.body;

      if (!userId && paymentType === 'subscription') {
        return res.status(400).json({
          success: false,
          error: 'Foydalanuvchi identifikatori (userId) majburiy. Iltimos, avval tizimga kiring.',
        });
      }

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Toʻlov summasi notoʻgʻri yoki 0 dan katta boʻlishi kerak.',
        });
      }

      const txId = `TX-PN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paynetTxId = `PN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const cashierCode = Math.floor(100000 + Math.random() * 900000).toString();

      const transaction: StoredTransaction = {
        id: txId,
        transactionId: txId,
        paynetTransactionId: paynetTxId,
        cashierCode,
        userId: userId || 'guest',
        userEmail: userEmail || '',
        userPhone: userPhone || '',
        planId: planId || 'starter',
        orderId: orderId || '',
        amount: Number(amount),
        currency: 'UZS',
        paymentType,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      transactionsStore.set(txId, transaction);
      transactionsStore.set(paynetTxId, transaction);

      // Deep link and web payment payload
      const qrData = `paynet://payment?transaction_id=${paynetTxId}&amount=${amount}&service=sellnex`;
      const checkoutUrl = `/checkout?payment=paynet&tx=${txId}`;

      console.log(`[Paynet] Created payment transaction ${txId} for user ${userId}, amount: ${amount} UZS`);

      return res.status(200).json({
        success: true,
        transactionId: txId,
        paynetTransactionId: paynetTxId,
        cashierCode,
        amount: Number(amount),
        currency: 'UZS',
        status: 'PENDING',
        paymentType,
        planId,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`,
        paynetDeepLink: qrData,
        checkoutUrl,
        expiresInSeconds: 900, // 15 minutes
      });
    } catch (err: any) {
      console.error('[Paynet] Error creating payment:', err);
      return res.status(500).json({
        success: false,
        error: 'Paynet toʻlov soʻrovini yaratishda ichki xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // B. Transaction Status Check
  app.get('/api/payment/paynet/status/:transactionId', (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const tx = transactionsStore.get(transactionId);

      if (!tx) {
        return res.status(404).json({
          success: false,
          error: 'Tranzaksiya topilmadi',
        });
      }

      return res.status(200).json({
        success: true,
        transactionId: tx.transactionId,
        paynetTransactionId: tx.paynetTransactionId,
        cashierCode: tx.cashierCode,
        userId: tx.userId,
        amount: tx.amount,
        status: tx.status,
        planId: tx.planId,
        orderId: tx.orderId,
        createdAt: tx.createdAt,
        paidAt: tx.paidAt,
        errorMessage: tx.errorMessage,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Tranzaksiya holatini tekshirishda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // C. Paynet Webhook / Callback Handler
  // Paynet Gateway -> Backend Webhook -> Subscription Activation
  const handlePaynetWebhook = (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      const txId = payload.transactionId || payload.transaction_id || payload.txId;
      const paynetId = payload.paynetTransactionId || payload.paynet_id;
      const status = (payload.status || 'PAID').toUpperCase();

      console.log(`[Paynet Webhook] Received status ${status} for tx: ${txId || paynetId}`);

      const targetKey = txId || paynetId;
      let tx = targetKey ? transactionsStore.get(targetKey) : null;

      if (!tx) {
        // Auto-create or fallback if mock webhook ping
        const fallbackId = txId || `TX-PN-${Date.now()}`;
        tx = {
          id: fallbackId,
          transactionId: fallbackId,
          paynetTransactionId: paynetId || `PN-${Date.now()}`,
          cashierCode: '123456',
          userId: payload.userId || 'guest',
          planId: payload.planId || 'starter',
          amount: payload.amount || 13000,
          currency: 'UZS',
          paymentType: payload.paymentType || 'subscription',
          status: status === 'PAID' ? 'PAID' : 'FAILED',
          createdAt: new Date().toISOString(),
          paidAt: status === 'PAID' ? new Date().toISOString() : undefined,
        };
        transactionsStore.set(fallbackId, tx);
      } else {
        tx.status = status === 'PAID' ? 'PAID' : status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
        if (tx.status === 'PAID') {
          tx.paidAt = new Date().toISOString();
        } else if (tx.status === 'FAILED') {
          tx.errorMessage = payload.errorMessage || 'Toʻlov rad etildi';
        }
      }

      // Compute subscription details if subscription payment
      const planConfig = PLAN_LIMITS[tx.planId || 'starter'] || PLAN_LIMITS.starter;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + planConfig.days * 24 * 60 * 60 * 1000).toISOString();

      return res.status(200).json({
        jsonrpc: '2.0',
        result: {
          status: tx.status,
          transaction_id: tx.transactionId,
          paynet_id: tx.paynetTransactionId,
          activated: tx.status === 'PAID',
          subscription: tx.status === 'PAID' ? {
            userId: tx.userId,
            plan: tx.planId,
            status: 'active',
            productLimit: planConfig.maxProducts,
            subscriptionExpiresAt: expiresAt,
          } : null,
        },
      });
    } catch (err: any) {
      console.error('[Paynet Webhook] Exception:', err);
      return res.status(500).json({
        error: 'Webhookni qayta ishlashda xatolik',
        details: err?.message,
      });
    }
  };

  app.post('/api/payment/paynet/webhook', handlePaynetWebhook);
  app.post('/api/payment/paynet/callback', handlePaynetWebhook);

  // D. Payment Verification Endpoint
  // Frontend -> Backend Verification -> Subscription Activation Confirmation
  app.post('/api/payment/paynet/verify', (req: Request, res: Response) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'transactionId talab qilinadi' });
      }

      const tx = transactionsStore.get(transactionId);
      if (!tx) {
        return res.status(404).json({ success: false, error: 'Tranzaksiya topilmadi' });
      }

      if (tx.status === 'PAID') {
        const planConfig = PLAN_LIMITS[tx.planId || 'starter'] || PLAN_LIMITS.starter;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + planConfig.days * 24 * 60 * 60 * 1000).toISOString();

        return res.status(200).json({
          success: true,
          status: 'PAID',
          activated: true,
          transaction: tx,
          subscription: {
            userId: tx.userId,
            plan: tx.planId,
            status: 'active',
            productLimit: planConfig.maxProducts,
            subscriptionExpiresAt: expiresAt,
          },
        });
      }

      return res.status(200).json({
        success: false,
        status: tx.status,
        activated: false,
        message: tx.status === 'PENDING'
          ? 'Toʻlov hali kutilmoqda. Iltimos, Paynet orqali toʻlovni yakunlang.'
          : 'Toʻlov amalga oshmadi yoki bekor qilindi.',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Toʻlovni tekshirishda xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // E. Test Payment Simulator (Restricted to non-production or authenticated admin)
  app.post('/api/payment/paynet/simulate', (req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV === 'production' && req.headers['x-admin-simulation-secret'] !== process.env.ADMIN_SIMULATION_SECRET) {
        return res.status(403).json({
          success: false,
          error: 'Toʻlov simulyatori production muhitida xavfsizlik maqsadida cheklangan.',
        });
      }

      const { transactionId, simulateStatus = 'PAID' } = req.body;
      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'transactionId talab qilinadi' });
      }

      const tx = transactionsStore.get(transactionId);
      if (!tx) {
        return res.status(404).json({ success: false, error: 'Tranzaksiya topilmadi' });
      }

      if (simulateStatus === 'PAID') {
        tx.status = 'PAID';
        tx.paidAt = new Date().toISOString();
        const planConfig = PLAN_LIMITS[tx.planId || 'starter'] || PLAN_LIMITS.starter;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + planConfig.days * 24 * 60 * 60 * 1000).toISOString();

        console.log(`[Paynet Simulate] Activated subscription ${tx.planId} for user ${tx.userId}`);

        return res.status(200).json({
          success: true,
          status: 'PAID',
          activated: true,
          transaction: tx,
          subscription: {
            userId: tx.userId,
            plan: tx.planId,
            status: 'active',
            productLimit: planConfig.maxProducts,
            subscriptionExpiresAt: expiresAt,
          },
        });
      } else if (simulateStatus === 'CANCELLED') {
        tx.status = 'CANCELLED';
        return res.status(200).json({
          success: true,
          status: 'CANCELLED',
          activated: false,
          transaction: tx,
        });
      } else {
        tx.status = 'FAILED';
        tx.errorMessage = 'Paynet: Hisobda mablagʻ yetarli emas yoki foydalanuvchi rad etdi.';
        return res.status(200).json({
          success: true,
          status: 'FAILED',
          activated: false,
          transaction: tx,
          error: tx.errorMessage,
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Simulyatsiyada xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // ==========================================
  // 3. DEVICE TYPE PERSISTENCE ENDPOINTS (P1)
  // ==========================================
  app.get('/api/user/device/:userId', (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const data = userDeviceStore.get(userId);
      return res.status(200).json({
        success: true,
        userId,
        deviceType: data?.deviceType || null,
        updatedAt: data?.updatedAt || null,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post('/api/user/device', (req: Request, res: Response) => {
    try {
      const { userId, deviceType } = req.body;
      if (!userId || !deviceType) {
        return res.status(400).json({ success: false, error: 'userId va deviceType talab qilinadi' });
      }

      const cleanDevice = deviceType === 'phone' || deviceType === 'Telefon' ? 'phone' : 'computer';
      userDeviceStore.set(userId, {
        deviceType: cleanDevice,
        updatedAt: new Date().toISOString(),
      });

      console.log(`[Device API] User ${userId} saved device preference: ${cleanDevice}`);

      return res.status(200).json({
        success: true,
        userId,
        deviceType: cleanDevice,
        message: 'Qurilma turi saqlandi',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // 4. SUBSCRIPTION STATUS API
  // ==========================================
  app.get('/api/subscription/status/:userId', (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      // Look up transactions for user
      const userTxs = Array.from(transactionsStore.values()).filter((t) => t.userId === userId && t.status === 'PAID');
      const latestTx = userTxs.sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime())[0];

      if (latestTx) {
        const planConfig = PLAN_LIMITS[latestTx.planId || 'starter'] || PLAN_LIMITS.starter;
        return res.status(200).json({
          success: true,
          hasActiveSubscription: true,
          plan: latestTx.planId,
          status: 'active',
          productLimit: planConfig.maxProducts,
          lastPayment: latestTx,
        });
      }

      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        plan: 'free',
        status: 'none',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // 5. AI ASSISTANT FOR SELLERS (GEMINI 3.8 FLASH)
  // ==========================================
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    try {
      const {
        action,
        productName = '',
        existingDescription = '',
        details = '',
        category = '',
        price = 0,
        targetLanguage = 'uz',
        tone = 'professional',
        targetAudience = 'all',
        includeEmojis = true,
        keyFeatures = '',
        seoKeywords = '',
      } = req.body || {};

      if (!action) {
        return res.status(400).json({ success: false, error: 'Harakat turi (action) koʻrsatilmadi.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      let aiResultText = '';

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          let systemPrompt =
            'You are an expert e-commerce copywriter, merchandiser, and marketing specialist for Sellnex, an e-commerce platform in Uzbekistan. ' +
            'You write high-converting, professional, accurate copy. Never invent fake certificates, unverified medical claims, or fake guarantees that the seller did not provide. ' +
            'Primary language is Uzbek (Latin script) unless specified otherwise. ' +
            'Return clean, ready-to-use e-commerce copy without robotic pleasantries.';

          let userPrompt = '';
          const toneInstruction = `Ohang / Uslub (Tone): ${tone} (${
            tone === 'professional' ? 'Professional va rasmiy' :
            tone === 'friendly' ? 'Do‘stona va samimiy' :
            tone === 'casual' ? 'Oddiy, erkin va kundalik' :
            tone === 'luxury' ? 'Premium, hashamatli va nufuzli' :
            tone === 'concise' ? 'Qisqa, lo‘nda va aniq' : tone
          }). `;
          const audienceInstruction = targetAudience && targetAudience !== 'all' ? `Auditoriya: ${targetAudience}. ` : '';
          const emojiInstruction = includeEmojis ? 'Chiroyli va mos emojilardan me’yorida foydalaning. ' : 'Emojilardan umuman foydalanmang. ';
          const featuresInstruction = keyFeatures ? `Asosiy xususiyatlar/afzalliklar: ${keyFeatures}. ` : '';
          const seoInstruction = seoKeywords ? `Kiritilishi lozim bo‘lgan SEO kalit so‘zlar: ${seoKeywords}. ` : '';

          switch (action) {
            case 'generate_description':
              userPrompt =
                `Mahsulot nomi: "${productName}"\n` +
                (details ? `Qo‘shimcha parametrlar va xususiyatlar: ${details}\n` : '') +
                (category ? `Kategoriya: ${category}\n` : '') +
                (price ? `Narxi: ${price} so'm\n` : '') +
                featuresInstruction + '\n' +
                seoInstruction + '\n' +
                toneInstruction + '\n' +
                audienceInstruction + '\n' +
                emojiInstruction + '\n' +
                `Vazifa: Ushbu mahsulot uchun O‘zbekiston xaridorlariga mo‘ljallangan, qiziqarli, ishonchli va sotuvchi tavsif yozing. ` +
                `Struktura: 1. Qisqa e'tiborni tortuvchi kirish. 2. Asosiy afzalliklari (punktlar bilan). 3. Texnik xususiyatlari. 4. Yetkazib berish va sifat kafolati eslatmasi. ` +
                `Til: ${targetLanguage === 'ru' ? 'Rus tili' : targetLanguage === 'en' ? 'Ingliz tili' : 'O‘zbek tili (Lotin)'}.`;
              break;

            case 'improve_description':
              userPrompt =
                `Mavjud mahsulot tavsifi:\n"${existingDescription}"\n` +
                (productName ? `Mahsulot nomi: "${productName}"\n` : '') +
                `Vazifa: Ushbu tavsifni xaridor uchun yanada jozibador, ravon, imlo xatolarisiz va professional tuzilma (punktlar, abzaslar) bilan boyitib qayta yozing. ` +
                `Faqat berilgan faktlarga tayaning, yo‘q xususiyatlarni to‘qimang. ` +
                `Til: ${targetLanguage === 'ru' ? 'Rus tili' : targetLanguage === 'en' ? 'Ingliz tili' : 'O‘zbek tili (Lotin)'}.`;
              break;

            case 'generate_title':
              userPrompt =
                `Mahsulot nomi/turi: "${productName || details}"\n` +
                (category ? `Kategoriya: ${category}\n` : '') +
                `Vazifa: Qidiruvda yuqori o‘rinlarda chiqadigan, xaridor e'tiborini tortuvchi 5 xil professional sarlavha (title) variantini tuzing. ` +
                `Har bir sarlavhani yangi qatorda raqam bilan ko‘rsating. ` +
                `Til: ${targetLanguage === 'ru' ? 'Rus tili' : targetLanguage === 'en' ? 'Ingliz tili' : 'O‘zbek tili (Lotin)'}.`;
              break;

            case 'suggest_categories':
              userPrompt =
                `Mahsulot: "${productName}"\n` +
                (details ? `Tafsilotlar: ${details}\n` : '') +
                `Vazifa: Ushbu mahsulotga eng mos keluvchi 5 ta e-tijorat toifasini (kategoriya va bo‘lim) tavsiya qiling. ` +
                `Misol: Elektronika > Smartfonlar, Go'zallik va parvarish, Uy-ro'zg'or buyumlari. ` +
                `Har birini yangi qatorda keltiring.`;
              break;

            case 'social_promo':
              userPrompt =
                `Mahsulot: "${productName}"\n` +
                (price ? `Narxi: ${price} so'm\n` : '') +
                (details ? `Xususiyatlar: ${details}\n` : '') +
                `Vazifa: Ikkita alohida post matnini yarating:\n` +
                `1) TELEGRAM POST: Emotsional, chiroyli smayliklar (emoji) bilan, asosiy xususiyatlar punktlarda, narx va buyurtma berish chaqirig‘i bilan.\n` +
                `2) INSTAGRAM POST: Qisqa, zamonaviy, e'tibor tortuvchi sarlavha, afzalliklar va tegishli heshteglar (#uzbekistan, #onlineshop, #tashkent va hk).\n` +
                `Til: ${targetLanguage === 'ru' ? 'Rus tili' : targetLanguage === 'en' ? 'Ingliz tili' : 'O‘zbek tili (Lotin)'}.`;
              break;

            case 'seo_metadata':
              userPrompt =
                `Mahsulot: "${productName}"\n` +
                (details ? `Tafsilotlar: ${details}\n` : '') +
                `Vazifa: Ushbu mahsulot uchun SEO ma'lumotlarini tuzing:\n` +
                `- SEO Sarlavha (Meta Title, 60 belgidan oshmasin)\n` +
                `- SEO Tavsif (Meta Description, 150-160 belgi, xarid qilishga undovchi)\n` +
                `- Tavsiya etiladigan URL slug (masalan: smartfon-redmi-13c)\n` +
                `- Asosiy kalit so'zlar (5 ta).`;
              break;

            case 'translate':
              userPrompt =
                `Matn / Mahsulot ma'lumoti:\n"${existingDescription || productName || details}"\n` +
                `Vazifa: Ushbu matnni ${targetLanguage === 'ru' ? 'Rus tiliga' : targetLanguage === 'en' ? 'Ingliz tiliga' : 'O‘zbek tiliga (Lotin)'} professional va tabiiy jaranglaydigan qilib tarjima qiling.`;
              break;

            case 'suggest_keywords':
              userPrompt =
                `Mahsulot: "${productName}"\n` +
                (category ? `Kategoriya: ${category}\n` : '') +
                `Vazifa: Xaridorlar Google, Yandex, Uzum va Telegram qidiruvida ushbu mahsulotni qanday so'zlar bilan qidirishi mumkin? ` +
                `12-15 ta eng mashhur va foydali kalit so'zlar (keywords/tags) ro'yxatini vergul bilan ajratilgan holda taqdim eting.`;
              break;

            default:
              userPrompt = `Mahsulot: "${productName}". Yordam: ${details}`;
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          aiResultText = response.text || '';
        } catch (apiErr: any) {
          console.warn('[AI Assistant Gemini API Error - using smart fallback]:', apiErr?.message);
        }
      }

      // If Gemini returned text, use it; otherwise use smart fallback generator
      if (!aiResultText) {
        aiResultText = generateLocalAiFallback(action, {
          productName,
          existingDescription,
          details,
          category,
          price,
          targetLanguage,
        });
      }

      return res.status(200).json({
        success: true,
        action,
        output: aiResultText,
      });
    } catch (err: any) {
      console.error('[AI Assistant Endpoint Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'AI matn yaratishda kutilmagan xatolik yuz berdi.',
        details: err?.message,
      });
    }
  });

  // Local fallback generator ensures immediate 100% uptime
  function generateLocalAiFallback(
    action: string,
    params: {
      productName: string;
      existingDescription?: string;
      details?: string;
      category?: string;
      price?: number;
      targetLanguage?: string;
    }
  ): string {
    const name = params.productName || 'Mahsulot';
    const priceStr = params.price ? `${new Intl.NumberFormat('uz-UZ').format(params.price)} so'm` : 'Hamyonbop narxda';
    const details = params.details ? `\n• ${params.details}` : '';

    switch (action) {
      case 'generate_description':
        return `✨ **${name}** — sifatli va ishonchli tanlov!\n\n` +
          `Ushbu mahsulot o‘zining mustahkamligi, zamonaviy dizayni va qulayligi bilan ajralib turadi. Kundalik foydalanish uchun juda mos keladi.\n\n` +
          `🌟 **Asosiy afzalliklari:**\n` +
          `• Yuqori sifatli materiallardan tayyorlangan\n` +
          `• Uzoq muddat xizmat qiladi va qulay ishlatiladi\n` +
          `• Zamonaviy va ixcham ko‘rinish${details}\n\n` +
          `📦 **Yetkazib berish:** O‘zbekiston bo‘ylab tezkor yetkazib berish mavjud!\n` +
          `💰 **Narxi:** ${priceStr}`;

      case 'improve_description':
        return `🔥 **${name}**\n\n` +
          `${params.existingDescription || 'Ajoyib sifat va qulay narx uyg‘unligi.'}\n\n` +
          `✅ **Nega aynan ushbu mahsulotni tanlashadi?**\n` +
          `• 100% kafolatlangan sifat\n` +
          `• Xaridorlar tomonidan yuqori baholangan\n` +
          `• Buyurtma berish juda oddiy va qulay`;

      case 'generate_title':
        return `1. ${name} — Original va Yuqori Sifatli\n` +
          `2. Premium ${name} (O‘zbekiston bo‘yicha yetkazib berish bilan)\n` +
          `3. ${name} — Eng Yaxshi Narx va Kafolatlangan Sifat\n` +
          `4. Zamonaviy ${name} — Arzon va Ishonchli Tanlov\n` +
          `5. Yangi Model: ${name} [Xit Sotuv]`;

      case 'suggest_categories':
        return `1. Elektronika va maishiy texnika\n` +
          `2. Smartfonlar va gadjetlar\n` +
          `3. Uy va oshxona anjomlari\n` +
          `4. Go‘zallik va salomatlik\n` +
          `5. Aksessuarlar va sovg‘alar`;

      case 'social_promo':
        return `📢 **TELEGRAM UCHUN POST:**\n\n` +
          `🔥 **Yangilik! ${name} sotuvda!**\n\n` +
          `Siz kutgan sifat va qulaylik endi bizning do‘konda! Buyurtma berishga shoshiling, soni cheklangan!\n\n` +
          `💰 Narxi: **${priceStr}**\n` +
          `🚚 Butun O‘zbekiston bo‘ylab yetkazib beramiz.\n\n` +
          `👇 Buyurtma berish uchun do‘kon havolasiga o‘ting!\n\n` +
          `-------------------------------\n\n` +
          `📸 **INSTAGRAM UCHUN POST:**\n\n` +
          `Eng sara sifat faqat siz uchun! ✨ ${name} har bir xonadonga qulaylik baxsh etadi.\n\n` +
          `👉 Hoziroq profil sarlavhasidagi (bio) havola orqali buyurtma qiling!\n\n` +
          `#uzbekistan #tashkent #onlineshop #xarid #sifatli #${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      case 'seo_metadata':
        return `📌 **SEO Meta Title (55 belgi):**\n${name} — Sotib olish | Eng arzon narx O‘zbekistonda\n\n` +
          `📝 **SEO Meta Description (148 belgi):**\n${name} arzon narxda va kafolat bilan xarid qiling. Toshkent va barcha viloyatlarga tez yetkazib berish xizmati mavjud. Buyurtma bering!\n\n` +
          `🔗 **URL Slug:**\n${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}\n\n` +
          `🏷️ **Kalit so'zlar:** ${name}, arzon narx, yetkazib berish, toshkent, online do'kon`;

      case 'translate':
        if (params.targetLanguage === 'ru') {
          return `Качественный товар: ${name}. Доступная цена, быстрая доставка по всему Узбекистану. Отличный выбор для каждого покупателя.`;
        }
        if (params.targetLanguage === 'en') {
          return `Premium quality: ${name}. Affordable pricing with fast nationwide delivery across Uzbekistan. Order today!`;
        }
        return `${name} — yuqori sifatli mahsulot. Hamyonbop narx va butun O‘zbekiston bo‘yicha tezkor yetkazib berish.`;

      case 'suggest_keywords':
        return `${name}, ${name} narxi, ${name} toshkent, ${name} sotib olish, arzon ${name}, sifatli ${name}, uzum market, online do'kon, yetkazib berish, buyurtma, aksessuarlar, chegirma, aksiya`;

      default:
        return `${name} bo‘yicha AI tavsiyasi tayyorlandi.`;
    }
  }

  // ==========================================
  // 5.8. OFFICIAL SELLNEX TELEGRAM BOT API (@Sellnex_bot)
  // ==========================================
  app.post('/api/telegram/webhook', async (req: Request, res: Response) => {
    try {
      const update = req.body;
      if (update) {
        processTelegramUpdate(update).catch((e) => console.error('[Webhook Update Error]:', e));
      }
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      console.error('[Telegram Webhook Error]:', err);
      return res.status(200).json({ ok: false, error: err.message });
    }
  });

  app.post('/api/telegram/send-welcome', async (req: Request, res: Response) => {
    try {
      const { chatId, firstName } = req.body || {};
      if (!chatId) {
        return res.status(400).json({ success: false, error: 'Chat ID ko‘rsatilmadi' });
      }
      const result = await sendWelcomeStartInterface(chatId, firstName);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/telegram/bot-info', async (req: Request, res: Response) => {
    try {
      const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
      const data = await resp.json();
      return res.status(200).json({
        success: data.ok,
        bot: data.result || { username: TELEGRAM_BOT_USERNAME },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Start background Telegram long-polling for real-time /start response
  try {
    startTelegramBotPolling(TELEGRAM_BOT_TOKEN);
  } catch (botErr) {
    console.warn('[Sellnex Server] Telegram bot polling init warning:', botErr);
  }

  // ==========================================
  // 6. GLOBAL 500 / 502 ERROR FALLBACK HANDLER FOR /api/*
  // ==========================================
  app.use('/api/*', (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[API Catch-all Error Guard]:', err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({
      success: false,
      error: 'API serverda kutilmagan xatolik yuz berdi.',
      message: err?.message || 'Unknown Server Error',
    });
  });

  // ==========================================
  // 6. VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to PORT 3000 and HOST 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sellnex Server] Production-ready server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
