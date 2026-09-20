import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import { subscriptionService, PLAN_CONFIGS } from '../services/subscriptionService';
import { paynetService, PaynetPaymentResponse } from '../services/paynetService';
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
  CheckCheck,
  RefreshCw,
  QrCode,
  ExternalLink,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PricingView: React.FC = () => {
  const { store, updateStore, currentUser, setCurrentUser, products, showToast, formatMoney, navigateTo, t } = useApp();

  const [selectedPlanModal, setSelectedPlanModal] = useState<PlanType | null>(null);
  const [isRenewalOption, setIsRenewalOption] = useState<boolean>(false);
  const [paymentTab, setPaymentTab] = useState<'paynet' | 'card'>('paynet');
  const [cardMethod, setCardMethod] = useState<'Click' | 'Payme' | 'Uzum Bank' | 'Card'>('Card');

  // Paynet Gateway states
  const [paynetData, setPaynetData] = useState<PaynetPaymentResponse | null>(null);
  const [paynetLoading, setPaynetLoading] = useState(false);
  const [paynetStatus, setPaynetStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'>('PENDING');
  const [copiedPaynetId, setCopiedPaynetId] = useState(false);
  const [copiedCashierCode, setCopiedCashierCode] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins

  // Card P2P states
  const [copiedCard, setCopiedCard] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{ mode: 'paynet' | 'p2p' | 'instant'; refNumber?: string; plan?: PlanType } | null>(null);

  // Auth requirement prompt modal
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

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
        'Paynet, Click, Payme va Uzum Bank to‘lovlari',
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
        'Paynet orqali bir zumda aktivatsiya',
        'To‘g‘ridan-to‘g‘ri Telegram buyurtmalar',
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
        'Barcha do‘kon funksiyalari ochiq',
        'Prioritet tezkor texnik yordam',
        'Telegram kanalga avtomatik bildirishnoma',
        'Batafsil savdo statistikasi',
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
      desc: 'Katta assortimentli bizneslar uchun. 50 tagacha mahsulot va kengaytirilgan imkoniyatlar.',
      badge: 'Biznes Uchun',
      features: [
        'Maksimum 50 ta mahsulot limiti',
        'Har oy $10 (130,000 UZS)',
        'Shaxsiy domen ulash imkoniyati',
        'Avtomatlashtirilgan buyurtma yuborish',
        'VIP qo‘llab-quvvatlash xizmati',
        'Ko‘p filialli boshqaruv',
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
      desc: 'Yirik brendlar va distributorlar uchun. 110 tagacha mahsulot va cheksiz savdo oqimi.',
      badge: 'VIP Maksimal',
      features: [
        'Maksimum 110 ta mahsulot limiti',
        'Har oy $20 (260,000 UZS)',
        'Cheksiz mijozlar va buyurtmalar',
        'Shaxsiy VIP menejer koʻmagi',
        'Maksimal server tezligi va 0% komissiya',
        'Barcha yangi imkoniyatlarga 1-kirish',
      ],
    },
  ];

  // Auth gate check before opening plan checkout
  const handleOpenUpgradeModal = (planId: PlanType, renewal = false) => {
    if (!currentUser) {
      setAuthPromptOpen(true);
      return;
    }

    setSelectedPlanModal(planId);
    setIsRenewalOption(renewal);
    setPaymentTab('paynet');
    setPaynetData(null);
    setPaynetStatus('PENDING');
    setReceiptImage(null);
    setTransactionRef('');
    setPaymentSuccessInfo(null);
    setSecondsRemaining(900);
  };

  // Auto-initiate Paynet payment when modal opens or plan changes
  useEffect(() => {
    if (!selectedPlanModal || !currentUser || paymentTab !== 'paynet' || paymentSuccessInfo) return;

    let isMounted = true;
    const plan = plans.find((p) => p.id === selectedPlanModal);
    const amountUZS = plan?.priceUZS || (selectedPlanModal === 'starter' ? 13000 : 65000);

    const initiatePaynet = async () => {
      setPaynetLoading(true);
      setPaynetStatus('PENDING');
      try {
        const res = await paynetService.createPayment({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userPhone: currentUser.phone,
          planId: selectedPlanModal,
          amount: amountUZS,
          paymentType: 'subscription',
        });

        if (isMounted) {
          if (res.success) {
            setPaynetData(res);
            setPaynetStatus('PENDING');
          } else {
            showToast('Paynet xatolik', res.error || 'Toʻlov yaratib boʻlmadi', 'error');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          showToast('Xatolik', 'Paynet bilan bogʻlanishda xatolik', 'error');
        }
      } finally {
        if (isMounted) setPaynetLoading(false);
      }
    };

    initiatePaynet();

    return () => {
      isMounted = false;
    };
  }, [selectedPlanModal, paymentTab]);

  // Polling transaction status every 3 seconds while PENDING
  useEffect(() => {
    if (!paynetData?.transactionId || paynetStatus !== 'PENDING' || paymentSuccessInfo) return;

    const interval = setInterval(async () => {
      try {
        const check = await paynetService.checkStatus(paynetData.transactionId);
        if (check.status === 'PAID') {
          setPaynetStatus('PAID');
          handlePaymentSuccess(selectedPlanModal!, 'Paynet', check.transaction?.transactionId || paynetData.transactionId);
        } else if (check.status === 'FAILED') {
          setPaynetStatus('FAILED');
        } else if (check.status === 'CANCELLED') {
          setPaynetStatus('CANCELLED');
        }
      } catch {
        // quiet fallback
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paynetData?.transactionId, paynetStatus, paymentSuccessInfo, selectedPlanModal]);

  // Expiration countdown
  useEffect(() => {
    if (!paynetData || paynetStatus !== 'PENDING') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPaynetStatus('CANCELLED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paynetData, paynetStatus]);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Payment Success Handler
  const handlePaymentSuccess = async (planId: PlanType, method: 'Paynet' | 'Card', receiptId?: string) => {
    if (!currentUser) return;
    setIsProcessing(true);

    try {
      const result = await subscriptionService.upgradePlan(currentUser, planId, method, isRenewalOption);
      setCurrentUser(result.user);
      updateStore({ theme: store.theme });

      setPaymentSuccessInfo({
        mode: method === 'Paynet' ? 'paynet' : 'p2p',
        refNumber: receiptId || result.receiptNumber,
        plan: planId,
      });

      try {
        confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      const selectedConfig = subscriptionService.getPlanConfig(planId);
      showToast(
        'Obuna Faollashtirildi! 🎉',
        `Siz endi ${selectedConfig.name} tarifidasiz (Limit: ${selectedConfig.limits.maxProducts} ta mahsulot). Maʻlumotlar Firebase bazasida saqlandi.`,
        'success'
      );
    } catch (err: any) {
      showToast('Xatolik', 'Obunani yangilashda xatolik yuz berdi: ' + err?.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Explicit Verify button
  const handleVerifyPaynet = async () => {
    if (!paynetData?.transactionId || !selectedPlanModal) return;
    setIsProcessing(true);

    const res = await paynetService.verifyPayment(paynetData.transactionId);
    setIsProcessing(false);

    if (res.activated || res.status === 'PAID') {
      setPaynetStatus('PAID');
      handlePaymentSuccess(selectedPlanModal, 'Paynet', paynetData.transactionId);
    } else {
      showToast('Toʻlov kutilmoqda', 'Toʻlov hali amalga oshirilmadi. Iltimos toʻlovni bajaring yoki bir necha soniyadan soʻng tekshiring.', 'info');
    }
  };

  // Simulation test helpers (P0 QA verification)
  const handleSimulatePaynet = async (simStatus: 'PAID' | 'FAILED' | 'CANCELLED') => {
    if (!paynetData?.transactionId || !selectedPlanModal) return;
    setIsProcessing(true);

    const res = await paynetService.simulatePayment(paynetData.transactionId, simStatus);
    setIsProcessing(false);

    if (simStatus === 'PAID') {
      setPaynetStatus('PAID');
      handlePaymentSuccess(selectedPlanModal, 'Paynet', paynetData.transactionId);
    } else {
      setPaynetStatus(simStatus);
      showToast(
        simStatus === 'CANCELLED' ? 'Toʻlov bekor qilindi' : 'Toʻlov rad etildi',
        `Simulyatsiya natijasi: ${simStatus}`,
        simStatus === 'CANCELLED' ? 'info' : 'error'
      );
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: 'card' | 'paynet' | 'cashier') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text.replace(/\s/g, ''));
    }
    if (type === 'card') {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
      showToast('Nusxalandi', text, 'success');
    } else if (type === 'paynet') {
      setCopiedPaynetId(true);
      setTimeout(() => setCopiedPaynetId(false), 2000);
      showToast('Paynet ID nusxalandi', text, 'success');
    } else {
      setCopiedCashierCode(true);
      setTimeout(() => setCopiedCashierCode(false), 2000);
      showToast('Kassa kodi nusxalandi', text, 'success');
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

  // Submit Receipt for Admin Review (P2P option)
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
      paymentMethod: cardMethod,
      receiptImageUrl: receiptImage || undefined,
      transactionRef: transactionRef.trim() || undefined,
      senderPhone: senderPhone.trim() || currentUser.phone || undefined,
    });

    setIsProcessing(false);

    if (res.success) {
      setPaymentSuccessInfo({ mode: 'p2p', refNumber: res.paymentId, plan: selectedPlanModal });
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

  return (
    <div id="pricing-view-root" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title={t('pricing_page_title', 'Obuna Tariflari va Mahsulot Limitlari')}
        subtitle={t('pricing_page_subtitle', 'Oʻzbekistondagi onlayn savdo uchun qulay va shaffof obuna rejalari. Paynet orqali avtomatik toʻlov va Firestore bazasida xavfsiz saqlash.')}
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
                {t('pricing_current_plan', 'Joriy Tarif:')} <span className="text-blue-600">{planConfig.name}</span>
              </h3>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  trialInfo.isTrial ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {trialInfo.isTrial ? t('pricing_free_trial', '7 Kunlik Bepul Sinov') : t('pricing_active_sub', 'Faol Obuna')}
              </span>
              {currentUser?.deviceType && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser.deviceType === 'phone' ? '📱 Telefon rejimi' : '💻 Kompyuter rejimi'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
              <span>{t('pricing_catalog_limit', 'Maksimal katalog hajmi:')} <strong>{planConfig.limits.maxProducts} {t('pricing_products_unit', 'ta mahsulot')}</strong></span>
              <span>•</span>
              <span>{t('pricing_existing_products', 'Mavjud mahsulotlar:')} <strong>{products.length} {t('pricing_products_unit', 'ta')}</strong></span>
              <span>•</span>
              <span>{t('pricing_status_label', 'Holati:')} <strong>{trialInfo.formattedRemaining}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser && (
            <button
              id="pricing-btn-paynet-quick-starter"
              onClick={() => handleOpenUpgradeModal('starter')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('pricing_starter_quick_btn', 'Starter ($1 / 3 oy) — Paynet')}</span>
            </button>
          )}
          {!currentUser && (
            <button
              id="pricing-btn-login-to-upgrade"
              onClick={() => setAuthPromptOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('pricing_login_register', 'Kirish / Roʻyxatdan oʻtish')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = (currentUser?.plan || 'trial') === p.id;
          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl border-2 transition-all p-6 flex flex-col justify-between relative overflow-hidden ${
                isCurrent
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                  : p.popular
                  ? 'border-blue-600 shadow-lg'
                  : 'border-slate-200 hover:border-blue-400 shadow-xs'
              }`}
            >
              {p.badge && (
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      p.popular
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h4 className="text-lg font-black text-slate-900">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.desc}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 mb-5 border border-slate-100">
                  <span className="text-2xl font-black text-slate-900">
                    {p.priceUSD === 0 ? '0 UZS' : `${p.priceUZS.toLocaleString()} UZS`}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">
                    {p.duration === '3 oy' ? '/ 3 oy uchun ($1)' : p.priceUSD === 0 ? '' : `/ oy ($${p.priceUSD})`}
                  </span>
                  <div className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Maksimal {p.productLimit} ta mahsulot limiti</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-slate-600">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('pricing_current_active_badge', 'Joriy Faol Tarifingiz')}</span>
                  </div>
                ) : p.isTrial ? (
                  <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs text-center">
                    {t('pricing_trial_period_badge', 'Bepul Sinov Davri')}
                  </div>
                ) : (
                  <button
                    id={`btn-select-plan-${p.id}`}
                    type="button"
                    onClick={() => handleOpenUpgradeModal(p.id)}
                    className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      p.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                    }`}
                  >
                    <span>{p.name} {t('pricing_select_plan_btn', 'Tarifini Tanlash')} ({p.id === 'starter' ? '$1 / 3 oy' : `$${p.priceUSD} / oy`})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auth Gate Modal (P0 Authentication Requirement) */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{t('pricing_auth_required_title', 'Tizimga Kirish Talab Qilinadi')}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('pricing_auth_required_desc', 'Obuna sotib olish va mahsulot katalog limitini kengaytirish uchun avval hisobingizga kiring yoki yangi roʻyxatdan oʻting. Har bir obuna va toʻlov aniq foydalanuvchi profiliga bogʻlanadi.')}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                id="btn-auth-prompt-login"
                onClick={() => {
                  setAuthPromptOpen(false);
                  navigateTo('auth', { mode: 'login' });
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth_login_tab', 'Kirish')}</span>
              </button>
              <button
                id="btn-auth-prompt-signup"
                onClick={() => {
                  setAuthPromptOpen(false);
                  navigateTo('auth', { mode: 'signup' });
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{t('auth_signup_tab', 'Roʻyxatdan oʻtish')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthPromptOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 py-1 cursor-pointer"
              >
                {t('cancel', 'Bekor qilish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Payment & Checkout Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
                    {t('pricing_checkout_success_title', 'Obuna Muvaffaqiyatli Faollashtirildi! 🎉')}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                    Siz <strong>{PLAN_CONFIGS[paymentSuccessInfo.plan || selectedPlanModal]?.name || selectedPlanModal.toUpperCase()}</strong> tarifiga oʻtdingiz. Yangi mahsulot limiti: {PLAN_CONFIGS[paymentSuccessInfo.plan || selectedPlanModal]?.limits.maxProducts || 5} ta mahsulot. Tranzaksiya kvitansiyasi: {paymentSuccessInfo.refNumber}.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlanModal(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {t('pricing_checkout_close_btn', 'Yopish va Doʻkonga Qaytish')}
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{t('pricing_checkout_badge', 'Rasmiy Toʻlov & Obuna')}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {PLAN_CONFIGS[selectedPlanModal]?.name || selectedPlanModal.toUpperCase()} {t('pricing_checkout_activate_title', 'Tarifini Faollashtirish')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('pricing_user_label', 'Foydalanuvchi:')} <strong>{currentUser?.name || currentUser?.email || 'Foydalanuvchi'}</strong> ({currentUser?.email || currentUser?.phone || 'ID: ' + currentUser?.id})
                  </p>
                </div>

                {/* Price Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-800">{PLAN_CONFIGS[selectedPlanModal]?.name || selectedPlanModal.toUpperCase()} {t('pricing_plan_suffix', 'Tarifi')}</p>
                    <p className="text-[11px] text-slate-500">
                      {selectedPlanModal === 'starter'
                        ? '3 oylik toʻliq kirish (90 kun)'
                        : '1 oylik toʻliq kirish (30 kun)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">
                      {plans.find((p) => p.id === selectedPlanModal)?.priceFormatted ||
                        `${PLAN_CONFIGS[selectedPlanModal]?.priceUZS.toLocaleString()} UZS ($${PLAN_CONFIGS[selectedPlanModal]?.priceUSD})`}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Limit: {PLAN_CONFIGS[selectedPlanModal]?.limits.maxProducts || 5} ta mahsulot
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    id="tab-paynet"
                    onClick={() => setPaymentTab('paynet')}
                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentTab === 'paynet'
                        ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{t('pricing_tab_paynet', '🟢 Paynet (Avtomatik)')}</span>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">{t('pricing_tab_paynet_speed', 'Tezkor')}</span>
                  </button>
                  <button
                    type="button"
                    id="tab-card"
                    onClick={() => setPaymentTab('card')}
                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentTab === 'card'
                        ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{t('pricing_tab_card', '💳 Karta (P2P Chek)')}</span>
                  </button>
                </div>

                {/* TAB 1: PAYNET GATEWAY (P0 INTEGRATION) */}
                {paymentTab === 'paynet' && (
                  <div className="space-y-4">
                    {paynetLoading ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-600 font-medium">{t('pricing_paynet_connecting', 'Paynet toʻlov shlyuziga ulanmoqda...')}</p>
                      </div>
                    ) : paynetData ? (
                      <div className="space-y-4">
                        {/* Paynet QR & Code Card */}
                        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg border border-emerald-500/20">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <ShieldCheck className="w-4 h-4" />
                              <span>{t('pricing_paynet_official_gateway', 'Paynet Rasmiy Shlyuzi')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                              <Clock className="w-3 h-3" />
                              <span>{formatCountdown(secondsRemaining)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                            {/* QR code box */}
                            <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center text-slate-900 shadow-inner">
                              <img
                                src={paynetData.qrCodeUrl}
                                alt="Paynet QR"
                                className="w-32 h-32 object-contain"
                              />
                              <span className="text-[10px] font-bold text-slate-600 mt-1 text-center">
                                {t('pricing_paynet_scan_qr', 'Paynet ilovasi orqali skanerlang')}
                              </span>
                            </div>

                            {/* Payment details */}
                            <div className="space-y-2.5 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block">{t('pricing_paynet_cashier_code_label', 'Kassa toʻlov kodi (Paynet shoxobchalari uchun):')}</span>
                                <div className="flex items-center justify-between bg-white/10 rounded-lg px-2.5 py-1.5 mt-0.5">
                                  <span className="font-mono text-base font-black text-amber-300">
                                    {paynetData.cashierCode}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(paynetData.cashierCode, 'cashier')}
                                    className="p-1 hover:bg-white/10 rounded text-slate-300"
                                  >
                                    {copiedCashierCode ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 block">{t('pricing_paynet_tx_id', 'Tranzaksiya ID:')}</span>
                                <div className="flex items-center justify-between bg-white/10 rounded-lg px-2.5 py-1.5 mt-0.5">
                                  <span className="font-mono text-xs text-slate-200 truncate">
                                    {paynetData.paynetTransactionId}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(paynetData.paynetTransactionId, 'paynet')}
                                    className="p-1 hover:bg-white/10 rounded text-slate-300"
                                  >
                                    {copiedPaynetId ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 block">{t('pricing_paynet_total_amount', 'Jami toʻlov miqdori:')}</span>
                                <span className="text-base font-black text-emerald-400 block">
                                  {paynetData.amount.toLocaleString()} UZS
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status notification */}
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            paynetStatus === 'PENDING'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : paynetStatus === 'PAID'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {paynetStatus === 'PENDING' && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                            )}
                            <span className="font-bold">
                              {paynetStatus === 'PENDING'
                                ? t('pricing_paynet_status_pending', 'Status: Toʻlov kutilmoqda (har 3 soniyada avto-tekshiruv)')
                                : paynetStatus === 'PAID'
                                ? t('pricing_paynet_status_paid', 'Status: Toʻlov qabul qilindi!')
                                : paynetStatus === 'CANCELLED'
                                ? t('pricing_paynet_status_cancelled', 'Status: Toʻlov bekor qilindi')
                                : t('pricing_paynet_status_failed', 'Status: Toʻlov amalga oshmadi')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyPaynet}
                            disabled={isProcessing || paynetStatus !== 'PENDING'}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                            <span>{t('pricing_paynet_btn_verify', 'Tekshirish')}</span>
                          </button>
                        </div>

                        {/* Test QA Simulator Controls (Per P0 Requirements) */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                            {t('pricing_qa_simulator_title', '🧪 QA & Test Simulyatori (Barcha holatlarni tekshirish):')}
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              id="btn-simulate-paynet-success"
                              onClick={() => handleSimulatePaynet('PAID')}
                              disabled={isProcessing}
                              className="py-2 px-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer text-center"
                            >
                              {t('pricing_qa_btn_success', '✓ Muvaffaqiyatli (Test)')}
                            </button>
                            <button
                              type="button"
                              id="btn-simulate-paynet-cancelled"
                              onClick={() => handleSimulatePaynet('CANCELLED')}
                              disabled={isProcessing}
                              className="py-2 px-1 text-[11px] font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors cursor-pointer text-center"
                            >
                              {t('pricing_qa_btn_cancel', 'Bekor qilish')}
                            </button>
                            <button
                              type="button"
                              id="btn-simulate-paynet-failed"
                              onClick={() => handleSimulatePaynet('FAILED')}
                              disabled={isProcessing}
                              className="py-2 px-1 text-[11px] font-bold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer text-center"
                            >
                              {t('pricing_qa_btn_reject', 'Rad etish')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500">
                        {t('pricing_paynet_load_failed', 'Toʻlov maʻlumotlari yuklanmadi. Iltimos qaytadan urinib koʻring.')}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: P2P CARD TRANSFER (CLICK / PAYME / UZUM BANK) */}
                {paymentTab === 'card' && (
                  <div className="space-y-4">
                    {/* Official Card Details Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                        <span>{t('pricing_card_recipient_label', 'Qabul qiluvchi karta (Uzcard / Humo):')}</span>
                        <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-md font-mono">{t('pricing_card_official_tag', 'Rasmiy')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-amber-300">
                          {OFFICIAL_CARD}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(OFFICIAL_CARD, 'card')}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedCard ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCard ? t('btn_copied', 'Nusxa olindi!') : t('btn_copy', 'Nusxa olish')}</span>
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
                        {t('pricing_receipt_upload_label', 'Toʻlov cheki / Skrinshotini yuklash')} <span className="text-rose-500">*</span>
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
                              {t('pricing_receipt_attached_title', 'Chek skrinshoti biriktirildi')}
                            </p>
                            <p className="text-[10px] text-emerald-700 mt-0.5 truncate">{t('pricing_receipt_ready_admin', 'Admin tasdiqlashiga tayyor')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                          <p className="text-xs font-bold text-slate-700">{t('pricing_receipt_drop_hint', 'Chek rasmini yuklash uchun bosing')}</p>
                          <p className="text-[10px] text-slate-400">{t('pricing_receipt_formats_hint', 'Click, Payme yoki bank cheki skrinshoti (JPG, PNG)')}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {t('pricing_sender_phone_label', 'Telefon raqamingiz')}
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
                          {t('pricing_tx_note_label', 'Tranzaksiya / Izoh (ixtiyoriy)')}
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

                    {/* Submit Receipt Action Button */}
                    <div className="pt-2">
                      <button
                        id="btn-submit-receipt"
                        onClick={handleSubmitReceiptPayment}
                        disabled={isProcessing}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{t('pricing_btn_submit_receipt', 'Chekni Yuborish (Admin Tasdiqlashi)')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
