import { PaynetTransaction, PlanType } from '../types';

export interface CreatePaynetPaymentParams {
  userId: string;
  userEmail?: string;
  userPhone?: string;
  planId?: PlanType;
  orderId?: string;
  amount: number;
  paymentType?: 'subscription' | 'order';
}

export interface PaynetPaymentResponse {
  success: boolean;
  transactionId: string;
  paynetTransactionId: string;
  cashierCode: string;
  amount: number;
  currency: 'UZS';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  planId?: string;
  qrCodeUrl: string;
  paynetDeepLink: string;
  checkoutUrl: string;
  expiresInSeconds: number;
  error?: string;
}

export interface PaynetVerifyResponse {
  success: boolean;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  activated: boolean;
  transaction?: PaynetTransaction;
  subscription?: {
    userId: string;
    plan: PlanType;
    status: 'active' | 'trial' | 'expired';
    productLimit: number;
    subscriptionExpiresAt: string;
  };
  message?: string;
  error?: string;
}

export const paynetService = {
  /**
   * Initiate a Paynet payment transaction via the backend API
   */
  async createPayment(params: CreatePaynetPaymentParams): Promise<PaynetPaymentResponse> {
    try {
      const res = await fetch('/api/payment/paynet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          transactionId: '',
          paynetTransactionId: '',
          cashierCode: '',
          amount: params.amount,
          currency: 'UZS',
          status: 'FAILED',
          qrCodeUrl: '',
          paynetDeepLink: '',
          checkoutUrl: '',
          expiresInSeconds: 0,
          error: data.error || 'Paynet toʻlov soʻrovini yaratib boʻlmadi',
        };
      }

      return data;
    } catch (err: any) {
      console.error('[paynetService] createPayment error:', err);
      return {
        success: false,
        transactionId: '',
        paynetTransactionId: '',
        cashierCode: '',
        amount: params.amount,
        currency: 'UZS',
        status: 'FAILED',
        qrCodeUrl: '',
        paynetDeepLink: '',
        checkoutUrl: '',
        expiresInSeconds: 0,
        error: 'Server bilan bogʻlanishda xatolik yuz berdi. Iltimos qaytadan urinib koʻring.',
      };
    }
  },

  /**
   * Check real-time transaction status by transaction ID
   */
  async checkStatus(transactionId: string): Promise<{
    success: boolean;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
    transaction?: any;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/payment/paynet/status/${encodeURIComponent(transactionId)}`);
      const data = await res.json();
      return {
        success: data.success,
        status: data.status || 'PENDING',
        transaction: data,
        error: data.error,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'PENDING',
        error: err?.message,
      };
    }
  },

  /**
   * Trigger explicit backend verification and subscription activation
   */
  async verifyPayment(transactionId: string): Promise<PaynetVerifyResponse> {
    try {
      const res = await fetch('/api/payment/paynet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        activated: false,
        error: err?.message || 'Toʻlovni tasdiqlashda tarmoq xatosi',
      };
    }
  },

  /**
   * Test payment simulation for QA / manual verification
   */
  async simulatePayment(transactionId: string, simulateStatus: 'PAID' | 'FAILED' | 'CANCELLED' = 'PAID'): Promise<PaynetVerifyResponse> {
    try {
      const res = await fetch('/api/payment/paynet/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, simulateStatus }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        activated: false,
        error: err?.message || 'Simulyatsiyada xatolik',
      };
    }
  },

  /**
   * Persist user device type to backend (P1)
   */
  async saveDevicePreference(userId: string, deviceType: 'phone' | 'computer'): Promise<boolean> {
    try {
      const res = await fetch('/api/user/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deviceType }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Retrieve user device type from backend (P1)
   */
  async getDevicePreference(userId: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/user/device/${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data?.deviceType || null;
    } catch {
      return null;
    }
  },
};
