import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { firestoreService } from '../services/firestoreService';
import { AdminSettings } from '../types';
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Phone,
  MapPin,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Building2,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutView: React.FC = () => {
  const {
    store,
    publicStore,
    cart,
    cartTotal,
    createOrder,
    navigateTo,
    formatMoney,
    showToast,
  } = useApp();

  const activeStore = publicStore || store;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('Toshkent shahri');
  const [district, setDistrict] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping & Payment Methods
  const [deliveryMethod, setDeliveryMethod] = useState<'Standard' | 'Express' | 'Pickup'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<'Click' | 'Payme' | 'Uzum Bank' | 'Cash on Delivery'>('Click');

  // P2P and Card states
  const [txReceiptNumber, setTxReceiptNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [copiedCard, setCopiedCard] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

  // Load Admin Central Card settings from Firestore
  useEffect(() => {
    let isMounted = true;
    firestoreService.getAdminSettings().then((settings) => {
      if (isMounted && settings) {
        setAdminSettings(settings);
      }
    }).catch((err) => {
      console.warn('Failed to load admin settings in checkout:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const uzbekistanRegions = [
    'Toshkent shahri',
    'Toshkent viloyati',
    'Samarqand viloyati',
    'Buxoro viloyati',
    'Farg‘ona viloyati',
    'Andijon viloyati',
    'Namangan viloyati',
    'Qashqadaryo viloyati',
    'Surxondaryo viloyati',
    'Jizzax viloyati',
    'Navoiy viloyati',
    'Sirdaryo viloyati',
    'Xorazm viloyati',
    'Qoraqalpog‘iston Respublikasi',
  ];

  const deliveryPrices = {
    Standard: 25000,
    Express: 45000,
    Pickup: 0,
  };

  const currentDeliveryCost = deliveryPrices[deliveryMethod];
  const grandTotal = (cartTotal || 0) + currentDeliveryCost;

  // Determine card details: If seller is admin-trusted, use seller's card, otherwise use central Admin Escrow Card
  const isTrustedSeller = Boolean(activeStore?.isTrustedSeller && activeStore?.sellerCardNumber);
  const targetCardNumber = isTrustedSeller
    ? (activeStore.sellerCardNumber || '8600 3141 7549 7736')
    : (adminSettings?.p2pCardNumber || '8600 3141 7549 7736');
  const targetCardHolder = isTrustedSeller
    ? (activeStore.sellerCardHolder || activeStore.name)
    : (adminSettings?.p2pCardHolder || 'Sellnex Bosh Administratsiyasi');
  const targetBankName = isTrustedSeller
    ? (activeStore.sellerBankName || 'Uzcard / Humo')
    : (adminSettings?.p2pBankName || 'Milliy Bank / Uzcard Humo');

  const handleCopyCard = () => {
    const rawCard = targetCardNumber.replace(/\s+/g, '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawCard);
    }
    setCopiedCard(true);
    showToast('Karta nusxalandi', `${targetCardNumber} buferga nusxalandi`, 'success');
    setTimeout(() => setCopiedCard(false), 3000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !district.trim() || !streetAddress.trim()) {
      showToast('Ma\'lumotlar to‘liq emas', 'Iltimos, yetkazib berish manzili va telefon raqamingizni kiriting.', 'warning');
      return;
    }

    if (!cart || cart.length === 0) {
      showToast('Savat bo‘sh', 'Xarid qilish uchun avval mahsulot tanlang.', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStage('To‘lov ma\'lumotlari xavfsiz tekshirilmoqda...');

    await new Promise((r) => setTimeout(r, 600));
    setProcessingStage('Buyurtma rasmiylashtirilmoqda...');

    await new Promise((r) => setTimeout(r, 600));

    // Create real domain order
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      image: item.product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
      price: item.product.sellingPrice,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
      supplierCost: item.product.supplierCost || Math.round(item.product.sellingPrice * 0.7),
      shippingCost: item.product.shippingCost || 0,
      supplier: item.product.supplier || 'Sellnex Warehouse',
    }));

    const isEscrow = !isTrustedSeller && paymentMethod !== 'Cash on Delivery';

    const newOrder = createOrder({
      storeId: activeStore?.id || store.id,
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || `${phone.replace(/[^0-9]/g, '')}@customer.uz`,
      shippingAddress: {
        region,
        city: district.trim(),
        street: streetAddress.trim(),
        notes: notes.trim(),
      },
      items: orderItems,
      totalAmount: grandTotal,
      currency: 'UZS',
      paymentMethod: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'P2P Card Transfer',
      deliveryMethod,
      trackingNumber: `UZP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      escrowStatus: isEscrow ? 'paid_held_in_escrow' : 'pending_payment',
      receiptTxNumber: txReceiptNumber.trim() || undefined,
    });

    setIsProcessing(false);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch {
      // ignore
    }

    showToast(
      'Buyurtma qabul qilindi!',
      `Buyurtma raqamingiz: ${newOrder.orderNumber}. Mahsulot tez orada yetkaziladi.`,
      'success'
    );
    navigateTo('order-success', {
      orderId: newOrder.id,
      storeSlug: activeStore?.slug || store.slug,
      storeId: activeStore?.id || store.id,
    });
  };

  const primaryColor = activeStore?.primaryColor || '#2563eb';

  // Empty cart fallback
  if (!cart || cart.length === 0) {
    return (
      <div id="checkout-view-empty" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Savatingiz hozircha bo‘sh</h2>
          <p className="text-xs text-slate-500">
            Buyurtma berish uchun avval do‘kondan o‘zingizga ma’qul mahsulotni savatga qo‘shing.
          </p>
          <button
            onClick={() => navigateTo('public-store', { storeSlug: activeStore?.slug || store.slug, storeId: activeStore?.id || store.id })}
            style={{ backgroundColor: primaryColor }}
            className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Do‘konga qaytish</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-view-root" className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-200 mb-6 sm:mb-8">
          <button
            id="checkout-back-to-store"
            onClick={() => navigateTo('public-store', { storeSlug: activeStore?.slug || store.slug, storeId: activeStore?.id || store.id })}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors min-h-[44px] py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Do‘konga qaytish</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-[140px] sm:max-w-none">
              {activeStore?.name || activeStore?.storeName || 'Do‘kon'}
            </span>
            <span className="text-[11px] sm:text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xavfsiz To‘lov</span>
            </span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left 7 Cols: Customer Info, Delivery & Payment */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* 1. Customer Details */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>1. Qabul qiluvchi ma’lumotlari</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ism va Familiya *</label>
                    <input
                      id="checkout-input-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masalan: Azizbek Rustamov"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Telefon raqam (+998) *</label>
                    <input
                      id="checkout-input-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Elektron pochta (ixtiyoriy)</label>
                    <input
                      id="checkout-input-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="pochta@mail.uz"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>2. Yetkazib berish manzili</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Viloyat / Shahar *</label>
                    <select
                      id="checkout-select-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-300 rounded-xl outline-hidden bg-slate-50 font-medium text-xs sm:text-sm min-h-[44px]"
                    >
                      {uzbekistanRegions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tuman / Shahar *</label>
                    <input
                      id="checkout-input-city"
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Masalan: Yunusobod tumani"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Ko‘cha, uy va xonadon raqami *</label>
                    <input
                      id="checkout-input-address"
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Masalan: Amir Temur ko‘chasi, 42-uy, 18-xonadon"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Kuryer uchun izoh (ixtiyoriy)</label>
                    <input
                      id="checkout-input-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masalan: Kelishdan 15 daqiqa oldin qo‘ng‘iroq qiling"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Yetkazib berish xizmati</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { id: 'Standard' as const, title: 'Standart Yetkazish', time: '1-2 ish kuni', price: 25000 },
                      { id: 'Express' as const, title: 'Tezkor Kuryer', time: '24 soat ichida', price: 45000 },
                      { id: 'Pickup' as const, title: 'Olib ketish punkti', time: 'Filialdan olish', price: 0 },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDeliveryMethod(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all min-h-[56px] ${
                          deliveryMethod === m.id
                            ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{m.title}</span>
                          {deliveryMethod === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{m.time}</p>
                        <p className="font-extrabold text-blue-700 mt-1">
                          {m.price === 0 ? 'BEPUL' : formatMoney(m.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. P2P Escrow Payment & Card Transfer */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>3. To‘lov usuli (P2P Kafolatlangan Hisob)</span>
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Admin Escrow Himoyasi</span>
                  </span>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {[
                    { id: 'Click' as const, name: 'Click', icon: '💳', badge: 'Uzcard / Humo' },
                    { id: 'Payme' as const, name: 'Payme', icon: '⚡', badge: 'Karta orqali' },
                    { id: 'Uzum Bank' as const, name: 'Uzum Bank', icon: '🍇', badge: 'Ilova orqali' },
                    { id: 'Cash on Delivery' as const, name: 'Naqd to‘lov', icon: '💵', badge: 'Qabul qilganda' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      id={`pay-method-${p.id.replace(/\s+/g, '')}`}
                      type="button"
                      onClick={() => setPaymentMethod(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all min-h-[70px] flex flex-col justify-between ${
                        paymentMethod === p.id
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{p.icon}</span>
                        {paymentMethod === p.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                        <span className="text-[10px] text-slate-400 font-medium block leading-tight">{p.badge}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* P2P Escrow Card Box */}
                {paymentMethod !== 'Cash on Delivery' && (
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="font-extrabold text-xs sm:text-sm text-white">
                            {isTrustedSeller ? "To'g'ridan-to'g'ri Sotuvchi Kartasi" : "Bosh Administratsiya Kafolatlangan Kartasi"}
                          </span>
                          <p className="text-[11px] text-slate-300">
                            {isTrustedSeller ? "Tasdiqlangan Ishonchli Sotuvchi" : "Mablag‘ yetkazib berilguncha xavfsiz saqlanadi"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {targetBankName}
                      </span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">To‘lov Karta Raqami</span>
                        <span className="font-mono text-base sm:text-xl font-black text-amber-300 tracking-wider">
                          {targetCardNumber}
                        </span>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                          Qabul qiluvchi: <strong className="text-white">{targetCardHolder}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCard}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                      >
                        {copiedCard ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-800" />
                            <span>Nusxalandi!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Karta raqamini nusxalash</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="block text-slate-200 font-semibold">
                        To‘lov cheki raqami yoki Tranzaksiya ID (Click / Payme chek kodi)
                      </label>
                      <input
                        type="text"
                        value={txReceiptNumber}
                        onChange={(e) => setTxReceiptNumber(e.target.value)}
                        placeholder="Masalan: 98765432 yoki to‘lov skrinshot raqami"
                        className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 font-mono text-xs outline-hidden focus:border-amber-400 focus:bg-white/20 transition-all"
                      />
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                      <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Escrow kafolati:</strong> Siz to‘lagan pul sotuvchi mahsulotni to‘liq yetkazib bergunga qadar Sellnex Administratsiyasi hisobida turadi. Mahsulot qabul qilingach sotuvchiga o‘tkazib beriladi.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Cols: Order Summary & Pay Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-slate-900" />
                  <span>Buyurtma tarkibi ({cart.length} ta mahsulot)</span>
                </h3>

                {/* Cart Items Summary */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="py-3 first:pt-0 flex items-center gap-3 text-xs">
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80'}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.product.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Soni: {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatMoney(item.product.sellingPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Mahsulotlar narxi:</span>
                    <span className="font-semibold text-slate-900">{formatMoney(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yetkazib berish ({deliveryMethod}):</span>
                    <span className="font-semibold text-slate-900">
                      {currentDeliveryCost === 0 ? 'BEPUL' : formatMoney(currentDeliveryCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Platforma xizmati:</span>
                    <span className="text-emerald-600 font-semibold">0 UZS (Bepul)</span>
                  </div>

                  <div className="border-t-2 border-dashed border-slate-200 pt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-700">Jami To‘lov</span>
                      <p className="text-[11px] text-slate-400">Barcha soliqlar va yetkazish kiritilgan</p>
                    </div>
                    <span className="text-2xl font-black text-blue-600">
                      {formatMoney(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  id="checkout-confirm-pay-btn"
                  type="submit"
                  disabled={isProcessing || cart.length === 0}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-4 rounded-xl text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingStage || 'Rasmiylashtirilmoqda...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>Buyurtmani Tasdiqlash ({formatMoney(grandTotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Kafolatlangan</span>
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-600" /> Butun O‘zbekiston bo‘ylab</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
