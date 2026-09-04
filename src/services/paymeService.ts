import { Storage } from './storage';

export interface PaymePaymentRequest {
  amount: number; // in UZS (will be multiplied by 100 in real tiyin)
  orderId: string;
  phone?: string;
  account?: {
    order_id: string;
  };
}

export interface PaymePaymentResponse {
  success: boolean;
  transactionId: string;
  paymeTransId: string;
  status: 'PAID' | 'CREATED' | 'FAILED';
  message: string;
  timestamp: string;
  amount: number;
}

export const paymeService = {
  /**
   * Mock Payme Merchant Checkout API Simulation
   * Ready for real Payme JSON-RPC 2.0 protocol
   */
  async createPayment(params: PaymePaymentRequest): Promise<PaymePaymentResponse> {
    const integrations = Storage.getIntegrations();
    const config = integrations.payme;

    await new Promise((r) => setTimeout(r, 1200));

    if (!config?.connected && !config?.testMode) {
      return {
        success: false,
        transactionId: `TX-PAYME-FAIL-${Date.now()}`,
        paymeTransId: '',
        status: 'FAILED',
        message: 'Payme merchant credentials not configured',
        timestamp: new Date().toISOString(),
        amount: params.amount,
      };
    }

    return {
      success: true,
      transactionId: `TX-PAYME-${Date.now()}`,
      paymeTransId: `PM-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'PAID',
      message: 'Demo Payme Payment successfully authorized',
      timestamp: new Date().toISOString(),
      amount: params.amount,
    };
  },

  async checkPayment(transactionId: string): Promise<{ state: number; reason: number | null }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      state: 2, // 2 = performed in Payme API
      reason: null,
    };
  },

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; cancelTime: number }> {
    await new Promise((r) => setTimeout(r, 700));
    return {
      success: true,
      cancelTime: Date.now(),
    };
  },
};
