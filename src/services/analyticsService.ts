import { Storage } from './storage';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  profitMarginPercent: number;
  visitorsCount: number;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface TrafficSource {
  channel: string;
  sharePercent: number;
  visitors: number;
  revenue: number;
  iconColor: string;
}

export interface RegionalStat {
  region: string;
  sales: number;
  orders: number;
}

export const analyticsService = {
  getSummary(): AnalyticsSummary {
    const orders = Storage.getOrders();
    const products = Storage.getProducts();
    const customers = Storage.getCustomers();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);
    const totalProfit = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalProfit : 0), 0);
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
    const totalOrders = orders.length;

    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
    const profitMarginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
    const visitorsCount = 4280;
    const conversionRate = visitorsCount > 0 ? Number(((totalOrders / visitorsCount) * 100).toFixed(1)) : 2.8;

    return {
      totalRevenue,
      totalOrders,
      totalProfit,
      totalCustomers: customers.length,
      totalProducts: products.length,
      averageOrderValue,
      conversionRate,
      profitMarginPercent,
      visitorsCount,
    };
  },

  getTimelineData(): ChartDataPoint[] {
    return [
      { label: 'Mon', revenue: 1450000, profit: 390000, orders: 4 },
      { label: 'Tue', revenue: 2100000, profit: 540000, orders: 6 },
      { label: 'Wed', revenue: 1850000, profit: 460000, orders: 5 },
      { label: 'Thu', revenue: 3200000, profit: 890000, orders: 9 },
      { label: 'Fri', revenue: 4100000, profit: 1120000, orders: 12 },
      { label: 'Sat', revenue: 5400000, profit: 1450000, orders: 16 },
      { label: 'Sun', revenue: 3800000, profit: 980000, orders: 11 },
    ];
  },

  getTrafficSources(): TrafficSource[] {
    return [
      { channel: 'Telegram Channels & Bots', sharePercent: 38, visitors: 1620, revenue: 6450000, iconColor: '#229ED9' },
      { channel: 'Instagram Reels & Stories', sharePercent: 32, visitors: 1370, revenue: 4890000, iconColor: '#E1306C' },
      { channel: 'TikTok Shop / Videos', sharePercent: 18, visitors: 770, revenue: 2850000, iconColor: '#000000' },
      { channel: 'Direct / Storefront Link', sharePercent: 8, visitors: 340, revenue: 1200000, iconColor: '#10B981' },
      { channel: 'Uzum & Search', sharePercent: 4, visitors: 180, revenue: 620000, iconColor: '#7C3AED' },
    ];
  },

  getRegionalStats(): RegionalStat[] {
    return [
      { region: 'Tashkent City & Region', sales: 9450000, orders: 28 },
      { region: 'Samarkand', sales: 4200000, orders: 14 },
      { region: 'Fergana Valley (Fergana, Andijan, Namangan)', sales: 5100000, orders: 17 },
      { region: 'Bukhara', sales: 2400000, orders: 8 },
      { region: 'Kashkadarya & Surkhandarya', sales: 1650000, orders: 5 },
      { region: 'Other Regions & Karakalpakstan', sales: 1100000, orders: 4 },
    ];
  },
};
