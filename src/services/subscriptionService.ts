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
  free: {
    id: 'free',
    name: '4-Day Free Trial',
    tagline: 'Full platform trial with all features enabled for 4 days',
    priceUSD: 0,
    priceUZS: 0,
    billingPeriod: '4 days free trial',
    trialDays: 4,
    badge: 'Free Trial',
    limits: {
      maxStores: 1,
      maxProducts: 50,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      '1 Public Storefront (.sellnex.uz)',
      'Up to 50 Products & 1-Click Import',
      'Click, Payme & Uzum Bank Checkout',
      'Instant Telegram Order Bot Alerts',
      'Instagram Bio & Story Links Generator',
      'Full Access for 4 Days without Card',
    ],
  },
  starter: {
    id: 'starter',
    name: 'STARTER',
    tagline: 'For micro-sellers & single-product campaigns',
    priceUSD: 5,
    priceUZS: 65000,
    renewalDiscountUSD: 3,
    renewalDiscountUZS: 39000,
    billingPeriod: '$5 / month ($3 / mo renewal option)',
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
      'Up to 5 Published Products',
      '1 Online Storefront & Direct Links',
      'Click, Payme & Cash on Delivery',
      'Telegram Order Alerts',
      '$3/mo Loyalty Renewal Option',
      'Standard Support',
    ],
  },
  full: {
    id: 'full',
    name: 'FULL',
    tagline: 'Best for growing dropshippers & local boutique brands',
    priceUSD: 5,
    priceUZS: 65000,
    billingPeriod: '$5 / month',
    badge: 'Best Value',
    popular: true,
    limits: {
      maxStores: 2,
      maxProducts: 50,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      'Up to 50 Products Catalog',
      '1-Click Uzum & AliExpress Importer',
      'Two Business Modes (Personal & Dropship)',
      'Instagram Bio & Product Direct Links',
      'Automated Order Tracking',
      'Priority Support',
    ],
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    tagline: 'For established stores with expanding catalogs',
    priceUSD: 8,
    priceUZS: 99000,
    billingPeriod: '99,000 UZS / month',
    badge: 'Popular',
    limits: {
      maxStores: 3,
      maxProducts: 100,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      'Up to 100 Products Catalog',
      'Custom Domain (.uz) Integration',
      'Automated Supplier Profit Calculations',
      'Multi-Variant Product Customization',
      'Dedicated Telegram Notification Bot',
      '24/7 Priority Assistance',
    ],
  },
  premium_pro: {
    id: 'premium_pro',
    name: 'PREMIUM PRO',
    tagline: 'For top-volume merchants, agencies & big stores',
    priceUSD: 16,
    priceUZS: 199000,
    billingPeriod: '199,000 UZS / month',
    badge: 'Maximum Power',
    limits: {
      maxStores: 5,
      maxProducts: 1000,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: [
      'Up to 1,000 Products Catalog',
      'Unlimited Storefront Customization',
      'Bulk Product Import & Inventory Sync',
      'VIP Dedicated Account Manager',
      'Advanced Influencer & Partner Tracking',
      'SLA 99.9% Uptime Guarantee',
    ],
  },
  // Legacy aliases for backward-compatibility
  pro: {
    id: 'premium_pro',
    name: 'PREMIUM PRO',
    tagline: 'For top-volume merchants',
    priceUSD: 16,
    priceUZS: 199000,
    billingPeriod: '199,000 UZS / month',
    limits: {
      maxStores: 5,
      maxProducts: 1000,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: ['Up to 1,000 Products', 'Priority 24/7 Support'],
  },
  business: {
    id: 'premium_pro',
    name: 'PREMIUM PRO',
    tagline: 'For top-volume merchants',
    priceUSD: 16,
    priceUZS: 199000,
    billingPeriod: '199,000 UZS / month',
    limits: {
      maxStores: 5,
      maxProducts: 1000,
      transactionFeePercent: 0,
      autoFulfillment: true,
      telegramAlerts: true,
      customDomain: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    features: ['Up to 1,000 Products', 'Priority 24/7 Support'],
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
    if (!planId || planId === 'free' || planId === 'trial') return PLAN_CONFIGS.free;
    const clean = planId.toLowerCase();
    return PLAN_CONFIGS[clean] || PLAN_CONFIGS.starter;
  },

  getTrialStatus(user: User | null): TrialStatusInfo {
    if (!user) {
      return {
        isTrial: false,
        isActive: true,
        isExpired: false,
        daysRemaining: 4,
        hoursRemaining: 96,
        formattedRemaining: '4 days remaining',
        expiryDateFormatted: new Date(Date.now() + 4 * 86400000).toLocaleDateString(),
        planName: '4-Day Free Trial',
        maxProducts: 50,
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

    const isTrial = user.plan === 'free' || (user as any).plan === 'trial';
    const config = this.getPlanConfig(user.plan);

    if (!isTrial) {
      const expiresAt = user.subscriptionExpiresAt
        ? new Date(user.subscriptionExpiresAt).getTime()
        : Date.now() + 30 * 86400000;
      const diffMs = expiresAt - Date.now();
      const isExpired = diffMs <= 0;
      const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      return {
        isTrial: false,
        isActive: !isExpired,
        isExpired,
        daysRemaining,
        hoursRemaining: Math.max(0, Math.floor(diffMs / (1000 * 60 * 60))),
        formattedRemaining: isExpired ? 'Subscription Expired' : `${daysRemaining} days remaining`,
        expiryDateFormatted: new Date(expiresAt).toLocaleDateString('uz-UZ', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        planName: config.name,
        maxProducts: config.limits.maxProducts,
      };
    }

    // 4 Days Free Trial logic
    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : Date.now();
    const trialDurationMs = 4 * 24 * 60 * 60 * 1000; // 4 days
    const expiryTimestamp = createdAt + trialDurationMs;
    const now = Date.now();
    const diffMs = expiryTimestamp - now;

    const isExpired = diffMs <= 0;
    const isActive = !isExpired;

    const totalHoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const daysRemaining = Math.floor(totalHoursRemaining / 24);
    const hoursRemaining = totalHoursRemaining % 24;

    let formattedRemaining = 'Active Trial';
    if (isExpired) {
      formattedRemaining = 'Trial expired';
    } else if (daysRemaining > 0) {
      formattedRemaining = `${daysRemaining}d ${hoursRemaining}h remaining`;
    } else {
      formattedRemaining = `${hoursRemaining} hours remaining`;
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
      planName: '4-Day Free Trial',
      maxProducts: config.limits.maxProducts,
    };
  },

  checkCanAddProduct(user: User | null, currentProductCount: number): { allowed: boolean; reason?: string; limit: number } {
    if (user?.role === 'admin') {
      return { allowed: true, limit: 10000 };
    }

    const plan = user?.plan || 'free';
    const config = this.getPlanConfig(plan);
    const trialStatus = this.getTrialStatus(user);

    if (trialStatus.isTrial && trialStatus.isExpired) {
      return {
        allowed: false,
        reason: 'Your 4-day free trial has ended. Upgrade your plan to continue adding products.',
        limit: config.limits.maxProducts,
      };
    }

    if (currentProductCount >= config.limits.maxProducts) {
      return {
        allowed: false,
        reason: `Your current plan allows up to ${config.limits.maxProducts} products. Upgrade your plan to add more products.`,
        limit: config.limits.maxProducts,
      };
    }

    return { allowed: true, limit: config.limits.maxProducts };
  },

  async upgradePlan(
    user: User,
    newPlan: PlanType,
    paymentMethod: 'Click' | 'Payme' | 'Uzum Bank' | 'Card',
    isRenewalDiscount = false
  ): Promise<{ user: User; receiptNumber: string }> {
    const config = this.getPlanConfig(newPlan);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updatedUser: User = {
      ...user,
      plan: newPlan,
      subscriptionExpiresAt: expiresAt,
      isStarterRenewedDiscount: isRenewalDiscount,
      status: 'active',
      updatedAt: new Date().toISOString(),
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

    const receiptNumber = `SUB-${newPlan.toUpperCase().replace('_', '-')}-${Math.floor(100000 + Math.random() * 900000)}`;

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
      const paymentId = `p2p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPayment: P2PPayment = {
        id: paymentId,
        paymentNumber: `SLX-PAY-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userPhone: senderPhone || user.phone || '',
        planRequested,
        planId: planRequested,
        planName: planRequested.toUpperCase(),
        durationMonths: 1,
        amount: amountUZS,
        paymentMethod: paymentMethod === 'Card' ? 'P2P Card Transfer' : paymentMethod,
        screenshotUrl: receiptImageUrl || '',
        notes: [transactionRef ? `Tranzaksiya: ${transactionRef}` : '', notes].filter(Boolean).join(' | '),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await firestoreService.createP2PPayment(newPayment);

      // Create admin notification
      try {
        await firestoreService.createAdminNotification({
          id: `admin_notif_${Date.now()}`,
          title: `Yangi to'lov cheki kelib tushdi!`,
          message: `${user.name} (${user.email}) "${planRequested.toUpperCase()}" tarifi uchun ${amountUZS.toLocaleString()} UZS to'lov chekini yukladi.`,
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
          planRequested: planRequested,
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
