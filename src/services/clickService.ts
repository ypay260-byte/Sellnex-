import { Storage } from './storage';

export interface ClickPaymentRequest {
  amount: number; // in UZS
  orderId: string;
  phone?: string;
  description?: string;
}

export interface ClickPaymentResponse {
  success: boolean;
  transactionId: string;
  clickTransId: string;
  status: 'SUCCESS' | 'WAITING' | 'ERROR';
  message: string;
  timestamp: string;
  amount: number;
}

export const clickService = {
  /**
   * Mock Click Payment Initialization & Processing
   * Ready for real Click Merchant API / Checkout integration
   */
  async createPayment(params: ClickPaymentRequest): Promise<ClickPaymentResponse> {
    const integrations = Storage.getIntegrations();
    const config = integrations.click;

    // Simulate Click API gateway latency
    await new Promise((r) => setTimeout(r, 1200));

    if (!config?.connected && !config?.testMode) {
      return {
        success: false,
        transactionId: `TX-FAIL-${Date.now()}`,
        clickTransId: '',
        status: 'ERROR',
        message: 'Click Merchant credentials not configured or disconnected',
        timestamp: new Date().toISOString(),
        amount: params.amount,
      };
    }

    return {
      success: true,
      transactionId: `TX-CLK-${Date.now()}`,
      clickTransId: `CK-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'SUCCESS',
      message: 'Demo Click Payment successfully confirmed via Uzbekistan National Payment Switch',
      timestamp: new Date().toISOString(),
      amount: params.amount,
    };
  },

  async checkPayment(transactionId: string): Promise<{ status: 'SUCCESS' | 'PENDING' | 'FAILED'; verified: boolean }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      status: 'SUCCESS',
      verified: true,
    };
  },

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId: string }> {
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      refundId: `RF-CLK-${Date.now()}`,
    };
  },
};
