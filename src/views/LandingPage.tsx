import React from 'react';
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
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { navigateTo, store, formatMoney, t, currentUser } = useApp();

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Import a Product',
      desc: 'Paste any product link from Amazon, Alibaba, Uzum Market, or local suppliers. We instantly extract images, descriptions & variants.',
      icon: Search,
      badge: 'Auto-Import',
    },
    {
      step: '02',
      title: 'Set Your Profit',
      desc: 'Use our smart profit calculator. Enter fixed earnings (e.g. 75,000 UZS) or percentage margin. Selling price is calculated automatically.',
      icon: Percent,
      badge: 'Smart Math',
    },
    {
      step: '03',
      title: 'Publish Your Store',
      desc: 'Customize your branded storefront in 2 minutes with our drag-and-drop builder. Connect custom domain or use your free .sellnex.uz URL.',
      icon: StoreIcon,
      badge: 'Live Instantly',
    },
    {
      step: '04',
      title: 'Share Your Link',
      desc: 'Promote your store link across Instagram, Telegram, TikTok and WhatsApp with built-in affiliate and tracking campaign links.',
      icon: Globe2,
      badge: 'Multi-Channel',
    },
    {
      step: '05',
      title: 'Receive Orders & Paid',
      desc: 'Accept local payments effortlessly with Click, Payme, Uzum Bank, and Cash on Delivery. Customer funds transfer directly.',
      icon: CreditCard,
      badge: 'Uzbekistan Switch',
    },
    {
      step: '06',
      title: 'Automate Fulfillment',
      desc: 'Sit back as our automation engine automatically routes orders to suppliers, tracks courier dispatch, and updates your customer.',
      icon: Bot,
      badge: 'Hands-Free',
    },
  ];

  const features = [
    {
      title: 'Storefront Builder',
      desc: 'Shopify-style customizable storefronts optimized for mobile conversion in Uzbekistan.',
      icon: StoreIcon,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '1-Click Product Importer',
      desc: 'Extract supplier costs, stock, high-res photos and variants from any major e-commerce marketplace.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Dynamic Profit Calculator',
      desc: 'Calculate supplier base + logistics + payment commission + your net profit in real-time.',
      icon: Percent,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Click & Payme Native Gateways',
      desc: 'Pre-integrated national payment switch with support for Click, Payme, and Uzum Bank installments.',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Uzum Market Ecosystem',
      desc: 'Sync inventory, export orders, and manage cross-platform marketplace channels seamlessly.',
      icon: Layers,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Dropship Order Automation',
      desc: 'Auto-dispatch orders to suppliers, auto-sync stock, and send Telegram bot alerts instantly.',
      icon: Bot,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'Real-time Analytics',
      desc: 'Monitor GMV, net margins, traffic channels (Telegram, TikTok, IG), and best-sellers.',
      icon: TrendingUp,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Regional Delivery & Couriers',
      desc: 'Automated dispatch with UzPost, BTS Cargo, Fargo Express, and Yandex Delivery across all 12 regions.',
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
    <div id="landing-page-root" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <nav id="landing-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
            <span className="sm:hidden">{t('nav_signup', 'Sign Up').length > 10 ? "Ro'yxat" : t('nav_signup', 'Sign Up')}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('landing_badge', "Central Asia's First All-in-One E-Commerce & Dropshipping Platform")}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          {t('landing_hero_title', 'Build Your Store.')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {t('landing_hero_title_highlight', 'Sell Anywhere.')}
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2.5xl mx-auto leading-relaxed">
          {t('landing_hero_subtitle', 'Create your online store, import products, set your profit, accept local payments and automate your orders — all from one platform.')}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            id="hero-start-selling"
            onClick={() => navigateTo('auth', { mode: 'signup' })}
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[48px]"
          >
            <span>{t('btn_start_selling', 'Start Selling')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-login-btn"
            onClick={() => navigateTo('auth', { mode: 'login' })}
            className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[48px]"
          >
            <span>{t('nav_login', 'Log In')}</span>
          </button>

          <button
            id="hero-view-pricing"
            onClick={() => navigateTo('pricing')}
            className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base transition-colors flex items-center gap-2 min-h-[48px]"
          >
            <span>{t('nav_pricing', 'Pricing & Plans')}</span>
          </button>
        </div>

        {/* Quick Device Selector Cards */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-2xl mx-auto text-left shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Qurilma bo'yicha kirish:</span>
            </span>
            <span className="text-[11px] text-slate-400">Telegram & Web tayyor</span>
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
                  <span>📱 Telefon / Mini App</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">Mobil & Telegram Mini App</p>
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
                  <span>💻 Kompyuter / Desktop</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">Keng ekranli Boshqaruv paneli</p>
              </div>
            </button>
          </div>
        </div>

        {/* Value Proposition Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Inventory Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Click & Payme Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>24-48h Delivery in Uzbekistan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Automatic Profit Calculator</span>
          </div>
        </div>

        {/* Dual Hero Visual Preview: Dashboard & Storefront */}
        <div className="mt-14 max-w-6xl mx-auto rounded-2xl border border-slate-200/80 bg-slate-900/5 p-2 sm:p-4 shadow-2xl backdrop-blur-xs">
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 text-left">
            {/* Window bar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-slate-400">sellnex.uz/dashboard • Kamo Store Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                  ● Order Auto-Fulfillment: ACTIVE
                </span>
              </div>
            </div>

            {/* Simulated mini dashboard preview */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">12,450,000 UZS</p>
                <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">↑ +24.8% this week</span>
              </div>
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Net Profit</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">3,240,000 UZS</p>
                <span className="text-xs text-slate-400 mt-1 inline-block">Avg. margin: 26.0%</span>
              </div>
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Orders Placed</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">128</p>
                <span className="text-xs text-blue-400 mt-1 inline-block">100% automated dropship</span>
              </div>
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Active Products</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">42</p>
                <span className="text-xs text-amber-400 mt-1 inline-block">Amazon • Alibaba • Uzum</span>
              </div>
            </div>

            {/* Interactive Try Button inside mockup */}
            <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-blue-400 font-semibold">Latest Order #SL-1024:</span>
                <span>Wireless ANC Headphones • 350,000 UZS via Click</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">+75,000 UZS Profit</span>
              </div>
              <button
                id="mockup-open-dashboard"
                onClick={() => navigateTo('dashboard')}
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4"
              >
                Launch Dashboard →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How Sellnex Works (6 Steps) */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              How Sellnex Works
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Start your dropshipping business in Uzbekistan in 6 simple, automated steps.
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
                    <span className="text-slate-400">Step {s.step} of 06</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Import Interactive Teaser */}
          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Want to test importing a product right now?</h4>
              <p className="text-slate-600 text-sm mt-1">
                Try pasting any Amazon, Alibaba or Uzum link into our calculator to see instant profit margins.
              </p>
            </div>
            <button
              id="cta-try-import-calculator"
              onClick={() => navigateTo('import-product')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Open Product Importer & Profit Calculator</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Everything You Need to Scale
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Built specifically for Central Asian entrepreneurs, creators, and commerce operators.
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
              Connected Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Marketplaces, Suppliers & Local Payments
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Connect your favorite platforms with real automated integrations.
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
              <span>Manage Integrations in Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Transparent Plans for Every Seller
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Start for free and scale your commerce revenue as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">FREE</h3>
              <p className="text-xs text-slate-500 mt-1">Perfect for trying out dropshipping</p>
              <div className="my-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">0 UZS</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
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
              Get Started Free
            </button>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="bg-blue-600 rounded-2xl p-7 text-white shadow-xl shadow-blue-500/20 relative flex flex-col justify-between border-2 border-blue-500">
            <div className="absolute -top-3.5 right-6 bg-amber-400 text-slate-900 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold">PRO</h3>
              <p className="text-xs text-blue-100 mt-1">For active online sellers & dropshippers</p>
              <div className="my-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">99,000 UZS</span>
                <span className="text-xs text-blue-200 ml-1">/ month</span>
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
              Subscribe to PRO
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">BUSINESS</h3>
              <p className="text-xs text-slate-500 mt-1">For large volume agencies & multi-stores</p>
              <div className="my-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">299,000 UZS</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
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
              Upgrade to Business
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
              <p className="text-xs text-slate-400">Sell. Automate. Grow.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => navigateTo('dashboard')} className="hover:text-white">Dashboard</button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-white">Pricing</button>
            <button onClick={() => navigateTo('auth', { mode: 'signup' })} className="hover:text-white">Start Selling</button>
            <button onClick={() => navigateTo('admin')} className="hover:text-white text-amber-400">Admin Portal</button>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 Sellnex Technologies. Built for Uzbekistan & Central Asia.
          </p>
        </div>
      </footer>
    </div>
  );
};
