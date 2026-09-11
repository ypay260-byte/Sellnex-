import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { subscriptionService } from '../../services/subscriptionService';
import { MenuItem, RestaurantProfile, RestaurantAddon } from '../../types';
import { SAMPLE_RESTAURANT, SAMPLE_MENU_ITEMS } from '../../data/restaurantInitialData';
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Tag,
  DollarSign,
  Sparkles,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

export const RestaurantMenuView: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add dish modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<MenuItem> | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Fast food');
  const [dishPrice, setDishPrice] = useState<number>(35000);
  const [dishDescription, setDishDescription] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishAddons, setDishAddons] = useState<RestaurantAddon[]>([]);

  // Addon inputs
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState<number>(5000);

  const [saving, setSaving] = useState(false);

  // Load restaurant & menu
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
            slug: `restoran-${currentUser.id.slice(0, 5)}`,
          };
          await firestoreService.saveRestaurant(profile);
        }

        if (isMounted && profile) {
          setRestaurant(profile);
          const items = await firestoreService.getMenuItems(profile.id);
          setMenuItems(items);
        }
      } catch (err) {
        console.error('Failed to load restaurant menu', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Product limit check
  const currentPlan = (currentUser?.plan || 'trial') as any;
  const maxLimit = currentUser?.productLimit || subscriptionService.getPlanConfig(currentPlan)?.limits?.maxProducts || 5;
  const isLimitReached = menuItems.length >= maxLimit;

  // Open modal for new dish
  const handleOpenAdd = () => {
    if (isLimitReached) {
      showToast(
        'Tarif limiti to‘ldi',
        `Sizning ${currentPlan.toUpperCase()} tarifingizda limit ${maxLimit} ta taom. Yangi taom qo‘shish uchun tarifni oshiring.`,
        'warning'
      );
      return;
    }
    setEditingDish(null);
    setDishName('');
    setDishCategory('Fast food');
    setDishPrice(35000);
    setDishDescription('');
    setDishImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500');
    setDishAvailable(true);
    setDishAddons([]);
    setIsModalOpen(true);
  };

  // Open modal for editing dish
  const handleOpenEdit = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishCategory(dish.category || 'Fast food');
    setDishPrice(dish.price);
    setDishDescription(dish.description || '');
    setDishImage(dish.image || '');
    setDishAvailable(dish.isAvailable);
    setDishAddons(dish.addons || []);
    setIsModalOpen(true);
  };

  // Add addon to dish
  const handleAddAddon = () => {
    if (!newAddonName.trim()) return;
    const addon: RestaurantAddon = {
      id: `addon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newAddonName.trim(),
      price: Number(newAddonPrice) || 0,
    };
    setDishAddons([...dishAddons, addon]);
    setNewAddonName('');
    setNewAddonPrice(5000);
  };

  const handleRemoveAddon = (addonId: string) => {
    setDishAddons(dishAddons.filter((a) => a.id !== addonId));
  };

  // Save dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) {
      showToast('Nomi kiritilmadi', 'Taom nomini kiriting', 'warning');
      return;
    }
    if (!restaurant) return;

    setSaving(true);
    try {
      const payload: MenuItem = {
        id: editingDish?.id || '',
        restaurantId: restaurant.id,
        ownerId: currentUser?.id,
        name: dishName.trim(),
        description: dishDescription.trim(),
        price: Number(dishPrice) || 0,
        category: dishCategory.trim(),
        image: dishImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        isAvailable: dishAvailable,
        addons: dishAddons,
      };

      const saved = await firestoreService.saveMenuItem(payload);
      setMenuItems((prev) => {
        const idx = prev.findIndex((i) => i.id === saved.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });

      showToast('Muvaffaqiyatli saqlandi', `${dishName} menyuga kiritildi`, 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Saqlab bo‘lmadi', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete dish
  const handleDeleteDish = async (id: string, name: string) => {
    if (!confirm(`"${name}" taomini rostdan ham menyudan o‘chirmoqchimisiz?`)) return;
    try {
      await firestoreService.deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      showToast('O‘chirildi', `"${name}" taomi o‘chirildi`, 'info');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'O‘chirib bo‘lmadi', 'error');
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (dish: MenuItem) => {
    try {
      const updated = { ...dish, isAvailable: !dish.isAvailable };
      await firestoreService.saveMenuItem(updated);
      setMenuItems((prev) => prev.map((i) => (i.id === dish.id ? updated : i)));
      showToast('Holat yangilandi', updated.isAvailable ? 'Taom sotuvda mavjud' : 'Taom tugadi deb belgilandi', 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean)))];

  const filteredItems = menuItems.filter((dish) => {
    const matchesCategory = activeCategory === 'all' || dish.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Menyu yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="restaurant-menu-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Restoran Menyusi</h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {menuItems.length} / {maxLimit} taom
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kategoriyalar, taomlar, narxlar va qo‘shimcha masalliqlar (add-ons) boshqaruvi.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={isLimitReached}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Taom Qo‘shish</span>
        </button>
      </div>

      {/* Limit Alert if Reached */}
      {isLimitReached && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Tarif limiti to‘lgan (<strong>{menuItems.length}/{maxLimit} taom</strong>). Yangi taom qo‘shish uchun tarifingizni yangilang.
            </span>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Menyudan taom nomini qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Barchasi' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                <img
                  src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {dish.category}
                </span>

                <button
                  onClick={() => handleToggleAvailability(dish)}
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs transition ${
                    dish.isAvailable
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {dish.isAvailable ? 'Sotuvda mavjud' : 'Tugagan'}
                </button>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{dish.name}</h3>
                  <span className="font-extrabold text-slate-900 text-sm whitespace-nowrap">
                    {dish.price.toLocaleString()} so‘m
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{dish.description}</p>

                {dish.addons && dish.addons.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">Qo‘shimchalar ({dish.addons.length}):</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dish.addons.map((a) => (
                        <span
                          key={a.id}
                          className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          +{a.name} ({a.price.toLocaleString()})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEdit(dish)}
                className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Tahrirlash</span>
              </button>
              <button
                onClick={() => handleDeleteDish(dish.id, dish.name)}
                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition"
                title="O‘chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingDish ? 'Taomni Tahrirlash' : 'Yangi Taom Qo‘shish'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Taom nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Double Burger"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategoriya *</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    <option value="Fast food">Fast food</option>
                    <option value="Taomlar">Taomlar (Milliy)</option>
                    <option value="Ichimliklar">Ichimliklar</option>
                    <option value="Salatlar">Salatlar</option>
                    <option value="Desert">Desert</option>
                    <option value="Souslar">Souslar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Narxi (so‘m) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  placeholder="Tarkibi, masalliqlar, porsiya haqida ma'lumot..."
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rasm havolasi (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={dishImage}
                  onChange={(e) => setDishImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Addons Manager */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Qo‘shimcha masalliqlar (Add-ons)
                </label>

                {/* Add new addon inputs */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Qo‘shimcha nomi (masalan: Pishloq)"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="number"
                    placeholder="Narxi"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition"
                  >
                    + Qo‘shish
                  </button>
                </div>

                {/* Addons List */}
                <div className="space-y-1.5 pt-1">
                  {dishAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-medium text-slate-800">{addon.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-700">+{addon.price.toLocaleString()} so‘m</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAddon(addon.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dishAvailableCheckbox"
                  checked={dishAvailable}
                  onChange={(e) => setDishAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <label htmlFor="dishAvailableCheckbox" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Taom sotuvda mavjud (buyurtma qabul qilish mumkin)
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Saqlanmoqda...' : 'Menyuga Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
