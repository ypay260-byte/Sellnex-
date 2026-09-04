import { Storage } from './storage';
import { Order, OrderStatus, OrderTimelineEvent } from '../types';
import { telegramService } from './telegramService';

export const orderService = {
  getOrders(): Order[] {
    return Storage.getOrders();
  },

  getOrderById(id: string): Order | undefined {
    return Storage.getOrders().find((o) => o.id === id || o.orderNumber === id);
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>): Order {
    const orders = Storage.getOrders();
    const orderCount = orders.length + 1025;
    const orderNumber = `#SL-${orderCount}`;

    const initialTimeline: OrderTimelineEvent[] = [
      {
        status: 'Pending',
        timestamp: new Date().toISOString(),
        title: 'Order Created',
        description: `Customer placed order for ${orderData.items.length} item(s)`,
      },
    ];

    if (orderData.paymentStatus === 'Paid') {
      initialTimeline.push({
        status: 'Paid',
        timestamp: new Date().toISOString(),
        title: `Payment Verified (${orderData.paymentMethod})`,
        description: `Full payment of ${orderData.totalAmount.toLocaleString()} UZS verified.`,
      });
    }

    // Check automation settings
    const automation = Storage.getAutomation();
    let initialStatus: OrderStatus = orderData.paymentStatus === 'Paid' ? 'Paid' : 'Pending';

    if (automation.autoSupplierOrder && orderData.paymentStatus === 'Paid') {
      initialStatus = 'Supplier Ordered';
      initialTimeline.push({
        status: 'Supplier Ordered',
        timestamp: new Date().toISOString(),
        title: 'Auto-Supplier Dispatch',
        description: 'Sellnex dropship automation engine sent order fulfillment dispatch to supplier.',
      });
    }

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      orderStatus: initialStatus,
      timeline: initialTimeline,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    Storage.setOrders(orders);

    // Update customer stats
    this.syncCustomerFromOrder(newOrder);

    // Update product sales
    this.syncProductStockAndSales(newOrder);

    // Add notification
    const notifications = Storage.getNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Order Received',
      message: `${orderNumber} placed by ${newOrder.customerName} (${newOrder.totalAmount.toLocaleString()} UZS). Profit: ${newOrder.totalProfit.toLocaleString()} UZS`,
      type: 'order',
      read: false,
      timestamp: 'Just now',
      link: 'orders',
    });
    Storage.setNotifications(notifications);

    // Send Real Telegram Alert to merchant's bot
    const store = Storage.getStore();
    telegramService.sendNewOrderAlert(newOrder, store.name).catch((err) => {
      console.warn('Telegram notification failed:', err);
    });

    return newOrder;
  },

  updateOrderStatus(orderId: string, newStatus: OrderStatus, trackingNumber?: string): Order | null {
    const orders = Storage.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const newTimeline = [...order.timeline];

    let desc = `Status updated to ${newStatus}`;
    if (newStatus === 'Paid') desc = 'Payment confirmed and credited to seller account';
    if (newStatus === 'Supplier Ordered') desc = 'Dispatched to supplier warehouse for dropship fulfillment';
    if (newStatus === 'Shipped') desc = `Package handed to courier. Tracking: ${trackingNumber || order.trackingNumber || 'UZ-EXP-TASHKENT'}`;
    if (newStatus === 'Delivered') desc = 'Package successfully delivered to customer address';
    if (newStatus === 'Cancelled') desc = 'Order was cancelled and items returned to stock';

    newTimeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      title: `${newStatus} Status Update`,
      description: desc,
    });

    const updated: Order = {
      ...order,
      orderStatus: newStatus,
      trackingNumber: trackingNumber || order.trackingNumber,
      paymentStatus: newStatus === 'Delivered' || newStatus === 'Paid' || newStatus === 'Shipped' || newStatus === 'Supplier Ordered' ? 'Paid' : order.paymentStatus,
      timeline: newTimeline,
    };

    orders[index] = updated;
    Storage.setOrders(orders);
    return updated;
  },

  syncCustomerFromOrder(order: Order): void {
    const customers = Storage.getCustomers();
    const existingIndex = customers.findIndex(
      (c) => c.phone === order.customerPhone || (order.customerEmail && c.email === order.customerEmail)
    );

    if (existingIndex !== -1) {
      const existing = customers[existingIndex];
      customers[existingIndex] = {
        ...existing,
        ordersCount: existing.ordersCount + 1,
        totalSpent: existing.totalSpent + order.totalAmount,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: existing.ordersCount + 1 >= 3 ? 'VIP' : 'Active',
      };
    } else {
      customers.unshift({
        id: `cust-${Date.now()}`,
        storeId: order.storeId,
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        city: `${order.shippingAddress.region} (${order.shippingAddress.district})`,
        ordersCount: 1,
        totalSpent: order.totalAmount,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }

    Storage.setCustomers(customers);
  },

  syncProductStockAndSales(order: Order): void {
    const products = Storage.getProducts();
    for (const item of order.items) {
      const prodIndex = products.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = products[prodIndex];
        const nextStock = Math.max(0, prod.stock - item.quantity);
        products[prodIndex] = {
          ...prod,
          stock: nextStock,
          salesCount: (prod.salesCount || 0) + item.quantity,
          status: nextStock === 0 ? 'Out of stock' : prod.status,
        };
      }
    }
    Storage.setProducts(products);
  },
};
