import React, { useState } from 'react';
import { Order, Store, User, OrderStatus } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  RotateCcw,
  Truck,
  CreditCard,
  Calendar,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  stores: Store[];
  users: User[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  stores,
  users,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.id, s));

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const st = storeMap.get(o.storeId);
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(term)) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerPhone.toLowerCase().includes(term) ||
      (st && st.name.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return o.orderStatus === statusFilter;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'order',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Order management by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  const handleUpdateOrderStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      const oldStatus = selectedOrder.orderStatus;
      await firestoreService.updateOrder(selectedOrder.id, {
        orderStatus: newStatus,
        timeline: [
          ...(selectedOrder.timeline || []),
          {
            title: `Order status updated to ${newStatus} by Admin`,
            timestamp: new Date().toISOString(),
            description: `Modified by platform administrator (${adminEmail})`,
          },
        ],
      });

      await recordAudit('update_order_status', selectedOrder.id, { status: oldStatus }, { status: newStatus });
      showToast('Order Updated', `Status changed to ${newStatus}`, 'success');
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      await onRefresh();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Status Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID, buyer name, phone..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'Pending', label: 'Pending' },
              { id: 'Paid', label: 'Paid' },
              { id: 'Shipped', label: 'Shipped' },
              { id: 'Delivered', label: 'Delivered' },
              { id: 'Cancelled', label: 'Cancelled' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => onRefresh()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order</th>
                <th className="py-3.5 px-4 font-semibold">Store</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Items</th>
                <th className="py-3.5 px-4 font-semibold">Total & Method</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No orders match filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const st = storeMap.get(o.storeId);
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{o.orderNumber || o.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[130px]">
                          {st ? st.name : o.storeId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200">
                          {o.items?.length || 0} item(s)
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-400">{formatMoney(o.total)}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{o.paymentMethod || 'COD'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.orderStatus === 'Paid' || o.orderStatus === 'Delivered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : o.orderStatus === 'Pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Order {selectedOrder.orderNumber || selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">Created {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer Details & Destination */}
            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="text-white font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-white font-medium">{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping Address:</span>
                <span className="text-white font-medium text-right max-w-xs">{selectedOrder.shippingAddress || 'Tashkent, Uzbekistan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-rose-400 font-bold uppercase">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total GMV:</span>
                <span className="text-emerald-400 font-bold text-sm">{formatMoney(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Purchased Items
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60'}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <div className="text-white font-medium">{item.product?.title || 'Product Item'}</div>
                        <div className="text-slate-500 text-[10px]">Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}</div>
                      </div>
                    </div>
                    <span className="text-white font-bold">{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow & Payout Management */}
            {selectedOrder.escrowStatus && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>P2P Escrow Holati:</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      selectedOrder.escrowStatus === 'payout_released'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : selectedOrder.escrowStatus === 'delivery_submitted'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {selectedOrder.escrowStatus === 'delivery_submitted'
                      ? 'Sotuvchi Pulni Talab Qildi'
                      : selectedOrder.escrowStatus === 'payout_released'
                      ? 'Pul Sotuvchiga Tashlab Berildi'
                      : 'Kassada Saqlanmoqda'}
                  </span>
                </div>

                {selectedOrder.receiptTxNumber && (
                  <div className="text-[11px] text-slate-400">
                    Xaridor Chek / Tranzaksiya ID: <strong className="text-white font-mono">{selectedOrder.receiptTxNumber}</strong>
                  </div>
                )}

                {selectedOrder.deliveryProofNote && (
                  <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">Sotuvchi yetkazib berish izohi:</strong>
                    {selectedOrder.deliveryProofNote}
                  </div>
                )}

                {(selectedOrder.payoutCardNumber || storeMap.get(selectedOrder.storeId)?.sellerCardNumber) && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800 flex items-center justify-between">
                    <span>Sotuvchi Kartasi (Pul o‘tkazish uchun):</span>
                    <strong className="font-mono text-white text-xs">
                      {selectedOrder.payoutCardNumber || storeMap.get(selectedOrder.storeId)?.sellerCardNumber}
                    </strong>
                  </div>
                )}

                {selectedOrder.escrowStatus === 'delivery_submitted' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        const updated = {
                          ...selectedOrder,
                          escrowStatus: 'payout_released' as const,
                          orderStatus: 'Delivered' as const,
                          payoutReleasedAt: new Date().toISOString(),
                        };
                        await firestoreService.saveOrder(updated);
                        await firestoreService.createAuditLog({
                          adminEmail,
                          action: 'release_escrow_payout',
                          targetType: 'order',
                          targetId: selectedOrder.id,
                          oldValue: selectedOrder.escrowStatus,
                          newValue: 'payout_released',
                          details: `Escrow payout released to seller for order ${selectedOrder.orderNumber || selectedOrder.id}`,
                          userAgent: navigator.userAgent,
                        });
                        setSelectedOrder(updated);
                        showToast('Mablag‘ o‘tkazildi!', 'Sotuvchiga pul tashlab berilgani tasdiqlandi.', 'success');
                        await onRefresh();
                      } catch (err: any) {
                        showToast('Xatolik', err.message, 'error');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sotuvchiga Pulni Tashlab Berdim (Kassadan Yechish)</span>
                  </button>
                )}
              </div>
            )}

            {/* Admin Override Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Admin Status Override
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleUpdateOrderStatus('Paid')}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark as Paid
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleUpdateOrderStatus('Shipped')}
                  className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark Shipped
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleUpdateOrderStatus('Cancelled')}
                  className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel / Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
