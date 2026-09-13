import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { RestaurantProfile, RestaurantOrder, RestaurantOrderStatus } from '../../types';
import { CafeReceiptModal } from '../../components/cafe/CafeReceiptModal';
import {
  Clock,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Share2,
  ChefHat,
  Volume2,
  VolumeX,
  ExternalLink,
  XCircle,
  Copy,
  FileText,
  Calendar,
  Check,
  RotateCcw,
  Bike,
} from 'lucide-react';

export const RestaurantDashboardView: React.FC = () => {
  const { currentUser, showToast, navigateTo } = useApp();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'new' | 'accepted' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled'
  >('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Receipt modal state
  const [receiptOrder, setReceiptOrder] = useState<RestaurantOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Track previous order count to trigger sound
  const prevOrdersCount = useRef<number>(0);

  // Sound chime for new incoming orders
  const playNewOrderSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Load restaurant profile
  useEffect(() => {
    let isMounted = true;
    async function initRestaurant() {
      if (!currentUser) return;
      setLoading(true);
      try {
        let profile = await firestoreService.getRestaurantByOwner(currentUser.id);
        if (!profile) {
          const userFirstName = currentUser.name?.split(' ')[0] || 'Mening';
          profile = await firestoreService.createCafeForOwner(currentUser.id, {
            name: `${userFirstName}'s Café`,
            phone: currentUser.phone || '',
          });
        }

        if (isMounted && profile) {
          setRestaurant(profile);
        }
      } catch (err) {
        console.error('Restaurant init error', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initRestaurant();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Real-time Firestore subscription to orders
  useEffect(() => {
    if (!restaurant?.id) return;

    const unsub = firestoreService.subscribeRestaurantOrders(restaurant.id, (freshOrders) => {
      if (freshOrders.length > prevOrdersCount.current && prevOrdersCount.current > 0) {
        playNewOrderSound();
        showToast('🔔 Yangi Buyurtma!', 'Café uchun yangi buyurtma kelib tushdi!', 'success');
      }
      prevOrdersCount.current = freshOrders.length;
      setOrders(freshOrders);
    });

    return () => unsub();
  }, [restaurant?.id, soundEnabled, showToast]);

  // Status transition handler (in-app, no telegram chat dependency)
  const handleUpdateStatus = async (order: RestaurantOrder, newStatus: RestaurantOrderStatus) => {
    try {
      await firestoreService.updateRestaurantOrderStatus(order.id, newStatus);
      showToast('Status yangilandi', `Buyurtma statusi o'zgartirildi`, 'success');

      // Update in local state immediately for responsive feedback
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Status yangilanmadi', 'error');
    }
  };

  // Open receipt modal
  const handleOpenReceipt = (order: RestaurantOrder) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  // Stats calculation
  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const acceptedOrdersCount = orders.filter((o) => o.status === 'accepted').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparing').length;
  const onTheWayOrdersCount = orders.filter((o) => o.status === 'on_the_way' || o.status === 'delivering').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'cancelled').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const isMatchingStatus =
      activeFilter === 'all'
        ? true
        : activeFilter === 'on_the_way'
        ? o.status === 'on_the_way' || o.status === 'delivering'
        : o.status === activeFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber.includes(searchQuery) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());

    return isMatchingStatus && matchesSearch;
  });

  const copyPublicRestaurantLink = () => {
    if (!restaurant) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sellnex.uz';
    const link = `${origin}/?restaurantSlug=${restaurant.slug}`;
    navigator.clipboard.writeText(link);
    showToast('Havola nusxalandi', 'Mijozlar uchun Café menyu havolasi nusxalandi!', 'success');
  };

  const openPublicView = () => {
    if (!restaurant) return;
    navigateTo('restaurant', { restaurantSlug: restaurant.slug });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Café buyurtmalari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const statusBadge = (status: RestaurantOrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> Yangi
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Check className="w-3 h-3 text-indigo-600" /> Qabul qilindi
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <ChefHat className="w-3 h-3 text-blue-600" /> Tayyorlanmoqda
          </span>
        );
      case 'on_the_way':
      case 'delivering':
        return (
          <span className="bg-orange-100 text-orange-900 border border-orange-300 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Bike className="w-3 h-3 text-orange-600" /> Yo‘lda
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yetkazildi
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-900 border border-red-300 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" /> Bekor qilindi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="cafe-orders-dashboard-root" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Café Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={restaurant?.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120'}
            alt={restaurant?.name || 'Café'}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {restaurant?.name || 'Mening Cafém'}
              </h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                ☕ Café / Restoran
              </span>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {restaurant?.address || 'Toshkent'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {restaurant?.workingHours || '09:00 - 23:00'}
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Buyurtmalar Sellnex ilovasida
              </span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Ovozli xabarnoma yoqilgan' : 'Ovozli xabarnoma o‘chirilgan'}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Ovoz: Yoqilgan' : 'Ovoz: O‘chiq'}</span>
          </button>

          <button
            onClick={copyPublicRestaurantLink}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Havolani nusxalash</span>
          </button>

          <button
            onClick={openPublicView}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Menyuni ochish</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Yangi</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              🔔
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{newOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Kutilayotgan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Qabul qilingan</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              📋
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600">{acceptedOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Tayyorlashga tayyor</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tayyorlanmoqda</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              🍳
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{preparingOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Oshxonada</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Yo‘lda</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              🛵
            </div>
          </div>
          <p className="text-2xl font-extrabold text-orange-600">{onTheWayOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Kuryer olib bormoqda</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Jami tushum</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              💰
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalRevenue.toLocaleString()} so‘m</p>
          <p className="text-[11px] text-slate-400">{deliveredOrdersCount} ta yetkazilgan</p>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Orders Header & Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>Buyurtmalar</span>
            </h2>
            <p className="text-xs text-slate-500">
              Café buyurtmalari Sellnex orqali to‘liq qabul qilinadi, chek chiqariladi va statuslar boshqariladi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: `Barchasi (${totalOrdersCount})` },
              { key: 'new', label: `Yangi (${newOrdersCount})`, badge: newOrdersCount > 0 },
              { key: 'accepted', label: `Qabul qilindi (${acceptedOrdersCount})` },
              { key: 'preparing', label: `Tayyorlanmoqda (${preparingOrdersCount})` },
              { key: 'on_the_way', label: `Yo‘lda (${onTheWayOrdersCount})` },
              { key: 'delivered', label: `Yetkazildi (${deliveredOrdersCount})` },
              { key: 'cancelled', label: `Bekor qilindi (${cancelledOrdersCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeFilter === tab.key
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } ${tab.badge ? 'ring-2 ring-amber-400 font-bold' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search inside orders */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buyurtma raqami, mijoz ismi yoki telefon raqami bo‘yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Orders Cards List */}
        <div className="p-4 sm:p-5 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Buyurtmalar mavjud emas</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Mijozlar buyurtma berishlari uchun Café havolasini ijtimoiy tarmoqlarda yoki QR kod orqali ulashing.
              </p>
              <button
                onClick={copyPublicRestaurantLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Café havolasini ulashish</span>
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-2xl border transition hover:shadow-sm ${
                    order.status === 'new'
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Order Details Left */}
                    <div className="space-y-3 flex-1">
                      {/* Top row: Order number, Status, Date */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-base font-black text-slate-900 tracking-tight">
                          #{order.orderNumber}
                        </span>
                        {statusBadge(order.status)}
                        <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </span>
                        <span className="text-xs text-slate-400">
                          To‘lov:{' '}
                          <strong className="uppercase text-slate-700">
                            {order.paymentMethod === 'cash' ? '💵 Naqd' : order.paymentMethod?.toUpperCase()}
                          </strong>
                        </span>
                      </div>

                      {/* Items table */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2 text-xs">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                          Buyurtma qilingan mahsulotlar:
                        </p>
                        <div className="space-y-1.5 divide-y divide-slate-100">
                          {order.items.map((item, idx) => {
                            const itemLineTotal = item.totalPrice || item.price * item.quantity;
                            return (
                              <div key={idx} className="pt-1.5 first:pt-0 flex justify-between items-start">
                                <div>
                                  <span className="font-semibold text-slate-900">{item.name}</span>{' '}
                                  <span className="text-amber-800 font-extrabold">× {item.quantity}</span>
                                  <span className="text-slate-400 ml-1.5 text-[11px]">
                                    ({item.price.toLocaleString()} so‘m/dona)
                                  </span>
                                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                                    <div className="text-[11px] text-slate-500 pl-2">
                                      + {item.selectedAddons.map((a) => `${a.name} (${a.price.toLocaleString()} so‘m)`).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <span className="font-bold text-slate-900 shrink-0 pl-2">
                                  {itemLineTotal.toLocaleString()} so‘m
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Calculation Totals */}
                        <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Mahsulotlar jami:</span>
                            <span className="font-medium">{order.subtotal.toLocaleString()} so‘m</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Yetkazib berish narxi:</span>
                            <span className="font-medium">
                              {order.deliveryFee > 0 ? `${order.deliveryFee.toLocaleString()} so‘m` : 'Bepul'}
                            </span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-sm text-slate-950">
                            <span>Umumiy buyurtma summasi:</span>
                            <span className="text-amber-800">{order.totalAmount.toLocaleString()} so‘m</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer info & Delivery Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Mijoz:</span>
                          <span className="font-bold text-slate-900">{order.customerName}</span>
                          <div className="pt-0.5">
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="inline-flex items-center gap-1 font-bold text-amber-800 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[11px]">Yetkazib berish / Yashash manzili:</span>
                          <span className="font-medium text-slate-800 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span>{order.deliveryAddress}</span>
                          </span>
                          {order.deliveryNotes && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              Izoh: {order.deliveryNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Action Buttons & Chek Right */}
                    <div className="flex flex-col gap-2 shrink-0 lg:w-48">
                      {/* Receipt Button */}
                      <button
                        onClick={() => handleOpenReceipt(order)}
                        className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>Chekni ko‘rish / Chop</span>
                      </button>

                      {/* Pipeline transitions: Yangi -> Qabul qilindi -> Tayyorlanmoqda -> Yo‘lda -> Yetkazildi */}
                      {order.status === 'new' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order, 'accepted')}
                            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Qabul qilish</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order, 'cancelled')}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rad etish</span>
                          </button>
                        </>
                      )}

                      {order.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order, 'preparing')}
                            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Tayyorlashni boshlash</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order, 'cancelled')}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold transition"
                          >
                            <span>Bekor qilish</span>
                          </button>
                        </>
                      )}

                      {order.status === 'preparing' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order, 'on_the_way')}
                            className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Yo‘lga chiqarish (Kuryer)</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order, 'cancelled')}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold transition"
                          >
                            <span>Bekor qilish</span>
                          </button>
                        </>
                      )}

                      {(order.status === 'on_the_way' || order.status === 'delivering') && (
                        <button
                          onClick={() => handleUpdateStatus(order, 'delivered')}
                          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Yetkazildi deb belgilash</span>
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <div className="w-full py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Muvaffaqiyatli yakunlandi</span>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="w-full py-2 px-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Bekor qilingan</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chek / Receipt Modal */}
      <CafeReceiptModal
        order={receiptOrder}
        cafeName={restaurant?.name || 'Sellnex Café'}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onToast={showToast}
      />
    </div>
  );
};
