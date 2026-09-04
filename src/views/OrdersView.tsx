import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { firestoreService } from '../services/firestoreService';
import { BackHeader } from '../components/common/BackHeader';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  RotateCw,
  X,
  CreditCard,
  User,
  MapPin,
  Bot,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Lock,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, store, updateOrderStatus, formatMoney, showToast, navigateTo, refreshOrders } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // Escrow Payout Request form states
  const [proofNote, setProofNote] = useState('');
  const [payoutCard, setPayoutCard] = useState(store?.sellerCardNumber || '');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const statuses: ('All' | OrderStatus)[] = [
    'All',
    'Pending',
    'Paid',
    'Processing',
    'Supplier Ordered',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleRequestDeliveryPayout = async (order: Order) => {
    if (!payoutCard.trim()) {
      showToast('Karta kiritilmadi', 'Iltimos, pulni qabul qilish uchun karta raqamingizni kiriting.', 'warning');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const updatedTimeline = [
        ...(order.timeline || []),
        {
          status: 'Delivered' as OrderStatus,
          timestamp: new Date().toISOString(),
          title: 'Yetkazib berildi & To‘lov so‘rovi yuborildi',
          description: `Sotuvchi mahsulot topshirilganligini tasdiqladi. Karta: ${payoutCard}. Izoh: ${proofNote || 'Topshirildi'}. Administratsiyadan pulni o‘tkazib berish so‘ralmoqda.`,
        },
      ];

      const updatedOrder: Order = {
        ...order,
        orderStatus: 'Delivered',
        escrowStatus: 'delivery_submitted',
        deliveryProofNote: proofNote.trim() || 'Mahsulot yetkazib berildi',
        payoutCardNumber: payoutCard.trim(),
        deliverySubmittedAt: new Date().toISOString(),
        timeline: updatedTimeline,
      };

      await firestoreService.saveOrder(updatedOrder);
      setSelectedOrder(updatedOrder);
      showToast(
        'So‘rov Yuborildi!',
        `Buyurtma (${order.orderNumber}) topshirildi deb belgilandi. Administratsiya tekshirib ${formatMoney(order.totalAmount)} miqdoridagi mablag‘ni kartangizga o‘tkazadi.`,
        'success'
      );
      if (refreshOrders) {
        await refreshOrders();
      }
    } catch (err: any) {
      showToast('Xatolik yuz berdi', err.message, 'error');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Supplier Ordered':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold';
      case 'Shipped':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
    showToast('Status Updated', `Order status changed to "${newStatus}"`, 'success');
  };

  return (
    <div id="orders-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Order Management"
        subtitle="Track customer payments, automated supplier fulfillment, and courier deliveries."
        fallbackRoute="dashboard"
        rightElement={
          <button
            id="orders-view-automation"
            onClick={() => navigateTo('automation')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <Bot className="w-4 h-4" />
            <span>Dropship Automation Rules</span>
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              key={s}
              id={`filter-order-${s.replace(/\s+/g, '')}`}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s} {s === 'All' ? `(${orders.length})` : `(${orders.filter((o) => o.orderStatus === s).length})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="orders-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID (e.g. SL-1024), customer name, or phone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-800">No orders matching this filter</p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Product / Items</th>
                    <th className="py-3.5 px-3">Amount</th>
                    <th className="py-3.5 px-3">Payment</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Net Profit</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{order.createdAt.split('T')[0]}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                      </td>

                      <td className="py-3.5 px-3 max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          {order.items[0]?.image && (
                            <img src={order.items[0].image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{order.items[0]?.title}</p>
                            {order.items.length > 1 && (
                              <span className="text-[10px] text-slate-400">+{order.items.length - 1} more item</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-extrabold text-slate-900">
                        {formatMoney(order.totalAmount)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          id={`order-status-select-${order.id}`}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-hidden cursor-pointer ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {statuses
                            .filter((s) => s !== 'All')
                            .map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-emerald-600">
                        +{formatMoney(order.totalProfit)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`order-view-details-${order.id}`}
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs transition-colors min-h-[36px]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-based View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{order.createdAt.split('T')[0]}</span>
                    </div>
                    <select
                      id={`mobile-order-status-select-${order.id}`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-hidden cursor-pointer ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {statuses
                        .filter((s) => s !== 'All')
                        .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-start gap-3">
                    {order.items[0]?.image && (
                      <img src={order.items[0].image} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{order.items[0]?.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Customer: <span className="font-semibold text-slate-800">{order.customerName}</span> ({order.customerPhone})
                      </p>
                      {order.items.length > 1 && (
                        <span className="text-[10px] text-blue-600 font-medium">+{order.items.length - 1} additional item(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total / Profit</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{formatMoney(order.totalAmount)}</span>
                        <span className="text-emerald-600 font-bold text-[11px]">(+{formatMoney(order.totalProfit)})</span>
                      </div>
                    </div>

                    <button
                      id={`mobile-order-view-details-${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors min-h-[40px]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Slide-over Modal */}
      {selectedOrder && (
        <div id="order-details-drawer" className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Details</span>
                <h3 className="text-lg font-black text-slate-900 font-mono">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-600">
              {/* Status advancement bar */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Dropship Fulfillment Engine</span>
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span>Current Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {(['Paid', 'Supplier Ordered', 'Shipped', 'Delivered'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        selectedOrder.orderStatus === st
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Advance to: {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Customer Info</span>
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                  <p>Phone: {selectedOrder.customerPhone}</p>
                  <p>Email: {selectedOrder.customerEmail}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Delivery Address</span>
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                  <p className="font-semibold text-slate-900">{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region}</p>
                  {selectedOrder.shippingAddress.notes && (
                    <p className="text-slate-400 italic">Notes: {selectedOrder.shippingAddress.notes}</p>
                  )}
                  <p className="text-blue-600 font-mono pt-1">Tracking Code: {selectedOrder.trackingNumber}</p>
                </div>
              </div>

              {/* Purchased Products */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Items Ordered</span>
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Supplier: {item.supplier} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{formatMoney(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 bg-slate-100 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span>Gross Customer Paid:</span>
                  <span className="font-bold text-slate-900">{formatMoney(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Supplier Cost + Logistics:</span>
                  <span>-{formatMoney(selectedOrder.totalSupplierCost)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-emerald-700 text-sm">
                  <span>Your Net Seller Profit:</span>
                  <span>+{formatMoney(selectedOrder.totalProfit)}</span>
                </div>
              </div>

              {/* Escrow P2P Status & Delivery Payout Claim */}
              {selectedOrder.paymentMethod === 'P2P Card Transfer' && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Admin P2P Escrow Hisobi</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedOrder.escrowStatus === 'payout_released'
                          ? 'bg-emerald-200 text-emerald-900'
                          : selectedOrder.escrowStatus === 'delivery_submitted'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {selectedOrder.escrowStatus === 'payout_released'
                        ? 'Pul kartangizga o‘tkazildi'
                        : selectedOrder.escrowStatus === 'delivery_submitted'
                        ? 'Admin ko‘rib chiqmoqda'
                        : 'Mablag‘ kafolatlangan (Escrow)'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    {selectedOrder.escrowStatus === 'payout_released'
                      ? 'Administratsiya ushbu buyurtma uchun to‘lovni sizning kartangizga to‘liq o‘tkazib bergan.'
                      : selectedOrder.escrowStatus === 'delivery_submitted'
                      ? 'Siz mahsulot topshirilgani haqida so‘rov bergansiz. Administratsiya tekshirib kartangizga pulni tashlab beradi.'
                      : 'Mijoz to‘lagan pul Bosh Administratsiya kartasida xavfsiz saqlanmoqda. Mahsulotni yetkazib bergach quyidagi tugma orqali pulni so‘rang.'}
                  </p>

                  {selectedOrder.escrowStatus !== 'payout_released' && selectedOrder.escrowStatus !== 'delivery_submitted' && (
                    <div className="space-y-2 pt-2 border-t border-emerald-200">
                      <label className="block text-[11px] font-bold text-emerald-950">
                        Yetkazib berish tasdiq kodi / izoh (masalan: kuryer cheki yoki xaridor qabul qildi)
                      </label>
                      <input
                        type="text"
                        value={proofNote}
                        onChange={(e) => setProofNote(e.target.value)}
                        placeholder="Masalan: Mahsulot topshirildi, kuryer kodi #748"
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs outline-none"
                      />
                      <button
                        type="button"
                        disabled={isSubmittingPayout}
                        onClick={async () => {
                          setIsSubmittingPayout(true);
                          try {
                            const updatedOrder: Order = {
                              ...selectedOrder,
                              escrowStatus: 'delivery_submitted',
                              deliveryProofNote: proofNote.trim() || 'Sotuvchi mahsulot topshirilganini tasdiqladi',
                              deliverySubmittedAt: new Date().toISOString(),
                              orderStatus: 'Delivered',
                            };
                            await updateOrderStatus(selectedOrder.id, 'Delivered');
                            setSelectedOrder(updatedOrder);
                            showToast(
                              'So‘rov yuborildi!',
                              'Mahsulot topshirilgani haqidagi so‘rov Administratsiyaga yetkazildi. Tez orada pulingiz o‘tkaziladi.',
                              'success'
                            );
                          } catch (err: any) {
                            showToast('Xatolik', err.message, 'error');
                          } finally {
                            setIsSubmittingPayout(false);
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mahsulot Topshirildi — Administratsiyadan Pulni So‘rash</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
