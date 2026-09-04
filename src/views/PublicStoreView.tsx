import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  ShoppingBag,
  Search,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
  CreditCard,
  Heart,
  Eye,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PublicStoreView: React.FC = () => {
  const {
    store,
    products,
    publicStore,
    publicProducts,
    publicStoreLoading,
    publicStoreStatus,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartTotalCount,
    cartSubtotal,
    navigateTo,
    navigateBack,
    formatMoney,
    getStoreUrl,
    openShareModal,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Active Storefront Resolution strictly from publicStore
  const activeStore = publicStore;

  // 1. Loading State Screen
  if (publicStoreLoading || publicStoreStatus === 'loading') {
    return (
      <div id="public-store-loading" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-700 font-bold text-sm">Do'kon yuklanmoqda...</p>
        <p className="text-slate-400 text-xs mt-1">Iltimos, kuting</p>
      </div>
    );
  }

  // 2. Not Found State Screen
  if (!activeStore || publicStoreStatus === 'not_found') {
    return (
      <div id="public-store-not-found" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-4 shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Do'kon topilmadi</h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
          Siz ochmoqchi bo'lgan do'kon havolasi mavjud emas yoki noto'g'ri kiritilgan. Havolani tekshirib qaytadan urinib ko'ring.
        </p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          Sellnex Bosh Sahifasi
        </button>
      </div>
    );
  }

  // 3. Private Store State Screen
  if (publicStoreStatus === 'private') {
    return (
      <div id="public-store-private" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-4 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Ushbu do'kon shaxsiy (Private) holatda</h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
          Do'kon egasi ushbu do'konni shaxsiy rejimga o'tkazgan. Agar siz ushbu do'kon egasi bo'lsangiz, admin paneliga kiring.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigateTo('auth', { mode: 'login' })}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Tizimga kirish
          </button>
          <button
            onClick={() => navigateTo('landing')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Bosh sahifa
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = activeStore.theme?.primaryColor || activeStore.primaryColor || '#2563eb';

  // Products strictly isolated to this store (never leak products from other stores)
  const publishedProducts = publicProducts.filter(
    (p) => p.status === 'Published' || p.status === 'active'
  );

  const categories = ['All', ...Array.from(new Set(publishedProducts.map((p) => p.category)))];

  const filteredProducts = publishedProducts.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.variants?.[0]?.options?.[0]);
    setIsCartDrawerOpen(true);
    try {
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
  };

  return (
    <div id="public-store-root" className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Announcement Bar */}
      {(activeStore.theme?.announcementText || activeStore.announcement) && (
        <div
          style={{ backgroundColor: primaryColor }}
          className="text-white text-center py-2 px-4 text-xs font-semibold tracking-wide flex items-center justify-center gap-2"
        >
          <span>{activeStore.theme?.announcementText || activeStore.announcement}</span>
        </div>
      )}

      {/* Store Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-store-back"
              onClick={navigateBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 text-xs font-bold min-h-[40px]"
              title="Orqaga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Orqaga</span>
            </button>

            {/* Logo & Store Name */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCategory('All')}>
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold overflow-hidden"
              >
                {activeStore.logo ? (
                  <img src={activeStore.logo} alt={activeStore.name || activeStore.storeName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                  {activeStore.name || activeStore.storeName}
                </h1>
                <span className="text-[10px] text-slate-400 font-mono">
                  /store/{activeStore.slug || activeStore.id}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="public-store-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog, smart devices, accessories..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Cart & Share Triggers */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="share-store-header-btn"
              onClick={() => {
                const targetSlug = activeStore.slug || activeStore.id;
                const link = getStoreUrl(targetSlug);
                openShareModal({
                  title: activeStore.name || activeStore.storeName || 'Online Doʻkon',
                  subtitle: "Do'kon havolasini Telegram, Instagram yoki mijozlaringiz bilan ulashing.",
                  url: link,
                  storeSlug: targetSlug,
                });
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="Do'kon havolasini ulashish"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Ulashish</span>
            </button>

            <button
              id="open-cart-drawer-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              style={{ backgroundColor: primaryColor }}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Savatcha</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[11px] font-mono">
                {cartTotalCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {(activeStore.theme?.bannerImage || activeStore.heroBanner) && (
          <img
            src={activeStore.theme?.bannerImage || activeStore.heroBanner}
            alt="Storefront Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-90 pointer-events-none"
          />
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Official Store • Fast Delivery in Uzbekistan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {activeStore.theme?.bannerTitle || activeStore.heroTitle || 'Premium Quality. Delivered to Your Doorstep.'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {activeStore.theme?.bannerSubtitle || activeStore.heroSubtitle || 'Discover top-rated gadgets, lifestyle gear, and daily essentials across Uzbekistan.'}
          </p>
          <div className="pt-3">
            <button
              id="hero-shop-collection-btn"
              onClick={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ backgroundColor: primaryColor }}
              className="px-8 py-3 rounded-xl font-bold text-sm shadow-xl text-white inline-flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <span>{activeStore.theme?.buttonText || activeStore.heroCtaText || 'Explore Catalog'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-slate-200 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2.5 text-xs font-medium text-slate-700">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Fast Uzbekistan Delivery</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-xs font-medium text-slate-700">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Click & Payme Accepted</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-xs font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>100% Quality Guaranteed</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-xs font-medium text-slate-700">
            <Phone className="w-4 h-4 text-amber-600" />
            <span>24/7 Customer Support</span>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <main id="products-section" className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* Mobile Search Bar (Visible only on mobile < md) */}
        <div className="block md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="public-store-mobile-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog, smart devices, accessories..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden shadow-2xs min-h-[44px]"
            />
          </div>
        </div>

        {/* Category Pills & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-pill-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all min-h-[38px] ${
                  selectedCategory === cat
                    ? 'text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? primaryColor : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-semibold shrink-0">
            Showing {filteredProducts.length} items
          </span>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 p-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No items found</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting another category or searching different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((p) => {
              const discountPercent =
                p.oldPrice && p.oldPrice > p.sellingPrice
                  ? Math.round(((p.oldPrice - p.sellingPrice) / p.oldPrice) * 100)
                  : 0;

              return (
                <div
                  key={p.id}
                  id={`product-card-${p.id}`}
                  onClick={() =>
                    navigateTo('public-product', {
                      storeId: activeStore.id,
                      storeSlug: activeStore.slug,
                      productId: p.id,
                    })
                  }
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {discountPercent > 0 && (
                        <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-rose-600 text-white text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                      {p.supplier === 'Uzum Market' && (
                        <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                          Uzum
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                        <span className="truncate">{p.category}</span>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{p.rating || '4.9'}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {p.title}
                      </h3>

                      <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="p-2.5 sm:p-4 pt-0 border-t border-slate-50 mt-1 sm:mt-2 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-base md:text-lg font-black text-slate-900 truncate">
                        {formatMoney(p.sellingPrice)}
                      </div>
                      {p.oldPrice && p.oldPrice > p.sellingPrice && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through truncate block">
                          {formatMoney(p.oldPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      id={`btn-quick-add-${p.id}`}
                      onClick={(e) => handleQuickAdd(p, e)}
                      style={{ backgroundColor: primaryColor }}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:scale-105 transition-transform flex items-center gap-1 shrink-0 min-h-[36px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Slide-out Drawer */}
      {isCartDrawerOpen && (
        <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-900 text-base">Shopping Bag ({cartTotalCount})</h3>
              </div>
              <button
                id="close-cart-drawer-btn"
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Your bag is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Explore our catalog and add items.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.product.id}-${item.selectedVariant || idx}`} className="pt-4 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80'}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.product.title}</p>
                      {item.selectedVariant && (
                        <p className="text-[11px] text-slate-400">Option: {item.selectedVariant}</p>
                      )}
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {formatMoney(item.product.sellingPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedVariant)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedVariant)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-extrabold text-slate-900 text-base">{formatMoney(cartSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                  <span>Delivery:</span>
                  <span>Calculated at checkout</span>
                </div>

                <button
                  id="drawer-proceed-checkout"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('checkout', { storeId: activeStore.id, storeSlug: activeStore.slug });
                  }}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Instant payment via Click, Payme, Uzum Bank or Cash on Delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{activeStore.name || activeStore.storeName}</span>
            <span>• Powered by Sellnex Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Customer Support: {activeStore.theme?.phone || activeStore.phone || '+998 (71) 200-00-00'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
