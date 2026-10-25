import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { firestoreService } from '../services/firestoreService';
import { ProductReviewsSection } from '../components/reviews/ProductReviewsSection';
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  Share2,
  Heart,
  ChevronRight,
  Zap,
  Link2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProductDetailView: React.FC = () => {
  const {
    publicStore,
    store,
    publicProducts,
    publicActiveProduct,
    publicStoreLoading,
    publicStoreStatus,
    routeParams,
    addToCart,
    navigateTo,
    formatMoney,
    showToast,
    getProductUrl,
    copyProductLink,
    openShareModal,
    cartTotalCount,
  } = useApp();

  const activeStore = publicStore || store;
  const productId = routeParams.productId;

  const [product, setProduct] = useState<Product | null>(() => {
    if (publicActiveProduct && publicActiveProduct.id === productId) {
      return publicActiveProduct;
    }
    if (productId && publicProducts.length > 0) {
      const matched = publicProducts.find((p) => p.id === productId);
      if (matched && (!activeStore?.id || !matched.storeId || matched.storeId === activeStore.id || matched.storeId === activeStore.slug)) {
        return matched;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!product && !!productId);

  useEffect(() => {
    let isMounted = true;
    const resolveProduct = async () => {
      if (publicActiveProduct && publicActiveProduct.id === productId) {
        if (isMounted) {
          setProduct(publicActiveProduct);
          setLoading(false);
        }
        return;
      }

      if (!productId) {
        if (isMounted) {
          setProduct(null);
          setLoading(false);
        }
        return;
      }

      // Check current in-memory public products for this store
      const inMemory = publicProducts.find((p) => p.id === productId);
      if (inMemory && (!activeStore?.id || !inMemory.storeId || inMemory.storeId === activeStore.id || inMemory.storeId === activeStore.slug)) {
        if (isMounted) {
          setProduct(inMemory);
          setLoading(false);
        }
        return;
      }

      // Fetch from Firestore and verify it belongs to this store
      setLoading(true);
      try {
        const fetched = await firestoreService.getProductById(productId);
        if (isMounted) {
          if (fetched && activeStore && (!fetched.storeId || fetched.storeId === activeStore.id || fetched.storeId === activeStore.slug)) {
            setProduct(fetched);
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        console.warn('Error fetching product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    resolveProduct();
    return () => {
      isMounted = false;
    };
  }, [productId, publicProducts, activeStore?.id, activeStore?.slug, publicActiveProduct]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0]?.options?.[0] || 'Standard'
  );
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'shipping' | 'reviews'>('desc');

  // Extract available sizes from product.sizes or variants
  const availableSizes = React.useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) return product.sizes;
    const sizeVar = product?.variants?.find((v) =>
      /razmer|o['‘`]?lcham|size/i.test(v.name)
    );
    return sizeVar?.options || [];
  }, [product]);

  // Extract available colors from product.colors or variants
  const availableColors = React.useMemo(() => {
    if (product?.colors && product.colors.length > 0) return product.colors;
    const colorVar = product?.variants?.find((v) =>
      /rang|color|colour/i.test(v.name)
    );
    return colorVar?.options || [];
  }, [product]);

  // Other variants that are neither size nor color
  const otherVariants = React.useMemo(() => {
    return (product?.variants || []).filter(
      (v) =>
        !/razmer|o['‘`]?lcham|size/i.test(v.name) &&
        !/rang|color|colour/i.test(v.name)
    );
  }, [product]);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  if (loading || publicStoreLoading || publicStoreStatus === 'loading') {
    return (
      <div id="product-detail-loading" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Mahsulot yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!activeStore || publicStoreStatus === 'not_found') {
    return (
      <div id="product-store-not-found" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm bg-white p-8 rounded-2xl shadow-xs border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Do'kon topilmadi</h3>
          <p className="text-xs text-slate-500">
            Ushbu mahsulot tegishli bo'lgan do'kon topilmadi yoki havola noto'g'ri.
          </p>
          <button
            onClick={() => navigateTo('landing')}
            className="w-full px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
          >
            Sellnex Bosh Sahifasi
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div id="product-not-found" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm bg-white p-8 rounded-2xl shadow-xs border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Mahsulot topilmadi</h3>
          <p className="text-xs text-slate-500">
            Ushbu mahsulot mavjud emas yoki do'kondan olib tashlangan.
          </p>
          <button
            onClick={() => navigateTo('public-store', { storeId: activeStore.id, storeSlug: activeStore.slug })}
            className="w-full px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
          >
            Do'konga qaytish
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = activeStore?.theme?.primaryColor || (activeStore as any)?.primaryColor || '#2563eb';

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      showToast('Razmer tanlanmadi', 'Iltimos, o‘zingizga kerakli o‘lcham (razmer)ni tanlang.', 'warning');
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      showToast('Rang tanlanmadi', 'Iltimos, o‘zingizga yoqqan rangni tanlang.', 'warning');
      return;
    }
    const comboDesc = [
      selectedSize ? `Razmer: ${selectedSize}` : '',
      selectedColor ? `Rang: ${selectedColor}` : '',
      selectedVariant && selectedVariant !== 'Standard' && selectedVariant !== 'Standart' ? selectedVariant : '',
    ].filter(Boolean).join(' • ');

    addToCart(product, quantity, comboDesc || selectedVariant, selectedSize, selectedColor);
    showToast('Savatga qo‘shildi!', `${quantity}x ${product.title} ${comboDesc ? `(${comboDesc})` : ''} savatga qo‘shildi.`, 'success');
  };

  const handleBuyNow = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      showToast('Razmer tanlanmadi', 'Iltimos, o‘zingizga kerakli o‘lcham (razmer)ni tanlang.', 'warning');
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      showToast('Rang tanlanmadi', 'Iltimos, o‘zingizga yoqqan rangni tanlang.', 'warning');
      return;
    }
    const comboDesc = [
      selectedSize ? `Razmer: ${selectedSize}` : '',
      selectedColor ? `Rang: ${selectedColor}` : '',
      selectedVariant && selectedVariant !== 'Standard' && selectedVariant !== 'Standart' ? selectedVariant : '',
    ].filter(Boolean).join(' • ');

    addToCart(product, quantity, comboDesc || selectedVariant, selectedSize, selectedColor);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    }
    navigateTo('checkout', {
      storeId: activeStore?.id || product.storeId || '',
      storeSlug: activeStore?.slug || '',
    });
  };

  const discountPercent =
    product.oldPrice && product.oldPrice > product.sellingPrice
      ? Math.round(((product.oldPrice - product.sellingPrice) / product.oldPrice) * 100)
      : 0;

  return (
    <div id="product-detail-root" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <button
            id="back-to-catalog-btn"
            onClick={() =>
              navigateTo('public-store', {
                storeId: activeStore?.id || product.storeId || '',
                storeSlug: activeStore?.slug || product.storeId || '',
              })
            }
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Store</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 truncate">
              {activeStore?.name || activeStore?.storeName || 'Store'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyProductLink(product.id, activeStore?.id || activeStore?.slug || product.storeId || '')}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Copy Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                openShareModal({
                  title: `Share "${product.title}"`,
                  subtitle: 'Share direct product link on Instagram, Telegram, or WhatsApp.',
                  url: getProductUrl(activeStore?.id || activeStore?.slug || product.storeId || '', product.id),
                  productTitle: product.title,
                  productPrice: product.sellingPrice,
                  productImage: product.images[0],
                })
              }
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="detail-checkout-shortcut"
              onClick={() =>
                navigateTo('checkout', {
                  storeId: activeStore?.id || product.storeId || '',
                  storeSlug: activeStore?.slug || product.storeId || '',
                })
              }
              style={{ backgroundColor: primaryColor }}
              className="px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({cartTotalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 text-xs text-slate-400 flex items-center gap-1.5">
        <span
          className="cursor-pointer hover:underline"
          onClick={() =>
            navigateTo('public-store', {
              storeId: activeStore?.id || product.storeId || '',
              storeSlug: activeStore?.slug || product.storeId || '',
            })
          }
        >
          {activeStore?.name || activeStore?.storeName || 'Store'}
        </span>
        <ChevronRight className="w-3 h-3" />
        <span>{product.category}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-medium truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Product Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left 6 Cols: Photo Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm flex items-center justify-center relative">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${
                      selectedImage === i ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right 6 Cols: Purchasing Details & Actions */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('reviews');
                    const el = document.getElementById('product-tabs-container');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 text-xs text-amber-500 font-bold hover:opacity-80 transition cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating ? product.rating.toFixed(1) : (product.reviewCount ? '5.0' : '5.0')}</span>
                  <span className="text-slate-400 font-normal">
                    ({product.reviewCount || 0} {product.reviewCount === 1 ? 'sharh' : 'sharhlar'})
                  </span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 p-4 bg-slate-100/70 rounded-2xl border border-slate-200">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatMoney(product.sellingPrice)}
                </span>
                {product.oldPrice && product.oldPrice > product.sellingPrice && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {formatMoney(product.oldPrice)}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-600 ml-auto bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  In Stock ({product.stock} available)
                </span>
              </div>

              {/* Size Selector (Razmer) */}
              {availableSizes.length > 0 && (
                <div className="space-y-2 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>👟 Razmer (O‘lcham):</span>
                      <span className="text-blue-600 font-black">{selectedSize || 'Tanlang'}</span>
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">Oyoq kiyim / kiyim o‘lchami</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-11 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20'
                            : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector (Rang) */}
              {availableColors.length > 0 && (
                <div className="space-y-2 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🎨 Rang:</span>
                      <span className="text-emerald-700 font-black">{selectedColor || 'Tanlang'}</span>
                    </label>
                    <span className="text-[11px] text-emerald-700 font-medium">Mavjud ranglar</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedColor === col
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600/20'
                            : 'border-slate-300 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50'
                        }`}
                      >
                        <span>{col}</span>
                        {selectedColor === col && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Variant Selector (agar mavjud bo'lsa) */}
              {otherVariants.length > 0 && otherVariants[0].options?.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {otherVariants[0].name || 'Tanlov'}: <span className="text-blue-600">{selectedVariant}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {otherVariants[0].options.map((opt) => (
                      <button
                        key={opt}
                        id={`variant-btn-${opt.replace(/\s+/g, '')}`}
                        type="button"
                        onClick={() => setSelectedVariant(opt)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedVariant === opt
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Quantity</label>
                <div className="inline-flex items-center gap-3 border border-slate-200 rounded-xl p-1 bg-white">
                  <button
                    id="qty-minus"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm px-2 text-slate-900">{quantity}</span>
                  <button
                    id="qty-plus"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CTAs & Direct Social Link Sharing */}
              <div className="pt-3 space-y-2.5">
                <button
                  id="btn-buy-now-action"
                  onClick={handleBuyNow}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Buy Now — {formatMoney(product.sellingPrice * quantity)}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-add-to-bag-action"
                    onClick={handleAddToCart}
                    className="py-3 rounded-xl border-2 border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    id="btn-share-product-action"
                    onClick={() =>
                      openShareModal({
                        title: `Share "${product.title}"`,
                        subtitle: 'Share link on Instagram, Telegram, or WhatsApp.',
                        url: getProductUrl(activeStore.slug || activeStore.id, product.id),
                        productTitle: product.title,
                        productPrice: product.sellingPrice,
                        productImage: product.images[0],
                      })
                    }
                    className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Link</span>
                  </button>
                </div>
              </div>

              {/* Delivery Guarantee Info */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Fast delivery across all regions of Uzbekistan</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secure payment via Click, Payme, Uzum Bank or Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Description Tab Section */}
            <div id="product-tabs-container" className="mt-8 border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`text-xs font-bold pb-2 transition-colors border-b-2 ${
                    activeTab === 'desc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`text-xs font-bold pb-2 transition-colors border-b-2 ${
                    activeTab === 'shipping' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Delivery & Returns
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`text-xs font-bold pb-2 transition-colors border-b-2 ${
                    activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Customer Reviews
                </button>
              </div>

              {activeTab === 'desc' && (
                <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                  <p>{product.description}</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="text-xs text-slate-600 space-y-2">
                  <p>• Delivery across Tashkent within 24 hours.</p>
                  <p>• Regional delivery across Uzbekistan (Samarkand, Bukhara, Fergana, etc.) within 2-3 business days.</p>
                  <p>• 14 days return policy for undamaged items.</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ProductReviewsSection
                  product={product}
                  formatMoney={formatMoney}
                  onReviewAdded={async () => {
                    try {
                      const updated = await firestoreService.getProductById(product.id);
                      if (updated) setProduct(updated);
                    } catch (e) {
                      console.warn('Could not reload product rating:', e);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
