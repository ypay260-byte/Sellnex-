import React, { useState, useEffect } from 'react';
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
  Eye,
  FileCheck,
  FileText,
  Clock,
  Check,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  stores: Store[];
  users: User[];
  adminEmail: string;
  adminUid?: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  stores,
  users,
  adminEmail,
  adminUid,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'confirm' | 'reject' | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [viewReceiptModal, setViewReceiptModal] = useState<{ url: string; fileName?: string; fileType?: string } | null>(
    null
  );

  // Maintain local orders state for immediate optimistic UI responsiveness
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Support Back button & browser back navigation
  useEffect(() => {
    const handleBack = (e: Event) => {
      if (viewReceiptModal) {
        setViewReceiptModal(null);
        e.preventDefault();
        return;
      }
      if (rejectModalOpen) {
        setRejectModalOpen(false);
        e.preventDefault();
        return;
      }
      if (selectedOrder) {
        setSelectedOrder(null);
        e.preventDefault();
        return;
      }
    };
    window.addEventListener('admin-back-pressed', handleBack);
    return () => window.removeEventListener('admin-back-pressed', handleBack);
  }, [viewReceiptModal, rejectModalOpen, selectedOrder]);

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.id, s));

  // Count how many orders have pending_verification
  const pendingVerificationCount = localOrders.filter((o) => o.paymentStatus === 'pending_verification').length;

  const filteredOrders = localOrders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const st = storeMap.get(o.storeId);
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(term)) ||
      (st && st.name.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending_verification') return o.paymentStatus === 'pending_verification';
    if (statusFilter === 'paid') return o.paymentStatus === 'paid' || o.paymentStatus === 'Paid';
    if (statusFilter === 'rejected') return o.paymentStatus === 'rejected';

    return o.orderStatus === statusFilter;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail: adminEmail || 'ypay260@gmail.com',
        action,
        targetType: 'order',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Order payment/status action by ${adminUid || adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  // ADMIN ACTION 1: CONFIRM PAYMENT
  const handleConfirmPayment = async (order: Order) => {
    if (processingOrderId) return;
    setProcessingOrderId(order.id);
    setProcessingAction('confirm');
    setIsProcessing(true);

    const targetUid = adminUid || 'admin_kamoliddin_5021';
    const targetEmail = adminEmail || 'ypay260@gmail.com';
    const nowIso = new Date().toISOString();

    // Optimistic immediate UI update
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              paymentStatus: 'paid',
              orderStatus: 'confirmed',
              verifiedBy: targetUid,
              adminEmail: targetEmail,
              verifiedAt: nowIso,
            }
          : o
      )
    );
    setSelectedOrder((prev) =>
      prev && prev.id === order.id
        ? {
            ...prev,
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            verifiedBy: targetUid,
            adminEmail: targetEmail,
            verifiedAt: nowIso,
          }
        : prev
    );

    try {
      await firestoreService.confirmOrderPayment(order.id, targetUid, targetEmail);
      await recordAudit(
        'confirm_order_payment',
        order.id,
        { paymentStatus: order.paymentStatus, orderStatus: order.orderStatus },
        { paymentStatus: 'paid', orderStatus: 'confirmed' }
      );

      showToast(
        'To‘lov tasdiqlandi',
        `Buyurtma ${order.orderNumber || order.id} to‘lovi muvaffaqiyatli tasdiqlandi va sotuvchiga yuborildi.`,
        'success'
      );

      await onRefresh();
    } catch (err: any) {
      console.error('Error confirming order payment:', err);
      showToast(
        'Amalni bajarib bo‘lmadi. Qayta urinib ko‘ring.',
        err?.message || 'Xatolik yuz berdi',
        'error'
      );
      await onRefresh();
    } finally {
      setIsProcessing(false);
      setProcessingOrderId(null);
      setProcessingAction(null);
    }
  };

  // ADMIN ACTION 2: REJECT PAYMENT
  const handleRejectPayment = async () => {
    if (!selectedOrder || processingOrderId) return;
    const targetOrder = selectedOrder;
    setProcessingOrderId(targetOrder.id);
    setProcessingAction('reject');
    setIsProcessing(true);

    const reason = rejectReason.trim() || 'To‘lov cheki tasdiqlanmadi';
    const targetUid = adminUid || 'admin_kamoliddin_5021';
    const targetEmail = adminEmail || 'ypay260@gmail.com';
    const nowIso = new Date().toISOString();

    // Optimistic immediate UI update
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id
          ? {
              ...o,
              paymentStatus: 'rejected',
              orderStatus: 'rejected',
              receiptRejectedReason: reason,
              verifiedBy: targetUid,
              adminEmail: targetEmail,
              verifiedAt: nowIso,
            }
          : o
      )
    );
    setSelectedOrder((prev) =>
      prev && prev.id === targetOrder.id
        ? {
            ...prev,
            paymentStatus: 'rejected',
            orderStatus: 'rejected',
            receiptRejectedReason: reason,
            verifiedBy: targetUid,
            adminEmail: targetEmail,
            verifiedAt: nowIso,
          }
        : prev
    );

    try {
      await firestoreService.rejectOrderPayment(targetOrder.id, reason, targetUid, targetEmail);
      await recordAudit(
        'reject_order_payment',
        targetOrder.id,
        { paymentStatus: targetOrder.paymentStatus },
        { paymentStatus: 'rejected', reason }
      );

      showToast(
        'To‘lov rad etildi',
        `Buyurtma ${targetOrder.orderNumber || targetOrder.id} to‘lovi rad etildi.`,
        'info'
      );

      setRejectModalOpen(false);
      setRejectReason('');
      await onRefresh();
    } catch (err: any) {
      console.error('Error rejecting order payment:', err);
      showToast(
        'Amalni bajarib bo‘lmadi. Qayta urinib ko‘ring.',
        err?.message || 'Xatolik yuz berdi',
        'error'
      );
      await onRefresh();
    } finally {
      setIsProcessing(false);
      setProcessingOrderId(null);
      setProcessingAction(null);
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
            status: newStatus,
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

  const formatAddress = (order: Order) => {
    const addr = order.deliveryAddress || order.shippingAddress;
    if (!addr) return 'Toshkent, O‘zbekiston';
    const parts = [
      addr.streetAddress || (addr as any).street || '',
      addr.district || (addr as any).city || '',
      addr.region || '',
      addr.zipCode ? `ZIP: ${addr.zipCode}` : '',
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Toshkent, O‘zbekiston';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Status Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buyurtma ID, mijoz, telefon..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {/* Filter for Pending Receipts */}
          <button
            onClick={() => setStatusFilter('pending_verification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'pending_verification'
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                : 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chek Tekshiruvda</span>
            {pendingVerificationCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {pendingVerificationCount}
              </span>
            )}
          </button>

          {(
            [
              { id: 'all', label: 'Barchasi' },
              { id: 'paid', label: 'To‘langan' },
              { id: 'rejected', label: 'Rad etilgan' },
              { id: 'Pending', label: 'Kutilmoqda' },
              { id: 'Shipped', label: 'Yuborildi' },
              { id: 'Delivered', label: 'Yetkazildi' },
              { id: 'Cancelled', label: 'Bekor' },
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
            title="Yangilash"
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
                <th className="py-3.5 px-4 font-semibold">Buyurtma</th>
                <th className="py-3.5 px-4 font-semibold">Do‘kon</th>
                <th className="py-3.5 px-4 font-semibold">Mijoz</th>
                <th className="py-3.5 px-4 font-semibold">Summa</th>
                <th className="py-3.5 px-4 font-semibold">To‘lov & Chek</th>
                <th className="py-3.5 px-4 font-semibold">Holat</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Buyurtmalar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const st = storeMap.get(o.storeId);
                  const isPendingCheck = o.paymentStatus === 'pending_verification';
                  const isPaidCheck = o.paymentStatus === 'paid' || o.paymentStatus === 'Paid';
                  const isRejectedCheck = o.paymentStatus === 'rejected';

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{o.orderNumber || o.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString('uz-UZ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[120px]">
                          {st ? st.name : o.storeId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-400">
                          {formatMoney(o.totalAmount || (o as any).total || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">{o.paymentMethod || 'Sellnex Card'}</div>
                      </td>

                      {/* Payment & Receipt Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {isPendingCheck && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>Chek Tekshiruvda</span>
                            </span>
                          )}
                          {isPaidCheck && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>To‘langan</span>
                            </span>
                          )}
                          {isRejectedCheck && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Rad etilgan</span>
                            </span>
                          )}
                          {!isPendingCheck && !isPaidCheck && !isRejectedCheck && (
                            <span className="text-[10px] text-slate-500">To‘lov kutilmoqda</span>
                          )}

                          {o.receiptUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewReceiptModal({
                                  url: o.receiptUrl!,
                                  fileName: o.receiptFileName,
                                  fileType: o.receiptFileType,
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 hover:underline pt-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Chekni ko‘rish</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.orderStatus === 'confirmed' || o.orderStatus === 'Paid' || o.orderStatus === 'Delivered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : o.orderStatus === 'Pending'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {isPendingCheck && (
                            <button
                              onClick={() => handleConfirmPayment(o)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              title="To‘lovni tasdiqlash"
                            >
                              {isProcessing && processingOrderId === o.id && processingAction === 'confirm' ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Tasdiqlanmoqda...</span>
                                </>
                              ) : (
                                <span>Tasdiqlash</span>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                          >
                            Ko‘rish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Ortga qaytish"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ortga</span>
                </button>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Buyurtma {selectedOrder.orderNumber || selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Yaratilgan: {new Date(selectedOrder.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RECEIPT SECTION (IF UPLOADED) */}
            {selectedOrder.receiptUrl ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white">Yuklangan To‘lov Cheki</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : selectedOrder.paymentStatus === 'pending_verification'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {selectedOrder.paymentStatus === 'paid'
                      ? 'Tasdiqlangan'
                      : selectedOrder.paymentStatus === 'pending_verification'
                      ? 'Tekshiruv kutilmoqda'
                      : 'Rad etilgan'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Thumbnail / Preview */}
                  <div
                    onClick={() =>
                      setViewReceiptModal({
                        url: selectedOrder.receiptUrl!,
                        fileName: selectedOrder.receiptFileName,
                        fileType: selectedOrder.receiptFileType,
                      })
                    }
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-900 aspect-video flex items-center justify-center"
                  >
                    {selectedOrder.receiptFileType?.includes('pdf') ? (
                      <div className="flex flex-col items-center gap-1.5 text-rose-400">
                        <FileText className="w-10 h-10" />
                        <span className="text-xs font-bold text-white">PDF Chek Hujjati</span>
                      </div>
                    ) : (
                      <img
                        src={selectedOrder.receiptUrl}
                        alt="Chek skrinshoti"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold">
                      <Eye className="w-4 h-4" />
                      <span>Kattalashtirish</span>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Fayl nomi:</span>
                      <strong className="text-white truncate block">
                        {selectedOrder.receiptFileName || 'payment_receipt.jpg'}
                      </strong>
                    </div>

                    {selectedOrder.receiptTxNumber && (
                      <div>
                        <span className="text-slate-500 block">Tranzaksiya / Chek kodi:</span>
                        <strong className="text-amber-300 font-mono">{selectedOrder.receiptTxNumber}</strong>
                      </div>
                    )}

                    {selectedOrder.receiptUploadedAt && (
                      <div>
                        <span className="text-slate-500 block">Yuklangan vaqt:</span>
                        <span className="text-slate-300">
                          {new Date(selectedOrder.receiptUploadedAt).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={selectedOrder.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Asl nusxani ochish</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* THE 2 MAIN ACTION BUTTONS: CONFIRM & REJECT PAYMENT */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={isProcessing || selectedOrder.paymentStatus === 'paid'}
                    onClick={() => handleConfirmPayment(selectedOrder)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing && processingOrderId === selectedOrder.id && processingAction === 'confirm' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Tasdiqlanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Payment (Tasdiqlash)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setRejectReason(selectedOrder.receiptRejectedReason || '');
                      setRejectModalOpen(true);
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing && processingOrderId === selectedOrder.id && processingAction === 'reject' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rad etilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Reject Payment (Rad etish)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1.5">
                <Clock className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-300">Ushbu buyurtmaga hali chek yuklanmagan</p>
                <p className="text-[11px] text-slate-500">
                  Mijoz Sellnex kartasiga to‘lov qilib chekni yuklashi kutilmoqda.
                </p>
              </div>
            )}

            {/* Buyer Details & Destination */}
            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Mijoz Ismi:</span>
                <span className="text-white font-bold">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telefon:</span>
                <span className="text-white font-mono font-medium">{selectedOrder.customerPhone}</span>
              </div>
              {selectedOrder.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Elektron pochta:</span>
                  <span className="text-slate-300">{selectedOrder.customerEmail}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Yetkazib berish manzili:</span>
                <span className="text-white font-medium text-right max-w-xs">{formatAddress(selectedOrder)}</span>
              </div>
              {selectedOrder.deliveryAddress?.notes && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Kuryer uchun izoh:</span>
                  <span className="text-amber-300 italic">{selectedOrder.deliveryAddress.notes}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-800/60">
                <span className="text-slate-500">To‘lov Usuli:</span>
                <span className="text-amber-400 font-bold uppercase">
                  {selectedOrder.paymentMethod || 'Sellnex Card'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jami Summa:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatMoney(selectedOrder.totalAmount || (selectedOrder as any).total || 0)}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Buyurtma Mahsulotlari ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60'}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-white font-medium">{item.title || 'Mahsulot'}</div>
                        <div className="text-slate-500 text-[10px]">
                          Soni: {item.quantity} {item.variant ? `(${item.variant})` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-white font-bold">
                      {formatMoney((item.price || item.sellingPrice || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* General Status Change */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Buyurtma Holati</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleUpdateOrderStatus('Shipped')}
                  className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Yuborildi (Shipped)
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleUpdateOrderStatus('Delivered')}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Yetkazildi (Delivered)
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleUpdateOrderStatus('Cancelled')}
                  className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT REASON MODAL */}
      {rejectModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  title="Ortga qaytish"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ortga</span>
                </button>
                <h4 className="font-black text-white text-sm flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>To‘lov Chekini Rad Etish</span>
                </h4>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Mijozga chek nima sababdan rad etilgani ko‘rsatiladi va qaytadan yangi chek yuklash imkoniyati beriladi.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Rad etish sababi:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masalan: Chek skrinshoti noaniq, summa yetarli emas yoki karta raqami mos kelmadi"
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder:text-slate-500 outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRejectPayment}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessing && processingAction === 'reject' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rad etilmoqda...</span>
                  </>
                ) : (
                  <span>Rad etishni tasdiqlash</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT LIGHTBOX MODAL */}
      {viewReceiptModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setViewReceiptModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center gap-4 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewReceiptModal(null)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  title="Ortga qaytish"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ortga</span>
                </button>
                <span className="font-bold text-sm text-white truncate max-w-md">
                  {viewReceiptModal.fileName || 'To‘lov Cheki'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewReceiptModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Yangi oynada</span>
                </a>
                <button
                  onClick={() => setViewReceiptModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl flex items-center justify-center w-full">
              {viewReceiptModal.fileType?.includes('pdf') ? (
                <iframe
                  src={viewReceiptModal.url}
                  title="Chek PDF"
                  className="w-full h-[600px] rounded-xl border border-slate-800"
                />
              ) : (
                <img
                  src={viewReceiptModal.url}
                  alt="Chek Skrinshoti"
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
