import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { telegramService } from '../../services/telegramService';
import { RestaurantProfile, RestaurantOrder, RestaurantOrderStatus, MenuItem } from '../../types';
import { SAMPLE_RESTAURANT, SAMPLE_MENU_ITEMS } from '../../data/restaurantInitialData';
import {
  Utensils,
  Clock,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Plus,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  Share2,
  ChefHat,
  Volume2,
  VolumeX,
  RefreshCw,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Package,
  Send,
  XCircle,
  Eye,
  Copy,
} from 'lucide-react';

export const RestaurantDashboardView: React.FC = () => {
  const { currentUser, showToast, navigateTo } = useApp();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'preparing' | 'delivering' | 'delivered'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<RestaurantOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Previous order count tracker to trigger audio notification
  const prevOrdersCount = useRef<number>(0);

  // Play audio chime on new orders
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

  // Load restaurant profile & menu
  useEffect(() => {
    let isMounted = true;
    async function initRestaurant() {
      if (!currentUser) return;
      setLoading(true);
      try {
        let profile = await firestoreService.getRestaurantByOwner(currentUser.id);
        if (!profile) {
          // If none exists, auto-provision user's restaurant profile
          const userFirstName = currentUser.name?.split(' ')[0] || 'My';
          const defaultSlug = `${userFirstName.toLowerCase().replace(/[^a-z0-9]/g, '')}-kafe`;
          profile = {
            ...SAMPLE_RESTAURANT,
            id: `rest_${currentUser.id}`,
            ownerId: currentUser.id,
            name: `${userFirstName}'s Restoran`,
            slug: defaultSlug,
            phone: currentUser.phone || '+998 90 123 45 67',
          };
          await firestoreService.saveRestaurant(profile);

          // Seed default sample menu items
          await Promise.all(
            SAMPLE_MENU_ITEMS.map((sample) =>
              firestoreService.saveMenuItem({
                ...sample,
                id: `dish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                restaurantId: profile!.id,
                ownerId: currentUser.id,
              } as MenuItem)
            )
          );
        }

        if (isMounted && profile) {
          setRestaurant(profile);
          const dishes = await firestoreService.getMenuItems(profile.id);
          setMenuItems(dishes);
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
      // Check if new orders came in
      const newOrders = freshOrders.filter((o) => o.status === 'new');
      if (freshOrders.length > prevOrdersCount.current && prevOrdersCount.current > 0) {
        playNewOrderSound();
        showToast('🔔 Yangi Buyurtma!', `Yangi buyurtma kelib tushdi!`, 'success');
      }
      prevOrdersCount.current = freshOrders.length;
      setOrders(freshOrders);
    });

    return () => unsub();
  }, [restaurant?.id, soundEnabled, showToast]);

  // Status changer with Telegram bot synchronization
  const handleUpdateStatus = async (order: RestaurantOrder, newStatus: RestaurantOrderStatus) => {
    try {
      await firestoreService.updateRestaurantOrderStatus(order.id, newStatus);

      // Instantly notify restaurant Telegram chat about the status change
      if (restaurant) {
        telegramService.sendRestaurantStatusUpdate(order, restaurant, newStatus).catch(() => {});
      }

      showToast('Status yangilandi', `Buyurtma statusi o‘zgartirildi`, 'success');
      if (selectedOrderDetails?.id === order.id) {
        setSelectedOrderDetails({ ...order, status: newStatus });
      }
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Status yangilanmadi', 'error');
    }
  };

  // Stats calculation
  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparing').length;
  const deliveringOrdersCount = orders.filter((o) => o.status === 'delivering').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber.includes(searchQuery) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const copyPublicRestaurantLink = () => {
    if (!restaurant) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sellnex.uz';
    const link = `${origin}/?restaurantSlug=${restaurant.slug}`;
    navigator.clipboard.writeText(link);
    showToast('Havola nusxalandi', 'Mijozlar uchun restoran havolasi nusxalandi!', 'success');
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
          <p className="text-sm font-semibold text-slate-600">Restoran ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="restaurant-dashboard-root" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Restaurant Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={restaurant?.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120'}
            alt={restaurant?.name || 'Restaurant'}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {restaurant?.name || 'Mening Restoranim'}
              </h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                🍽️ Restoran Mode
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
              <span className="font-semibold text-emerald-600">
                {restaurant?.telegramChatId ? '✅ Telegram ulangan' : '⚠️ Telegram ulanmagan'}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Yangi buyurtmalar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              🔔
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{newOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Tezkor qabul qilish talab etiladi</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tayyorlanmoqda</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              🍳
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{preparingOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Oshxonada pishirilmoqda</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kuryer yo‘lda</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              🚚
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-orange-600">{deliveringOrdersCount}</p>
          <p className="text-[11px] text-slate-400">Yetkazib berilmoqda</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Jami tushum</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              💰
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{totalRevenue.toLocaleString()} so‘m</p>
          <p className="text-[11px] text-slate-400">{deliveredOrdersCount} ta yetkazilgan buyurtma</p>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Orders Header & Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Jonli Buyurtmalar oqimi</h2>
            <p className="text-xs text-slate-500">
              Mijozlar buyurtma berishi bilan bu yerda real vaqtda paydo bo‘ladi va Telegramga xabar boradi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: `Barchasi (${totalOrdersCount})` },
              { key: 'new', label: `Yangi (${newOrdersCount})`, badge: newOrdersCount > 0 },
              { key: 'preparing', label: `Tayyorlanmoqda (${preparingOrdersCount})` },
              { key: 'delivering', label: `Yetkazilmoqda (${deliveringOrdersCount})` },
              { key: 'delivered', label: `Yetkazildi (${deliveredOrdersCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeFilter === tab.key
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } ${tab.badge ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
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
        <div className="p-4 sm:p-5 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Buyurtmalar mavjud emas</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Mijozlar buyurtma berishlari uchun restoran havolasini Telegram kanalingiz yoki ijtimoiy tarmoqlarda ulashing.
              </p>
              <button
                onClick={copyPublicRestaurantLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Restoran havolasini ulashish</span>
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusColors: Record<RestaurantOrderStatus, string> = {
                new: 'bg-amber-100 text-amber-900 border-amber-300',
                preparing: 'bg-blue-100 text-blue-900 border-blue-300',
                delivering: 'bg-orange-100 text-orange-900 border-orange-300',
                delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                cancelled: 'bg-red-100 text-red-900 border-red-300',
              };

              const statusLabels: Record<RestaurantOrderStatus, string> = {
                new: '🟡 Yangi buyurtma',
                preparing: '🔵 Tayyorlanmoqda',
                delivering: '🟠 Yetkazilmoqda',
                delivered: '🟢 Yetkazildi',
                cancelled: '🔴 Bekor qilindi',
              };

              return (
                <div
                  key={order.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition hover:shadow-md ${
                    order.status === 'new'
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Details Left */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-slate-900">#{order.orderNumber}</span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between font-medium text-slate-800">
                            <span>
                              {item.name} <strong className="text-amber-700">x{item.quantity}</strong>
                              {item.selectedAddons && item.selectedAddons.length > 0 && (
                                <span className="text-[10px] text-slate-500 block">
                                  + {item.selectedAddons.map((a) => a.name).join(', ')}
                                </span>
                              )}
                            </span>
                            <span className="font-bold text-slate-900">{item.totalPrice.toLocaleString()} so‘m</span>
                          </div>
                        ))}
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-xs text-slate-900">
                          <span>
                            Yetkazib berish:{' '}
                            <span className="text-slate-500 font-normal">
                              {order.deliveryFee > 0 ? `${order.deliveryFee.toLocaleString()} so‘m` : 'Bepul'}
                            </span>
                          </span>
                          <span className="text-sm font-extrabold text-amber-800">
                            Jami: {order.totalAmount.toLocaleString()} so‘m
                          </span>
                        </div>
                      </div>

                      {/* Customer info & Address */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <span>
                          👤 <strong>{order.customerName}</strong>
                        </span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center gap-1 font-bold text-amber-700 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {order.deliveryAddress}
                        </span>
                      </div>
                    </div>

                    {/* Order Status Action Buttons Right */}
                    <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                      {order.status === 'new' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order, 'preparing')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Qabul qilish / Tayyorlash</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order, 'cancelled')}
                            className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold transition"
                          >
                            Rad etish
                          </button>
                        </>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order, 'delivering')}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kuryerga berish</span>
                        </button>
                      )}

                      {order.status === 'delivering' && (
                        <button
                          onClick={() => handleUpdateStatus(order, 'delivered')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Yetkazildi deb belgilash</span>
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 py-1">
                          <CheckCircle2 className="w-4 h-4" /> Muvaffaqiyatli yakunlandi
                        </span>
                      )}

                      {order.status === 'cancelled' && (
                        <span className="text-xs font-bold text-red-600 inline-flex items-center gap-1 py-1">
                          <XCircle className="w-4 h-4" /> Bekor qilingan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
