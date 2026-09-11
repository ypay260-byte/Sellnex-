import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { SAMPLE_RESTAURANT, SAMPLE_MENU_ITEMS } from '../../data/restaurantInitialData';
import { RestaurantProfile, MenuItem } from '../../types';
import {
  Utensils,
  Store,
  MapPin,
  Clock,
  Phone,
  Truck,
  Send,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RestaurantOnboarding: React.FC = () => {
  const { currentUser, setCurrentUser, navigateTo, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const userFirstName = currentUser?.name?.split(' ')[0] || 'Mening';
  const [restaurantName, setRestaurantName] = useState(`${userFirstName}'s Restoran`);
  const [restaurantSlug, setRestaurantSlug] = useState(
    `${userFirstName.toLowerCase().replace(/[^a-z0-9]/g, '')}-kafe`
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+998 90 ');
  const [address, setAddress] = useState('Toshkent sh., Chilonzor tumani');
  const [workingHours, setWorkingHours] = useState('09:00 - 23:00');
  const [deliveryFee, setDeliveryFee] = useState<number>(15000);
  const [telegramChatId, setTelegramChatId] = useState('');

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setRestaurantSlug(clean);
  };

  const handleCompleteRestaurantOnboarding = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const profile: RestaurantProfile = {
        id: `rest_${currentUser.id}`,
        ownerId: currentUser.id,
        name: restaurantName.trim() || 'Mening Restoranim',
        slug: restaurantSlug.trim() || `restoran-${currentUser.id.slice(0, 5)}`,
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
        phone: phone.trim(),
        address: address.trim(),
        workingHours: workingHours.trim(),
        deliveryFee: Number(deliveryFee) || 0,
        description: 'Mazali taomlar va tezkor yetkazib berish!',
        telegramBotToken: '',
        telegramChatId: telegramChatId.trim() || undefined,
        isOpen: true,
        createdAt: new Date().toISOString(),
      };

      await firestoreService.saveRestaurant(profile);

      // Seed initial menu items
      await Promise.all(
        SAMPLE_MENU_ITEMS.map((sample) =>
          firestoreService.saveMenuItem({
            ...sample,
            id: `dish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            restaurantId: profile.id,
            ownerId: currentUser.id,
          } as MenuItem)
        )
      );

      // Ensure user profile has businessType: restaurant
      const updatedUser = { ...currentUser, businessType: 'restaurant' as const };
      await firestoreService.setUser(currentUser.id, updatedUser);
      setCurrentUser(updatedUser);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast('Restoran tayyor!', 'Restoran boshqaruv paneliga xush kelibsiz', 'success');
      navigateTo('restaurant-dashboard');
    } catch (err: any) {
      console.error('Restaurant onboarding error:', err);
      showToast('Xatolik', err.message || 'Restoran yaratilmadi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="restaurant-onboarding-container" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Sellnex Restoran Sozlamalari</h1>
          <p className="text-xs text-amber-100 mt-1 max-w-md mx-auto">
            Bir necha soniyada restoraningiz uchun onlayn menyu va buyurtma tizimini ishga tushiramiz!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900">1. Restoraningiz haqida ma'lumot</h2>
                <p className="text-xs text-slate-500">Mijozlar menyuda ko‘radigan asosiy ma'lumotlar.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Restoran / Kafe nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => {
                      setRestaurantName(e.target.value);
                      handleSlugChange(e.target.value);
                    }}
                    placeholder="Masalan: Rayhon Osh Markazi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Onlayn havola (Slug) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                      sellnex.uz/restaurant/
                    </span>
                    <input
                      type="text"
                      required
                      value={restaurantSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="rayhon"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bog‘lanish telefon raqami *
                  </label>
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Keyingi qadam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900">2. Manzil va Yetkazib berish</h2>
                <p className="text-xs text-slate-500">Ish vaqti va yetkazib berish narxi.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manzil *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Toshkent sh., Chilonzor tumani..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ish vaqti</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="09:00 - 23:00"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Yetkazib berish (so‘m)</label>
                    <input
                      type="number"
                      step={1000}
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      placeholder="15000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Telegram notifications preview */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>Telegramga Buyurtma Xabarnomalari</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Yangi buyurtmalar kelganda Telegramingizga chek va "Qabul qilish / Rad etish" tugmalari borishi uchun
                    Telegram Chat ID ingizni kiriting (yoki keyinroq sozlamalarda kiritishingiz mumkin).
                  </p>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Masalan: 123456789 (@userinfobot orqali olish mumkin)"
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  Orqaga
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCompleteRestaurantOnboarding}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Restoran ochilmoqda...</span>
                  ) : (
                    <>
                      <span>Restoranni Ishga Tushirish</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
