import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  QrCode,
  Upload,
  Trash2,
  Download,
} from 'lucide-react';
import { downloadPaynetQrImage } from '../../../utils/qrDownload';

interface AdminPaymentsTabProps {
  p2pPayments: P2PPayment[];
  settings: AdminSettings | null;
  plans: DynamicPlan[];
  users: User[];
  orders?: Order[];
  stores?: Store[];
  adminEmail: string;
  adminUid?: string;
  onRefresh: (forceServer?: boolean) => Promise<void>;
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
  adminUid,
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
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'confirm' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  // Orders verification state
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending_verification' | 'paid' | 'rejected'>(
    'pending_verification'
  );
  const [orderSearch, setOrderSearch] = useState('');
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [orderRejectReason, setOrderRejectReason] = useState('');

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Handle back button event
  useEffect(() => {
    const handleBack = (e: Event) => {
      if (viewScreenshot) {
        setViewScreenshot(null);
        e.preventDefault();
        return;
      }
      if (rejectOrderModal) {
        setRejectOrderModal(null);
        e.preventDefault();
        return;
      }
      if (selectedPayment) {
        setSelectedPayment(null);
        e.preventDefault();
        return;
      }
    };
    window.addEventListener('admin-back-pressed', handleBack);
    return () => window.removeEventListener('admin-back-pressed', handleBack);
  }, [viewScreenshot, rejectOrderModal, selectedPayment]);

  // P2P Card Settings Config State
  const [cardNumber, setCardNumber] = useState(settings?.p2pCardNumber || '8600 3141 7549 7736');
  const [cardHolder, setCardHolder] = useState(settings?.p2pCardHolder || 'Sellnex Bosh Administratsiyasi');
  const [bankName, setBankName] = useState(settings?.p2pBankName || 'Milliy Bank / Uzcard Humo');
  const [paynetQrCodeUrl, setPaynetQrCodeUrl] = useState(settings?.paynetQrCodeUrl || '');
  const [instructions, setInstructions] = useState(
    settings?.p2pInstructions || 'Iltimos, kartaga toʻlov qiling va chek skrinshotini yuklang. Admin 15 daqiqada tasdiqlaydi.'
  );

  // Sync settings when loaded from Firestore
  useEffect(() => {
    if (settings) {
      if (settings.p2pCardNumber) setCardNumber(settings.p2pCardNumber);
      if (settings.p2pCardHolder) setCardHolder(settings.p2pCardHolder);
      if (settings.p2pBankName) setBankName(settings.p2pBankName);
      if (settings.paynetQrCodeUrl !== undefined) setPaynetQrCodeUrl(settings.paynetQrCodeUrl);
      if (settings.p2pInstructions) setInstructions(settings.p2pInstructions);
    }
  }, [settings]);

  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Fayl juda katta', 'Iltimos, 8MB dan kichik rasm tanlang', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setPaynetQrCodeUrl(dataUrl);
        showToast('QR rasm yuklandi', 'Skrinshot muvaffaqiyatli tanlandi. Saqlash tugmasini bosing.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const pendingOrdersCount = localOrders.filter((o) => o.paymentStatus === 'pending_verification').length;
  const pendingSubsCount = p2pPayments.filter((p) => p.status === 'pending').length;

  const filteredPayments = p2pPayments.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const filteredOrders = localOrders.filter((o) => {
    const term = orderSearch.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending_verification') {
      return (
        o.paymentStatus === 'pending_verification' ||
        o.paymentStatus === 'pending' ||
        o.paymentStatus === 'pending_payment_verification' ||
        o.orderStatus === 'pending_payment_verification' ||
        o.orderStatus === 'Pending'
      );
    }
    if (orderFilter === 'paid') return o.paymentStatus === 'paid' || o.paymentStatus === 'Paid';
    if (orderFilter === 'rejected') return o.paymentStatus === 'rejected';
    return true;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail: adminEmail || 'ypay260@gmail.com',
        action,
        targetType: 'p2p_payment',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Payment action by ${adminUid || adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  // 1. ORDER PAYMENT: CONFIRM
  const handleConfirmOrderPayment = async (order: Order) => {
    if (processingOrderId) return;
    setProcessingOrderId(order.id);
    setProcessingAction('confirm');
    setIsProcessing(true);

    const targetUid = adminUid || 'admin_kamoliddin_5021';
    const targetEmail = adminEmail || 'ypay260@gmail.com';
    const nowIso = new Date().toISOString();

    // Optimistic UI update
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

    try {
      await firestoreService.confirmOrderPayment(order.id, targetUid, targetEmail);
      await recordAudit(
        'confirm_order_payment',
        order.id,
        { paymentStatus: order.paymentStatus },
        { paymentStatus: 'paid', orderStatus: 'confirmed' }
      );
      showToast('To‘lov tasdiqlandi', `Buyurtma ${order.orderNumber || order.id} to‘lovi muvaffaqiyatli tasdiqlandi.`, 'success');
      await onRefresh(true);
    } catch (err: any) {
      console.error('Confirm order payment error:', err);
      showToast('Amalni bajarib bo‘lmadi. Qayta urinib ko‘ring.', err?.message || 'Xatolik yuz berdi', 'error');
      await onRefresh(true);
    } finally {
      setIsProcessing(false);
      setProcessingOrderId(null);
      setProcessingAction(null);
    }
  };

  // 2. ORDER PAYMENT: REJECT
  const handleRejectOrderPayment = async () => {
    if (!rejectOrderModal || processingOrderId) return;
    const targetOrder = rejectOrderModal;
    setProcessingOrderId(targetOrder.id);
    setProcessingAction('reject');
    setIsProcessing(true);

    const targetUid = adminUid || 'admin_kamoliddin_5021';
    const targetEmail = adminEmail || 'ypay260@gmail.com';
    const nowIso = new Date().toISOString();
    const reason = orderRejectReason.trim() || 'To‘lov cheki tasdiqlanmadi';

    // Optimistic UI update
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

    try {
      await firestoreService.rejectOrderPayment(targetOrder.id, reason, targetUid, targetEmail);
      await recordAudit(
        'reject_order_payment',
        targetOrder.id,
        { paymentStatus: targetOrder.paymentStatus },
        { paymentStatus: 'rejected', reason }
      );
      showToast('To‘lov rad etildi', `Buyurtma ${targetOrder.orderNumber || targetOrder.id} to‘lovi rad etildi.`, 'info');
      setRejectOrderModal(null);
      setOrderRejectReason('');
      await onRefresh(true);
    } catch (err: any) {
      console.error('Reject order payment error:', err);
      showToast('Amalni bajarib bo‘lmadi. Qayta urinib ko‘ring.', err?.message || 'Xatolik yuz berdi', 'error');
      await onRefresh(true);
    } finally {
      setIsProcessing(false);
      setProcessingOrderId(null);
      setProcessingAction(null);
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

      const targetPlan: PlanType = (payment.planRequested as PlanType) || 'pro';
      const cleanPlan: PlanType = targetPlan === 'free' ? 'trial' : targetPlan;
      const currentExp = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).getTime() : Date.now();
      const durationDays = cleanPlan === 'starter' ? 90 : (payment.durationMonths ? payment.durationMonths * 30 : 30);
      const newExpiry = new Date(Math.max(Date.now(), currentExp) + durationDays * 24 * 60 * 60 * 1000).toISOString();
      const productLimit =
        cleanPlan === 'starter'
          ? 5
          : cleanPlan === 'pro'
          ? 20
          : cleanPlan === 'business'
          ? 50
          : cleanPlan === 'premium' || cleanPlan === 'premium_pro'
          ? 110
          : 5;
      const paymentAmount =
        cleanPlan === 'starter'
          ? 1
          : cleanPlan === 'pro'
          ? 5
          : cleanPlan === 'business'
          ? 10
          : cleanPlan === 'premium' || cleanPlan === 'premium_pro'
          ? 20
          : 0;

      if (targetUserId) {
        await firestoreService.updateUser(targetUserId, {
          plan: cleanPlan,
          status: 'active',
          subscriptionStatus: 'active',
          startDate: new Date().toISOString(),
          endDate: newExpiry,
          subscriptionExpiresAt: newExpiry,
          productLimit,
          paymentAmount,
        });
      }

      // Automatically confirm blogger attribution if linked
      try {
        await firestoreService.updateBloggerAttributionStatus(payment.id, 'confirmed');
      } catch (attrErr) {
        console.warn('Failed to update blogger attribution status:', attrErr);
      }

      await recordAudit(
        'approve_p2p_payment',
        payment.id,
        { status: 'pending' },
        { status: 'approved', plan: payment.planRequested }
      );
      showToast('To‘lov Tasdiqlandi', `Obuna faollashtirildi: ${payment.userEmail}`, 'success');
      setSelectedPayment(null);
      await onRefresh(true);
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

      // Automatically cancel blogger attribution if linked
      try {
        await firestoreService.updateBloggerAttributionStatus(payment.id, 'cancelled');
      } catch (attrErr) {
        console.warn('Failed to cancel blogger attribution status:', attrErr);
      }

      await recordAudit('reject_p2p_payment', payment.id, { status: 'pending' }, { status: 'rejected', reason: rejectReason });
      showToast('Payment Rejected', 'Status marked as rejected', 'info');
      setSelectedPayment(null);
      setRejectReason('');
      await onRefresh(true);
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
        paynetQrCodeUrl: paynetQrCodeUrl.trim(),
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

  // Download Paynet QR code image as PNG
  const handleDownloadQr = async () => {
    const rawCard = (cardNumber || '8600314175497736').replace(/\s/g, '');
    const activeQr = paynetQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(`https://paynet.uz/p2p?card=${rawCard}`)}`;
    showToast('Yuklanmoqda...', 'Paynet QR-kod surati tayyorlanmoqda', 'info');
    const success = await downloadPaynetQrImage({
      qrImageUrl: activeQr,
      cardNumber: cardNumber || '8600 3141 7549 7736',
      cardHolder: cardHolder || 'Sellnex Bosh Administratsiyasi',
      bankName: bankName || 'Milliy Bank / Uzcard Humo',
      fileName: `paynet-qr-${rawCard}.png`,
    });
    if (success) {
      showToast('Muvaffaqiyatli saqlandi', 'QR-kod surati qurilmangizga yuklab olindi (PNG)', 'success');
    } else {
      showToast('Xatolik', 'QR-kod suratini yuklab olishda muammo yuz berdi', 'error');
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

      {/* Current Active Admin Card Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Admin To‘lov Kartasi (Paynet & P2P):</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">Faol</span>
            </div>
            <div className="font-mono text-base font-black text-amber-300 tracking-wider">
              {cardNumber || '8600 3141 7549 7736'}
            </div>
            <div className="text-[11px] text-slate-400">
              {cardHolder || 'Sellnex Bosh Administratsiyasi'} • {bankName || 'Milliy Bank / Uzcard Humo'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer"
            title="Paynet QR-kod suratini yuklab olish (PNG)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>QR Yuklab Olish</span>
          </button>
          {activeSubTab !== 'card_setup' ? (
            <button
              type="button"
              onClick={() => setActiveSubTab('card_setup')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Kartani O‘zgartirish</span>
            </button>
          ) : (
            <div className="text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              O‘zgartirish rejimida
            </div>
          )}
        </div>
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
                        {isProcessing && processingOrderId === o.id && processingAction === 'confirm' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Tasdiqlanmoqda...</span>
                          </>
                        ) : isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tasdiqlangan</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tasdiqlash</span>
                          </>
                        )}
                      </button>

                      {/* Reject Payment Button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setRejectOrderModal(o);
                          setOrderRejectReason(o.receiptRejectedReason || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 disabled:opacity-50 text-rose-300 border border-rose-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {isProcessing && processingOrderId === o.id && processingAction === 'reject' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Rad etilmoqda...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rad etish</span>
                          </>
                        )}
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
                      {pay.bloggerPromoCode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Blogger: {pay.bloggerPromoCode}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        Plan: <strong className="text-rose-400 uppercase">{pay.planRequested}</strong>
                      </span>
                      <span>
                        Amount: <strong className="text-emerald-400">{formatMoney(pay.amount)}</strong>
                      </span>
                      {pay.discountApplied ? (
                        <span className="text-amber-400 font-medium">
                          Chegirma: -{formatMoney(pay.discountApplied)}
                        </span>
                      ) : null}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-300">
              Ushbu bank karta ma’lumotlari Sellnex xaridori checkout’da hamda sotuvchilar tarif sotib olayotganda to‘g‘ridan-to‘g‘ri ko‘rsatiladi. QR-kod har daqiqada yangilanishi va eskirishi tufayli QR to‘lov olib tashlandi, mijozlar to‘g‘ridan-to‘g‘ri ushbu kartaga to‘lab chek yuklashadi.
            </p>
            <button
              type="button"
              onClick={() => {
                setCardNumber('8600 3141 7549 7736');
                setCardHolder('Sellnex Bosh Administratsiyasi');
                setBankName('Milliy Bank / Uzcard Humo');
                showToast('Karta kiritildi', '8600 3141 7549 7736 kartasi tanlandi', 'info');
              }}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline font-mono flex items-center gap-1 cursor-pointer shrink-0"
            >
              ⚡ Standart kartani tiklash (8600 3141 7549 7736)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Form Section */}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    Paynet QR-Code Surati (Fayl yoki URL)
                  </label>
                  {paynetQrCodeUrl && (
                    <button
                      type="button"
                      onClick={() => setPaynetQrCodeUrl('')}
                      className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Standartga qaytarish</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paynetQrCodeUrl.startsWith('data:') ? '📸 Galereyadan yuklangan skrinshot (Base64)' : paynetQrCodeUrl}
                      onChange={(e) => setPaynetQrCodeUrl(e.target.value)}
                      placeholder="https://... yoki fayl tanlang"
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-2.5 text-white font-mono text-xs outline-hidden"
                    />
                    <input
                      type="file"
                      ref={qrFileInputRef}
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => qrFileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Galereyadan tanlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      title="Ushbu QR-kodni rasm qilib yuklab olish"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Yuklab olish</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Paynet ilovangizdagi rasmiy QR-kod skrinshotini yuklashingiz yoki tayyor QR suratini telefon/kompyuteringizga yuklab olishingiz mumkin.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Ko‘rsatma Matni</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-white text-xs outline-hidden"
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

            {/* Live Preview Section matching User & Customer view */}
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                Mijozlar & Sotuvchilar Ekrandagi Ko‘rinishi (Plastik Karta To‘lovi)
              </span>

              {/* Exact Direct Card Payment Preview */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 text-center space-y-4 shadow-xl border border-indigo-500/30">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="text-amber-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>To‘lov Kartasi (Uzcard / Humo)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono font-bold">
                    Click • Payme • Uzum
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Karta Raqami:
                  </span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                    {cardNumber || '8600 3141 7549 7736'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-white/10">
                    <div>
                      <span className="text-slate-400">Egasi: </span>
                      <strong className="text-white">{cardHolder || 'Sellnex Bosh Administratsiyasi'}</strong>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {bankName || 'Milliy Bank / Uzcard Humo'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-xs text-amber-200">
                  <p>
                    ✅ Foydalanuvchi ushbu kartaga Click, Payme yoki Uzum orqali to‘lov qiladi va chek skrinshotini yuklaydi. Eskiruvchi QR-kod muammosi butunlay yo‘q.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT ORDER MODAL */}
      {rejectOrderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRejectOrderModal(null)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  title="Ortga qaytish"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ortga</span>
                </button>
                <h4 className="font-bold text-white text-sm">To‘lov Chekini Rad Etish</h4>
              </div>
              <button onClick={() => setRejectOrderModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Buyurtma <strong>{rejectOrderModal.orderNumber || rejectOrderModal.id}</strong> uchun to‘lov chekini rad etish sababini yozing:
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
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectOrderPayment}
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessing && processingAction === 'reject' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rad etilmoqda...</span>
                  </>
                ) : (
                  <span>Rad etish</span>
                )}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewScreenshot(null)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  title="Ortga qaytish"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ortga</span>
                </button>
                <span className="text-xs font-bold text-white">To‘lov Cheki Skrinshoti</span>
              </div>
              <button onClick={() => setViewScreenshot(null)} className="text-slate-400 hover:text-white cursor-pointer">
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
