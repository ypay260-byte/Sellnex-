import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { telegramService } from '../../services/telegramService';
import { RestaurantProfile } from '../../types';
import { SAMPLE_RESTAURANT } from '../../data/restaurantInitialData';
import {
  Store,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Truck,
  Copy,
  ExternalLink,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const RestaurantSettingsView: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number>(15000);
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Telegram states
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [testingBot, setTestingBot] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!currentUser) return;
      setLoading(true);
      try {
        let profile = await firestoreService.getRestaurantByOwner(currentUser.id);
        if (!profile) {
          profile = {
            ...SAMPLE_RESTAURANT,
            id: `rest_${currentUser.id}`,
            ownerId: currentUser.id,
            name: `${currentUser.name?.split(' ')[0] || 'Mening'}'s Restoran`,
            slug: `restoran-${currentUser.id.slice(0, 6)}`,
          };
          await firestoreService.saveRestaurant(profile);
        }

        if (isMounted && profile) {
          setRestaurant(profile);
          setName(profile.name || '');
          setSlug(profile.slug || '');
          setLogo(profile.logo || '');
          setPhone(profile.phone || '');
          setAddress(profile.address || '');
          setWorkingHours(profile.workingHours || '');
          setDeliveryFee(profile.deliveryFee || 0);
          setDescription(profile.description || '');
          setIsOpen(profile.isOpen ?? true);
          setTelegramBotToken(profile.telegramBotToken || '');
          setTelegramChatId(profile.telegramChatId || '');
        }
      } catch (err) {
        console.error('Restaurant settings load error', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!name.trim()) {
      showToast('Nomi kiritilmadi', 'Restoran nomini kiriting', 'warning');
      return;
    }
    if (!slug.trim()) {
      showToast('Havola kiritilmadi', 'Restoran slug havolasini kiriting', 'warning');
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      const updated: RestaurantProfile = {
        ...restaurant,
        name: name.trim(),
        slug: cleanSlug,
        logo: logo.trim(),
        phone: phone.trim(),
        address: address.trim(),
        workingHours: workingHours.trim(),
        deliveryFee: Number(deliveryFee) || 0,
        description: description.trim(),
        isOpen,
        telegramBotToken: telegramBotToken.trim(),
        telegramChatId: telegramChatId.trim(),
      };

      await firestoreService.saveRestaurant(updated);
      setRestaurant(updated);
      setSlug(cleanSlug);
      showToast('Sozlamalar saqlandi', 'Restoran profili muvaffaqiyatli yangilandi', 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Saqlab bo‘lmadi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    const token = telegramBotToken.trim();
    const chatId = telegramChatId.trim();

    if (!chatId) {
      showToast('Chat ID yo‘q', 'Iltimos, Telegram Chat ID kiriting', 'warning');
      return;
    }

    setTestingBot(true);
    try {
      const testMsg = `🔔 <b>Sellnex Restoran Xabarnomasi</b>\n\n✅ Telegram Bot ulanishi muvaffaqiyatli tekshirildi!\n🍽️ Restoran: <b>${name || 'Mening Restoranim'}</b>\n\n<i>Endi yangi buyurtmalar to‘g‘ridan-to‘g‘ri shu yerga keladi!</i>`;
      const res = await telegramService.sendMessage(testMsg, chatId, undefined, token || undefined);

      if (res.success) {
        showToast('Xabar yuborildi!', 'Telegramingizni tekshiring, test xabari yetib bordi.', 'success');
      } else {
        showToast('Xatolik yuz berdi', res.error || 'Telegram xabari bormadi. Token va Chat ID ni tekshiring.', 'error');
      }
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    } finally {
      setTestingBot(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Sozlamalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="restaurant-settings-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Restoran Sozlamalari</h1>
          <p className="text-xs text-slate-500 mt-1">
            Restoran profili, manzillar, yetkazib berish va Telegram buyurtma xabarnomalari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Holat:</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isOpen ? '🟢 Hozir ochiq' : '🔴 Yopiq'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600" />
            <span>Asosiy Ma'lumotlar</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Restoran / Kafe nomi *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Rayhon Milliy Taomlar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Restoran havolasi (Slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                  sellnex.uz/restaurant/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="rayhon"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo yoki Rasm (URL)</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefon raqam *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Manzil *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Toshkent sh., Yunusobod tumani..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ish vaqti</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="09:00 - 23:00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yetkazib berish narxi (so‘m)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">0 qilib qo'yilsa - Bepul yetkazib berish deb ko'rinadi.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tavsif</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mazali milliy taomlar, tandir go'sht, shashliklar..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Integration Box */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Telegram Botga Buyurtma Xabarnomalari</span>
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md">
              Eng muhim funksiya
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Har safar mijoz menyudan buyurtma berganda, ushbu Telegram botingizga yoki guruhingizga darhol to‘liq buyurtma
            cheki va <strong>"✅ Qabul qilish"</strong> hamda <strong>"❌ Rad etish"</strong> interaktiv tugmalari bilan xabar boradi!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Bot Token (ixtiyoriy)</label>
              <input
                type="text"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQ..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Agar bo'sh qoldirsangiz, Sellnex rasmiy Telegram boti orqali yuboriladi.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telegram Chat ID yoki Guruh ID *
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Masalan: 123456789 yoki -10012345678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                O'z Telegram ID ingizni bilish uchun <strong>@userinfobot</strong> ga /start bosing.
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={testingBot || !telegramChatId}
              onClick={handleTestTelegram}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingBot ? 'Yuborilmoqda...' : '🔔 Test xabar yuborish'}</span>
            </button>
            <span className="text-xs text-slate-400">
              Bot va Chat ID to‘g‘ri ulanganligini tekshirish uchun test tugmasini bosing.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
};
