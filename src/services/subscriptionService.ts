import { Storage } from './storage';
import { User, Store, PlanType, P2PPayment } from '../types';
import { firestoreService } from './firestoreService';
import { telegramService } from './telegramService';

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  priceUSD: number;
  priceUZS: number;
  renewalDiscountUSD?: number;
  renewalDiscountUZS?: number;
  billingPeriod: string;
  trialDays?: number;
  badge?: string;
  limits: {
    maxStores: number;
    maxProducts: number;
    transactionFeePercent: number;
    autoFulfillment: boolean;
    telegramAlerts: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  };
  features: string[];
  popular?: boolean;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  trial: {
    id: 'trial',
    name: 'FREE TRIAL',
    tagline: '7-day full access with up to 5 products',
    priceUSD: 0,
    priceUZS: 0,
    billingPeriod: '7 days',
    trialDays: 7,
    badge: 'Free Trial',
    limits: {
      maxStores: 1,
      maxProducts: 5,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
    features: [
      '7 kunlik bepul sinov davri',
      'Maksimum 5 ta mahsulot katalogi',
      'Click, Payme va Uzum Bank orqali toʻlov',
      'Telegram orqali tezkor bildirishnomalar',
      'Shaxsiy onlayn doʻkon havolasi (.sellnex.uz)',
    ],
  },
  // Alias for backward compatibility
  free: {
    id: 'trial',
    name: 'FREE TRIAL',
    tagline: '7-day full access with up to 5 products',
    priceUSD: 0,
    priceUZS: 0,
    billingPeriod: '7 days',
    trialDays: 7,
    badge: 'Free Trial',
    limits: {
      maxStores: 1,
      maxProducts: 5,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
    features: [
      '7 kunlik bepul sinov davri',
      'Maksimum 5 ta mahsulot katalogi',
      'Click, Payme va Uzum Bank orqali toʻlov',
      'Telegram orqali tezkor bildirishnomalar',
      'Shaxsiy onlayn doʻkon havolasi (.sellnex.uz)',
    ],
  },
  starter: {
    id: 'starter',
    name: 'STARTER',
    tagline: '$1 for 3 months with up to 5 products',
    priceUSD: 1,
    priceUZS: 13000,
    billingPeriod: '3 months',
    badge: 'Starter',
    limits: {
      maxStores: 1,
      maxProducts: 5,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
    features: [
      '$1 toʻlov evaziga 3 oy aktiv',
      'Maksimum 5 ta mahsulot katalogi',
      'Click, Payme va Uzum Bank orqali toʻlov',
      'Telegram buyurtma boti va xabarlar',
      'Doimiy qoʻllab-quvvatlash',
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    tagline: '$5 / month with up to 20 products',
    priceUSD: 5,
    priceUZS: 65000,
    billingPeriod: '1 month',
    badge: 'Pro',
    popular: true,
    limits: {
      maxStores: 2,
      maxProducts: 20,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      '$5 toʻlov evaziga 1 oy aktiv',
      'Maksimum 20 ta mahsulot katalogi',
      '1-klikda Uzum va AliExpressdan import',
      'Click, Payme va Uzum Bank integratsiyasi',
      'Ustuvor VIP texnik koʻmak',
    ],
  },
  business: {
    id: 'business',
    name: 'BUSINESS',
    tagline: '$10 / month with up to 50 products',
    priceUSD: 10,
    priceUZS: 130000,
    billingPeriod: '1 month',
    badge: 'Kengayish',
    limits: {
      maxStores: 5,
      maxProducts: 50,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      '$10 toʻlov evaziga 1 oy aktiv',
      'Maksimum 50 ta mahsulot katalogi',
      'Shaxsiy domen ulash imkoniyati',
      'Telegram bot va kengaytirilgan statistika',
      'Ustuvor VIP texnik koʻmak',
    ],
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    tagline: '$20 / month with up to 110 products',
    priceUSD: 20,
    priceUZS: 260000,
    billingPeriod: '1 month',
    badge: 'Maksimal',
    limits: {
      maxStores: 10,
      maxProducts: 110,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      '$20 toʻlov evaziga 1 oy aktiv',
      'Maksimum 110 ta mahsulot katalogi',
      'Cheksiz buyurtmalar va toʻliq funksionallik',
      'Shaxsiy VIP menejer koʻmagi',
      'Maksimal server tezligi va 0% komissiya',
    ],
  },
  // Legacy aliases for backward compatibility
  full: {
    id: 'pro',
    name: 'PRO',
    tagline: '$5 / month with up to 20 products',
    priceUSD: 5,
    priceUZS: 65000,
    billingPeriod: '1 month',
    popular: true,
    limits: {
      maxStores: 2,
      maxProducts: 20,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: ['Up to 20 Products', 'Priority Support'],
  },
  premium_pro: {
    id: 'premium',
    name: 'PREMIUM',
    tagline: '$20 / month with up to 110 products',
    priceUSD: 20,
    priceUZS: 260000,
    billingPeriod: '1 month',
    limits: {
      maxStores: 10,
      maxProducts: 110,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: ['Up to 110 Products', 'Priority VIP Support'],
  },
};

export interface TrialStatusInfo {
  isTrial: boolean;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  formattedRemaining: string;
  expiryDateFormatted: string;
  planName: string;
  maxProducts: number;
}

export const subscriptionService = {
  getPlanConfig(planId?: string): PlanConfig {
    if (!planId || planId === 'trial' || planId === 'free') return PLAN_CONFIGS.trial;
    const clean = planId.toLowerCase();
    return PLAN_CONFIGS[clean] || PLAN_CONFIGS.starter;
  },

  getTrialStatus(user: User | null): TrialStatusInfo {
    if (!user) {
      return {
        isTrial: true,
        isActive: true,
        isExpired: false,
        daysRemaining: 7,
        hoursRemaining: 168,
        formattedRemaining: 'Your free trial ends in 7 days.',
        expiryDateFormatted: new Date(Date.now() + 7 * 86400000).toLocaleDateString(),
        planName: 'FREE TRIAL',
        maxProducts: 5,
      };
    }

    // Admins always have unlimited and perpetual active access
    if (user.role === 'admin') {
      return {
        isTrial: false,
        isActive: true,
        isExpired: false,
        daysRemaining: 999,
        hoursRemaining: 9999,
        formattedRemaining: 'Unlimited Admin Access',
        expiryDateFormatted: 'Lifetime / Admin',
        planName: 'Administrator VIP',
        maxProducts: 10000,
      };
    }

    const plan = (user.plan === 'free' ? 'trial' : user.plan) || 'trial';
    const isTrial = plan === 'trial';
    const config = this.getPlanConfig(plan);

    // Paid Plan (Starter: 3 months, Pro: 1 month)
    if (!isTrial) {
      const expiresAt = user.endDate || user.subscriptionExpiresAt
        ? new Date(user.endDate || user.subscriptionExpiresAt!).getTime()
        : Date.now() + (plan === 'starter' ? 90 : 30) * 86400000;
      const diffMs = expiresAt - Date.now();
      const isExpired = diffMs <= 0 || user.status === 'expired' || user.subscriptionStatus === 'expired';
      const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

      return {
        isTrial: false,
        isActive: !isExpired,
        isExpired,
        daysRemaining,
        hoursRemaining,
        formattedRemaining: isExpired ? 'Your subscription has expired.' : `${daysRemaining} days remaining`,
        expiryDateFormatted: new Date(expiresAt).toLocaleDateString('uz-UZ', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        planName: config.name,
        maxProducts: user.productLimit || config.limits.maxProducts,
      };
    }

    // Free Trial logic (7 days, 5 products)
    const startDate = user.startDate || user.createdAt
      ? new Date(user.startDate || user.createdAt).getTime()
      : Date.now();
    const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    const expiryTimestamp = user.endDate || user.trialEndsAt || user.subscriptionExpiresAt
      ? new Date(user.endDate || user.trialEndsAt || user.subscriptionExpiresAt!).getTime()
      : startDate + trialDurationMs;
    const now = Date.now();
    const diffMs = expiryTimestamp - now;

    const isExpired = diffMs <= 0 || user.status === 'expired' || user.subscriptionStatus === 'expired';
    const isActive = !isExpired;

    const totalHoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const daysRemaining = Math.floor(totalHoursRemaining / 24);
    const hoursRemaining = totalHoursRemaining % 24;

    let formattedRemaining = 'Your subscription has expired.';
    if (!isExpired) {
      if (daysRemaining > 0) {
        formattedRemaining = `Your free trial ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`;
      } else {
        formattedRemaining = `Your free trial ends in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`;
      }
    }

    return {
      isTrial: true,
      isActive,
      isExpired,
      daysRemaining,
      hoursRemaining,
      formattedRemaining,
      expiryDateFormatted: new Date(expiryTimestamp).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      planName: 'FREE TRIAL',
      maxProducts: 5,
    };
  },

  checkCanAddProduct(user: User | null, currentProductCount: number): { allowed: boolean; reason?: string; limit: number } {
    if (user?.role === 'admin') {
      return { allowed: true, limit: 10000 };
    }

    const plan = (user?.plan === 'free' ? 'trial' : user?.plan) || 'trial';
    const statusInfo = this.getTrialStatus(user);

    if (statusInfo.isExpired) {
      return {
        allowed: false,
        reason: 'Your subscription has expired.',
        limit: statusInfo.maxProducts,
      };
    }

    // Trial: 5 products
    if (plan === 'trial') {
      const limit = 5;
      if (currentProductCount >= limit) {
        return {
          allowed: false,
          reason: 'You have reached your 5 product limit.',
          limit,
        };
      }
      return { allowed: true, limit };
    }

    // Starter: 5 products
    if (plan === 'starter') {
      const limit = 5;
      if (currentProductCount >= limit) {
        return {
          allowed: false,
          reason: 'You have reached your 5 product limit. Upgrade to Pro for up to 20 products.',
          limit,
        };
      }
      return { allowed: true, limit };
    }

    // Pro: 20 products
    if (plan === 'pro' || plan === 'full') {
      const limit = 20;
      if (currentProductCount >= limit) {
        return {
          allowed: false,
          reason: 'You have reached your 20 product limit. Upgrade to Business for up to 50 products.',
          limit,
        };
      }
      return { allowed: true, limit };
    }

    // Business: 50 products
    if (plan === 'business') {
      const limit = 50;
      if (currentProductCount >= limit) {
        return {
          allowed: false,
          reason: 'You have reached your 50 product limit. Upgrade to Premium for up to 110 products.',
          limit,
        };
      }
      return { allowed: true, limit };
    }

    // Premium: 110 products
    if (plan === 'premium' || plan === 'premium_pro') {
      const limit = 110;
      if (currentProductCount >= limit) {
        return {
          allowed: false,
          reason: 'You have reached your 110 product limit on Premium.',
          limit,
        };
      }
      return { allowed: true, limit };
    }

    // Fallback limit check
    const limit = user?.productLimit || 5;
    if (currentProductCount >= limit) {
      return {
        allowed: false,
        reason: `You have reached your ${limit} product limit.`,
        limit,
      };
    }

    return { allowed: true, limit };
  },

  async upgradePlan(
    user: User,
    newPlan: PlanType,
    paymentMethod: 'Click' | 'Payme' | 'Uzum Bank' | 'Card',
    isRenewalDiscount = false
  ): Promise<{ user: User; receiptNumber: string }> {
    const cleanPlan: PlanType = newPlan === 'free' ? 'trial' : newPlan;
    const now = new Date();
    let durationDays = 7;
    let productLimit = 5;
    let paymentAmount = 0;

    if (cleanPlan === 'starter') {
      durationDays = 90; // 3 months
      productLimit = 5;
      paymentAmount = 1;
    } else if (cleanPlan === 'pro' || cleanPlan === 'full') {
      durationDays = 30; // 1 month
      productLimit = 20;
      paymentAmount = 5;
    } else if (cleanPlan === 'business') {
      durationDays = 30; // 1 month
      productLimit = 50;
      paymentAmount = 10;
    } else if (cleanPlan === 'premium' || cleanPlan === 'premium_pro') {
      durationDays = 30; // 1 month
      productLimit = 110;
      paymentAmount = 20;
    } else if (cleanPlan === 'trial') {
      durationDays = 7; // 7 days
      productLimit = 5;
      paymentAmount = 0;
    }

    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const updatedUser: User = {
      ...user,
      plan: cleanPlan,
      status: 'active',
      subscriptionStatus: 'active',
      startDate: now.toISOString(),
      endDate: expiresAt,
      subscriptionExpiresAt: expiresAt,
      trialEndsAt: cleanPlan === 'trial' ? expiresAt : user.trialEndsAt,
      productLimit,
      paymentAmount,
      isStarterRenewedDiscount: isRenewalDiscount,
      updatedAt: now.toISOString(),
    };

    // 1. Update localStorage
    Storage.setCurrentUser(updatedUser);
    const allUsers = Storage.getUsers().map((u) => (u.id === user.id ? updatedUser : u));
    Storage.setUsers(allUsers);

    // 2. Persist directly to Firestore to prevent reverting on page refresh
    try {
      await firestoreService.setUser(user.id, updatedUser);
    } catch (err) {
      console.error('Failed to sync plan upgrade to Firestore user document:', err);
    }

    const receiptNumber = `SUB-${cleanPlan.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    return { user: updatedUser, receiptNumber };
  },

  async submitP2PPaymentRequest({
    user,
    planRequested,
    amountUZS,
    amountUSD,
    paymentMethod,
    receiptImageUrl,
    transactionRef,
    senderPhone,
    notes,
  }: {
    user: User;
    planRequested: PlanType;
    amountUZS: number;
    amountUSD: number;
    paymentMethod: 'Click' | 'Payme' | 'Uzum Bank' | 'Card';
    receiptImageUrl?: string;
    transactionRef?: string;
    senderPhone?: string;
    notes?: string;
  }): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const cleanPlan: PlanType = planRequested === 'free' ? 'trial' : planRequested;
      const durationMonths = cleanPlan === 'starter' ? 3 : 1;
      const paymentId = `p2p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPayment: P2PPayment = {
        id: paymentId,
        paymentNumber: `SLX-PAY-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userPhone: senderPhone || user.phone || '',
        planRequested: cleanPlan,
        planId: cleanPlan,
        planName: cleanPlan.toUpperCase(),
        durationMonths,
        amount: amountUZS,
        paymentMethod: paymentMethod === 'Card' ? 'P2P Card Transfer' : paymentMethod,
        screenshotUrl: receiptImageUrl || '',
        notes: [
          `Tarif: ${cleanPlan.toUpperCase()} ($${amountUSD} / ${amountUZS.toLocaleString()} UZS, ${durationMonths} oy)`,
          transactionRef ? `Tranzaksiya: ${transactionRef}` : '',
          notes,
        ]
          .filter(Boolean)
          .join(' | '),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await firestoreService.createP2PPayment(newPayment);

      // Create admin notification
      try {
        await firestoreService.createAdminNotification({
          id: `admin_notif_${Date.now()}`,
          title: `Yangi to'lov cheki kelib tushdi!`,
          message: `${user.name} (${user.email}) "${cleanPlan.toUpperCase()}" tarifi uchun ${amountUZS.toLocaleString()} UZS ($${amountUSD}) to'lov chekini yukladi.`,
          type: 'order',
          timestamp: new Date().toISOString(),
          read: false,
        });
      } catch (notifErr) {
        console.warn('Admin notification error:', notifErr);
      }

      // Send Instant Telegram Bot Alert to @Sellnexadmunhistaryta_bot
      try {
        await telegramService.sendPaymentReceiptAlert({
          paymentNumber: newPayment.paymentNumber,
          userName: user.name,
          userEmail: user.email,
          userPhone: senderPhone || user.phone || '',
          planRequested: cleanPlan,
          amount: amountUZS,
          paymentMethod: newPayment.paymentMethod,
          notes: newPayment.notes,
          screenshotUrl: receiptImageUrl,
        });
      } catch (tgErr) {
        console.warn('Telegram payment alert warning:', tgErr);
      }

      return { success: true, paymentId };
    } catch (err: any) {
      console.error('Error submitting P2P payment request:', err);
      return { success: false, error: err?.message || 'Toʻlov chekini yuborishda xatolik yuz berdi.' };
    }
  },
};
