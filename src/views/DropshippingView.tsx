import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DropshippingCategory, DropshippingCatalogProduct, Product } from '../types';
import { firestoreService } from '../services/firestoreService';
import {
  Boxes,
  Search,
  Filter,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  Truck,
  Building2,
  DollarSign,
  TrendingUp,
  Info,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  Store,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowLeft,
  ShoppingBag,
  Zap,
  Tag,
  ArrowUpRight,
  Package,
} from 'lucide-react';

export const DropshippingView: React.FC = () => {
  const {
    store,
    currentUser,
    products,
    addProduct,
    refreshProducts,
    formatMoney,
    showToast,
    navigateTo,
    openLimitModal,
  } = useApp();

  const [categories, setCategories] = useState<DropshippingCategory[]>([]);
  const [catalog, setCatalog] = useState<DropshippingCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'profit_high'>('recommended');

  // Modals & 1-Click State
  const [detailProduct, setDetailProduct] = useState<DropshippingCatalogProduct | null>(null);
  const [addModalProduct, setAddModalProduct] = useState<DropshippingCatalogProduct | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [marginAmount, setMarginAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [directAddingId, setDirectAddingId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Helper to ensure store exists
  const getEnsuredStore = async () => {
    if (store?.id) return store;
    if (currentUser?.id) {
      try {
        const autoStore = await firestoreService.createDefaultStoreForUser(currentUser);
        return autoStore;
      } catch (err) {
        console.warn('Could not auto-create store:', err);
      }
    }
    return store;
  };

  // Load Categories & Catalog
  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        firestoreService.getDropshippingCategories(true),
        firestoreService.getDropshippingCatalog({ activeOnly: true }),
      ]);
      setCategories(cats);
      setCatalog(prods);
    } catch (err) {
      console.error('Error loading dropshipping catalog data:', err);
      showToast('Xatolik', 'Dropshipping katalogini yuklashda xatolik yuz berdi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Set initial price and margin when opening Add Modal
  const handleOpenAddModal = async (p: DropshippingCatalogProduct, initialMargin?: number) => {
    if (!currentUser) {
      showToast(
        'Tizimga kiring',
        'Mahsulotni do‘koningizga qo‘shish uchun avval bepul ro‘yxatdan o‘ting va do‘koningizni oching.',
        'info'
      );
      navigateTo('auth', { mode: 'signup' });
      return;
    }

    const activeStore = await getEnsuredStore();
    if (!activeStore?.id) {
      showToast('Do‘kon oching', 'Mahsulotni qo‘shish uchun avval do‘koningizni sozlang.', 'info');
      navigateTo('onboarding');
      return;
    }

    setAddModalProduct(p);
    const initialPrice =
      initialMargin !== undefined
        ? Math.max(p.minSellingPrice, p.supplierCost + initialMargin)
        : (p.recommendedPrice || p.minSellingPrice);

    setCustomPrice(initialPrice);
    setMarginAmount(Math.max(0, initialPrice - p.supplierCost));
  };

  // Preset Margin Handlers for the Modal
  const handleSetMargin = (margin: number) => {
    if (!addModalProduct) return;
    const newPrice = Math.max(addModalProduct.minSellingPrice, addModalProduct.supplierCost + margin);
    setMarginAmount(margin);
    setCustomPrice(newPrice);
  };

  const handleSetMarginPercent = (percent: number) => {
    if (!addModalProduct) return;
    const margin = Math.round(addModalProduct.supplierCost * (percent / 100));
    handleSetMargin(margin);
  };

  const handlePriceChange = (price: number) => {
    setCustomPrice(price);
    if (addModalProduct) {
      setMarginAmount(Math.max(0, price - addModalProduct.supplierCost));
    }
  };

  const handleMarginChange = (margin: number) => {
    setMarginAmount(margin);
    if (addModalProduct) {
      setCustomPrice(Math.max(addModalProduct.minSellingPrice, addModalProduct.supplierCost + margin));
    }
  };

  // Instant 1-Click addition directly from product card
  const handleDirectQuickAdd = async (p: DropshippingCatalogProduct, margin: number) => {
    if (!currentUser) {
      showToast(
        'Tizimga kiring',
        'Mahsulotni do‘koningizga qo‘shish uchun avval bepul ro‘yxatdan o‘ting va do‘koningizni oching.',
        'info'
      );
      navigateTo('auth', { mode: 'signup' });
      return;
    }

    const activeStore = await getEnsuredStore();
    if (!activeStore?.id) {
      showToast('Do‘kon oching', 'Mahsulotni qo‘shish uchun avval do‘koningizni sozlang.', 'info');
      navigateTo('onboarding');
      return;
    }

    const targetPrice = Math.max(p.minSellingPrice, p.supplierCost + margin);
    setDirectAddingId(p.id);

    try {
      const addedProd = await firestoreService.addDropshippingProductToStore(
        p,
        activeStore,
        currentUser || ({ id: activeStore.ownerId } as any),
        Number(targetPrice)
      );

      // Refresh seller's products list
      await refreshProducts();

      showToast(
        'Do‘koningizga qo‘shildi! 🎉',
        `"${addedProd.title}" +${formatMoney(margin)} ustama ulush bilan do‘koningizga bir bosishda qo‘shildi va sotuvga chiqarildi.`,
        'success'
      );
    } catch (err: any) {
      console.error('Failed to add dropshipping product quickly:', err);
      const msg = err?.message || 'Mahsulotni qo‘shishda xatolik yuz berdi.';
      if (msg.includes('limiti to‘ldi') || msg.includes('product limit')) {
        openLimitModal(products.length, 10, msg);
      } else {
        showToast('Xatolik', msg, 'error');
      }
    } finally {
      setDirectAddingId(null);
    }
  };

  // Submit adding to seller's store from the modal
  const handleConfirmAddToStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addModalProduct) return;

    if (customPrice < addModalProduct.minSellingPrice) {
      showToast(
        'Narx juda past',
        `Sotish narxi eng kam ruxsat etilgan narxdan (${formatMoney(addModalProduct.minSellingPrice)}) kam bo‘lishi mumkin emas.`,
        'warning'
      );
      return;
    }

    const activeStore = await getEnsuredStore();
    if (!activeStore?.id) {
      showToast('Do‘kon topilmadi', 'Avval do‘koningizni yarating yoki sozlang.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const addedProd = await firestoreService.addDropshippingProductToStore(
        addModalProduct,
        activeStore,
        currentUser || ({ id: activeStore.ownerId } as any),
        Number(customPrice)
      );

      // Refresh seller's products list
      await refreshProducts();

      showToast(
        'Do‘koningizga qo‘shildi! 🎉',
        `"${addedProd.title}" muvaffaqiyatli do‘koningizga qo‘shildi va sotuvga chiqarildi.`,
        'success'
      );

      setAddModalProduct(null);
    } catch (err: any) {
      console.error('Failed to add dropshipping product:', err);
      const msg = err?.message || 'Mahsulotni qo‘shishda xatolik yuz berdi.';
      if (msg.includes('limiti to‘ldi') || msg.includes('product limit')) {
        openLimitModal(products.length, 10, msg);
      } else {
        showToast('Xatolik', msg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a catalog product is already imported into seller's store
  const getStoreProduct = (catalogId: string) => {
    return products.find((p) => p.dropshippingCatalogId === catalogId);
  };

  const isAlreadyInStore = (catalogId: string) => {
    return Boolean(getStoreProduct(catalogId));
  };

  // Filtered & Sorted Catalog
  const filteredCatalog = catalog
    .filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        Boolean(p.title && p.title.toLowerCase().includes(q)) ||
        Boolean(p.description && p.description.toLowerCase().includes(q)) ||
        Boolean(p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        Boolean(p.supplierName && p.supplierName.toLowerCase().includes(q)) ||
        Boolean(p.sku && p.sku.toLowerCase().includes(q));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.minSellingPrice - b.minSellingPrice;
      if (sortBy === 'price_high') return b.minSellingPrice - a.minSellingPrice;
      if (sortBy === 'profit_high') {
        const profitA = (a.recommendedPrice || a.minSellingPrice) - a.supplierCost;
        const profitB = (b.recommendedPrice || b.minSellingPrice) - b.supplierCost;
        return profitB - profitA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate live profit in Add Modal
  const modalSupplierCost = addModalProduct?.supplierCost || 0;
  const modalDeliveryFee = addModalProduct?.defaultDeliveryFee || 0;
  const modalCommission = Math.round(Number(customPrice || 0) * ((addModalProduct?.commissionPercent || 5) / 100));
  const modalProfit = Math.max(0, Number(customPrice || 0) - modalSupplierCost - modalDeliveryFee - modalCommission);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Public Header for Guest Visitors */}
      {!currentUser && (
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('auth', { mode: 'login' })}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Kirish
            </button>
            <button
              onClick={() => navigateTo('auth', { mode: 'signup' })}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Do‘kon ochish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Boxes className="w-3.5 h-3.5 text-blue-400" />
            <span>Sellnex Dropshipping Tizimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Oldindan tovar sotib olmasdan savdo qiling!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Ishonchli yetkazib beruvchilarning mahsulotlarini o‘z do‘koningizga bir bosishda qo‘shing.
            Sotish narxi va foyda marjangizni o‘zingiz belgilang. Buyurtma tushganda, mahsulot to‘g‘ridan-to‘g‘ri
            yetkazib beruvchi omboridan mijozingizga yetkaziladi.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 0 so‘m boshlang‘ich tovar xarajati
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Kafolatlangan ombor mahsulotlari
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" /> Barcha 12 viloyat bo‘ylab yetkazib berish
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
      </div>

      {/* Search, Filter & Categories Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot nomi, kategoriya yoki yetkazib beruvchi bo‘yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="recommended">Tavsiya etilgan</option>
              <option value="profit_high">Eng yuqori foyda</option>
              <option value="price_low">Narx: Arzondan qimmatga</option>
              <option value="price_high">Narx: Qimmatdan arzonga</option>
            </select>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Barchasi ({catalog.length})
          </button>
          {categories.map((cat) => {
            const count = catalog.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="aspect-square bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Boxes className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {searchQuery ? 'Qidiruv bo‘yicha mahsulot topilmadi' : 'Hozircha mahsulotlar mavjud emas'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? `"${searchQuery}" so‘rovi bo‘yicha hech qanday mahsulot topilmadi. Qidiruvni tozalang.`
                : 'Ushbu kategoriyada hozircha dropshipping mahsulotlari qo‘shilmagan.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Barcha mahsulotlarni ko‘rish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCatalog.map((product) => {
            const storeProd = getStoreProduct(product.id);
            const alreadyAdded = Boolean(storeProd);
            const estProfit =
              (product.recommendedPrice || product.minSellingPrice) -
              product.supplierCost -
              (product.defaultDeliveryFee || 0);

            const isAddingThis = directAddingId === product.id;
            const recMargin = (product.recommendedPrice || product.minSellingPrice) - product.supplierCost;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-blue-300"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setDetailProduct(product)}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <Package className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {product.categoryName}
                    </span>
                    {alreadyAdded && (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> Do‘konda bor
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3
                        onClick={() => setDetailProduct(product)}
                        className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {product.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Logistics and Supplier Info */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-1">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {product.supplierName}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-800 font-medium border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {product.estimatedDeliveryDays || '1-3 kun'}
                      </span>
                    </div>

                    {/* Sizes and Colors Badges */}
                    {(Boolean(product.sizes?.length) || Boolean(product.colors?.length)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {Boolean(product.sizes?.length) && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-200">
                            👟 Razmer: {product.sizes!.slice(0, 4).join(', ')}{product.sizes!.length > 4 ? ` +${product.sizes!.length - 4}` : ''}
                          </span>
                        )}
                        {Boolean(product.colors?.length) && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                            🎨 {product.colors!.length} xil rang
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price Breakdown Box */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px]">Xarid narxi:</span>
                        <span className="font-bold text-slate-900">{formatMoney(product.supplierCost)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px]">Tavsiya narxi:</span>
                        <span className="font-extrabold text-blue-700">
                          {formatMoney(product.recommendedPrice || product.minSellingPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                        <span className="text-[11px] font-bold text-emerald-800">Taxminiy sof foyda:</span>
                        <span className="font-black text-emerald-600 text-xs">
                          +{formatMoney(Math.max(0, estProfit))}
                        </span>
                      </div>
                    </div>

                    {/* If already in seller's store, show current selling price */}
                    {alreadyAdded && storeProd && (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] flex items-center justify-between text-emerald-900">
                        <span className="font-medium">Do‘koningizdagi narx:</span>
                        <span className="font-black">{formatMoney(storeProd.sellingPrice)}</span>
                      </div>
                    )}

                    {/* 1-Click Fast Margin Addition Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>1 bosishda ulush bilan qo‘shish:</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          disabled={isAddingThis}
                          onClick={() => handleDirectQuickAdd(product, 30000)}
                          className="py-1 px-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                          title="Xarid narxiga +30,000 so‘m qo‘yib do‘konga qo‘shish"
                        >
                          <span>+30 000</span>
                        </button>
                        <button
                          type="button"
                          disabled={isAddingThis}
                          onClick={() => handleDirectQuickAdd(product, 50000)}
                          className="py-1 px-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                          title="Xarid narxiga +50,000 so‘m qo‘yib do‘konga qo‘shish"
                        >
                          <span>+50 000</span>
                        </button>
                        <button
                          type="button"
                          disabled={isAddingThis}
                          onClick={() => handleDirectQuickAdd(product, recMargin > 0 ? recMargin : 40000)}
                          className="py-1 px-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                          title="Tavsiya qilingan foyda bilan bir bosishda qo‘shish"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Tavsiya</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                    title="Batafsil ko‘rish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isAddingThis}
                    onClick={() => handleOpenAddModal(product)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      alreadyAdded
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                    }`}
                  >
                    {isAddingThis ? (
                      <span>Qo‘shilmoqda...</span>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>{alreadyAdded ? 'Ulushni o‘zgartirish' : 'O‘z ulushingiz bilan qo‘shish'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD TO MY STORE & CONFIGURE SELLING PRICE / MARGIN */}
      {/* ======================================================== */}
      {addModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600 fill-blue-600/20" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 leading-tight">Mahsulotga o‘z ulushingizni qo‘ying</h3>
                  <p className="text-[11px] text-slate-500">Bir tugma bilan o‘z foydangizni tanlang va do‘konga e’lon qiling</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product summary strip */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {addModalProduct.images?.[0] ? (
                <img
                  src={addModalProduct.images[0]}
                  alt={addModalProduct.title}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-900 truncate">{addModalProduct.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600">
                  <span>Xarid narxi: <strong className="text-slate-900 font-mono">{formatMoney(addModalProduct.supplierCost)}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Tavsiya narxi: <strong className="text-blue-600 font-mono">{formatMoney(addModalProduct.recommendedPrice)}</strong></span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmAddToStore} className="space-y-4">
              {/* SECTION: 1-Click Margin Quick Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Sizning ustama ulushingiz (foydangiz):</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    +{formatMoney(marginAmount)}
                  </span>
                </div>

                {/* Fixed Amount Preset Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[20000, 30000, 50000, 80000, 100000, 150000].map((amt) => {
                    const isSelected = marginAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSetMargin(amt)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        +{amt >= 100000 ? `${amt / 1000}k` : `${amt / 1000}k`}
                      </button>
                    );
                  })}
                </div>

                {/* Percentage Preset Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[25, 35, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSetMarginPercent(pct)}
                      className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer text-center"
                    >
                      +{pct}% foyda
                    </button>
                  ))}
                </div>

                {/* Custom Margin Input Box */}
                <div className="relative pt-1">
                  <span className="text-[10px] text-slate-500 block mb-1">Yoki o‘zingiz istagan ustama summani yozing:</span>
                  <div className="relative">
                    <input
                      type="number"
                      step={1000}
                      min={0}
                      value={marginAmount || ''}
                      onChange={(e) => handleMarginChange(Number(e.target.value))}
                      placeholder="Masalan: 45000"
                      className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      UZS ulush
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Final Selling Price Input */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mijoz to‘laydigan yakuniy sotish narxi:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = addModalProduct.recommendedPrice || addModalProduct.minSellingPrice;
                      setCustomPrice(rec);
                      setMarginAmount(Math.max(0, rec - addModalProduct.supplierCost));
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Tavsiya narxiga qaytarish
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={addModalProduct.minSellingPrice}
                    step={1000}
                    required
                    value={customPrice || ''}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full pl-3.5 pr-14 py-3 rounded-xl border border-blue-400 bg-blue-50/30 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    UZS
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    Eng kam ruxsat etilgan: <strong>{formatMoney(addModalProduct.minSellingPrice)}</strong>
                  </span>
                  <span>
                    Tavsiya etilgan: <strong>{formatMoney(addModalProduct.recommendedPrice)}</strong>
                  </span>
                </div>
              </div>

              {/* Real-time Profit Calculation Breakdown */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-950 mb-1">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>Daromad taqsimoti:</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-normal">Har bir muvaffaqiyatli buyurtmadan</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mijoz to‘laydigan narx:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatMoney(customPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Yetkazib beruvchi xarid narxi:</span>
                  <span className="font-semibold text-rose-600 font-mono">-{formatMoney(modalSupplierCost)}</span>
                </div>
                {modalDeliveryFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Yetkazib berish xarajati:</span>
                    <span className="font-semibold text-slate-700 font-mono">-{formatMoney(modalDeliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Sellnex komissiyasi ({addModalProduct.commissionPercent || 5}%):</span>
                  <span className="font-semibold text-slate-700 font-mono">-{formatMoney(modalCommission)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-emerald-950 pt-2 border-t border-emerald-200">
                  <span>Sizning sof foydangiz:</span>
                  <span className="text-emerald-700 font-mono text-base">+{formatMoney(modalProfit)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalProduct(null)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || customPrice < addModalProduct.minSellingPrice}
                  className="flex-1 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Qo‘shilmoqda...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>1 tugma bilan do‘konga qo‘shish (+{formatMoney(modalProfit)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FULL PRODUCT DETAILS MODAL */}
      {/* ======================================================== */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {detailProduct.categoryName}
              </span>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Image Preview & Thumbnails */}
              <div className="space-y-2">
                <div className="aspect-16/10 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  {detailProduct.images?.[activeImageIndex] || detailProduct.images?.[0] ? (
                    <img
                      src={detailProduct.images?.[activeImageIndex] || detailProduct.images?.[0]}
                      alt={detailProduct.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <Package className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                </div>
                {Boolean(detailProduct.images && detailProduct.images.length > 1) && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {detailProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                          activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 opacity-70'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">{detailProduct.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {detailProduct.description}
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Xarid Narxi</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {formatMoney(detailProduct.supplierCost)}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-800 font-bold block uppercase">Eng Kam Narx</span>
                  <span className="text-sm font-black text-amber-900 mt-0.5 block">
                    {formatMoney(detailProduct.minSellingPrice)}
                  </span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-800 font-bold block uppercase">Tavsiya Narxi</span>
                  <span className="text-sm font-black text-blue-900 mt-0.5 block">
                    {formatMoney(detailProduct.recommendedPrice)}
                  </span>
                </div>
              </div>

              {/* Sizes & Colors in Detail Modal */}
              {(Boolean(detailProduct.sizes?.length) || Boolean(detailProduct.colors?.length)) && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  {Boolean(detailProduct.sizes?.length) && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">
                        👟 Mavjud Razmerlar (O‘lchamlar):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {detailProduct.sizes!.map((sz) => (
                          <span
                            key={sz}
                            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-xs"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Boolean(detailProduct.colors?.length) && (
                    <div className={detailProduct.sizes?.length ? 'pt-2.5 border-t border-slate-200' : ''}>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">
                        🎨 Mavjud Ranglar:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {detailProduct.colors!.map((col) => (
                          <span
                            key={col}
                            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 shadow-xs"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Supplier & Logistics info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Yetkazib beruvchi:</span>
                  <span className="font-bold text-slate-900">{detailProduct.supplierName}</span>
                </div>
                {detailProduct.supplierProductCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Yetkazib beruvchi kodi (SKU):</span>
                    <span className="font-mono font-bold text-slate-800">{detailProduct.supplierProductCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxminiy yetkazib berish muddati:</span>
                  <span className="font-bold text-slate-900">{detailProduct.estimatedDeliveryDays || '1-3 kun'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Yetkazib berish ma'lumoti:</span>
                  <span className="font-medium text-slate-700 text-right max-w-xs">{detailProduct.deliveryInfo}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = detailProduct;
                  setDetailProduct(null);
                  handleOpenAddModal(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Ustama ulush qo‘yish va do‘konga qo‘shish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
