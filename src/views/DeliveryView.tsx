import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import { StoreDeliveryOption } from '../types';
import {
  Truck,
  Clock,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const DEFAULT_OPTIONS: StoreDeliveryOption[] = [
  {
    id: 'opt_standard',
    name: 'Standart yetkazish',
    estimatedTime: '1–2 ish kuni',
    price: 25000,
    enabled: true,
  },
  {
    id: 'opt_express',
    name: 'Tezkor yetkazish',
    estimatedTime: '24 soat ichida',
    price: 45000,
    enabled: true,
  },
];

export const DeliveryView: React.FC = () => {
  const { store, updateStore, formatMoney, showToast } = useApp();

  const [deliveryOptions, setDeliveryOptions] = useState<StoreDeliveryOption[]>(() => {
    if (store?.deliveryOptions && Array.isArray(store.deliveryOptions) && store.deliveryOptions.length > 0) {
      return store.deliveryOptions;
    }
    return DEFAULT_OPTIONS;
  });

  const [isSaving, setIsSaving] = useState(false);

  // New option modal/form states
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionTime, setNewOptionTime] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState<number>(30000);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdateOption = (id: string, field: keyof StoreDeliveryOption, value: any) => {
    setDeliveryOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleToggleOption = (id: string) => {
    setDeliveryOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, enabled: !opt.enabled } : opt))
    );
  };

  const handleDeleteOption = (id: string) => {
    if (deliveryOptions.length <= 1) {
      showToast('Xatolik', 'Kamida bitta yetkazib berish tarifi mavjud bo‘lishi kerak.', 'warning');
      return;
    }
    setDeliveryOptions((prev) => prev.filter((opt) => opt.id !== id));
    showToast('O‘chirildi', 'Tarif o‘chirildi. Saqlash tugmasini bosing.', 'info');
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionName.trim()) {
      showToast('Xatolik', 'Tarif nomini kiriting.', 'warning');
      return;
    }
    if (!newOptionTime.trim()) {
      showToast('Xatolik', 'Yetkazish muddatini kiriting.', 'warning');
      return;
    }
    if (newOptionPrice < 0) {
      showToast('Xatolik', 'Yetkazish narxi 0 dan kam bo‘lmasligi kerak.', 'warning');
      return;
    }

    const newOpt: StoreDeliveryOption = {
      id: `opt_${Date.now()}`,
      name: newOptionName.trim(),
      estimatedTime: newOptionTime.trim(),
      price: Number(newOptionPrice),
      enabled: true,
    };

    setDeliveryOptions((prev) => [...prev, newOpt]);
    setNewOptionName('');
    setNewOptionTime('');
    setNewOptionPrice(30000);
    setShowAddForm(false);
    showToast('Tarif qo‘shildi', 'O‘zgarishlarni saqlash uchun "Tariflarni saqlash" tugmasini bosing.', 'success');
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateStore({
        deliveryOptions,
      });
      showToast('Yetkazib berish tariflari saqlandi!', 'Do‘koningiz checkout sahifasida aynan shu tariflar ko‘rinadi.', 'success');
    } catch (err: any) {
      showToast('Xatolik yuz berdi', err?.message || 'Tariflarni saqlashda muammo yuz berdi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="delivery-view-root" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Yetkazib berish sozlamalari (Delivery Settings)"
        subtitle="Do‘koningiz uchun yetkazib berish tariflarini (nomi, muddati, narxi) belgilang. Xaridor checkout paytida faqat siz kiritgan tariflarni ko‘radi."
        fallbackRoute="dashboard"
        rightElement={
          <button
            id="btn-save-delivery-rates"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Tariflarni saqlash</span>
          </button>
        }
      />

      {/* Info notice box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-blue-900">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-blue-950">
            Yetkazib berish narxlarini har bir sotuvchi o‘zi mustaqil belgilaydi
          </p>
          <p className="text-blue-800 text-xs">
            Xaridor sizning mahsulotlaringizni savatga qo‘shib Checkout sahifasiga o‘tganda, aynan shu yerda belgilangan tariflar chiqadi.
            Yetkazib berish narxi mahsulotlar summasiga qo‘shilib, umumiy Buyurtma summasi hosil qilinadi.
          </p>
        </div>
      </div>

      {/* Main Delivery Rates List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Sizning do‘kon tariflaringiz</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Jami {deliveryOptions.length} ta yetkazib berish tarifi
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Yangi tarif qo‘shish</span>
          </button>
        </div>

        {/* Form to add a new option */}
        {showAddForm && (
          <form onSubmit={handleAddOption} className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Yangi yetkazib berish tarifini kiritish
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tarif nomi <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Standart yetkazish"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Yetkazish muddati <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1–2 ish kuni"
                  value={newOptionTime}
                  onChange={(e) => setNewOptionTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Narxi (UZS) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="25000"
                  value={newOptionPrice}
                  onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Qo‘shish
              </button>
            </div>
          </form>
        )}

        {/* Existing Options List */}
        <div className="divide-y divide-slate-100">
          {deliveryOptions.map((opt) => (
            <div key={opt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) => handleUpdateOption(opt.id, 'name', e.target.value)}
                    className="font-extrabold text-sm text-slate-900 border-b border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-600 outline-hidden bg-transparent px-1 py-0.5"
                  />
                  {opt.enabled !== false ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Faol
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      O‘chirilgan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Yetkazish muddati:</span>
                  <input
                    type="text"
                    value={opt.estimatedTime}
                    onChange={(e) => handleUpdateOption(opt.id, 'estimatedTime', e.target.value)}
                    className="font-semibold text-slate-700 border-b border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-600 outline-hidden bg-transparent px-1 py-0.5 w-36"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Narxi:</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={opt.price}
                    onChange={(e) => handleUpdateOption(opt.id, 'price', Number(e.target.value))}
                    className="w-28 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-black text-blue-700 outline-hidden bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs font-mono font-bold text-slate-500">UZS</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={opt.enabled !== false ? "O'chirish" : "Yoqish"}
                    onClick={() => handleToggleOption(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      opt.enabled !== false
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {opt.enabled !== false ? 'Faol' : 'Nofaol'}
                  </button>

                  <button
                    type="button"
                    title="Tarifni butunlay o'chirish"
                    onClick={() => handleDeleteOption(opt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button at the Bottom as well */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Tariflarni saqlash</span>
        </button>
      </div>
    </div>
  );
};
