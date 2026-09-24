import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import {
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Bot,
  Zap,
  Globe2,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  Percent,
  Play,
  Store as StoreIcon,
  Search,
  Smartphone,
  Monitor,
  Megaphone,
  Flame,
  X,
  Send,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const {
    navigateTo,
    store,
    formatMoney,
    t,
    currentUser,
    products,
    orders,
    automation,
    getStoreUrl,
  } = useApp();

  // State for Advertising Request Modal
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adSubmitted, setAdSubmitted] = useState(false);
  const [adForm, setAdForm] = useState({
    name: '',
    phone: '',
    category: 'product',
    message: '',
  });

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.phone.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('sellnex_ad_inquiries') || '[]');
      existing.unshift({
        ...adForm,
        id: `ad_${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('sellnex_ad_inquiries', JSON.stringify(existing));
    } catch {
      // ignore
    }
    setAdSubmitted(true);
    setTimeout(() => {
      setAdSubmitted(false);
      setIsAdModalOpen(false);
      setAdForm({ name: '', phone: '', category: 'product', message: '' });
    }, 2800);
  };

  const howItWorksSteps = [
    {
      step: '01',
      title: t('landing_step_1_title', 'Import a Product'),
      desc: t('landing_step_1_desc', 'Paste any product link from Amazon, Alibaba, Uzum Market, or local suppliers. We instantly extract images, descriptions & variants.'),
      icon: Search,
      badge: t('landing_step_1_badge', 'Auto-Import'),
    },
    {
      step: '02',
      title: t('landing_step_2_title', 'Set Your Profit'),
      desc: t('landing_step_2_desc', 'Use our smart profit calculator. Enter fixed earnings (e.g. 75,000 UZS) or percentage margin. Selling price is calculated automatically.'),
      icon: Percent,
      badge: t('landing_step_2_badge', 'Smart Math'),
    },
    {
      step: '03',
      title: t('landing_step_3_title', 'Publish Your Store'),
      desc: t('landing_step_3_desc', 'Customize your branded storefront in 2 minutes with our drag-and-drop builder. Connect custom domain or use your free .sellnex.uz URL.'),
      icon: StoreIcon,
      badge: t('landing_step_3_badge', 'Live Instantly'),
    },
    {
      step: '04',
      title: t('landing_step_4_title', 'Share Your Link'),
      desc: t('landing_step_4_desc', 'Promote your store link across Instagram, Telegram, TikTok and WhatsApp with built-in affiliate and tracking campaign links.'),
      icon: Globe2,
      badge: t('landing_step_4_badge', 'Multi-Channel'),
    },
    {
      step: '05',
      title: t('landing_step_5_title', 'Receive Orders & Paid'),
      desc: t('landing_step_5_desc', 'Accept local payments effortlessly with Click, Payme, Uzum Bank, and Cash on Delivery. Customer funds transfer directly.'),
      icon: CreditCard,
      badge: t('landing_step_5_badge', 'Uzbekistan Switch'),
    },
    {
      step: '06',
      title: t('landing_step_6_title', 'Automate Fulfillment'),
      desc: t('landing_step_6_desc', 'Sit back as our automation engine automatically routes orders to suppliers, tracks courier dispatch, and updates your customer.'),
      icon: Bot,
      badge: t('landing_step_6_badge', 'Hands-Free'),
    },
  ];

  const features = [
    {
      title: t('landing_feat_1_title', 'Storefront Builder'),
      desc: t('landing_feat_1_desc', 'Shopify-style customizable storefronts optimized for mobile conversion in Uzbekistan.'),
      icon: StoreIcon,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: t('landing_feat_2_title', '1-Click Product Importer'),
      desc: t('landing_feat_2_desc', 'Extract supplier costs, stock, high-res photos and variants from any major e-commerce marketplace.'),
      icon: Zap,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: t('landing_feat_3_title', 'Dynamic Profit Calculator'),
      desc: t('landing_feat_3_desc', 'Calculate supplier base + logistics + payment commission + your net profit in real-time.'),
      icon: Percent,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: t('landing_feat_4_title', 'Click & Payme Native Gateways'),
      desc: t('landing_feat_4_desc', 'Pre-integrated national payment switch with support for Click, Payme, and Uzum Bank installments.'),
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: t('landing_feat_5_title', 'Uzum Market Ecosystem'),
      desc: t('landing_feat_5_desc', 'Sync inventory, export orders, and manage cross-platform marketplace channels seamlessly.'),
      icon: Layers,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: t('landing_feat_6_title', 'Dropship Order Automation'),
      desc: t('landing_feat_6_desc', 'Auto-dispatch orders to suppliers, auto-sync stock, and send Telegram bot alerts instantly.'),
      icon: Bot,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: t('landing_feat_7_title', 'Real-time Analytics'),
      desc: t('landing_feat_7_desc', 'Monitor GMV, net margins, traffic channels (Telegram, TikTok, IG), and best-sellers.'),
      icon: TrendingUp,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: t('landing_feat_8_title', 'Regional Delivery & Couriers'),
      desc: t('landing_feat_8_desc', 'Automated dispatch with UzPost, BTS Cargo, Fargo Express, and Yandex Delivery across all 12 regions.'),
      icon: Truck,
      color: 'bg-teal-50 text-teal-600',
    },
  ];

  const integrations = [
    { name: 'Click', type: 'Local Payments', status: 'Connected', icon: '💳' },
    { name: 'Payme', type: 'Local Payments', status: 'Connected', icon: '⚡' },
    { name: 'Uzum Bank', type: 'Installment & Payments', status: 'Connected', icon: '🍇' },
    { name: 'Uzum Market', type: 'Marketplace Sync', status: 'Official Partner', icon: '🛍️' },
    { name: 'Amazon', type: 'Global Supplier', status: 'Global API', icon: '📦' },
    { name: 'Alibaba', type: 'Wholesale Dropship', status: 'Wholesale API', icon: '🌏' },
    { name: 'Custom Suppliers', type: 'Direct API & Warehouse', status: 'Available', icon: '🏢' },
    { name: 'Telegram Bot', type: 'Order Notifications', status: 'Available', icon: '🤖' },
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Top Navigation */}
      <nav id="landing-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-12 py-2 sm:py-3.5 flex items-center justify-between w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              SELLNEX
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                UZ
              </span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button
            id="nav-home"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-blue-600 transition-colors"
          >
            {t('nav_home', 'Home')}
          </button>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">{t('nav_how_it_works', 'How it Works')}</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">{t('nav_features', 'Features')}</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">{t('nav_pricing', 'Pricing')}</a>
        </div>

        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <LanguageSwitcher variant="compact" />
          <button
            id="landing-login-btn"
            onClick={() => navigateTo('auth', { mode: 'login' })}
            className="px-2 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 min-h-[34px] sm:min-h-[40px]"
          >
            {t('nav_login', 'Log In')}
          </button>
          <button
            id="landing-signup-btn"
            onClick={() => navigateTo('auth', { mode: 'signup' })}
            className="px-2.5 sm:px-4 lg:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center gap-1 shrink-0 whitespace-nowrap min-h-[34px] sm:min-h-[40px]"
          >
            <span className="hidden sm:inline">{t('nav_signup', 'Sign Up')}</span>
            <span className="sm:hidden">{t('nav_signup_short', "Ro'yxat")}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden w-full">
        {/* Subtle Background Glow - constrained to not overflow on mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[600px] h-72 sm:h-[350px] bg-blue-400/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none -z-10 max-w-full" />

        <div className="inline-flex max-w-full items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="break-words text-center">{t('landing_badge', "Central Asia's First All-in-One E-Commerce & Dropshipping Platform")}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.2] sm:leading-[1.15] break-words px-1">
          {t('landing_hero_title', 'Build Your Store.')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block">
            {t('landing_hero_title_highlight', 'Sell Anywhere.')}
          </span>
        </h1>

        <p className="mt-3.5 sm:mt-5 text-xs sm:text-base lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-1 break-words">
          {t('landing_hero_subtitle', 'Create your online store, import products, set your profit, accept local payments and automate your orders — all from one platform.')}
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 max-w-sm sm:max-w-none mx-auto w-full px-2 sm:px-0">
          <button
            id="hero-start-selling"
            onClick={() => navigateTo('auth', { mode: 'signup' })}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px]"
          >
            <span>{t('btn_start_selling', 'Start Selling')}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <button
            id="hero-login-btn"
            onClick={() => navigateTo('auth', { mode: 'login' })}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px]"
          >
            <span>{t('nav_login', 'Log In')}</span>
          </button>

          <button
            id="hero-view-pricing"
            onClick={() => navigateTo('pricing')}
            className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px]"
          >
            <span>{t('nav_pricing', 'Pricing & Plans')}</span>
          </button>
        </div>

        {/* Quick Device Selector Cards */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-2xl mx-auto text-left shadow-2xs w-full">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{t('landing_device_selector_title', "Qurilma bo'yicha kirish:")}</span>
            </span>
            <span className="text-[11px] text-slate-400">{t('landing_device_ready_badge', 'Telegram & Web tayyor')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              id="landing-enter-mobile-btn"
              onClick={() => {
                localStorage.setItem('sellnex_device_mode', 'mobile');
                if (currentUser) {
                  navigateTo('dashboard');
                } else {
                  navigateTo('auth', { mode: 'signup' });
                }
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 transition-all text-left group shadow-2xs cursor-pointer min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                  <span>{t('landing_device_mobile_title', '📱 Telefon / Mini App')}</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">{t('landing_device_mobile_desc', 'Mobil & Telegram Mini App')}</p>
              </div>
            </button>

            <button
              id="landing-enter-desktop-btn"
              onClick={() => {
                localStorage.setItem('sellnex_device_mode', 'desktop');
                if (currentUser) {
                  navigateTo('dashboard');
                } else {
                  navigateTo('auth', { mode: 'signup' });
                }
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-800 transition-all text-left group shadow-2xs cursor-pointer min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1">
                  <span>{t('landing_device_desktop_title', '💻 Kompyuter / Desktop')}</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">{t('landing_device_desktop_desc', 'Keng ekranli Boshqaruv paneli')}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Value Proposition Pills */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500 px-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('landing_pill_no_inventory', 'No Inventory Required')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('landing_pill_payments_ready', 'Click & Payme Ready')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('landing_pill_delivery', '24-48h Delivery in Uzbekistan')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('landing_pill_profit_calc', 'Automatic Profit Calculator')}</span>
          </div>
        </div>

        {/* Sellnex Reklama & Hamkorlik Vitrinasi (Replaced fake report with real Advertising / Promo Showcase) */}
        <div id="sellnex-ad-showcase" className="mt-8 sm:mt-12 max-w-6xl mx-auto rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-2 sm:p-5 shadow-2xl text-left w-full overflow-hidden text-white">
          {/* Top Bar / Ad Tag */}
          <div className="px-3 sm:px-4 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
                <span>Reklama & Hamkorlik Vitrinasi</span>
              </div>
              <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                O‘zbekiston bo‘ylab 50,000+ maqsadli tadbirkor va xaridorlar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-place-ad-top"
                onClick={() => setIsAdModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Reklama joylashtirish</span>
              </button>
            </div>
          </div>

          {/* Main Featured Promo Banner */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900/90 rounded-2xl border border-blue-500/30 m-1.5 sm:m-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>HOT PROMO | SELLNEX ADS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Mahsulotingiz yoki Do‘koningizni Sellnex orqali butun O‘zbekistonga reklama qiling!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Do‘koningiz, optom tovarlaringiz yoki yetkazib berish xizmatingizni eng faol sotuvchilar va xaridorlarga taqdim eting. Sayt bosh sahifasi, katalog va Telegram kanalimizda to‘g‘ridan-to‘g‘ri reklama banneri.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  id="btn-place-ad-hero"
                  onClick={() => setIsAdModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 shrink-0" />
                  <span>Reklama berish</span>
                </button>
                <button
                  id="btn-view-catalog-promo"
                  onClick={() => navigateTo('products')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Tovarlar katalogi</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Interactive Commercial Promo Spots */}
          <div className="p-1.5 sm:p-3 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Ad Spot 1: Trend Mahsulotlar */}
            <div className="bg-slate-800/80 hover:bg-slate-800 transition-colors p-4 rounded-2xl border border-slate-700/70 flex flex-col justify-between space-y-3 group">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>TREND TOVAR REKLAMASI</span>
                  </span>
                  <span className="bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 text-[10px]">Optom Ombor</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Smart Gadjetlar & Elektronika
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Toshkent omboridan 24 soatda yetkazib berish. 1 donadan boshlab dropshipping va to‘g‘ridan-to‘g‘ri mijozga yetkazish.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-bold">100% Rasmiy ombor</span>
                <button
                  onClick={() => navigateTo('products')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Katalogda ko‘rish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ad Spot 2: Sizning Reklamangiz */}
            <div className="bg-gradient-to-br from-slate-800/90 to-amber-950/20 hover:border-amber-500/50 transition-all p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>REKLAMA JOYI BO‘SH</span>
                  </span>
                  <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-extrabold text-[10px]">Aksiya</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Sizning Reklamangiz Shu Yerda!
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Do‘koningiz, mahsulotingiz yoki xizmatingizni birinchi o‘rinda joylashtiring va minglab yangi xaridorlarga ega bo‘ling.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Kunlik 5,000+ ko‘rishlar</span>
                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Joylashtirish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ad Spot 3: To'lov va Yetkazib Berish */}
            <div className="bg-slate-800/80 hover:bg-slate-800 transition-colors p-4 rounded-2xl border border-slate-700/70 flex flex-col justify-between space-y-3 group">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-2">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>KAFOLATLANGAN TO‘LOV</span>
                  </span>
                  <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">Click & Payme</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Click, Payme & Uzum Bank
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Barcha savdolar rasmiy xavfsiz to‘lov tizimlari orqali amalga oshiriladi. Mablag‘lar darhol kartangizga tushadi.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">0% yashirin to‘lov</span>
                <button
                  onClick={() => navigateTo('auth', { mode: 'signup' })}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Do‘kon ochish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Sellnex Works (6 Steps) */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t('landing_workflow_badge', 'End-to-End Workflow')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              {t('landing_workflow_title', 'How Sellnex Works')}
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              {t('landing_workflow_subtitle', 'Start your dropshipping business in Uzbekistan in 6 simple, automated steps.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorksSteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  id={`how-it-works-step-${s.step}`}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-slate-300 font-mono">{s.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-600">{s.badge}</span>
                    <span className="text-slate-400">{t('landing_step_of', 'Step {step} of 06').replace('{step}', s.step)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Import Interactive Teaser */}
          <div className="mt-12 bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 w-full">
            <div className="text-left w-full md:w-auto">
              <h4 className="text-lg sm:text-xl font-bold text-slate-900">{t('landing_teaser_title', 'Want to test importing a product right now?')}</h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                {t('landing_teaser_desc', 'Try pasting any Amazon, Alibaba or Uzum link into our calculator to see instant profit margins.')}
              </p>
            </div>
            <button
              id="cta-try-import-calculator"
              onClick={() => navigateTo('import-product')}
              className="px-5 sm:px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto shrink-0 text-center"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>{t('landing_teaser_btn', 'Open Product Importer & Profit Calculator')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t('landing_feat_badge', 'Platform Capabilities')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            {t('landing_feat_title', 'Everything You Need to Scale')}
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            {t('landing_feat_subtitle', 'Enterprise-grade dropshipping and e-commerce tools built for high conversion')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 bg-slate-900 text-white px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
              {t('landing_eco_badge', 'Connected Ecosystem')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              {t('landing_eco_title', 'Marketplaces, Suppliers & Local Payments')}
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              {t('landing_eco_subtitle', 'Connect your favorite platforms with real automated integrations.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {integrations.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {item.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{item.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.type}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              id="integrations-view-all"
              onClick={() => navigateTo('integrations')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors inline-flex items-center gap-2"
            >
              <span>{t('landing_eco_btn', 'Manage Integrations in Dashboard')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t('landing_pricing_badge', 'Simple Pricing')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            {t('landing_pricing_title', 'Transparent Plans for Every Seller')}
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            {t('landing_pricing_subtitle', 'Start for free and scale your commerce revenue as you grow.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">FREE</h3>
              <p className="text-xs text-slate-500 mt-1">{t('landing_plan_free_desc', 'Perfect for trying out dropshipping')}</p>
              <div className="my-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">0 UZS</span>
                <span className="text-xs text-slate-500 ml-1">{t('landing_per_month', '/ month')}</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 10 products</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Basic online store (.sellnex.uz)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Basic analytics & reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Standard checkout & COD</li>
              </ul>
            </div>
            <button
              id="pricing-free-btn"
              onClick={() => navigateTo('auth', { mode: 'signup' })}
              className="mt-8 w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-800 text-sm transition-colors"
            >
              {t('landing_plan_free_btn', 'Get Started Free')}
            </button>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="bg-blue-600 rounded-2xl p-7 text-white shadow-xl shadow-blue-500/20 relative flex flex-col justify-between border-2 border-blue-500">
            <div className="absolute -top-3.5 right-6 bg-amber-400 text-slate-900 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
              {t('landing_plan_pro_badge', 'Most Popular')}
            </div>
            <div>
              <h3 className="text-lg font-bold">PRO</h3>
              <p className="text-xs text-blue-100 mt-1">{t('landing_plan_pro_desc', 'For active online sellers & dropshippers')}</p>
              <div className="my-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">99,000 UZS</span>
                <span className="text-xs text-blue-200 ml-1">{t('landing_per_month', '/ month')}</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-blue-50">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" /> 1,000 products</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" /> Unlimited 1-click Product Import</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" /> Click, Payme & Uzum Bank</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" /> Dropship Order Automation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" /> Advanced Profit & Traffic Analytics</li>
              </ul>
            </div>
            <button
              id="pricing-pro-btn"
              onClick={() => navigateTo('pricing')}
              className="mt-8 w-full py-3 rounded-xl bg-white hover:bg-slate-100 font-bold text-blue-700 text-sm shadow-md transition-colors"
            >
              {t('landing_plan_pro_btn', 'Subscribe to PRO')}
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">BUSINESS</h3>
              <p className="text-xs text-slate-500 mt-1">{t('landing_plan_biz_desc', 'For large volume agencies & multi-stores')}</p>
              <div className="my-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">299,000 UZS</span>
                <span className="text-xs text-slate-500 ml-1">{t('landing_per_month', '/ month')}</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited products & stores</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Uzum Market full multi-sync</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Custom Supplier API integrations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Dedicated 24/7 Account Manager</li>
              </ul>
            </div>
            <button
              id="pricing-business-btn"
              onClick={() => navigateTo('pricing')}
              className="mt-8 w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-800 text-sm transition-colors"
            >
              {t('landing_plan_biz_btn', 'Upgrade to Business')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 lg:px-12 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white">SELLNEX</span>
              <p className="text-xs text-slate-400">{t('landing_footer_tagline', 'Sell. Automate. Grow.')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => navigateTo('dashboard')} className="hover:text-white">{t('nav_dashboard', 'Dashboard')}</button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-white">{t('nav_pricing', 'Pricing')}</button>
            <button onClick={() => navigateTo('auth', { mode: 'signup' })} className="hover:text-white">{t('btn_start_selling', 'Start Selling')}</button>
            <button onClick={() => navigateTo('admin')} className="hover:text-white text-amber-400">{t('nav_admin', 'Admin Portal')}</button>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 Sellnex Technologies. {t('landing_footer_desc', 'Built for Uzbekistan & Central Asia.')}
          </p>
        </div>
      </footer>

      {/* Reklama & Hamkorlik Joylashtirish Modali */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-white relative max-h-[92vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsAdModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {adSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">So‘rovingiz Qabul Qilindi!</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                  Rahmat! Reklama va hamkorlik bo‘yicha menejerimiz ko‘rsatilgan telefon raqamingiz orqali tez orada bog‘lanadi.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Reklama Joylashtirish</h3>
                    <p className="text-xs text-slate-400">Sellnex platformasida mahsulot va brendingizni e’lon qiling</p>
                  </div>
                </div>

                <form onSubmit={handleAdSubmit} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ismingiz yoki Do‘kon / Brend nomi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Azizbek (Trend Mall)"
                      value={adForm.name}
                      onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Telefon raqamingiz (Aloqa uchun) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+998 90 123 45 67"
                      value={adForm.phone}
                      onChange={(e) => setAdForm({ ...adForm, phone: e.target.value })}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reklama / Hamkorlik yo‘nalishi
                    </label>
                    <select
                      value={adForm.category}
                      onChange={(e) => setAdForm({ ...adForm, category: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="product">🔥 Mahsulot / Tovar reklamasi (Trend tovarlar)</option>
                      <option value="store">🏪 Onlayn do‘konni targ‘ib qilish</option>
                      <option value="wholesale">📦 Optom yetkazib beruvchi / Ombor taklifi</option>
                      <option value="logistics">🚚 Yetkazib berish va Logistika xizmati</option>
                      <option value="other">✨ Boshqa tijoriy hamkorlik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Taklifingiz yoki Mahsulot haqida qisqacha
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Qanday mahsulot yoki xizmatni reklama qilmoqchisiz?.."
                      value={adForm.message}
                      onChange={(e) => setAdForm({ ...adForm, message: e.target.value })}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-500 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>So‘rovni Yuborish</span>
                    </button>
                    <a
                      href="https://t.me/sellnex_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4 text-sky-400" />
                      <span>Telegram</span>
                    </a>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
