import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { firestoreService } from '../services/firestoreService';
import {
  ShoppingBag,
  Store as StoreIcon,
  Globe2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  Search,
  Instagram,
  Send,
  Video,
  Share2,
  HelpCircle,
  Smartphone,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingWizard: React.FC = () => {
  const { completeOnboarding, navigateTo, showToast, pendingRegistration, setPendingRegistration, currentUser } = useApp();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: What do you want to sell?
  const [sellType, setSellType] = useState<string>('Dropshipping');

  // Step 2: Where will you sell?
  const [market, setMarket] = useState<string>('Uzbekistan');

  // Step 3: Where will you find customers? (Multiple selections supported)
  const [customerSources, setCustomerSources] = useState<string[]>(['Instagram', 'Telegram']);

  // Step 4: Do you already have products?
  const [hasProducts, setHasProducts] = useState<string>('No, I need to find products');

  // Step 5: Store name & URL
  const defaultInitialName = pendingRegistration?.name ? `${pendingRegistration.name.split(' ')[0]}'s Store` : 'My Store';
  const defaultInitialSlug = pendingRegistration?.name ? `${pendingRegistration.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}store` : 'mystore';
  const [storeName, setStoreName] = useState(defaultInitialName);
  const [storeSlug, setStoreSlug] = useState(defaultInitialSlug);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeSlug.trim()) {
      setSlugStatus('idle');
      setSlugError(null);
      return;
    }

    const clean = storeSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    if (clean.length < 3) {
      setSlugStatus('idle');
      setSlugError('Havola kamida 3 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setSlugStatus('checking');
    setSlugError(null);

    const timer = setTimeout(async () => {
      try {
        const isAvailable = await firestoreService.isSlugAvailable(clean);
        if (isAvailable) {
          setSlugStatus('available');
          setSlugError(null);
        } else {
          setSlugStatus('taken');
          setSlugError('Bu URL band. Iltimos, boshqa URL tanlang.');
        }
      } catch {
        setSlugStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [storeSlug]);

  // Account details if registration wasn't completed on prior page
  const [fallbackEmail, setFallbackEmail] = useState(pendingRegistration?.email || '');
  const [fallbackPassword, setFallbackPassword] = useState(pendingRegistration?.password || '');
  const [fallbackName, setFallbackName] = useState(pendingRegistration?.name || '');
  const [fallbackPhone, setFallbackPhone] = useState(pendingRegistration?.phone || '');

  const handleStoreNameChange = (name: string) => {
    setStoreName(name);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 24);
    setStoreSlug(slug || 'mystore');
  };

  const toggleCustomerSource = (source: string) => {
    if (customerSources.includes(source)) {
      if (customerSources.length > 1) {
        setCustomerSources(customerSources.filter((s) => s !== source));
      }
    } else {
      setCustomerSources([...customerSources, source]);
    }
  };

  const handleFinish = async () => {
    if (slugStatus === 'taken') {
      showToast('URL Band', 'Bu URL band. Iltimos, boshqa URL tanlang.', 'error');
      return;
    }

    setSubmitting(true);
    const finalStoreName = storeName.trim() || 'My Store';
    const finalSlug = (storeSlug.trim() || 'mystore').toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Ensure registration info is set if not already authenticated
    if (!currentUser && (!pendingRegistration || !pendingRegistration.email)) {
      if (!fallbackEmail || !fallbackPassword) {
        setSubmitting(false);
        showToast('Account Required', 'Please enter your email and password to complete store creation.', 'error');
        return;
      }
      setPendingRegistration({
        name: fallbackName || finalStoreName,
        email: fallbackEmail,
        phone: fallbackPhone || '+998 90 123 45 67',
        password: fallbackPassword,
      });
    }

    const res = await completeOnboarding({
      sellCategory: sellType,
      sellMarket: market,
      customerChannels: customerSources,
      hasProducts,
      storeName: finalStoreName,
      storeSlug: finalSlug,
    });

    setSubmitting(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      navigateTo('dashboard');
    } else {
      showToast('Error setting up store', res.error || 'Please try again', 'error');
    }
  };

  return (
    <div id="onboarding-wizard-root" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>QUICK STORE ONBOARDING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Launch Your Online Store
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Step {step} of 5 — Answer 5 quick questions to set up your dashboard
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between mt-6 gap-2 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          {/* STEP 1: What do you want to sell? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">1. What do you want to sell?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the business model you plan to use.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'Dropshipping',
                    title: 'Dropshipping',
                    desc: 'Sell products from Uzum, Alibaba, and local suppliers with zero inventory risk',
                    icon: ShoppingBag,
                  },
                  {
                    id: 'My own products',
                    title: 'My own products',
                    desc: 'I have physical stock in Tashkent or my local warehouse',
                    icon: Package,
                  },
                  {
                    id: 'Physical products',
                    title: 'Physical products',
                    desc: 'Clothing, electronics, home goods, cosmetics',
                    icon: Layers,
                  },
                  {
                    id: 'Digital products',
                    title: 'Digital products',
                    desc: 'Courses, presets, eBooks, software licences',
                    icon: Sparkles,
                  },
                  {
                    id: 'Reselling',
                    title: 'Reselling',
                    desc: 'Buying from wholesale bazaars (Abu Saxiy, Chorsu) and reselling online',
                    icon: Search,
                  },
                  {
                    id: 'Not sure yet',
                    title: 'Not sure yet',
                    desc: "I want to explore what's selling well in Uzbekistan first",
                    icon: HelpCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = sellType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSellType(item.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Where will you sell? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">2. Where will you sell?</h3>
                <p className="text-xs text-slate-500 mt-0.5">We will configure your currency (UZS/USD) and delivery regions accordingly.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'Uzbekistan',
                    title: 'Uzbekistan (All 12 Regions + Tashkent)',
                    desc: 'Optimized with UZS currency, Payme, Click, Uzum Bank, and BTS / Fargo / EMU Express delivery integration.',
                    icon: Globe2,
                  },
                  {
                    id: 'International',
                    title: 'International (Global Market)',
                    desc: 'Multi-currency (USD, EUR, RUB), Stripe & global card checkouts, and international shipping.',
                    icon: Globe2,
                  },
                  {
                    id: 'Both',
                    title: 'Both (Uzbekistan & Worldwide)',
                    desc: 'Local payment gateways + international cards with dual currency conversion.',
                    icon: Globe2,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMarket(item.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                      market === item.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${market === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {market === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Where will you find customers? */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">3. Where will you find customers?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select all channels you plan to promote on (select multiple).</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'Instagram', name: 'Instagram', icon: Instagram },
                  { id: 'Telegram', name: 'Telegram Channel/Bot', icon: Send },
                  { id: 'TikTok', name: 'TikTok', icon: Video },
                  { id: 'Facebook', name: 'Facebook', icon: Share2 },
                  { id: 'YouTube', name: 'YouTube', icon: Video },
                  { id: 'Other', name: 'Word of mouth / Other', icon: Smartphone },
                ].map((item) => {
                  const isSelected = customerSources.includes(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCustomerSource(item.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Do you already have products? */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">4. Do you already have products?</h3>
                <p className="text-xs text-slate-500 mt-0.5">We will personalize your initial catalog and supplier recommendations.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'Yes, I have products ready',
                    title: 'Yes, I have products ready to list',
                    desc: 'I have photography, pricing, and stock ready to upload to my storefront.',
                  },
                  {
                    id: 'No, I need to find products',
                    title: 'No, I need to find winning products (Dropshipping)',
                    desc: 'I want to import trending products from Uzum Market, AliExpress, and 1688 with 1-click.',
                  },
                  {
                    id: 'I want to manufacture or private label',
                    title: 'I want to create my own brand / private label',
                    desc: 'I want to source custom packaging and private label products.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHasProducts(item.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                      hasProducts === item.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {hasProducts === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Store Name and Unique URL */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">5. Enter your store name</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your store name will generate your public store link automatically (just like Shopify).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <StoreIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="input-store-name"
                      type="text"
                      autoFocus
                      required
                      value={storeName}
                      onChange={(e) => handleStoreNameChange(e.target.value)}
                      placeholder="e.g. Silk Road Trends"
                      className="block w-full pl-10 pr-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Store URL (Slug) <span className="text-rose-500">*</span>
                    </label>
                    {slugStatus === 'checking' && (
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Tekshirilmoqda...
                      </span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mavjud (Bo'sh)
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Bu URL band
                      </span>
                    )}
                  </div>
                  <div className={`flex rounded-xl border overflow-hidden transition-colors ${
                    slugStatus === 'taken'
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : slugStatus === 'available'
                      ? 'border-emerald-400 ring-2 ring-emerald-100'
                      : 'border-slate-300 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent'
                  }`}>
                    <span className="bg-slate-100 border-r border-slate-200 px-3 py-2.5 text-xs text-slate-600 font-mono flex items-center select-none">
                      /store/
                    </span>
                    <input
                      id="input-store-slug"
                      type="text"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="mystore"
                      className="flex-1 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-hidden"
                    />
                  </div>

                  {slugError && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{slugError}</span>
                    </p>
                  )}

                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700 font-medium">
                    <span className="text-slate-500">Do'koningiz rasmiy havolasi:</span>
                    <strong className="font-mono text-blue-600">/store/{storeSlug || 'mystore'}</strong>
                  </div>
                </div>

                {/* Account credentials prompt if missing */}
                {!currentUser && (!pendingRegistration || !pendingRegistration.email) && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>Account Credentials for Store Login</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={fallbackEmail}
                          onChange={(e) => setFallbackEmail(e.target.value)}
                          placeholder="seller@example.com"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={fallbackPassword}
                          onChange={(e) => setFallbackPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                id="wizard-prev-btn"
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                id="wizard-next-btn"
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="wizard-finish-btn"
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create My Store & Go to Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
