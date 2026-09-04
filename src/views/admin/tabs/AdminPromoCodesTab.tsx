import React, { useState } from 'react';
import { PromoCode, DynamicPlan } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Gift,
  RefreshCw,
  X,
  Clock,
  Check,
} from 'lucide-react';

interface AdminPromoCodesTabProps {
  promoCodes: PromoCode[];
  plans: DynamicPlan[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminPromoCodesTab: React.FC<AdminPromoCodesTabProps> = ({
  promoCodes,
  plans,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Promo Code Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed' | 'free_months' | 'trial_days'>('percent');
  const [value, setValue] = useState(20);
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState('');
  const [applicablePlan, setApplicablePlan] = useState('all');

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'promo_code',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Promo code action by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit err:', err);
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      showToast('Validation Error', 'Please enter a valid promo code string.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const newPromo: PromoCode = {
        id: `promo_${cleanCode.toLowerCase()}`,
        code: cleanCode,
        type,
        value: Number(value),
        maxUses: Number(maxUses),
        usedCount: 0,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        applicablePlan: applicablePlan === 'all' ? undefined : applicablePlan,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: adminEmail,
      };

      await firestoreService.createPromoCode(newPromo);
      await recordAudit('create_promo_code', newPromo.id, null, newPromo);
      showToast('Promo Code Generated', `Code ${cleanCode} is now active!`, 'success');
      setShowCreateModal(false);
      setCode('');
      await onRefresh();
    } catch (err: any) {
      showToast('Creation Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePromoStatus = async (promo: PromoCode) => {
    setIsProcessing(true);
    try {
      const nextActive = !promo.isActive;
      await firestoreService.updatePromoCode(promo.id, { isActive: nextActive });
      await recordAudit('toggle_promo_status', promo.id, { isActive: promo.isActive }, { isActive: nextActive });
      showToast('Status Updated', `Promo code ${promo.code} is now ${nextActive ? 'Active' : 'Disabled'}`, 'success');
      await onRefresh();
    } catch (err: any) {
      showToast('Failed to toggle status', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePromo = async (promo: PromoCode) => {
    setIsProcessing(true);
    try {
      await firestoreService.deletePromoCode(promo.id);
      await recordAudit('delete_promo_code', promo.id, { code: promo.code }, null);
      showToast('Promo Code Deleted', `Removed ${promo.code}`, 'info');
      await onRefresh();
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (promoCodeStr: string) => {
    navigator.clipboard?.writeText(promoCodeStr);
    setCopiedCode(promoCodeStr);
    setTimeout(() => setCopiedCode(null), 2500);
    showToast('Code Copied', `${promoCodeStr} copied to clipboard`, 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Growth & Incentives</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Promo Codes & Discounts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create coupon codes offering % discounts, fixed UZS deductions, free subscription months, or extra trial days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Code</span>
          </button>

          <button
            onClick={() => onRefresh()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No promo codes created yet. Click "Generate New Code" to create one.
          </div>
        ) : (
          promoCodes.map((p) => {
            const isExpired = p.expiresAt && new Date(p.expiresAt).getTime() < Date.now();
            const isDepleted = p.maxUses && p.usedCount >= p.maxUses;
            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {p.code}
                      </span>
                      <button
                        onClick={() => handleCopy(p.code)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode === p.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        !p.isActive
                          ? 'bg-slate-800 text-slate-400'
                          : isExpired
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {!p.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-1.5">
                    {p.type === 'percent' && <span>{p.value}% OFF Subscription</span>}
                    {p.type === 'fixed' && <span>{formatMoney(p.value)} Fixed Discount</span>}
                    {p.type === 'free_months' && <span>{p.value} Month(s) 100% FREE Access</span>}
                    {p.type === 'trial_days' && <span>+{p.value} Extra Trial Days</span>}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span>Redemptions:</span>
                      <span className="text-white font-mono font-bold">
                        {p.usedCount} / {p.maxUses || '∞'} uses
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Target Tier:</span>
                      <span className="text-slate-200 uppercase font-semibold">{p.applicablePlan || 'All Plans'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Expiration:</span>
                      <span className="text-slate-200">
                        {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never expires'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleTogglePromoStatus(p)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    {p.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleDeletePromo(p)}
                    className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                    title="Delete Promo Code"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Create Promo Code</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoCode} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Promo Code String</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SELLNEX2025, UZBEKPRO, SUMMER50"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono uppercase tracking-wider outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reward / Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="percent">Percentage Discount (% OFF)</option>
                  <option value="fixed">Fixed Sum Deduction (UZS)</option>
                  <option value="free_months">100% Free Plan Period (Months)</option>
                  <option value="trial_days">Extra Free Trial Days</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {type === 'percent' ? 'Discount %' : type === 'fixed' ? 'Amount (UZS)' : type === 'free_months' ? 'Months Count' : 'Days Count'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Applicable Plan</label>
                <select
                  value={applicablePlan}
                  onChange={(e) => setApplicablePlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="all">All Plans</option>
                  <option value="pro">PRO Plan Only</option>
                  <option value="business">BUSINESS Plan Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Promo Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
