import { Storage } from './storage';

export interface UzumBankPaymentRequest {
  amount: number;
  orderId: string;
  phone?: string;
  installments?: number; // 0 = standard, 3, 6, 12 months
}

export interface UzumBankPaymentResponse {
  success: boolean;
  transactionId: string;
  uzumTransId: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  message: string;
  timestamp: string;
  amount: number;
}

export const uzumbankService = {
  /**
   * Mock Uzum Bank / Uzum Nasiya API integration
   */
  async createPayment(params: UzumBankPaymentRequest): Promise<UzumBankPaymentResponse> {
    const integrations = Storage.getIntegrations();
    const config = integrations.uzumbank;

    await new Promise((r) => setTimeout(r, 1200));

    if (!config?.connected && !config?.testMode) {
      return {
        success: false,
        transactionId: `TX-UZB-FAIL-${Date.now()}`,
        uzumTransId: '',
        status: 'REJECTED',
        message: 'Uzum Bank merchant connection not active',
        timestamp: new Date().toISOString(),
        amount: params.amount,
      };
    }

    return {
      success: true,
      transactionId: `TX-UZB-${Date.now()}`,
      uzumTransId: `UB-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'COMPLETED',
      message: 'Uzum Bank instant payment confirmed (Demo)',
      timestamp: new Date().toISOString(),
      amount: params.amount,
    };
  },

  async checkPayment(transactionId: string): Promise<{ status: 'COMPLETED'; code: number }> {
    await new Promise((r) => setTimeout(r, 300));
    return { status: 'COMPLETED', code: 200 };
  },

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 600));
    return { success: true };
  },
};
