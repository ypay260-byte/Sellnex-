import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import { subscriptionService, PLAN_CONFIGS } from '../services/subscriptionService';
import { PlanType } from '../types';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  Crown,
  Lock,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Package,
  Layers,
  Flame,
  Upload,
  Copy,
  FileCheck,
  Image as ImageIcon,
  CheckCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PricingView: React.FC = () => {
  const { store, updateStore, currentUser, setCurrentUser, products, showToast, formatMoney } = useApp();

  const [selectedPlanModal, setSelectedPlanModal] = useState<PlanType | null>(null);
  const [isRenewalOption, setIsRenewalOption] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'Click' | 'Payme' | 'Uzum Bank' | 'Card'>('Card');
  const [copiedCard, setCopiedCard] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{ mode: 'p2p' | 'instant'; refNumber?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const trialInfo = subscriptionService.getTrialStatus(currentUser);
  const currentPlanId = currentUser?.plan || 'free';
  const planConfig = subscriptionService.getPlanConfig(currentPlanId);

  const OFFICIAL_CARD = '8600 5704 1234 5678';
  const CARD_HOLDER = 'SELLNEX TECH OOO (Kapitalbank)';

  const plans: {
    id: PlanType;
    name: string;
    priceUSD: number;
    priceUZS: number;
    duration: string;
    priceFormatted: string;
    productLimit: number;
    desc: string;
    badge?: string;
    features: string[];
    popular?: boolean;
    isTrial?: boolean;
  }[] = [
    {
      id: 'trial',
      name: 'FREE TRIAL',
      priceUSD: 0,
      priceUZS: 0,
      duration: '7 kun',
      priceFormatted: '$0 (7 kun bepul)',
      productLimit: 5,
      desc: 'Yangi foydalanuvchilar uchun 7 kunlik bepul sinov. 5 tagacha mahsulot qo‘shish imkoniyati.',
      badge: 'Avtomatik Sinov',
      isTrial: true,
      features: [
        'Maksimum 5 ta mahsulot limiti',
        '7 kunlik bepul to‘liq kirish',
        'Ro‘yxatdan o‘tganda avtomatik boshlanadi',
        'To‘g‘ridan-to‘g‘ri buyurtmalar qabuli',
        'Click, Payme va Uzum Bank to‘lovlari',
        'Tugaganda Starter tarifiga o‘tish taklifi',
      ],
      popular: false,
    },
    {
      id: 'starter',
      name: 'STARTER',
      priceUSD: 1,
      priceUZS: 13000,
      duration: '3 oy',
      priceFormatted: '$1 (jami 3 oy uchun)',
      productLimit: 5,
      desc: 'Kichik do‘konlar va yangi boshlovchilar uchun 3 oylik qulay tarif. 5 tagacha mahsulot.',
      badge: 'Qulay Boshlanish',
      features: [
        'Maksimum 5 ta mahsulot limiti',
        '3 oy muddat (jami 3 oy uchun atigi $1)',
        '13,000 UZS jami 3 oylik to‘lov',
        'To‘g‘ridan-to‘g‘ri Telegram buyurtmalar',
        '5 tadan ortiq mahsulot uchun Pro taklif qilinadi',
        'Doimiy 24/7 texnik ko‘mak',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'PRO',
      priceUSD: 5,
      priceUZS: 65000,
      duration: '1 oy',
      priceFormatted: '$5 / oyiga (65,000 UZS)',
      productLimit: 20,
      desc: 'Kengroq mahsulot katalogiga ega faol sotuvchilar uchun. 20 tagacha mahsulot limiti.',
      badge: 'Eng Ommabop',
      popular: true,
      features: [
        'Maksimum 20 ta mahsulot limiti',
        'Har oy $5 (65,000 UZS)',
        '2 ta savdo rejimi (Shaxsiy va Dropshipping)',
        'Telegram bot bildirishnomalari va statistika',
        'Cheksiz mijoz buyurtmalari',
        'Ustuvor VIP texnik yordam',
      ],
    },
    {
      id: 'business',
      name: 'BUSINESS',
      priceUSD: 10,
      priceUZS: 130000,
      duration: '1 oy',
      priceFormatted: '$10 / oyiga (130,000 UZS)',
      productLimit: 50,
      desc: 'Katta assortiment va o‘sayotgan bizneslar uchun. 50 tagacha mahsulot limiti.',
      badge: 'Biznes Kengayish',
      features: [
        'Maksimum 50 ta mahsulot limiti',
        'Har oy $10 (130,000 UZS)',
        'Shaxsiy domen ulash (.uz yoki .com)',
        'Kengaytirilgan savdo statistikasi',
        'Telegram buyurtma boti va integratsiyalar',
        'Ustuvor VIP texnik koʻmak',
      ],
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      priceUSD: 20,
      priceUZS: 260000,
      duration: '1 oy',
      priceFormatted: '$20 / oyiga (260,000 UZS)',
      productLimit: 110,
      desc: 'Professional brendlar va yirik do‘konlar uchun. 110 tagacha mahsulot limiti.',
      badge: 'Maksimal Quvvat',
      features: [
        'Maksimum 110 ta mahsulot limiti',
        'Har oy $20 (260,000 UZS)',
        'Cheksiz buyurtmalar va toʻliq avtomatizatsiya',
        'Shaxsiy VIP menejer koʻmagi',
        'Maksimal server tezligi va 0% komissiya',
        'Barcha yangi imkoniyatlarga 1-kirish',
      ],
    },
  ];

  const handleOpenUpgradeModal = (planId: PlanType, renewal = false) => {
    setSelectedPlanModal(planId);
    setIsRenewalOption(renewal);
    setReceiptImage(null);
    setTransactionRef('');
    setPaymentSuccessInfo(null);
  };

  const handleCopyCard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(OFFICIAL_CARD.replace(/\s/g, ''));
      }
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
      showToast('Karta raqami nusxalandi', OFFICIAL_CARD, 'success');
    } catch {
      showToast('Karta', OFFICIAL_CARD, 'info');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Fayl hajmi katta', 'Iltimos, 5MB dan kichik rasm yuklang.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
      showToast('Chek yuklandi', 'Skrinshot muvaffaqiyatli tanlandi.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Submit Receipt for Admin Review
  const handleSubmitReceiptPayment = async () => {
    if (!selectedPlanModal || !currentUser) return;
    if (!receiptImage && !transactionRef) {
      showToast('Chek talab qilinadi', 'Iltimos, toʻlov cheki skrinshotini yuklang yoki tranzaksiya raqamini kiriting.', 'error');
      return;
    }

    setIsProcessing(true);
    const plan = plans.find((p) => p.id === selectedPlanModal);
    const amountUZS = plan?.priceUZS || (selectedPlanModal === 'starter' ? 13000 : 65000);
    const amountUSD = plan?.priceUSD || (selectedPlanModal === 'starter' ? 1 : 5);

    const res = await subscriptionService.submitP2PPaymentRequest({
      user: currentUser,
      planRequested: selectedPlanModal,
      amountUZS,
      amountUSD,
      paymentMethod,
      receiptImageUrl: receiptImage || undefined,
      transactionRef: transactionRef.trim() || undefined,
      senderPhone: senderPhone.trim() || currentUser.phone || undefined,
    });

    setIsProcessing(false);

    if (res.success) {
      setPaymentSuccessInfo({ mode: 'p2p', refNumber: res.paymentId });
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      showToast(
        'Toʻlov cheki qabul qilindi!',
        'Admin chekni tekshirib tasdiqlagach (5-15 daqiqa), obunangiz avtomatik faollashadi.',
        'success'
      );
    } else {
      showToast('Xatolik', res.error || 'Chekni yuborishda xatolik yuz berdi.', 'error');
    }
  };

  // Instant Direct Activation (Admin / Test Mode)
  const handleInstantActivate = async () => {
    if (!selectedPlanModal || !currentUser) return;

    setIsProcessing(true);
    const result = await subscriptionService.upgradePlan(currentUser, selectedPlanModal, paymentMethod, isRenewalOption);
    setCurrentUser(result.user);
    updateStore({ theme: store.theme });
    setIsProcessing(false);

    setPaymentSuccessInfo({ mode: 'instant', refNumber: result.receiptNumber });

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    const selectedConfig = subscriptionService.getPlanConfig(selectedPlanModal);
    showToast(
      'Obuna Faollashtirildi! 🎉',
      `Siz endi ${selectedConfig.name} tarifidasiz (Limit: ${selectedConfig.limits.maxProducts} ta mahsulot). Maʻlumotlar Firebase bazasida saqlandi.`,
      'success'
    );
  };

  return (
    <div id="pricing-view-root" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Obuna Tariflari va Mahsulot Limitlari"
        subtitle="Oʻzbekistondagi onlayn savdo uchun qulay va shaffof obuna rejalari. Firebase bulutli bazasida doimiy saqlanadi."
        fallbackRoute="dashboard"
      />

      {/* Current Active Plan Status Bar */}
      <div className="bg-white border-2 border-blue-600 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Joriy Tarif: <span className="text-blue-600">{planConfig.name}</span>
              </h3>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                trialInfo.isTrial ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {trialInfo.isTrial ? '7 Kunlik Bepul Sinov' : 'Faol Obuna'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
              <span className="flex items-center gap-1 font-bold text-slate-900">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                Katalog: {products.length} / {planConfig.limits.maxProducts} ta mahsulot
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {trialInfo.formattedRemaining} (Tugash vaqti: {trialInfo.expiryDateFormatted})
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {trialInfo.isTrial ? (
            <button
              id="btn-upgrade-starter-plan"
              onClick={() => handleOpenUpgradeModal('starter')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Starter Tarifga Oʻtish ($1 / 3 oy)</span>
            </button>
          ) : currentPlanId === 'starter' ? (
            <button
              id="btn-upgrade-pro-plan"
              onClick={() => handleOpenUpgradeModal('pro')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Tarifga Oʻtish ($5 / oy)</span>
            </button>
          ) : currentPlanId === 'pro' ? (
            <button
              id="btn-upgrade-biz-plan"
              onClick={() => handleOpenUpgradeModal('business')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Business Tarifga Oʻtish ($10 / oy)</span>
            </button>
          ) : currentPlanId === 'business' ? (
            <button
              id="btn-upgrade-premium-plan"
              onClick={() => handleOpenUpgradeModal('premium')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Tarifga Oʻtish ($20 / oy)</span>
            </button>
          ) : (
            <button
              id="btn-renew-current-plan"
              onClick={() => handleOpenUpgradeModal(currentPlanId as PlanType)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Obunani Yangilash</span>
            </button>
          )}
        </div>
      </div>

      {/* Free Trial Banner if active */}
      {trialInfo.isTrial && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-xs text-slate-700">
              <strong>7 Kunlik Bepul Sinov Faol:</strong> Siz 5 tagacha mahsulot joylashingiz va barcha funksiyalardan toʻliq foydalanishingiz mumkin. Sinov muddati tugaganda Starter tarifiga ($1 / 3 oy) o‘tishingiz mumkin.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full shrink-0">
            {trialInfo.formattedRemaining}
          </span>
        </div>
      )}

      {/* Pricing Cards Grid (5 Columns on XL, responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pt-2">
        {plans.map((p) => {
          const isCurrent = currentPlanId === p.id || (trialInfo.isTrial && p.id === 'trial');

          return (
            <div
              key={p.id}
              className={`rounded-3xl p-5 flex flex-col justify-between space-y-5 transition-all relative ${
                p.popular
                  ? 'bg-white border-2 border-blue-600 shadow-xl ring-4 ring-blue-600/10'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>ENG OMMABOP</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg text-slate-900 tracking-tight">{p.name}</h3>
                    {p.badge && !p.popular && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[36px] leading-relaxed">{p.desc}</p>
                </div>

                {/* Price Display */}
                <div className="pt-1">
                  <div className="text-xl font-black text-slate-900">
                    {p.id === 'trial' ? (
                      <span>$0 <span className="text-xs font-bold text-slate-400">(7 kun bepul)</span></span>
                    ) : p.id === 'starter' ? (
                      <span>$1 <span className="text-xs font-bold text-slate-400">/ jami 3 oy uchun (13,000 UZS)</span></span>
                    ) : (
                      <span>${p.priceUSD} <span className="text-xs font-bold text-slate-400">/ oyiga ({p.priceUZS.toLocaleString()} UZS)</span></span>
                    )}
                  </div>
                  {/* Product Limit Highlight */}
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-100">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>Maksimum {p.productLimit} ta mahsulot</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Imkoniyatlar:</p>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-tight">
                      <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {p.id === 'trial' ? (
                  <div className="w-full py-3 rounded-xl font-extrabold text-xs text-center bg-slate-100 text-slate-600 border border-slate-200">
                    {isCurrent ? 'Joriy Tarif (Faol Sinov)' : 'Avtomatik Sinov (7 kun)'}
                  </div>
                ) : (
                  <button
                    id={`btn-choose-plan-${p.id}`}
                    onClick={() => handleOpenUpgradeModal(p.id)}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
                        : p.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-95'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Faol Tarif</span>
                      </>
                    ) : (
                      <>
                        <span>{p.name} Tarifini Tanlash ({p.id === 'starter' ? '$1 / 3 oy' : `$${p.priceUSD} / oy`})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Payment & Receipt Upload Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccessInfo ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {paymentSuccessInfo.mode === 'instant' ? 'Obuna Muvaffaqiyatli Faollashtirildi!' : 'Toʻlov Cheki Qabul Qilindi!'}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                    {paymentSuccessInfo.mode === 'instant'
                      ? `Siz ${PLAN_CONFIGS[selectedPlanModal]?.name || selectedPlanModal.toUpperCase()} tarifiga oʻtdingiz. Barcha oʻzgarishlar Firestore bazasida saqlandi.`
                      : `Chekingiz admin tekshiruviga yuborildi (Kvitansiya ID: ${paymentSuccessInfo.refNumber}). Admin 5-15 daqiqa ichida tasdiqlaydi.`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlanModal(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Yopish va Doʻkonga Qaytish
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Rasmiy Toʻlov & Obuna</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {PLAN_CONFIGS[selectedPlanModal]?.name || selectedPlanModal.toUpperCase()} Tarifini Faollashtirish
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {PLAN_CONFIGS[selectedPlanModal]?.limits.maxProducts || (selectedPlanModal === 'premium' ? 110 : selectedPlanModal === 'business' ? 50 : selectedPlanModal === 'pro' ? 20 : 5)} tagacha mahsulot katalog hajmi ochiladi.
                  </p>
                </div>

                {/* Price Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-800">{PLAN_CONFIGS[selectedPlanModal]?.name || selectedPlanModal.toUpperCase()} Tarifi</p>
                    <p className="text-[11px] text-slate-500">
                      {selectedPlanModal === 'starter'
                        ? '3 oylik toʻliq kirish (90 kun)'
                        : '1 oylik toʻliq kirish (30 kun)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-blue-600">
                      {plans.find((p) => p.id === selectedPlanModal)?.priceFormatted ||
                        `${PLAN_CONFIGS[selectedPlanModal]?.priceUZS.toLocaleString()} UZS ($${PLAN_CONFIGS[selectedPlanModal]?.priceUSD})`}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {selectedPlanModal === 'starter'
                        ? '3 oy uchun jami $1'
                        : `1 oy uchun $${PLAN_CONFIGS[selectedPlanModal]?.priceUSD || (selectedPlanModal === 'premium' ? 20 : selectedPlanModal === 'business' ? 10 : 5)}`}
                    </span>
                  </div>
                </div>

                {/* Official Card Details Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>Qabul qiluvchi karta (Uzcard / Humo):</span>
                    <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-md font-mono">Rasmiy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-amber-300">
                      {OFFICIAL_CARD}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedCard ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCard ? 'Nusxalandi!' : 'Nusxa olish'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
                    <span>{CARD_HOLDER}</span>
                    <span>Click / Payme / Uzum Bank</span>
                  </div>
                </div>

                {/* Upload Receipt Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Toʻlov cheki / Skrinshotini yuklash <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {receiptImage ? (
                    <div className="relative border border-emerald-300 bg-emerald-50/60 rounded-2xl p-3 flex items-center gap-3">
                      <img
                        src={receiptImage}
                        alt="Receipt Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Chek skrinshoti biriktirildi
                        </p>
                        <p className="text-[10px] text-emerald-700 mt-0.5 truncate">Admin tasdiqlashiga tayyor</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReceiptImage(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                    >
                      <Upload className="w-5 h-5 text-blue-600" />
                      <p className="text-xs font-bold text-slate-700">Chek rasmini yuklash uchun bosing</p>
                      <p className="text-[10px] text-slate-400">Click, Payme yoki bank cheki skrinshoti (JPG, PNG)</p>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Telefon raqamingiz
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tranzaksiya / Izoh (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Masalan: TR-892147"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    id="btn-submit-receipt"
                    onClick={handleSubmitReceiptPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Chekni Yuborish (Admin Tasdiqlashi)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleInstantActivate}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tezkor Toʻgʻridan-toʻgʻri Aktivlashtirish (Admin/Test)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
