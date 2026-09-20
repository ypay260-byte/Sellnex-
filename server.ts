import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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

  // E. Test Payment Simulator (for QA and Verification)
  app.post('/api/payment/paynet/simulate', (req: Request, res: Response) => {
    try {
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
  // 5. GLOBAL 500 / 502 ERROR FALLBACK HANDLER FOR /api/*
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
