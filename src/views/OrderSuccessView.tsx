import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  MapPin,
  Clock,
  RotateCw,
  Store as StoreIcon,
} from 'lucide-react';

export const OrderSuccessView: React.FC = () => {
  const { store, orders, routeParams, navigateTo, formatMoney } = useApp();

  const orderId = routeParams.orderId;
  const order = orders.find((o) => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">No recent order found</p>
          <button
            onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Go to Store
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = store.primaryColor || '#2563eb';

  return (
    <div id="order-success-root" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment & Order Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Order <strong className="text-slate-900 font-mono">{order.orderNumber}</strong> has been received and routed to our automated dropshipping supplier.
            </p>
          </div>

          {/* Fulfillment Stepper */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Live Fulfillment Timeline
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                  ✓
                </div>
                <p className="font-bold text-slate-900 text-[11px]">Placed</p>
                <p className="text-[10px] text-slate-400">Just now</p>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                  ✓
                </div>
                <p className="font-bold text-slate-900 text-[11px]">{order.paymentMethod}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Approved</p>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto text-xs font-bold animate-pulse">
                  <Package className="w-4 h-4" />
                </div>
                <p className="font-bold text-blue-700 text-[11px]">Supplier</p>
                <p className="text-[10px] text-blue-600 font-medium">Packing</p>
              </div>

              <div className="space-y-1 opacity-50">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xs font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-700 text-[11px]">Courier</p>
                <p className="text-[10px] text-slate-400">Next</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Receipt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-slate-400">Order Number</p>
              <p className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Estimated Delivery</p>
              <p className="font-bold text-slate-900 text-sm">24 – 48 Hours</p>
            </div>
          </div>

          {/* Shipping & Payment summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Shipping Address</span>
              </p>
              <p className="text-slate-700 font-medium">{order.customerName}</p>
              <p className="text-slate-500">{order.shippingAddress.street}</p>
              <p className="text-slate-500">{order.shippingAddress.city}, {order.shippingAddress.region}</p>
              <p className="text-slate-500">{order.customerPhone}</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment & Shipping</span>
              </p>
              <p className="text-slate-700 font-medium">Method: {order.paymentMethod}</p>
              <p className="text-emerald-600 font-semibold">Payment Status: Paid</p>
              <p className="text-slate-500">Tracking: {order.trackingNumber}</p>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="font-bold text-slate-800">Purchased Items</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.image && (
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant}` : ''}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatMoney(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-1.5 text-slate-600">
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Paid:</span>
              <span className="text-blue-600 font-extrabold">{formatMoney(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="success-continue-shopping"
            onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-800 shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping at {store.name}</span>
          </button>

          <button
            id="success-view-in-seller-dashboard"
            onClick={() => navigateTo('orders')}
            className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
          >
            <StoreIcon className="w-4 h-4" />
            <span>View Order in Seller Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
