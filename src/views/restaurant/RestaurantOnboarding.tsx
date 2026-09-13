import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import {
  Utensils,
  Store,
  MapPin,
  Clock,
  Phone,
  Truck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RestaurantOnboarding: React.FC = () => {
  const { currentUser, setCurrentUser, navigateTo, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const userFirstName = currentUser?.name?.split(' ')[0] || 'Mening';
  const [restaurantName, setRestaurantName] = useState(`${userFirstName}'s Café`);
  const [restaurantSlug, setRestaurantSlug] = useState(
    `${userFirstName.toLowerCase().replace(/[^a-z0-9]/g, '')}-cafe`
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+998 90 ');
  const [address, setAddress] = useState('Toshkent sh., Chilonzor tumani');
  const [workingHours, setWorkingHours] = useState('09:00 - 23:00');
  const [deliveryFee, setDeliveryFee] = useState<number>(15000);

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setRestaurantSlug(clean);
  };

  const handleCompleteRestaurantOnboarding = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      // Create a unique, isolated Cafe linked directly to currentUser.id
      const cafe = await firestoreService.createCafeForOwner(currentUser.id, {
        name: restaurantName.trim() || 'Mening Qahvaxonam',
        slug: restaurantSlug.trim() || undefined,
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
        phone: phone.trim(),
        address: address.trim(),
        workingHours: workingHours.trim(),
        deliveryFee: Number(deliveryFee) || 0,
        description: 'Mazali taomlar va tezkor yetkazib berish!',
        isOpen: true,
      });

      // Ensure user profile has businessType: restaurant and direct cafe pointer
      const updatedUser = {
        ...currentUser,
        businessType: 'restaurant' as const,
        restaurantId: cafe.id,
        storeId: cafe.id,
      };
      await firestoreService.setUser(currentUser.id, updatedUser);
      setCurrentUser(updatedUser);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast('Café muvaffaqiyatli ochildi!', 'Menyuga birinchi taomingizni qo‘shishingiz mumkin', 'success');
      navigateTo('restaurant-dashboard');
    } catch (err: any) {
      console.error('Restaurant onboarding error:', err);
      showToast('Xatolik', err.message || 'Café ochilmadi', 'error');
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
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Sellnex Café & Restoran Sozlamalari</h1>
          <p className="text-xs text-amber-100 mt-1 max-w-md mx-auto">
            Bir necha soniyada shaxsiy qahvaxonangiz uchun onlayn menyu va mustaqil buyurtmalar tizimini ishga tushiramiz!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900">1. Café / Restoraningiz haqida ma'lumot</h2>
                <p className="text-xs text-slate-500">Mijozlar menyuda ko‘radigan asosiy ma'lumotlar.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Café / Restoran nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => {
                      setRestaurantName(e.target.value);
                      handleSlugChange(e.target.value);
                    }}
                    placeholder="Masalan: Rayhon Café & Osh Markazi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Onlayn havola (Slug) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                      sellnex.uz/r/
                    </span>
                    <input
                      type="text"
                      required
                      value={restaurantSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="rayhon-cafe"
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
                <p className="text-xs text-slate-500">Ish vaqti va yetkazib berish tarifi.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Café Manzili *</label>
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

                {/* Sellnex In-App Orders Info */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ShoppingBag className="w-4 h-4 text-amber-700" />
                    <span>Sellnex Ilovasida To‘liq Buyurtmalar Boshqaruvi</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Barcha buyurtmalar to‘g‘ridan-to‘g‘ri Sellnex boshqaruv panelida qabul qilinadi, yangi buyurtmalar ovozli
                    signal bilan bildiriladi va har bir buyurtma uchun chek chiqariladi. Telegram botga ehtiyoj yo‘q.
                  </p>
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
                    <span>Café ochilmoqda...</span>
                  ) : (
                    <>
                      <span>Café va Menyuni Ishga Tushirish</span>
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
