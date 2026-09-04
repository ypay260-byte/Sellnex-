import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { productService, ImportedProductDraft } from '../services/productService';
import { BackHeader } from '../components/common/BackHeader';
import {
  Zap,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Percent,
  Coins,
  RotateCw,
  Edit3,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProductImportView: React.FC = () => {
  const { store, addProduct, navigateTo, showToast, formatMoney, t } = useApp();

  // Input states
  const [url, setUrl] = useState('https://uzum.uz/product/smartfon-redmi-13c');
  const [selectedSupplier, setSelectedSupplier] = useState<'Amazon' | 'Alibaba' | 'Uzum Market' | 'Custom URL'>('Uzum Market');
  const [isLoading, setIsLoading] = useState(false);
  const [importedDraft, setImportedDraft] = useState<ImportedProductDraft | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Profit Calculator states
  const [profitType, setProfitType] = useState<'fixed' | 'percentage'>('fixed');
  const [fixedProfitValue, setFixedProfitValue] = useState<number>(75000); // 75k UZS
  const [percentageMarginValue, setPercentageMarginValue] = useState<number>(25); // 25%

  const supplierPresets = [
    {
      id: 'Uzum Market' as const,
      name: 'Uzum Market',
      icon: '🍇',
      sampleUrl: 'https://uzum.uz/ru/product/smartfon-xiaomi-redmi-13c-23032',
      tag: '1-Day Tashkent Hub',
    },
    {
      id: 'Alibaba' as const,
      name: 'Alibaba / AliExpress',
      icon: '🌏',
      sampleUrl: 'https://aliexpress.com/item/smart-watch-ultra-2',
      tag: 'Low Wholesale Cost',
    },
    {
      id: 'Amazon' as const,
      name: 'Amazon',
      icon: '📦',
      sampleUrl: 'https://amazon.com/dp/B08N5N6RSS-wireless-headphones',
      tag: 'Global Fast Track',
    },
    {
      id: 'Custom URL' as const,
      name: 'Custom URL / Any Shop',
      icon: '🔗',
      sampleUrl: 'https://shop.uz/item/aroma-diffuser-led',
      tag: 'Direct Supplier',
    },
  ];

  const handleSelectPreset = (preset: typeof supplierPresets[0]) => {
    setSelectedSupplier(preset.id);
    setUrl(preset.sampleUrl);
  };

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setImportedDraft(null);
    setIsEditingDraft(false);

    try {
      const draft = await productService.simulateUrlImport(url, selectedSupplier);
      setImportedDraft(draft);

      // Auto-set profit defaults based on supplier cost
      if (draft.supplierCost > 1000000) {
        setFixedProfitValue(200000);
      } else if (draft.supplierCost > 300000) {
        setFixedProfitValue(120000);
      } else if (draft.supplierCost > 100000) {
        setFixedProfitValue(75000);
      } else {
        setFixedProfitValue(35000);
      }

      showToast('Mahsulot yuklandi!', `"${draft.title}" muvaffaqiyatli aniqlandi.`, 'success');
    } catch {
      showToast('Xatolik yuz berdi', 'Havolani tekshirib qaytadan urinib koʻring.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Math calculations
  const supplierCost = importedDraft?.supplierCost || 250000;
  const shippingCost = importedDraft?.shippingCost || 15000;
  const baseSupplierTotal = supplierCost + shippingCost;

  let sellerProfit = 0;
  let customerPrice = 0;
  let paymentFee = 0;

  if (profitType === 'fixed') {
    sellerProfit = Math.max(0, fixedProfitValue);
    const preliminaryTotal = baseSupplierTotal + sellerProfit;
    paymentFee = Math.round(preliminaryTotal * 0.015);
    customerPrice = baseSupplierTotal + sellerProfit + paymentFee;
  } else {
    const marginRatio = (percentageMarginValue + 1.5) / 100;
    if (marginRatio < 0.95) {
      customerPrice = Math.round(baseSupplierTotal / (1 - marginRatio));
      paymentFee = Math.round(customerPrice * 0.015);
      sellerProfit = customerPrice - baseSupplierTotal - paymentFee;
    } else {
      customerPrice = Math.round(baseSupplierTotal * 1.5);
      paymentFee = Math.round(customerPrice * 0.015);
      sellerProfit = customerPrice - baseSupplierTotal - paymentFee;
    }
  }

  const profitMarginPercent = customerPrice > 0 ? Math.round((sellerProfit / customerPrice) * 100) : 0;

  const handleAddProductToStore = (andPublish = true) => {
    if (!importedDraft) return;

    addProduct({
      storeId: store.id,
      title: importedDraft.title,
      description: importedDraft.description,
      category: importedDraft.category,
      images: importedDraft.images,
      supplier: importedDraft.supplier,
      supplierUrl: importedDraft.supplierUrl,
      supplierCost: importedDraft.supplierCost,
      shippingCost: importedDraft.shippingCost,
      paymentFeePercent: 1.5,
      platformFeePercent: 0,
      profitType,
      profitValue: profitType === 'fixed' ? fixedProfitValue : percentageMarginValue,
      calculatedProfit: sellerProfit,
      sellingPrice: customerPrice,
      oldPrice: importedDraft.suggestedOldPrice || Math.round(customerPrice * 1.25),
      stock: importedDraft.stock,
      status: andPublish ? 'Published' : 'Draft',
      sku: `SL-${Math.floor(1000 + Math.random() * 9000)}`,
      variants: importedDraft.variants,
      rating: 4.9,
      reviewCount: 1,
      featured: true,
    });

    try {
      confetti({ particleCount: 75, spread: 60 });
    } catch {
      // ignore
    }

    if (andPublish) {
      showToast('Doʻkonga qoʻshildi!', 'Mahsulot muvaffaqiyatli nashr etildi va doʻkonda koʻrinmoqda.', 'success');
      navigateTo('public-store', { storeSlug: store.slug });
    } else {
      showToast('Qoralama saqlandi', 'Mahsulotlar roʻyxatiga saqlandi.', 'info');
      navigateTo('products');
    }
  };

  return (
    <div id="product-import-view" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <BackHeader
        badge="Core Dropshipping Engine"
        title={t('import_title', 'Mahsulotni import qilish va Foyda belgilash')}
        subtitle={t('import_subtitle', 'Uzum Market, AliExpress, Amazon yoki istalgan doʻkon havolasini kiriting. Tizim rasmlar, nom, ulgurji narx va sof foydani avtomatik hisoblab beradi.')}
        fallbackRoute="products"
      />

      {/* URL Input Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('import_url_label', 'Yetkazib beruvchi / Mahsulot havolasi (URL)')}
          </label>
          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Uzum / AliExpress / Amazon / Custom
          </span>
        </div>

        <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              id="input-supplier-url"
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('import_url_placeholder', 'https://uzum.uz/product/... yoki https://aliexpress.com/item/...')}
              className="w-full pl-11 pr-4 py-3.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden bg-slate-50/60 transition-colors"
            />
          </div>

          <button
            id="btn-import-product-action"
            type="submit"
            disabled={isLoading}
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 min-h-[48px]"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('import_loading_text', 'Maʼlumotlar olinmoqda...')}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{t('import_btn_action', 'Import Qilish')}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Supplier Presets */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2.5">
            {t('import_presets_title', 'Yoki quyidagi tayyor yetkazib beruvchi namunalaridan tanlang:')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {supplierPresets.map((preset) => (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id.replace(/\s+/g, '')}`}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedSupplier === preset.id
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block">{preset.tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center py-14 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-bounce">
            <RotateCw className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{selectedSupplier} bilan bogʻlanilmoqda...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Mahsulot nomi, sifatli rasmlar, rang/oʻlcham variantlari va ulgurji yetkazib berish narxlari aniqlanmoqda.
          </p>
        </div>
      )}

      {/* Extracted Product & Profit Calculator */}
      {importedDraft && !isLoading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Product Details & Live Editing */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mahsulot Aniqlindi
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingDraft(!isEditingDraft)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingDraft ? 'Tahrirni yopish' : 'Tahrirlash'}
                </button>
              </div>

              {/* Main Image Preview */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={importedDraft.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                  alt={importedDraft.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">
                  {importedDraft.supplier}
                </span>
              </div>

              {/* Edit Mode vs Preview Mode */}
              {isEditingDraft ? (
                <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-700">Mahsulot Nomi</label>
                    <input
                      type="text"
                      value={importedDraft.title}
                      onChange={(e) => setImportedDraft({ ...importedDraft, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-700">Rasm Havolasi (URL)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={importedDraft.images[0] || ''}
                        onChange={(e) =>
                          setImportedDraft({
                            ...importedDraft,
                            images: [e.target.value, ...(importedDraft.images.slice(1) || [])],
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-700">Tannarx (UZS)</label>
                      <input
                        type="number"
                        step="5000"
                        value={importedDraft.supplierCost}
                        onChange={(e) => setImportedDraft({ ...importedDraft, supplierCost: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-700">Kategoriya</label>
                      <input
                        type="text"
                        value={importedDraft.category}
                        onChange={(e) => setImportedDraft({ ...importedDraft, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-700">Tavsif</label>
                    <textarea
                      rows={2}
                      value={importedDraft.description}
                      onChange={(e) => setImportedDraft({ ...importedDraft, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingDraft(false)}
                    className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Saqlash
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{importedDraft.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {importedDraft.description}
                  </p>
                </div>
              )}

              {/* Supplier Cost Breakdown Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Yetkazib beruvchi tannarxi:</span>
                  <span className="font-semibold text-slate-900">{formatMoney(importedDraft.supplierCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Yetkazib berish (Logistika):</span>
                  <span className="font-semibold text-slate-900">{formatMoney(importedDraft.shippingCost)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Jami Yetkazib Beruvchi Xarajati:</span>
                  <span className="text-blue-700">{formatMoney(baseSupplierTotal)}</span>
                </div>
              </div>

              {/* Variants */}
              {importedDraft.variants.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">Mavjud Variantlar:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {importedDraft.variants[0].options.map((opt, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Interactive Profit Calculator */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-lg shadow-blue-500/5 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Foyda Kalkulyatori</h3>
                      <p className="text-xs text-slate-500">Har bir sotuvdan qancha sof foyda olmoqchisiz?</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Avtomatik Hisob-kitob
                  </span>
                </div>

                {/* Profit Mode Switcher */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    id="calc-mode-fixed"
                    type="button"
                    onClick={() => setProfitType('fixed')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      profitType === 'fixed'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Aniq Summa (UZS)</span>
                      <Coins className="w-4 h-4 text-blue-600" />
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Masalan, har bir dona mahsulotdan 75,000 soʻm</p>
                  </button>

                  <button
                    id="calc-mode-percentage"
                    type="button"
                    onClick={() => setProfitType('percentage')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      profitType === 'percentage'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Foizda (%) Ustama</span>
                      <Percent className="w-4 h-4 text-blue-600" />
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Masalan, yakuniy narxning 25% qismi foyda</p>
                  </button>
                </div>

                {/* Profit Input Controls */}
                {profitType === 'fixed' ? (
                  <div className="space-y-2 mb-6">
                    <label className="block text-xs font-semibold text-slate-700">
                      Siz xohlagan Sof Foyda miqdori (UZS)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="input-fixed-profit"
                        type="number"
                        step="5000"
                        min="10000"
                        value={fixedProfitValue}
                        onChange={(e) => setFixedProfitValue(Number(e.target.value) || 0)}
                        className="flex-1 px-4 py-3 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden bg-slate-50/50 min-h-[44px]"
                      />
                      <div className="flex flex-wrap gap-1">
                        {[50000, 75000, 100000, 150000, 200000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFixedProfitValue(val)}
                            className="flex-1 sm:flex-none px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors min-h-[36px]"
                          >
                            {(val / 1000).toFixed(0)}k
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Foyda foizi (Ustama):</span>
                      <span className="text-blue-600 font-bold">{percentageMarginValue}%</span>
                    </div>
                    <input
                      id="input-percentage-margin"
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={percentageMarginValue}
                      onChange={(e) => setPercentageMarginValue(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>10% (Raqobatbardosh)</span>
                      <span>25% (Tavsiya etiladi)</span>
                      <span>50%+ (Yuqori Daromad)</span>
                    </div>
                  </div>
                )}

                {/* Calculation Breakdown Matrix */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>1. Yetkazib beruvchi tannarxi:</span>
                    <span>{formatMoney(supplierCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>2. Yetkazib berish (Pochta/Kuryer):</span>
                    <span>+{formatMoney(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>3. Toʻlov tizimi komissiyasi (1.5%):</span>
                    <span>+{formatMoney(paymentFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>4. Sellnex platforma komissiyasi:</span>
                    <span className="text-emerald-600 font-semibold">0 UZS (0% Bepul)</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span>5. Sizning Sof Foydangiz (Har bir sotuvdan):</span>
                    <span>+{formatMoney(sellerProfit)}</span>
                  </div>

                  <div className="border-t-2 border-dashed border-slate-300 pt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-600">Mijoz Sotib Olish Narxi</span>
                      <p className="text-[11px] text-slate-400">Doʻkoningizda koʻrinadigan yakuniy narx</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black text-blue-600">
                        {formatMoney(customerPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit Metrics Callout */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-[11px] text-emerald-800 font-semibold">1 ta Buyurtmadan Sof Foyda</p>
                    <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-0.5">
                      {formatMoney(sellerProfit)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <p className="text-[11px] text-blue-800 font-semibold">Rentabellik Foizi</p>
                    <p className="text-lg sm:text-xl font-extrabold text-blue-700 mt-0.5">
                      {profitMarginPercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  id="btn-add-product-publish"
                  type="button"
                  onClick={() => handleAddProductToStore(true)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Doʻkonga Qoʻshish va Nashr Qilish</span>
                </button>

                <button
                  id="btn-add-product-draft"
                  type="button"
                  onClick={() => handleAddProductToStore(false)}
                  className="py-3.5 px-6 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors min-h-[48px]"
                >
                  Qoralama sifatida saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
