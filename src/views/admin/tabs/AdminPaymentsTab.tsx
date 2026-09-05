import React, { useState } from 'react';
import { P2PPayment, AdminSettings, DynamicPlan, User, PlanType, Order, Store } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  Eye,
  Sliders,
  Save,
  AlertTriangle,
  FileText,
  Calendar,
  X,
  Phone,
  Mail,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  FileCheck,
  ShoppingBag,
} from 'lucide-react';

interface AdminPaymentsTabProps {
  p2pPayments: P2PPayment[];
  settings: AdminSettings | null;
  plans: DynamicPlan[];
  users: User[];
  orders?: Order[];
  stores?: Store[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  p2pPayments,
  settings,
  plans,
  users,
  orders = [],
  stores = [],
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  // Main Subtab
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'subscriptions' | 'card_setup'>('orders');

  // Subscriptions filter & state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<P2PPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  // Orders verification state
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending_verification' | 'paid' | 'rejected'>(
    'pending_verification'
  );
  const [orderSearch, setOrderSearch] = useState('');
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [orderRejectReason, setOrderRejectReason] = useState('');

  // P2P Card Settings Config State
  const [cardNumber, setCardNumber] = useState(settings?.p2pCardNumber || '8600 3141 7549 7736');
  const [cardHolder, setCardHolder] = useState(settings?.p2pCardHolder || 'Sellnex Bosh Administratsiyasi');
  const [bankName, setBankName] = useState(settings?.p2pBankName || 'Milliy Bank / Uzcard Humo');
  const [instructions, setInstructions] = useState(
    settings?.p2pInstructions || 'Iltimos, kartaga toʻlov qiling va chek skrinshotini yuklang. Admin 15 daqiqada tasdiqlaydi.'
  );

  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'pending_verification').length;
  const pendingSubsCount = p2pPayments.filter((p) => p.status === 'pending').length;

  const filteredPayments = p2pPayments.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const filteredOrders = orders.filter((o) => {
    const term = orderSearch.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending_verification') return o.paymentStatus === 'pending_verification';
    if (orderFilter === 'paid') return o.paymentStatus === 'paid' || o.paymentStatus === 'Paid';
    if (orderFilter === 'rejected') return o.paymentStatus === 'rejected';
    return true;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'p2p_payment',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Payment action by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  // 1. ORDER PAYMENT: CONFIRM
  const handleConfirmOrderPayment = async (order: Order) => {
    setIsProcessing(true);
    try {
      await firestoreService.confirmOrderPayment(order.id, adminEmail);
      await recordAudit(
        'confirm_order_payment',
        order.id,
        { paymentStatus: order.paymentStatus },
        { paymentStatus: 'paid', orderStatus: 'confirmed' }
      );
      showToast('To‘lov Tasdiqlandi', `Buyurtma ${order.orderNumber} to‘lovi muvaffaqiyatli tasdiqlandi.`, 'success');
      await onRefresh();
    } catch (err: any) {
      showToast('Tasdiqlashda xatolik', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. ORDER PAYMENT: REJECT
  const handleRejectOrderPayment = async () => {
    if (!rejectOrderModal) return;
    setIsProcessing(true);
    try {
      const reason = orderRejectReason.trim() || 'To‘lov cheki tasdiqlanmadi';
      await firestoreService.rejectOrderPayment(rejectOrderModal.id, reason, adminEmail);
      await recordAudit(
        'reject_order_payment',
        rejectOrderModal.id,
        { paymentStatus: rejectOrderModal.paymentStatus },
        { paymentStatus: 'rejected', reason }
      );
      showToast('To‘lov Rad Etildi', `Buyurtma ${rejectOrderModal.orderNumber} to‘lovi rad etildi.`, 'info');
      setRejectOrderModal(null);
      setOrderRejectReason('');
      await onRefresh();
    } catch (err: any) {
      showToast('Rad etishda xatolik', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve Subscription Payment -> Automatically activate subscription
  const handleApprovePayment = async (payment: P2PPayment) => {
    setIsProcessing(true);
    try {
      await firestoreService.updateP2PPayment(payment.id, {
        status: 'approved',
        approvedBy: adminEmail,
        approvedAt: new Date().toISOString(),
      });

      let targetUserId = payment.userId;
      const user = users.find((u) => u.id === payment.userId || u.email === payment.userEmail);
      if (user) {
        targetUserId = user.id;
      }

      const targetPlan: PlanType = (payment.planRequested as PlanType) || 'full';
      const currentExp = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).getTime() : Date.now();
      const durationDays = payment.durationMonths ? payment.durationMonths * 30 : 30;
      const newExpiry = new Date(Math.max(Date.now(), currentExp) + durationDays * 24 * 60 * 60 * 1000).toISOString();

      if (targetUserId) {
        await firestoreService.updateUser(targetUserId, {
          plan: targetPlan,
          subscriptionExpiresAt: newExpiry,
          status: 'active',
        });
      }

      await recordAudit(
        'approve_p2p_payment',
        payment.id,
        { status: 'pending' },
        { status: 'approved', plan: payment.planRequested }
      );
      showToast('To‘lov Tasdiqlandi', `Obuna faollashtirildi: ${payment.userEmail}`, 'success');
      setSelectedPayment(null);
      await onRefresh();
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject Subscription Payment
  const handleRejectPayment = async (payment: P2PPayment) => {
    setIsProcessing(true);
    try {
      await firestoreService.updateP2PPayment(payment.id, {
        status: 'rejected',
        rejectionReason: rejectReason || 'Check verification failed',
        approvedBy: adminEmail,
        approvedAt: new Date().toISOString(),
      });

      await recordAudit('reject_p2p_payment', payment.id, { status: 'pending' }, { status: 'rejected', reason: rejectReason });
      showToast('Payment Rejected', 'Status marked as rejected', 'info');
      setSelectedPayment(null);
      setRejectReason('');
      await onRefresh();
    } catch (err: any) {
      showToast('Rejection Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Card Setup Settings
  const handleSaveCardSettings = async () => {
    setIsProcessing(true);
    try {
      await firestoreService.saveAdminSettings({
        p2pCardNumber: cardNumber.trim(),
        p2pCardHolder: cardHolder.trim(),
        p2pBankName: bankName.trim(),
        p2pInstructions: instructions.trim(),
      });
      await recordAudit(
        'update_admin_p2p_settings',
        'global_settings',
        null,
        { cardNumber, cardHolder, bankName }
      );
      showToast('Karta Sozlamalari Saqlandi', 'Mijozlar va sotuvchilar ushbu kartani ko‘rishadi.', 'success');
    } catch (err: any) {
      showToast('Saqlashda xatolik', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subtab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buyurtma To‘lov Cheklari</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('subscriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'subscriptions'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Sotuvchi Obunalari</span>
          {pendingSubsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
              {pendingSubsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('card_setup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'card_setup'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Karta Sozlamalari</span>
        </button>

        <button
          onClick={() => onRefresh()}
          className="ml-auto p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. STORE ORDERS PAYMENT RECEIPTS SUBTAB */}
      {/* ======================================================== */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Buyurtma ID, mijoz ismi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'pending_verification' as const, label: 'Tekshiruv kutilmoqda' },
                { id: 'all' as const, label: 'Barchasi' },
                { id: 'paid' as const, label: 'Tasdiqlangan' },
                { id: 'rejected' as const, label: 'Rad etilgan' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    orderFilter === f.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                Ushbu filtr bo‘yicha to‘lov cheklari topilmadi.
              </div>
            ) : (
              filteredOrders.map((o) => {
                const isPending = o.paymentStatus === 'pending_verification';
                const isPaid = o.paymentStatus === 'paid' || o.paymentStatus === 'Paid';
                const isRejected = o.paymentStatus === 'rejected';

                return (
                  <div
                    key={o.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{o.orderNumber || o.id}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPaid
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isPending
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : isRejected
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isPaid ? 'To‘langan' : isPending ? 'Chek tekshiruvda' : isRejected ? 'Rad etilgan' : 'Kutilmoqda'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>
                          Mijoz: <strong className="text-white">{o.customerName}</strong> ({o.customerPhone})
                        </span>
                        <span>
                          Do‘kon:{' '}
                          <strong className="text-cyan-300 font-semibold">
                            {stores.find((s) => s.id === o.storeId || s.slug === o.storeId)?.name || o.storeId || 'Sellnex Do‘koni'}
                          </strong>
                        </span>
                        <span>
                          Summa:{' '}
                          <strong className="text-emerald-400">
                            {formatMoney(o.totalAmount || (o as any).total || 0)}
                          </strong>
                        </span>
                        <span>Sana: {new Date(o.createdAt).toLocaleString('uz-UZ')}</span>
                        {o.receiptTxNumber && (
                          <span>
                            Tranzaksiya ID: <strong className="text-amber-300 font-mono">{o.receiptTxNumber}</strong>
                          </span>
                        )}
                      </div>

                      {/* Delivery address snippet */}
                      <p className="text-[11px] text-slate-500">
                        Manzil: {o.deliveryAddress?.region || o.shippingAddress?.region},{' '}
                        {o.deliveryAddress?.district || o.shippingAddress?.district},{' '}
                        {o.deliveryAddress?.streetAddress || o.shippingAddress?.streetAddress}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {o.receiptUrl && (
                        <button
                          type="button"
                          onClick={() => setViewScreenshot(o.receiptUrl!)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chekni Ko‘rish</span>
                        </button>
                      )}

                      {/* Confirm Payment Button */}
                      <button
                        type="button"
                        disabled={isProcessing || isPaid}
                        onClick={() => handleConfirmOrderPayment(o)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Payment</span>
                      </button>

                      {/* Reject Payment Button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setRejectOrderModal(o);
                          setOrderRejectReason(o.receiptRejectedReason || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SELLER SUBSCRIPTION PAYMENTS SUBTAB */}
      {/* ======================================================== */}
      {activeSubTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            {(['pending', 'all', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                No subscription payments match the current filter.
              </div>
            ) : (
              filteredPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{pay.userEmail}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pay.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : pay.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        Plan: <strong className="text-rose-400 uppercase">{pay.planRequested}</strong>
                      </span>
                      <span>
                        Amount: <strong className="text-emerald-400">{formatMoney(pay.amount)}</strong>
                      </span>
                      <span>Sender: {pay.senderName || 'Anonymous'}</span>
                      <span>Date: {new Date(pay.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {pay.screenshotUrl && (
                      <button
                        onClick={() => setViewScreenshot(pay.screenshotUrl)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    )}

                    {pay.status === 'pending' && (
                      <>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleApprovePayment(pay)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => setSelectedPayment(pay)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SELLNEX CARD CONFIGURATION SUBTAB */}
      {/* ======================================================== */}
      {activeSubTab === 'card_setup' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Sellnex Plastik Karta Sozlamalari</span>
            </h3>
            <span className="text-xs text-slate-400">Checkout & Obuna uchun</span>
          </div>

          <p className="text-xs text-slate-300">
            Ushbu bank karta ma’lumotlari Sellnex xaridori checkout’da “Sellnex Plastik Karta To‘lovi”ni tanlaganda
            hamda sotuvchilar tarif sotib olayotganda avtomatik ravishda ko‘rsatiladi.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Karta Raqami (Uzcard / Humo) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="8600 3141 7549 7736"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Karta Egasi (F.I.Sh. yoki Tashkilot) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Sellnex Bosh Administratsiyasi"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-3 text-white text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Bank Nomi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Milliy Bank / Uzcard Humo"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-3 text-white text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Ko‘rsatma Matni</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-3 text-white text-xs outline-hidden"
              />
            </div>

            <button
              disabled={isProcessing}
              onClick={handleSaveCardSettings}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Karta Sozlamalarini Saqlash</span>
            </button>
          </div>
        </div>
      )}

      {/* REJECT ORDER MODAL */}
      {rejectOrderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">To‘lov Chekini Rad Etish</h4>
              <button onClick={() => setRejectOrderModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Buyurtma <strong>{rejectOrderModal.orderNumber}</strong> uchun to‘lov chekini rad etish sababini yozing:
            </p>
            <textarea
              value={orderRejectReason}
              onChange={(e) => setOrderRejectReason(e.target.value)}
              placeholder="Masalan: Chek skrinshoti xira yoki summa to‘liq emas"
              className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectOrderModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectOrderPayment}
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX */}
      {viewScreenshot && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setViewScreenshot(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white">To‘lov Cheki Skrinshoti</span>
              <button onClick={() => setViewScreenshot(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {viewScreenshot.includes('pdf') ? (
              <iframe src={viewScreenshot} title="PDF" className="w-full h-[600px] rounded-xl" />
            ) : (
              <img src={viewScreenshot} alt="Receipt" className="max-h-[75vh] w-auto object-contain rounded-xl mx-auto" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
