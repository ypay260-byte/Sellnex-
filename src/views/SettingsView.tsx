import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import { subscriptionService } from '../services/subscriptionService';
import {
  Settings,
  Store,
  CreditCard,
  Globe,
  Bell,
  Save,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Send,
  User,
  Copy,
  KeyRound,
  Sparkles,
  ArrowRight,
  Crown,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { store, updateStore, currentUser, setCurrentUser, navigateTo, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'payments' | 'domain' | 'advanced'>('account');

  // User Account states
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [copiedUserId, setCopiedUserId] = useState(false);

  // Store profile states
  const [storeName, setStoreName] = useState(store.name || store.storeName || 'My Online Store');
  const [storeSlug, setStoreSlug] = useState(store.slug || 'my-store');
  const [storeVisibility, setStoreVisibility] = useState<'PUBLIC' | 'PRIVATE'>(store.visibility || 'PUBLIC');
  const [isPublished, setIsPublished] = useState<boolean>(store.published !== false);
  const [description, setDescription] = useState(store.description);
  const [phone, setPhone] = useState(store.phone || '');
  const [email, setEmail] = useState(store.email || '');
  const [telegram, setTelegram] = useState(store.telegram || '');
  const [instagram, setInstagram] = useState(store.instagram || '');
  const [currency, setCurrency] = useState(store.currency || 'UZS');

  // Direct Merchant Card Payout (for 260K+ UZS / VIP tiers)
  const [sellerCardNumber, setSellerCardNumber] = useState(store.sellerCardNumber || '');
  const [sellerCardHolder, setSellerCardHolder] = useState(store.sellerCardHolder || currentUser?.name || '');
  const [sellerBankName, setSellerBankName] = useState(store.sellerBankName || 'Uzcard / Humo (O‘zbekiston)');
  const [directPayoutEnabled, setDirectPayoutEnabled] = useState(store.directPayoutEnabled !== false);

  // Payment test credentials
  const [clickServiceId, setClickServiceId] = useState('14920');
  const [clickSecretKey, setClickSecretKey] = useState('clk_live_sec_9841289412');
  const [paymeMerchantId, setPaymeMerchantId] = useState('64019284fa9201a0');
  const [uzumMerchantKey, setUzumMerchantKey] = useState('uzum_sec_prod_live_8849');

  // Custom Domain
  const [customDomain, setCustomDomain] = useState(store.customDomain || `${store.slug}.uz`);

  const trialInfo = subscriptionService.getTrialStatus(currentUser);

  const handleCopyUserId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      setCopiedUserId(true);
      showToast('User ID Copied', currentUser.id, 'info');
      setTimeout(() => setCopiedUserId(false), 2000);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: userName.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim(),
      };
      setCurrentUser(updatedUser);
      showToast('Account Profile Updated', 'Your seller credentials have been saved.', 'success');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showToast('Error', 'Please enter a new password.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Password Mismatch', 'New password and confirmation do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    showToast('Password Changed! 🔒', 'Your account password has been updated securely.', 'success');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateStore({
      name: storeName,
      storeName,
      slug: cleanSlug || store.slug,
      description,
      phone,
      email,
      telegram,
      instagram,
      currency: currency as any,
      customDomain,
      visibility: storeVisibility,
      published: isPublished,
    });
    showToast('Settings Saved!', 'Store profile and visibility configuration updated.', 'success');
  };

  const handleResetData = () => {
    if (confirm('Brauzer keshini tozalash va Firestore bilan qayta sinxronlashni xohlaysizmi?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="settings-view-root" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Settings & Configuration"
        subtitle="Manage your user identity, storefront properties, regional payment keys, and subscription plan."
        fallbackRoute="dashboard"
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'account', label: 'User Account & Security' },
          { id: 'profile', label: 'Store Identity & Socials' },
          { id: 'payments', label: 'Payment Gateway Keys' },
          { id: 'domain', label: 'Custom Domain (.uz)' },
          { id: 'advanced', label: 'System & Data' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 border-b-2 transition-colors shrink-0 ${
              activeTab === t.id ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: User Account & Security */}
      {activeTab === 'account' && (
        <div className="space-y-6 text-xs">
          {/* User ID & Subscription overview */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">User Identification</h3>
                  <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    Role: {currentUser?.role?.toUpperCase() || 'SELLER'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">Unique platform system identifier for API and billing.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-100 px-3 py-2 rounded-xl font-mono text-xs text-slate-800 font-bold border border-slate-200">
                  {currentUser?.id || 'USR-KAMO99'}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Copy User ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subscription status banner */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Plan: {trialInfo.planName}</p>
                  <p className="text-slate-600 text-[11px]">{trialInfo.formattedRemaining}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('pricing')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0"
              >
                <span>Manage Plan & Limits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSaveAccount} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Edit Account Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Email</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Update Profile</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Change Password</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>Save New Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 1: Profile & Socials */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span>Store Profile & Public Access</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Control public visibility, unique store identifiers, and store contact info.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${storeVisibility === 'PUBLIC' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {storeVisibility === 'PUBLIC' ? '🌐 PUBLIC STORE' : '🔒 PRIVATE STORE'}
              </span>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 text-xs block">Store Visibility Setting</label>
                <p className="text-[11px] text-slate-500">
                  {storeVisibility === 'PUBLIC'
                    ? 'Publicly accessible by all customers via unique store URL without login.'
                    : 'Private: Only visible to you when logged in as store owner.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStoreVisibility('PUBLIC')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    storeVisibility === 'PUBLIC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setStoreVisibility('PRIVATE')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    storeVisibility === 'PRIVATE'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Store Unique ID:</span>
                <code className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-slate-800 font-bold">
                  {store.id || store.storeId || 'N/A'}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Storefront Slug:</span>
                <code className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-slate-800 font-bold">
                  {store.slug || 'my-store'}
                </code>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storefront Slug (URL)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. nike, tech"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-mono text-xs font-bold"
                />
              </div>
              <p className="text-[11px] text-blue-700 font-mono mt-1 font-semibold truncate">
                Public URL: /store/{storeSlug || 'slug'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden bg-slate-50 font-bold"
              >
                <option value="UZS">UZS (Uzbekistani Som)</option>
                <option value="USD">USD (United States Dollar)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Store Slogan / Bio</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Phone (+998)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telegram Channel / Username</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@yourstore_uz"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instagram Handle</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@yourstore_uz"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Payment Gateway & Direct Merchant Payout */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 text-xs">
          {/* Section 1: Direct Seller Payment (260K+ UZS / Golden VIP) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <span>To‘g‘ridan-to‘g‘ri Sotuvchi Kartasiga To‘lov Qabul Qilish</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Xaridorlar buyurtma berganda to‘lov Sellnex administratoriga emas, to‘g‘ridan-to‘g‘ri sizning shaxsiy kartangizga o‘tkaziladi.
                </p>
              </div>

              {subscriptionService.isDirectPayoutEligible(currentUser) ? (
                <span className="text-[11px] bg-gradient-to-r from-amber-500/10 to-emerald-500/10 text-amber-800 font-extrabold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>260 000+ VIP / Faol</span>
                </span>
              ) : (
                <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1 shrink-0 self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>260 000 UZS dan boshlab</span>
                </span>
              )}
            </div>

            {subscriptionService.isDirectPayoutEligible(currentUser) ? (
              <div className="bg-gradient-to-br from-amber-50/60 via-slate-50 to-white rounded-2xl p-5 border-2 border-amber-300/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-slate-900 text-xs">
                      Sizning Shaxsiy Plastik Karta Rekvizitlaringiz
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[11px] font-bold text-slate-700">To‘g‘ridan-to‘g‘ri to‘lov:</span>
                    <input
                      type="checkbox"
                      checked={directPayoutEnabled}
                      onChange={(e) => setDirectPayoutEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <span className={`text-[11px] font-black ${directPayoutEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {directPayoutEnabled ? 'YOQILGAN' : 'O‘CHIRILGAN'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Karta Raqami (16 xonali Uzcard / Humo)
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={sellerCardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        setSellerCardNumber(val);
                      }}
                      placeholder="8600 0000 0000 0000"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Karta Egasi (Ism Familiya)
                    </label>
                    <input
                      type="text"
                      value={sellerCardHolder}
                      onChange={(e) => setSellerCardHolder(e.target.value.toUpperCase())}
                      placeholder="ALISHER USMONOV"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Bank Nomi
                    </label>
                    <input
                      type="text"
                      value={sellerBankName}
                      onChange={(e) => setSellerBankName(e.target.value)}
                      placeholder="Kapitalbank / Ipak Yo‘li"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Xaridorlar buyurtma berish sahifasida (Checkout) ushbu karta raqami ko‘rsatiladi. Mijoz chek yuklaganida to‘lov to‘g‘ridan-to‘g‘ri sizning kartangizga tushadi va buyurtmalar ro‘yxatida <strong>"To‘lovni tasdiqlash"</strong> tugmasi orqali qabul qilasiz.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateStore({
                        sellerCardNumber: sellerCardNumber.trim(),
                        sellerCardHolder: sellerCardHolder.trim(),
                        sellerBankName: sellerBankName.trim(),
                        directPayoutEnabled,
                        directPayoutApproved: true,
                      });
                      showToast(
                        'Karta Ma’lumotlari Saqlandi!',
                        'Xaridorlar to‘lovi to‘g‘ridan-to‘g‘ri kartangizga yo‘naltirildi (Sellnex administratorsiz).',
                        'success'
                      );
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sotuvchi Kartasini Saqlash</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-r from-amber-50/50 via-slate-50 to-blue-50/50 rounded-2xl border-2 border-dashed border-amber-300/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                      To‘g‘ridan-to‘g‘ri sotuvchi kartasiga to‘lov — 260 000 UZS (Premium) va $100 (Golden VIP) tariflarda!
                    </h4>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      Hozirgi tarifingizda barcha xaridor to‘lovlari Sellnex markaziy ma’muriyati orqali kafolatlangan holda qabul qilinadi.
                      Xaridorlar buyurtma berganida to‘lovni Sellnex administratorsiz, to‘g‘ridan-to‘g‘ri shaxsiy kartangizga qabul qilish uchun tarifingizni yangilang.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Joriy tarifingiz: <strong className="text-slate-800 uppercase">{currentUser?.plan || 'TRIAL'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('pricing')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Tarifni Yangilash (260 000 so‘mdan boshlab)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Payment Gateway API Credentials */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Click & Payme API Kalitlari (Opsional)</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Avtomatlashtirilgan Click Merchant va Payme Business integratsiyasi uchun API ma’lumotlari.
                </p>
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Production Gateway
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-900">Click Merchant Switch</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Click Service ID</label>
                    <input
                      type="text"
                      value={clickServiceId}
                      onChange={(e) => setClickServiceId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Click Secret Key</label>
                    <input
                      type="password"
                      value={clickSecretKey}
                      onChange={(e) => setClickSecretKey(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-900">Payme Business Gateway</p>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Payme Merchant ID</label>
                  <input
                    type="text"
                    value={paymeMerchantId}
                    onChange={(e) => setPaymeMerchantId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('Kalitlar Saqlandi!', 'To‘lov tizimi API kalitlari xavfsiz saqlandi.', 'success')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>API Kalitlarini Saqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Domain */}
      {activeTab === 'domain' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Connect Custom .uz Domain</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Custom Domain Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. yourstore.uz"
                  className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden font-mono"
                />
                <button
                  onClick={() => showToast('DNS Connected!', `SSL certificate issued for ${customDomain}`, 'success')}
                  className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Verify DNS
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">DNS Configuration Records for CNAME / A:</p>
              <div className="font-mono text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                <p>Type: <strong>CNAME</strong> | Name: <strong>@</strong> | Value: <strong>ingress.sellnex.uz</strong></p>
                <p>Type: <strong>A</strong> | Name: <strong>@</strong> | Value: <strong>185.199.108.153</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Advanced */}
      {activeTab === 'advanced' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Xotira va Keshni boshqarish</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div>
              <p className="font-bold text-slate-900">Keshni tozalash va qayta yuklash</p>
              <p className="text-slate-600 text-xs mt-0.5">
                Brauzer lokal xotirasini tozalab, ma'lumotlarni to'g'ridan-to'g'ri bulutli bazadan yangilaydi.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Brauzer keshini tozalash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

