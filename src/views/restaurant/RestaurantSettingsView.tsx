import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { RestaurantProfile } from '../../types';
import {
  Store,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Truck,
  Copy,
  ExternalLink,
  Shield,
  UploadCloud,
  ImageIcon,
  Loader2,
  Bell,
  Sparkles,
  Layers,
} from 'lucide-react';

export const RestaurantSettingsView: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!currentUser) return;
      setLoading(true);
      try {
        let profile = await firestoreService.getRestaurantByOwner(currentUser.id);
        if (!profile) {
          profile = await firestoreService.createCafeForOwner(currentUser.id, {
            name: `${currentUser.name?.split(' ')[0] || 'Mening'} Café`,
            slug: `cafe-${currentUser.id.slice(0, 6)}`,
          });
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

  // Gallery logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const uploadedUrl = await firestoreService.uploadCafeImage(file);
      setLogo(uploadedUrl);
      showToast('Logo yuklandi', 'Café logotipi muvaffaqiyatli yuklandi', 'success');
    } catch (err: any) {
      showToast('Xatolik', 'Rasmni yuklab bo‘lmadi', 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!name.trim()) {
      showToast('Nomi kiritilmadi', 'Café nomini kiriting', 'warning');
      return;
    }
    if (!slug.trim()) {
      showToast('Havola kiritilmadi', 'Café slug havolasini kiriting', 'warning');
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
        storeType: 'cafe',
      };

      await firestoreService.saveRestaurant(updated);
      setRestaurant(updated);
      setSlug(cleanSlug);
      showToast('Sozlamalar saqlandi', 'Café profili muvaffaqiyatli yangilandi', 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Saqlab bo‘lmadi', 'error');
    } finally {
      setSaving(false);
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
    <div id="cafe-settings-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Café Sozlamalari
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Café profili, manzili, ish vaqti va yetkazib berish narxlari boshqaruvi.
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
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600" />
            <span>Asosiy Ma'lumotlar</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Café / Restoran nomi *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Rayhon Milliy Taomlar yoki Evos Cafe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Café havolasi (Slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                  sellnex.uz/?restaurantSlug=
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

          {/* Logo / Rasm with Gallery Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Café Logotipi yoki Muqova Rasmi
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'}
                alt="Café Logo"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="space-y-2 flex-1 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      <span>Yuklanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-amber-600" />
                      <span>📱 Galereyadan logo tanlash</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400">
                  Telefon yoki kompyuter galereyasidan rasm tanlang (URL yozish shart emas)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yetkazib berish narxi (so‘m)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                0 qilib qo‘yilsa — Bepul yetkazib berish deb ko‘rinadi.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Café tavsifi</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mazali milliy taomlar, tandir go'sht, shashliklar..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* In-App Order System Info Banner (No Telegram required) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-amber-700" />
            <span>Sellnex Café Ilova Ichki Buyurtma Tizimi</span>
          </div>
          <p className="text-xs text-amber-950/80 leading-relaxed">
            Café bo‘limida Telegram bot yoki chat ulash talab etilmaydi. Barcha buyurtmalar to‘g‘ridan-to‘g‘ri
            Sellnex ilovasining <strong>"Buyurtmalar"</strong> bo‘limiga kelib tushadi, yangi buyurtma kelganda
            ovozli signal chalinadi va cheklar chiqariladi.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <span>Sozlamalarni Saqlash</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
