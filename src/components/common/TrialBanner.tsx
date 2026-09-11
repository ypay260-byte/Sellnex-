import React from 'react';
import { useApp } from '../../context/AppContext';
import { subscriptionService } from '../../services/subscriptionService';
import { Sparkles, AlertCircle, ArrowRight, Package } from 'lucide-react';

export const TrialBanner: React.FC = () => {
  const { currentUser, products, navigateTo } = useApp();
  const trialInfo = subscriptionService.getTrialStatus(currentUser);

  if (!currentUser || currentUser.role === 'admin') {
    return null;
  }

  // Subscription or Trial Expired
  if (trialInfo.isExpired) {
    return (
      <div
        id="trial-banner-expired"
        className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 shrink-0 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
          <span>
            <strong>Your subscription has expired.</strong> Upgrade your plan to continue adding products and managing your store.
          </span>
        </div>
        <button
          id="btn-trial-upgrade-expired"
          onClick={() => navigateTo('pricing')}
          className="bg-white text-rose-700 hover:bg-rose-50 px-3.5 py-1.5 rounded-xl font-black text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Upgrade Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Free Trial Active Countdown
  if (trialInfo.isTrial) {
    return (
      <div
        id="trial-banner-active"
        className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shrink-0 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Free Trial:</span>
            </span>
            <span className="text-blue-100 font-semibold">{trialInfo.formattedRemaining}</span>
            <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded-md text-[11px] font-mono">
              {products.length} / 5 products
            </span>
          </span>
        </div>
        <button
          id="btn-trial-upgrade-active"
          onClick={() => navigateTo('pricing')}
          className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-3 py-1 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Upgrade Plan</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return null;
};
