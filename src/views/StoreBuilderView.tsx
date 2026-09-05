import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Palette,
  Layout,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Store as StoreIcon,
  Type,
  Image,
  Eye,
  Sliders,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StoreBuilderView: React.FC = () => {
  const { store, updateStore, products, navigateTo, navigateBack, showToast, formatMoney } = useApp();

  // Local builder states
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'theme' | 'sections'>('branding');

  // Form states
  const [storeName, setStoreName] = useState(store.name);
  const [announcement, setAnnouncement] = useState(store.announcement || '🚚 Free Delivery in Tashkent on orders over 300,000 UZS');
  const [theme, setTheme] = useState(store.theme || 'modern');
  const [primaryColor, setPrimaryColor] = useState(store.primaryColor || '#2563eb');
  const [heroTitle, setHeroTitle] = useState(store.heroTitle || 'Premium Quality. Delivered to Your Doorstep.');
  const [heroSubtitle, setHeroSubtitle] = useState(store.heroSubtitle || 'Discover top-rated gadgets, lifestyle gear, and daily essentials across Uzbekistan.');
  const [heroCtaText, setHeroCtaText] = useState(store.heroCtaText || 'Explore Products');
  const [heroBannerUrl, setHeroBannerUrl] = useState(
    store.heroBanner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
  );
  const [mobileBuilderTab, setMobileBuilderTab] = useState<'settings' | 'preview'>('settings');

  const colorPresets = [
    { name: 'Sellnex Blue', hex: '#2563eb' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Royal Indigo', hex: '#4f46e5' },
    { name: 'Deep Purple', hex: '#7c3aed' },
    { name: 'Crimson Rose', hex: '#e11d48' },
    { name: 'Midnight Slate', hex: '#0f172a' },
  ];

  const themeTemplates = [
    { id: 'modern', name: 'Modern Clean', desc: 'Sleek, high conversion layout with crisp borders.' },
    { id: 'vibrant', name: 'Vibrant Tech', desc: 'High energy style ideal for consumer gadgets & electronics.' },
    { id: 'luxury', name: 'Dark Luxury', desc: 'Premium rich dark accents for perfumes and luxury items.' },
    { id: 'boutique', name: 'Boutique Pastel', desc: 'Soft warm aesthetics for beauty and lifestyle.' },
  ];

  const handleSaveAndPublish = () => {
    updateStore({
      name: storeName,
      announcement,
      theme: theme as any,
      primaryColor,
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroBanner: heroBannerUrl,
      published: true,
    });

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {
      // ignore
    }

    showToast('Storefront Updated!', 'Your live store theme & branding changes are saved.', 'success');
  };

  const sampleProducts = products.filter((p) => p.status === 'Published').slice(0, 4);

  return (
    <div id="store-builder-root" className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Builder Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            id="btn-builder-back"
            onClick={navigateBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Orqaga</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <StoreIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">Storefront Customizer</span>
            <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">Editing: {store.domain}</span>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            id="view-desktop"
            type="button"
            onClick={() => setDevice('desktop')}
            title="Desktop View"
            className={`p-1.5 rounded-lg transition-colors ${
              device === 'desktop' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            id="view-tablet"
            type="button"
            onClick={() => setDevice('tablet')}
            title="Tablet View"
            className={`p-1.5 rounded-lg transition-colors ${
              device === 'tablet' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            id="view-mobile"
            type="button"
            onClick={() => setDevice('mobile')}
            title="Mobile View"
            className={`p-1.5 rounded-lg transition-colors ${
              device === 'mobile' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="builder-open-public"
            onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Live</span>
          </button>
          <button
            id="builder-save-btn"
            onClick={handleSaveAndPublish}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher (only visible on mobile/tablet) */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 text-xs font-bold text-slate-600">
        <button
          onClick={() => setMobileBuilderTab('settings')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            mobileBuilderTab === 'settings' ? 'border-blue-600 text-blue-600 bg-blue-50/40' : 'border-transparent'
          }`}
        >
          Customize Store
        </button>
        <button
          onClick={() => setMobileBuilderTab('preview')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            mobileBuilderTab === 'preview' ? 'border-blue-600 text-blue-600 bg-blue-50/40' : 'border-transparent'
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* Main Split Body: Left Settings + Right Live Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Customization Sidebar */}
        <div className={`w-full lg:w-96 bg-white border-r border-slate-200 flex-col shrink-0 h-full overflow-y-auto ${
          mobileBuilderTab === 'settings' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50">
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'branding' ? 'border-blue-600 text-blue-600 bg-white font-bold' : 'border-transparent'
              }`}
            >
              Branding
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'hero' ? 'border-blue-600 text-blue-600 bg-white font-bold' : 'border-transparent'
              }`}
            >
              Hero
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'theme' ? 'border-blue-600 text-blue-600 bg-white font-bold' : 'border-transparent'
              }`}
            >
              Theme
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 space-y-5 text-xs">
            {activeTab === 'branding' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Top Announcement Bar</label>
                  <input
                    type="text"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="e.g. Free shipping on orders over 300,000 UZS"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-2">Primary Accent Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setPrimaryColor(c.hex)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                          primaryColor === c.hex
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: c.hex }} />
                        <span className="text-[11px] truncate text-slate-800">{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Instant Live Preview
                  </p>
                  <p className="text-[11px] text-blue-800/80 mt-1">
                    Every keystroke is reflected in real-time in the canvas preview on the right.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hero Headline</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hero Background Image URL</label>
                  <input
                    type="url"
                    value={heroBannerUrl}
                    onChange={(e) => setHeroBannerUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-3">
                <label className="block font-bold text-slate-800 mb-1">Choose Template Style</label>
                {themeTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      theme === t.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{t.name}</span>
                      {theme === t.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Live Store Canvas Preview */}
        <div className={`flex-1 bg-slate-200/70 p-4 sm:p-6 overflow-y-auto items-start justify-center ${
          mobileBuilderTab === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div
            style={{
              width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
              maxWidth: '1000px',
            }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden transition-all duration-300 flex flex-col"
          >
            {/* Mock browser header */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-slate-600 bg-white px-3 py-0.5 rounded border border-slate-200 truncate max-w-xs">
                /store/{store.slug}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">● Live Preview</span>
            </div>

            {/* Live Storefront Component Output */}
            <div className="flex-1 flex flex-col">
              {/* Announcement */}
              {announcement && (
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="text-white text-center py-2 px-4 text-xs font-semibold"
                >
                  {announcement}
                </div>
              )}

              {/* Storefront Nav */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-black text-base text-slate-900">{storeName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <span>Catalog</span>
                  <span>About</span>
                  <div
                    style={{ color: primaryColor }}
                    className="flex items-center gap-1 font-bold"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>(0)</span>
                  </div>
                </div>
              </div>

              {/* Hero Banner */}
              <div className="relative bg-slate-900 text-white py-12 px-6 text-center overflow-hidden">
                <img
                  src={heroBannerUrl}
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                />
                <div className="relative z-10 max-w-xl mx-auto space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">{heroTitle}</h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{heroSubtitle}</p>
                  <div className="pt-2">
                    <button
                      style={{ backgroundColor: primaryColor }}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs shadow-md inline-flex items-center gap-2 text-white"
                    >
                      <span>{heroCtaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid Sample */}
              <div className="p-6 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Featured Collection</h3>
                  <span style={{ color: primaryColor }} className="text-xs font-semibold">
                    View all ({products.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sampleProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs truncate">{p.title}</p>
                        <p style={{ color: primaryColor }} className="font-extrabold text-xs mt-1">
                          {formatMoney(p.sellingPrice)}
                        </p>
                      </div>
                      <button
                        style={{ backgroundColor: primaryColor }}
                        className="w-full py-1.5 rounded-lg text-white font-bold text-[11px]"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-around text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-600" /> Fast Regional Delivery</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Click / Payme Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
