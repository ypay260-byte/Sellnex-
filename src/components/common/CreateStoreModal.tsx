import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { Store as StoreIcon, X, Plus, Sparkles, Globe, DollarSign, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose }) => {
  const { createNewStore, showToast, t } = useApp();
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [currency, setCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [targetMarket, setTargetMarket] = useState<'Uzbekistan' | 'Central Asia' | 'Global'>('Uzbekistan');
  const [sellType, setSellType] = useState<'Dropshipping' | 'My own products' | 'Both'>('My own products');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slug check state
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug.trim()) {
      setSlugStatus('idle');
      setSlugError(null);
      return;
    }

    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    if (clean.length < 3) {
      setSlugStatus('idle');
      setSlugError('Havola kamida 3 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setSlugStatus('checking');
    setSlugError(null);

    const timer = setTimeout(async () => {
      try {
        const isAvailable = await firestoreService.isSlugAvailable(clean);
        if (isAvailable) {
          setSlugStatus('available');
          setSlugError(null);
        } else {
          setSlugStatus('taken');
          setSlugError('Bu URL band. Iltimos, boshqa URL tanlang.');
        }
      } catch {
        setSlugStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setStoreName(val);
    const derivedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);
    setSlug(derivedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      showToast('Store name is required', 'Please enter a name for your new store', 'error');
      return;
    }

    if (slugStatus === 'taken') {
      showToast('URL Band', 'Bu URL band. Iltimos, boshqa URL tanlang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createNewStore({
        storeName: storeName.trim(),
        slug: slug.trim() || undefined,
        currency,
        targetMarket,
        sellType,
      });

      if (res.success && res.store) {
        showToast('Store Created!', `Your store "${res.store.name}" is ready and active.`, 'success');
        onClose();
        setStoreName('');
        setSlug('');
      } else {
        showToast('Creation failed', res.error || 'Could not create store', 'error');
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to create store', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Yangi Do'kon Ochish</h3>
              <p className="text-xs text-slate-500">Add a new isolated store to your Sellnex account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Do'kon Nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Masalan: Trendy Wear, Smart Store"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Do'kon Havolasi (Slug) <span className="text-rose-500">*</span>
              </label>
              {slugStatus === 'checking' && (
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Tekshirilmoqda...
                </span>
              )}
              {slugStatus === 'available' && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Mavjud (Bo'sh)
                </span>
              )}
              {slugStatus === 'taken' && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Bu URL band
                </span>
              )}
            </div>
            <div className={`flex items-center rounded-xl border bg-slate-50 overflow-hidden transition-colors ${
              slugStatus === 'taken'
                ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200'
                : slugStatus === 'available'
                ? 'border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200'
                : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
              <span className="pl-3.5 pr-1 text-slate-500 text-xs font-mono select-none">
                /#store/
              </span>
              <input
                id="modal-input-store-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="store-slug"
                className="w-full py-2.5 pr-3.5 bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden"
              />
            </div>
            {slugError && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{slugError}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Do'kon yaratilgach, xaridorlar ushbu unikal havola orqali to'g'ridan-to'g'ri kirishadi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Valyuta</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'UZS' | 'USD')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="UZS">UZS (So'm)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sotuv Turi</label>
              <select
                value={sellType}
                onChange={(e) => setSellType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="My own products">O'z mahsulotlarim</option>
                <option value="Dropshipping">Dropshipping</option>
                <option value="Both">Ikkalasi ham</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Maqsadli Bozor</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Uzbekistan', label: "O'zbekiston" },
                { id: 'Central Asia', label: 'Markaziy Osiyo' },
                { id: 'Global', label: 'Global' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setTargetMarket(m.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    targetMarket === m.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold transition-colors min-h-[38px]"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !storeName.trim()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5 min-h-[38px]"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Do'konni Yaratish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
