import React from 'react';
import { useApp } from '../../context/AppContext';
import { subscriptionService } from '../../services/subscriptionService';
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  X,
  Package,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  maxLimit: number;
  customMessage?: string;
}

export const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  maxLimit,
  customMessage,
}) => {
  const { currentUser, navigateTo } = useApp();

  if (!isOpen) return null;

  const planConfig = subscriptionService.getPlanConfig(currentUser?.plan);
  const displayMsg =
    customMessage ||
    `Your current plan allows up to ${maxLimit} products. Upgrade your plan to add more products.`;

  const handleUpgrade = () => {
    onClose();
    navigateTo('pricing');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-xs">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>

        {/* Title & message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
            <span>Product Limit Reached</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Plan Capacity Exceeded
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {displayMsg}
          </p>
        </div>

        {/* Current status box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Current Plan: {planConfig.name}</span>
            <span className="text-amber-700 font-mono font-black">{currentCount} / {maxLimit} items</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-full animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-500">
            Upgrade to <strong>FULL ($5/mo, 50 products)</strong>, <strong>PREMIUM (99,000 UZS, 100 products)</strong> or <strong>PREMIUM PRO (199,000 UZS, 1,000 products)</strong> to continue expanding your catalog.
          </p>
        </div>

        {/* Upgrade & Dismiss buttons */}
        <div className="space-y-2 pt-2">
          <button
            id="btn-limit-upgrade-now"
            onClick={handleUpgrade}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade Plan Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            I will manage existing products
          </button>
        </div>
      </div>
    </div>
  );
};
