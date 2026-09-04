import React, { useState } from 'react';
import { P2PPayment, AdminSettings, DynamicPlan, User, PlanType } from '../../../types';
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
} from 'lucide-react';

interface AdminPaymentsTabProps {
  p2pPayments: P2PPayment[];
  settings: AdminSettings | null;
  plans: DynamicPlan[];
  users: User[];
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
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<P2PPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  // P2P Card Settings Config State
  const [cardNumber, setCardNumber] = useState(settings?.p2pCardNumber || '8600 0000 0000 0000');
  const [cardHolder, setCardHolder] = useState(settings?.p2pCardHolder || 'SELLNEX TECH OOO');
  const [bankName, setBankName] = useState(settings?.p2pBankName || 'Kapitalbank / TBC');
  const [instructions, setInstructions] = useState(
    settings?.p2pInstructions || 'Iltimos, kartaga toʻlov qiling va chek skrinshotini yuklang. Admin 15 daqiqada tasdiqlaydi.'
  );

  const filteredPayments = p2pPayments.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
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
        details: `P2P action by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  // Approve Payment -> Automatically activate subscription & notify user
  const handleApprovePayment = async (payment: P2PPayment) => {
    setIsProcessing(true);
    try {
      // 1. Update Payment status
      await firestoreService.updateP2PPayment(payment.id, {
        status: 'approved',
        approvedBy: adminEmail,
        approvedAt: new Date().toISOString(),
      });

      // 2. Automatically update target User's subscription in Firestore
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

        try {
          await firestoreService.saveNotification(targetUserId, {
            id: `notif_${Date.now()}`,
            title: `Toʻlov tasdiqlandi! 🎉`,
            message: `Sizning "${targetPlan.toUpperCase()}" tarifi boʻyicha toʻlovingiz admin tomonidan tasdiqlandi va obunangiz 30 kunga faollashtirildi!`,
            type: 'order',
            timestamp: new Date().toISOString(),
            read: false,
          });
        } catch (notifErr) {
          console.warn('User notification error:', notifErr);
        }
      }

      await recordAudit('approve_p2p_payment', payment.id, { status: 'pending' }, { status: 'approved', plan: payment.planRequested });
      showToast('Payment Approved', `Subscription activated for ${payment.userEmail}`, 'success');
      setSelectedPayment(null);
      await onRefresh();
    } catch (err: any) {
      showToast('Approval Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject Payment with custom reason
  const handleRejectPayment = async (payment: P2PPayment) => {
    setIsProcessing(true);
    try {
      await firestoreService.updateP2PPayment(payment.id, {
        status: 'rejected',
        rejectionReason: rejectReason || 'Chek noaniq yoki toʻlov hisobga kelib tushmadi.',
        approvedBy: adminEmail,
      });

      await recordAudit('reject_p2p_payment', payment.id, { status: 'pending' }, { status: 'rejected', reason: rejectReason });
      showToast('Payment Rejected', `Marked as rejected for ${payment.userEmail}`, 'info');
      setSelectedPayment(null);
      setRejectReason('');
      await onRefresh();
    } catch (err: any) {
      showToast('Rejection Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save P2P Card Settings to Firestore
  const handleSaveP2PSettings = async () => {
    setIsProcessing(true);
    try {
      await firestoreService.saveAdminSettings({
        p2pCardNumber: cardNumber.trim(),
        p2pCardHolder: cardHolder.trim(),
        p2pBankName: bankName.trim(),
        p2pInstructions: instructions.trim(),
      });
      await recordAudit('update_p2p_settings', 'admin_settings', null, { cardNumber, cardHolder, bankName });
      showToast('Bank Settings Saved', 'P2P bank card details updated across client applications', 'success');
      await onRefresh();
    } catch (err: any) {
      showToast('Failed to save settings', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Verification Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Manual Verification Core</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">P2P Card Payment Clearances</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Sellers transfer subscription funds directly to platform bank cards (Uzcard / Humo). Authorized admins inspect bank receipt proof before activating seller plans.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch lg:self-auto justify-center">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === key
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {key}
            </button>
          ))}

          <button
            onClick={() => onRefresh()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Payments Queue + Receiver Card Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Payments Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Submitted Payment Receipts ({filteredPayments.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-800/80">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No {statusFilter} P2P payment requests.
                </div>
              ) : (
                filteredPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pay.userEmail}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
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
                        <span>Plan: <strong className="text-rose-400 uppercase">{pay.planRequested}</strong></span>
                        <span>Amount: <strong className="text-emerald-400">{formatMoney(pay.amount)}</strong></span>
                        <span>Sender: <strong className="text-slate-200">{pay.senderName || 'Anonymous'}</strong></span>
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
        </div>

        {/* Right Col: Admin P2P Bank Card Configuration */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>P2P Receiver Card Setup</span>
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Configure the bank card credentials shown to merchants during subscription checkout.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Card Number (Uzcard / Humo)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="8600 0000 0000 0000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cardholder Official Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="SELLNEX TECH OOO"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Kapitalbank / TBC Bank"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Seller Payment Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions displayed to users when sending card transfers..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl p-3 text-white outline-none resize-none"
                />
              </div>

              <button
                disabled={isProcessing}
                onClick={handleSaveP2PSettings}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Bank Card Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {viewScreenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Payment Receipt Proof</span>
              <button
                onClick={() => setViewScreenshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[70vh] overflow-auto bg-black rounded-xl p-2">
              <img src={viewScreenshot} alt="Payment Receipt" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Reject Payment Request</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Please specify the reason for rejecting this receipt. This message will be recorded in the audit log.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Transfer amount did not match / Receipt screenshot illegible / Duplicate proof..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-rose-500"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleRejectPayment(selectedPayment)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
