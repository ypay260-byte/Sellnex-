import { Storage } from './storage';
import { Product } from '../types';

export interface UzumMarketItem {
  skuId: string;
  title: string;
  stock: number;
  price: number;
  category: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export const uzumService = {
  async connectAccount(apiKey: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 1000));
    const integrations = Storage.getIntegrations();
    integrations.uzum_market = {
      service: 'uzum_market',
      connected: true,
      apiKey: apiKey || 'uzum_mock_seller_token',
      testMode: true,
      connectedAt: new Date().toISOString().split('T')[0],
    };
    Storage.setIntegrations(integrations);
    return { success: true, message: 'Uzum Market seller store connected successfully' };
  },

  async syncInventory(): Promise<{ success: boolean; syncedItemsCount: number; timestamp: string }> {
    await new Promise((r) => setTimeout(r, 1200));
    const products = Storage.getProducts();
    return {
      success: true,
      syncedItemsCount: products.length,
      timestamp: new Date().toISOString(),
    };
  },

  async syncOrders(): Promise<{ success: boolean; importedOrdersCount: number }> {
    await new Promise((r) => setTimeout(r, 1000));
    return {
      success: true,
      importedOrdersCount: 2,
    };
  },

  async exportOrder(orderId: string): Promise<{ success: boolean; uzumFulfillmentId: string }> {
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      uzumFulfillmentId: `UZUM-FUL-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  },

  async importProductsFromUzum(): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 1500));
    return Storage.getProducts().filter((p) => p.supplier === 'Uzum Market');
  },
};
