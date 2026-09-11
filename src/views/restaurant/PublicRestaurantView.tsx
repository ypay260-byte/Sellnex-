import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { telegramService } from '../../services/telegramService';
import { RestaurantProfile, MenuItem, RestaurantAddon, RestaurantOrder, RestaurantOrderItem } from '../../types';
import { SAMPLE_RESTAURANT, SAMPLE_MENU_ITEMS } from '../../data/restaurantInitialData';
import {
  Utensils,
  Clock,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  ChevronRight,
  Share2,
  ChefHat,
  ArrowLeft,
  DollarSign,
  Copy,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartItem extends RestaurantOrderItem {
  itemKey: string;
}

export const PublicRestaurantView: React.FC = () => {
  const { routeParams, navigateTo, showToast } = useApp();
  const slugParam = routeParams?.restaurantSlug || routeParams?.slug || routeParams?.restaurant || 'osh-markazi';

  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Addon selection modal
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<RestaurantAddon[]>([]);
  const [dishQuantity, setDishQuantity] = useState(1);

  // Checkout form
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'click' | 'payme'>('cash');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order placed confirmation
  const [placedOrder, setPlacedOrder] = useState<RestaurantOrder | null>(null);

  // Load restaurant & menu
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        let profile = await firestoreService.getRestaurantBySlug(slugParam);
        if (!profile) {
          profile = await firestoreService.getRestaurantById(slugParam);
        }

        if (!profile) {
          // If not found, check if there's any restaurant or fallback to sample
          const all = await firestoreService.getAllRestaurants();
          if (all.length > 0) {
            profile = all[0];
          } else {
            profile = { ...SAMPLE_RESTAURANT, slug: slugParam };
            try {
              await firestoreService.saveRestaurant(profile);
            } catch {}
          }
        }

        if (isMounted && profile) {
          setRestaurant(profile);
          let items = await firestoreService.getMenuItems(profile.id);
          if (items.length === 0) {
            // Seed sample menu items for instant rich view
            const seeded = await Promise.all(
              SAMPLE_MENU_ITEMS.map((sample) =>
                firestoreService.saveMenuItem({
                  ...sample,
                  id: `dish_${Math.random().toString(36).slice(2, 8)}`,
                  restaurantId: profile!.id,
                } as MenuItem)
              )
            );
            items = seeded;
          }
          setMenuItems(items);
        }
      } catch (err) {
        console.error('Failed to load restaurant data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slugParam]);

  // Subscribe to live status of placed order if active
  useEffect(() => {
    if (!placedOrder?.id || !restaurant?.id) return;
    const unsub = firestoreService.subscribeRestaurantOrders(restaurant.id, (orders) => {
      const found = orders.find((o) => o.id === placedOrder.id);
      if (found && found.status !== placedOrder.status) {
        setPlacedOrder(found);
        showToast('Buyurtma holati yangilandi', `Yangi status: ${found.status}`, 'info');
      }
    });
    return () => unsub();
  }, [placedOrder?.id, restaurant?.id, showToast]);

  // Categories extraction
  const categories = ['all', ...Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)))];

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open dish selection
  const handleOpenDishModal = (dish: MenuItem) => {
    if (!dish.isAvailable) {
      showToast('Mavjud emas', 'Bu taom hozirda tugagan.', 'warning');
      return;
    }
    setSelectedDish(dish);
    setSelectedAddons([]);
    setDishQuantity(1);
  };

  const handleAddonToggle = (addon: RestaurantAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!selectedDish) return;
    const addonsSum = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = selectedDish.price + addonsSum;
    const totalPrice = unitPrice * dishQuantity;

    const sortedAddonIds = [...selectedAddons].map((a) => a.id).sort().join('-');
    const itemKey = `${selectedDish.id}_${sortedAddonIds}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.itemKey === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + dishQuantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            itemKey,
            menuItemId: selectedDish.id,
            name: selectedDish.name,
            price: selectedDish.price,
            quantity: dishQuantity,
            selectedAddons: selectedAddons,
            totalPrice,
          },
        ];
      }
    });

    showToast('Savatga qo\'shildi', `${selectedDish.name} savatga kiritildi`, 'success');
    setSelectedDish(null);
  };

  const updateCartItemQuantity = (itemKey: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.itemKey === itemKey) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const addonsSum = (item.selectedAddons || []).reduce((s, a) => s + a.price, 0);
            const unitPrice = item.price + addonsSum;
            return {
              ...item,
              quantity: newQty,
              totalPrice: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const cartGrandTotal = cartSubtotal + (cartSubtotal > 0 ? deliveryFee : 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Ism kiritilmadi', 'Iltimos, ismingizni kiriting', 'warning');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 9) {
      showToast('Telefon raqam xato', 'Iltimos, to\'liq telefon raqamingizni kiriting', 'warning');
      return;
    }
    if (!deliveryAddress.trim()) {
      showToast('Manzil kiritilmadi', 'Iltimos, yetkazib berish manzilini kiriting', 'warning');
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderPayload: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'> = {
        restaurantId: restaurant!.id,
        ownerId: restaurant!.ownerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        items: cart.map(({ itemKey, ...rest }) => rest),
        subtotal: cartSubtotal,
        deliveryFee: deliveryFee,
        totalAmount: cartGrandTotal,
        status: 'new',
        paymentMethod: paymentMethod,
      };

      const createdOrder = await firestoreService.createRestaurantOrder(orderPayload);

      // Auto-trigger Telegram notification to restaurant chat
      try {
        await telegramService.sendRestaurantOrderAlert(createdOrder, restaurant!);
      } catch (tgErr) {
        console.warn('Telegram notification could not be delivered:', tgErr);
      }

      // Celebrate
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setPlacedOrder(createdOrder);
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      showToast('Buyurtma qabul qilindi!', `Buyurtma raqami: #${createdOrder.orderNumber}`, 'success');
    } catch (err: any) {
      console.error('Order submission error:', err);
      showToast('Xatolik yuz berdi', err.message || 'Buyurtma yuborilmadi', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const copyRestaurantLink = () => {
    const link = typeof window !== 'undefined' ? window.location.href : `https://sellnex.uz/restaurant/${restaurant?.slug}`;
    navigator.clipboard.writeText(link);
    showToast('Nusxalandi', 'Restoran havolasi nusxalandi!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Restoran menyusi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Restoran topilmadi</h2>
          <p className="text-sm text-slate-500">
            Qidirilayotgan <code>{slugParam}</code> havolali restoran mavjud emas yoki nomi o'zgartirilgan.
          </p>
          <button
            onClick={() => navigateTo('landing')}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition"
          >
            Sellnex Bosh Sahifasiga Qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="restaurant-public-page" className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      {/* Restaurant Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={restaurant.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'}
              alt={restaurant.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 leading-tight">{restaurant.name}</h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  RESTORAN
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{restaurant.workingHours || '09:00 - 23:00'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-medium">Ochiq</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyRestaurantLink}
              title="Havolani nusxalash"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={`tel:${restaurant.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{restaurant.phone}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Restaurant Hero Card */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{restaurant.name}</h2>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{restaurant.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {restaurant.address}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  Yetkazib berish:{' '}
                  <strong className="text-amber-700 font-bold">
                    {restaurant.deliveryFee > 0 ? `${restaurant.deliveryFee.toLocaleString()} so‘m` : 'Bepul'}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Taom yoki ichimlik nomi bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition capitalize ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Barchasi' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-semibold text-slate-700">Hech narsa topilmadi</p>
            <p className="text-xs text-slate-400">Qidiruv so'rovingizni o'zgartirib ko'ring yoki boshqa kategoriyani tanlang.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((dish) => {
              const inCartItem = cart.find((i) => i.menuItemId === dish.id);
              const hasAddons = dish.addons && dish.addons.length > 0;

              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                      {dish.category}
                    </span>
                    {!dish.isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Mavjud emas
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">{dish.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{dish.description}</p>
                      {hasAddons && (
                        <p className="text-[11px] text-amber-700 font-medium">
                          ✨ +{dish.addons!.length} ta qo'shimcha tanlash mumkin
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Narxi</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {dish.price.toLocaleString()} <span className="text-xs font-semibold text-slate-500">so‘m</span>
                        </span>
                      </div>

                      {dish.isAvailable && (
                        <button
                          onClick={() => handleOpenDishModal(dish)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Qo‘shish</span>
                          {inCartItem && (
                            <span className="w-5 h-5 bg-white text-amber-700 rounded-full flex items-center justify-center text-[10px] font-extrabold ml-0.5">
                              {inCartItem.quantity}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Bar (Sticky Bottom) */}
      {cartItemsCount > 0 && !isCartOpen && !isCheckoutOpen && !placedOrder && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between hover:bg-black transition active:scale-98 border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold text-sm">
                {cartItemsCount}
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">Savatda {cartItemsCount} ta taom</p>
                <p className="text-sm font-extrabold text-white">
                  {cartGrandTotal.toLocaleString()} so‘m
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 pr-1">
              Buyurtma berish <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* Dish Addon & Customization Modal */}
      {selectedDish && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="relative aspect-16/9 bg-slate-100">
              <img
                src={selectedDish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {selectedDish.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedDish.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedDish.description}</p>
                <p className="text-base font-extrabold text-slate-900 mt-2">
                  {selectedDish.price.toLocaleString()} so‘m
                </p>
              </div>

              {/* Addons List */}
              {selectedDish.addons && selectedDish.addons.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Qo‘shimcha masalliqlar (Add-ons)
                  </p>
                  <div className="space-y-2">
                    {selectedDish.addons.map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                            />
                            <span className="text-sm font-medium text-slate-800">{addon.name}</span>
                          </div>
                          <span className="text-xs font-bold text-amber-700">
                            +{addon.price.toLocaleString()} so‘m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-700">Miqdori:</span>
                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setDishQuantity(Math.max(1, dishQuantity - 1))}
                    disabled={dishQuantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm w-5 text-center">{dishQuantity}</span>
                  <button
                    onClick={() => setDishQuantity(dishQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={handleConfirmAddToCart}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-between px-4"
              >
                <span>Savatga qo‘shish</span>
                <span>
                  {((selectedDish.price + selectedAddons.reduce((s, a) => s + a.price, 0)) * dishQuantity).toLocaleString()}{' '}
                  so‘m
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left">
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Sizning savatingiz</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItemsCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">Savatingiz hozircha bo'sh</p>
                  <p className="text-xs text-slate-400">Menyudan yoqqan taomlarni tanlab qo'shing.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.itemKey} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                        <p className="text-xs text-slate-500">
                          {item.price.toLocaleString()} so‘m
                        </p>
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="text-[11px] text-amber-700 font-medium mt-1">
                            + {item.selectedAddons.map((a) => `${a.name} (${a.price.toLocaleString()})`).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-sm text-slate-900">
                        {item.totalPrice.toLocaleString()} so‘m
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => updateCartItemQuantity(item.itemKey, -item.quantity)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium"
                      >
                        O‘chirish
                      </button>

                      <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateCartItemQuantity(item.itemKey, -1)}
                          className="text-slate-500 hover:text-slate-800 p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.itemKey, 1)}
                          className="text-slate-500 hover:text-slate-800 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Taomlar summasi:</span>
                    <span className="font-semibold text-slate-800">{cartSubtotal.toLocaleString()} so‘m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yetkazib berish narxi:</span>
                    <span className="font-semibold text-slate-800">
                      {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} so‘m` : 'Bepul'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Jami to‘lov:</span>
                    <span className="text-amber-700">{cartGrandTotal.toLocaleString()} so‘m</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Rasmiylashtirishga o‘tish</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Buyurtmani rasmiylashtirish</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ismingiz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Ali"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefon raqamingiz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Yetkazib berish manzili <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toshkent sh., Chilonzor 9-mavze, 12-uy, 45-xonadon"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Izoh yoki mo'ljal (ixtiyoriy)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Domofon kodi, qavat yoki qo'shimcha istaklaringiz..."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">To‘lov usuli</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', label: '💵 Naqd' },
                      { id: 'click', label: '🔵 Click' },
                      { id: 'payme', label: '🟢 Payme' },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          paymentMethod === pm.id
                            ? 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 space-y-1 text-xs text-amber-950">
                  <div className="flex justify-between">
                    <span>Taomlar ({cartItemsCount} ta):</span>
                    <span>{cartSubtotal.toLocaleString()} so‘m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yetkazib berish:</span>
                    <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} so‘m` : 'Bepul'}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-amber-200">
                    <span>Jami to‘lov:</span>
                    <span className="text-amber-800">{cartGrandTotal.toLocaleString()} so‘m</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <span>Buyurtma yuborilmoqda...</span>
                  ) : (
                    <>
                      <span>Buyurtmani tasdiqlash</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Placed Success View & Live Tracker */}
      {placedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">
                Buyurtma qabul qilindi
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">№{placedOrder.orderNumber}</h3>
              <p className="text-xs text-slate-500">
                Buyurtmangiz restoran botiga yetkazildi va oshxonaga topshirildi!
              </p>
            </div>

            {/* Status Tracker Pipeline */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jonli Status:</p>
              <div className="space-y-2 text-xs">
                {[
                  { key: 'new', label: '1. Qabul qilinishi kutilmoqda', color: 'text-amber-600' },
                  { key: 'preparing', label: '2. Qabul qilindi / Tayyorlanmoqda', color: 'text-blue-600' },
                  { key: 'delivering', label: '3. Kuryer yetkazib bermoqda', color: 'text-orange-600' },
                  { key: 'delivered', label: '4. Muvaffaqiyatli yetkazildi', color: 'text-emerald-600' },
                ].map((st, idx) => {
                  const currentIdx = ['new', 'preparing', 'delivering', 'delivered'].indexOf(placedOrder.status);
                  const isCurrent = placedOrder.status === st.key;
                  const isDone = currentIdx > idx;

                  return (
                    <div
                      key={st.key}
                      className={`flex items-center gap-2 p-1.5 rounded-lg ${
                        isCurrent
                          ? 'bg-amber-100/70 font-bold text-amber-900'
                          : isDone
                          ? 'text-slate-400 line-through'
                          : 'text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-sm">{isDone ? '✅' : isCurrent ? '⏳' : '⚪'}</span>
                      <span>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary details */}
            <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
              <p>
                <strong>Mijoz:</strong> {placedOrder.customerName} (<code>{placedOrder.customerPhone}</code>)
              </p>
              <p>
                <strong>Manzil:</strong> {placedOrder.deliveryAddress}
              </p>
              <p>
                <strong>Jami summa:</strong>{' '}
                <strong className="text-slate-900">{placedOrder.totalAmount.toLocaleString()} so‘m</strong>
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`tel:${restaurant.phone}`}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>Restoranga qo‘ng‘iroq</span>
              </a>
              <button
                onClick={() => setPlacedOrder(null)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition"
              >
                Yangi buyurtma berish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
