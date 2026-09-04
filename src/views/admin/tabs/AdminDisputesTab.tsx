import React, { useState } from 'react';
import { Dispute, Order, User, Store } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  RefreshCw,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface AdminDisputesTabProps {
  disputes: Dispute[];
  orders: Order[];
  stores: Store[];
  users: User[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminDisputesTab: React.FC<AdminDisputesTabProps> = ({
  disputes,
  orders,
  stores,
  users,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved' | 'rejected'>('open');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredDisputes = disputes.filter((d) => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'dispute',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Dispute arbitration by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  const handleResolveDispute = async (decision: 'resolved' | 'rejected') => {
    if (!selectedDispute) return;
    setIsProcessing(true);
    try {
      await firestoreService.updateDispute(selectedDispute.id, {
        status: decision,
        adminDecision: decision === 'resolved' ? 'Refund Approved' : 'Dispute Claim Rejected',
        adminNotes: resolutionNotes,
        resolvedAt: new Date().toISOString(),
        resolvedBy: adminEmail,
      });

      // If resolved/refund approved, update associated order
      if (decision === 'resolved' && selectedDispute.orderId) {
        await firestoreService.updateOrder(selectedDispute.orderId, {
          orderStatus: 'Cancelled',
        });
      }

      await recordAudit('arbitrate_dispute', selectedDispute.id, { status: selectedDispute.status }, { status: decision, decision });
      showToast('Dispute Arbitrated', `Case marked as ${decision.toUpperCase()}`, 'success');
      setSelectedDispute(null);
      setResolutionNotes('');
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Arbitration & Claims</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Buyer & Seller Dispute Resolution</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review customer claims, evidence attachments, and authorize refunds or dismiss fraudulent claims.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['open', 'resolved', 'rejected', 'all'] as const).map((key) => (
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

      {/* Disputes List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/80">
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No {statusFilter} dispute cases at this time.
            </div>
          ) : (
            filteredDisputes.map((d) => (
              <div
                key={d.id}
                className="p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">Dispute #{d.id.slice(0, 8)}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        d.status === 'open'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : d.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">Order: {d.orderId}</span>
                  </div>

                  <div className="text-xs text-slate-300 font-semibold">{d.reason}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">{d.description}</div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 pt-1">
                    <span>Buyer: <strong className="text-slate-300">{d.buyerEmail}</strong></span>
                    <span>Claim Amount: <strong className="text-emerald-400">{formatMoney(d.amount)}</strong></span>
                    <span>Date: {new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setSelectedDispute(d)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Review Case →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Case Review Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Dispute Case Arbitration</h3>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Reason:</span>
                <span className="text-rose-400 font-bold">{selectedDispute.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Email:</span>
                <span className="text-white font-medium">{selectedDispute.buyerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Amount:</span>
                <span className="text-emerald-400 font-bold">{formatMoney(selectedDispute.amount)}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Customer Statement:</span>
                <p className="text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                  {selectedDispute.description}
                </p>
              </div>
            </div>

            {selectedDispute.status === 'open' ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Arbitration Decision & Reasoning
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record justification for approving refund or rejecting dispute..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500 resize-none"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleResolveDispute('resolved')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Buyer Refund</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleResolveDispute('rejected')}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Dispute Claim</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-1">Final Arbitration Decision:</span>
                <div>{selectedDispute.adminDecision}</div>
                {selectedDispute.adminNotes && <div className="text-slate-400 mt-1 italic">"{selectedDispute.adminNotes}"</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
