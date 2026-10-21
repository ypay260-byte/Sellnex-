import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Store as StoreIcon,
  Package,
  Eye,
  Share2,
  ShoppingBag,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

interface OnboardingChecklistCardProps {
  onOpenHelpFaq?: () => void;
}

export const OnboardingChecklistCard: React.FC<OnboardingChecklistCardProps> = ({ onOpenHelpFaq }) => {
  const {
    currentUser,
    store,
    products,
    orders,
    navigateTo,
    copyStoreLink,
    openShareModal,
    getStoreUrl,
  } = useApp();

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('sellnex_onboarding_dismissed') === 'true';
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Track if user has previewed/checked the store and shared it
  const [hasViewedStore, setHasViewedStore] = useState<boolean>(() => {
    return localStorage.getItem('sellnex_step_viewed_store') === 'true';
  });

  const [hasSharedStore, setHasSharedStore] = useState<boolean>(() => {
    return localStorage.getItem('sellnex_step_shared_store') === 'true';
  });

  // Calculate real progress based on actual user and store data
  // Step 1: Account created
  const step1Done = Boolean(currentUser && currentUser.email);

  // Step 2: Store info configured (store name exists and has been saved)
  const step2Done = Boolean(store && store.name && store.slug);

  // Step 3: First product added
  const step3Done = Boolean(products && products.length > 0);

  // Step 4: Storefront previewed
  const step4Done = hasViewedStore;

  // Step 5: Store link shared or first order received
  const step5Done = hasSharedStore || (orders && orders.length > 0);

  const stepsList = [
    {
      id: 1,
      title: 'Akkaunt yaratish',
      desc: 'Sellnex platformasida shaxsiy profilingiz muvaffaqiyatli faollashtirildi.',
      done: step1Done,
      buttonLabel: 'Akkaunt tayyor',
      icon: CheckCircle2,
      onClick: undefined,
    },
    {
      id: 2,
      title: 'Do‘kon ma’lumotlarini to‘ldirish',
      desc: 'Do‘koningiz nomi, logotipi va dizaynini o‘zingizga moslashtiring.',
      done: step2Done,
      buttonLabel: step2Done ? 'Sozlamalarni ko‘rish' : 'Do‘konni sozlash',
      icon: StoreIcon,
      onClick: () => navigateTo('store-builder'),
    },
    {
      id: 3,
      title: 'Birinchi mahsulotingizni qo‘shing',
      desc: 'Shaxsiy tovaringizni yuklang yoki Excel / Uzum Market havolasidan import qiling.',
      done: step3Done,
      buttonLabel: step3Done ? 'Mahsulotlarni boshqarish' : 'Mahsulot qo‘shish',
      icon: Package,
      onClick: () => navigateTo('products'),
    },
    {
      id: 4,
      title: 'Do‘koningizni tekshiring',
      desc: 'Mijozlaringiz ko‘radigan onlayn do‘koningiz vitrinasini ochib ko‘zdan kechiring.',
      done: step4Done,
      buttonLabel: 'Do‘konni ko‘rish',
      icon: Eye,
      onClick: () => {
        setHasViewedStore(true);
        localStorage.setItem('sellnex_step_viewed_store', 'true');
        navigateTo('public-store', { storeSlug: store.slug });
      },
    },
    {
      id: 5,
      title: 'Do‘kon havolasini ulashing',
      desc: 'Do‘kon havolangizni Instagram bio, Telegram yoki do‘stlaringizga yuboring.',
      done: step5Done,
      buttonLabel: 'Havolani ulashish',
      icon: Share2,
      onClick: () => {
        setHasSharedStore(true);
        localStorage.setItem('sellnex_step_shared_store', 'true');
        openShareModal({
          title: `Do‘konni ulashish — ${store.name}`,
          subtitle: 'Do‘kon havolasini Instagram, Telegram yoki TikTok orqali yuboring.',
          url: getStoreUrl(store.slug),
          storeSlug: store.slug,
        });
      },
    },
  ];

  const completedCount = stepsList.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / stepsList.length) * 100);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('sellnex_onboarding_dismissed', 'true');
  };

  const handleReopen = () => {
    setIsDismissed(false);
    localStorage.removeItem('sellnex_onboarding_dismissed');
  };

  if (isDismissed) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Do‘konni ishga tushirish qo‘llanmasi ({progressPercent}%)
            </p>
            <p className="text-[11px] text-slate-500">
              {completedCount} / 5 ta qadam bajarildi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelpFaq && (
            <button
              type="button"
              onClick={onOpenHelpFaq}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Savol-Javoblar</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReopen}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
          >
            Yo‘l-yo‘riqni ochish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="seller-onboarding-checklist-card"
      className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-blue-500/30 shadow-lg shadow-blue-500/5 relative overflow-hidden space-y-5"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boshlang‘ich qo‘llanma</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sellnex'ga xush kelibsiz!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Bir necha oddiy qadamda do‘koningizni tayyorlang va onlayn savdoni boshlang.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenHelpFaq && (
            <button
              type="button"
              onClick={onOpenHelpFaq}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[38px]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Qo‘llanma / FAQ</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Yoyish' : 'Yig‘ish'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Qo‘llanmani yopish (Keyinroq ochish mumkin)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Do‘koningizni ishga tushirish: {progressPercent}%</span>
          <span className="text-slate-500 font-medium">
            {completedCount} / 5 ta bosqich bajarildi
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {stepsList.map((step) => {
            const isDone = step.done;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200/90 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h4
                      className={`text-xs sm:text-sm font-bold leading-tight ${
                        isDone ? 'text-emerald-900 line-through opacity-85' : 'text-slate-900'
                      }`}
                    >
                      {step.id}. {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isDone ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {isDone ? 'Bajarildi' : 'Bajarilmagan'}
                  </span>

                  {step.onClick ? (
                    <button
                      type="button"
                      onClick={step.onClick}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      <span>{step.buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 px-2 py-1">
                      {step.buttonLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
