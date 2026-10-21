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
} from 'lucide-react';

export const DropshippingView: React.FC = () => {
  const { store, currentUser, products, addProduct, refreshProducts, formatMoney, showToast, navigateTo } = useApp();

  const [categories, setCategories] = useState<DropshippingCategory[]>([]);
  const [catalog, setCatalog] = useState<DropshippingCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'profit_high'>('recommended');

  // Modals state
  const [detailProduct, setDetailProduct] = useState<DropshippingCatalogProduct | null>(null);
  const [addModalProduct, setAddModalProduct] = useState<DropshippingCatalogProduct | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  // Set initial price when opening Add Modal
  const handleOpenAddModal = (p: DropshippingCatalogProduct) => {
    if (!currentUser) {
      showToast(
        'Tizimga kiring',
        'Mahsulotni do‘koningizga qo‘shish uchun avval bepul ro‘yxatdan o‘ting va do‘koningizni oching.',
        'info'
      );
      navigateTo('auth', { mode: 'signup' });
      return;
    }
    if (!store?.id) {
      showToast('Do‘kon oching', 'Mahsulotni qo‘shish uchun avval do‘koningizni sozlang.', 'info');
      navigateTo('onboarding');
      return;
    }
    setAddModalProduct(p);
    setCustomPrice(p.recommendedPrice || p.minSellingPrice);
  };

  // Submit adding to seller's store
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

    if (!store?.id) {
      showToast('Do‘kon topilmadi', 'Avval do‘koningizni yarating yoki sozlang.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const addedProd = await firestoreService.addDropshippingProductToStore(
        addModalProduct,
        store,
        currentUser || ({ id: store.ownerId } as any),
        Number(customPrice)
      );

      // Refresh seller's products list
      await refreshProducts();

      showToast(
        'Do‘koningizga qo‘shildi!',
        `"${addedProd.title}" muvaffaqiyatli do‘koningizga qo‘shildi va sotuvga chiqarildi.`,
        'success'
      );

      setAddModalProduct(null);
    } catch (err: any) {
      console.error('Failed to add dropshipping product:', err);
      showToast('Xatolik', err?.message || 'Mahsulotni qo‘shishda xatolik yuz berdi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a catalog product is already imported into seller's store
  const isAlreadyInStore = (catalogId: string) => {
    return products.some((p) => p.dropshippingCatalogId === catalogId);
  };

  // Filtered & Sorted Catalog
  const filteredCatalog = catalog
    .filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
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
            const alreadyAdded = isAlreadyInStore(product.id);
            const estProfit =
              (product.recommendedPrice || product.minSellingPrice) -
              product.supplierCost -
              (product.defaultDeliveryFee || 0);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-blue-300"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setDetailProduct(product)}>
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                      }}
                    />
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
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 flex items-center gap-2">
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
                    onClick={() => handleOpenAddModal(product)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                      alreadyAdded
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{alreadyAdded ? 'Yana qo‘shish' : 'Do‘konimga qo‘shish'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD TO MY STORE & CONFIGURE SELLING PRICE */}
      {/* ======================================================== */}
      {addModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">Mahsulotni do‘konga qo‘shish</h3>
              </div>
              <button
                onClick={() => setAddModalProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product summary strip */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={addModalProduct.images[0]}
                alt={addModalProduct.title}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">{addModalProduct.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Yetkazib beruvchi: <span className="font-semibold text-slate-700">{addModalProduct.supplierName}</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Xarid narxi: <strong className="text-slate-900">{formatMoney(addModalProduct.supplierCost)}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmAddToStore} className="space-y-4">
              {/* Selling price input with bounds */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Sizning sotish narxingiz (so‘mda) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomPrice(addModalProduct.recommendedPrice)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Tavsiya narxini qo‘yish
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={addModalProduct.minSellingPrice}
                    step={1000}
                    required
                    value={customPrice || ''}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-xl border border-blue-400 bg-blue-50/40 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    UZS
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    Eng kam narx: <strong>{formatMoney(addModalProduct.minSellingPrice)}</strong>
                  </span>
                  <span>
                    Tavsiya narxi: <strong>{formatMoney(addModalProduct.recommendedPrice)}</strong>
                  </span>
                </div>
              </div>

              {/* Real-time Profit Calculation Breakdown (Section 5 Requirement) */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Kutilayotgan daromad hisob-kitobi:</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mijoz to‘laydigan narx:</span>
                  <span className="font-bold text-slate-900">{formatMoney(customPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Yetkazib beruvchi xarid narxi:</span>
                  <span className="font-semibold text-rose-600">-{formatMoney(modalSupplierCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Yetkazib berish xarajati:</span>
                  <span className="font-semibold text-slate-700">-{formatMoney(modalDeliveryFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sellnex komissiyasi ({addModalProduct.commissionPercent || 5}%):</span>
                  <span className="font-semibold text-slate-700">-{formatMoney(modalCommission)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-emerald-900 pt-2 border-t border-emerald-200">
                  <span>Sizning sof foydangiz:</span>
                  <span className="text-emerald-700">+{formatMoney(modalProfit)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || customPrice < addModalProduct.minSellingPrice}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Qo‘shilmoqda...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Do‘konga qo‘shish va e’lon qilish</span>
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
                  <img
                    src={detailProduct.images[activeImageIndex] || detailProduct.images[0]}
                    alt={detailProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {detailProduct.images.length > 1 && (
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
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Do‘konimga qo‘shish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
