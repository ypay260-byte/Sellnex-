import React, { useState } from 'react';
import { DynamicPlan, AdminSettings } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Crown,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  DollarSign,
  Clock,
  Layers,
  CheckCircle,
  RefreshCw,
  Edit2,
  X,
  Percent,
} from 'lucide-react';

interface AdminSubscriptionsTabProps {
  plans: DynamicPlan[];
  settings: AdminSettings | null;
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminSubscriptionsTab: React.FC<AdminSubscriptionsTabProps> = ({
  plans,
  settings,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [editingPlan, setEditingPlan] = useState<DynamicPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Global Subscription Rules State
  const [trialDays, setTrialDays] = useState(settings?.trialDurationDays || 4);
  const [renewalDiscountPercent, setRenewalDiscountPercent] = useState(settings?.renewalDiscountPercent || 40);

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'subscription_plan',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Subscription config by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  // Save specific Plan modifications
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setIsProcessing(true);
    try {
      await firestoreService.saveDynamicPlan(editingPlan);
      await recordAudit('update_plan_config', editingPlan.id, null, editingPlan);
      showToast('Plan Saved', `${editingPlan.name} configuration updated successfully!`, 'success');
      setEditingPlan(null);
      await onRefresh();
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Global Trial & Discount Rules
  const handleSaveGlobalRules = async () => {
    setIsProcessing(true);
    try {
      await firestoreService.saveAdminSettings({
        trialDurationDays: Number(trialDays),
        renewalDiscountPercent: Number(renewalDiscountPercent),
      });
      await recordAudit('update_global_sub_rules', 'admin_settings', null, { trialDays, renewalDiscountPercent });
      showToast('Subscription Rules Saved', 'Global trial length and renewal discounts updated in Firestore', 'success');
      await onRefresh();
    } catch (err: any) {
      showToast('Failed to save rules', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewPlan = () => {
    const newId = `custom_${Date.now()}`;
    const newPlan: DynamicPlan = {
      id: newId,
      name: 'Custom VIP Plan',
      priceMonthlyUZS: 150000,
      priceMonthlyUSD: 12,
      renewalDiscountPercent: 30,
      maxProducts: 250,
      maxStores: 5,
      platformFeePercent: 1.5,
      features: ['Unlimited Orders', 'Priority 24/7 Support', 'Custom Domain', 'Telegram Automation'],
      trialDays: 7,
      isActive: true,
    };
    setEditingPlan(newPlan);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dynamic Pricing Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Subscription Tier Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify plan pricing in UZS/USD, adjust trial duration, and customize product & store quota limits without touching code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewPlan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Plan</span>
          </button>

          <button
            onClick={() => onRefresh()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Defaults Config (Trial Days + Renewal Discount) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Global Registration & Renewal Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Default Free Trial Duration (Days)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
              />
              <span className="text-slate-400 shrink-0 font-medium">days</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Standard initial trial period given on signup.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Standard Renewal Discount % (e.g. $5 → $3)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={90}
                value={renewalDiscountPercent}
                onChange={(e) => setRenewalDiscountPercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
              />
              <span className="text-slate-400 shrink-0 font-medium">%</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Applied to recurring plan renewals.</span>
          </div>

          <div className="flex items-end">
            <button
              disabled={isProcessing}
              onClick={handleSaveGlobalRules}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Update Global Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          return (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <h3 className="font-bold text-white text-base uppercase tracking-tight">{p.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      p.isActive !== false
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.isActive !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-black text-white">{formatMoney(p.priceMonthlyUZS)}</div>
                  <div className="text-xs text-slate-400">${p.priceMonthlyUSD} / month</div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Products Limit:</span>
                    <span className="text-white font-bold">{p.maxProducts} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Stores per User:</span>
                    <span className="text-white font-bold">{p.maxStores} store(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Take Fee:</span>
                    <span className="text-rose-400 font-bold">{p.platformFeePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trial Period:</span>
                    <span className="text-white font-bold">{p.trialDays || 4} days</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Included Features:</span>
                  {p.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setEditingPlan(p)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Plan Settings</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-rose-400" />
                <span>Configure {editingPlan.name}</span>
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plan Display Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price Monthly (UZS)</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthlyUZS}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthlyUZS: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price Monthly (USD)</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthlyUSD}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthlyUSD: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Products Allowed</label>
                  <input
                    type="number"
                    value={editingPlan.maxProducts}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxProducts: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Stores per Account</label>
                  <input
                    type="number"
                    value={editingPlan.maxStores}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxStores: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Platform Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPlan.platformFeePercent}
                    onChange={(e) => setEditingPlan({ ...editingPlan, platformFeePercent: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Renewal Discount (%)</label>
                  <input
                    type="number"
                    value={editingPlan.renewalDiscountPercent || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, renewalDiscountPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Features (One per line)</label>
                <textarea
                  rows={4}
                  value={editingPlan.features?.join('\n') || ''}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  placeholder="Unlimited Orders&#10;Custom Domain&#10;Telegram Bot Integration..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-white outline-none resize-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editingPlan.isActive !== false}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800"
                />
                <label htmlFor="activeCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Plan is currently active & purchasable by merchants
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
