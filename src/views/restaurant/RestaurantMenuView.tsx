import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { subscriptionService } from '../../services/subscriptionService';
import { MenuItem, RestaurantProfile, RestaurantAddon, CafeCategory } from '../../types';
import { DEFAULT_CAFE_CATEGORIES } from '../../data/cafeInitialCategories';
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
  UploadCloud,
  Layers,
  FolderPlus,
  SlidersHorizontal,
  Package,
  Info,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const RestaurantMenuView: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CafeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Category manager modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍽️');
  const [editingCategory, setEditingCategory] = useState<CafeCategory | null>(null);

  // Edit / Add dish modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<MenuItem> | null>(null);
  const targetProductIdRef = useRef<string>('');

  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(35000);
  const [dishDiscountPrice, setDishDiscountPrice] = useState<number | undefined>(undefined);
  const [dishDescription, setDishDescription] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishStockQuantity, setDishStockQuantity] = useState<number | undefined>(undefined);
  const [dishExtraInfo, setDishExtraInfo] = useState('');
  const [dishAddons, setDishAddons] = useState<RestaurantAddon[]>([]);

  // Addon inputs
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState<number>(5000);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const [saving, setSaving] = useState(false);

  // Load restaurant, categories & menu with instant cache support
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!currentUser?.id) return;
      // If we already have items in memory, keep view smooth without full page freeze
      if (menuItems.length === 0 && categories.length === 0) {
        setLoading(true);
      }
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

          // 1. Load Categories
          let cats = await firestoreService.getCafeCategories(profile.id);
          if (cats.length === 0) {
            const seededCats: CafeCategory[] = await Promise.all(
              DEFAULT_CAFE_CATEGORIES.map((def, idx) =>
                firestoreService.saveCafeCategory({
                  id: `cat_${Date.now()}_${idx}`,
                  restaurantId: profile!.id,
                  name: def.name,
                  icon: def.icon,
                  orderIndex: idx,
                })
              )
            );
            cats = seededCats;
          }
          if (isMounted) setCategories(cats);

          // 2. Load Menu Items
          const items = await firestoreService.getMenuItems(profile.id);
          if (isMounted) setMenuItems(items);
        }
      } catch (err) {
        console.error('Failed to load cafe menu', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Product limit check
  const currentPlan = (currentUser?.plan || 'trial') as any;
  const maxLimit =
    currentUser?.productLimit || subscriptionService.getPlanConfig(currentPlan)?.limits?.maxProducts || 5;
  const isLimitReached = menuItems.length >= maxLimit;

  // Open modal for new dish
  const handleOpenAdd = () => {
    if (isLimitReached) {
      showToast(
        'Tarif limiti to‘ldi',
        `Sizning ${currentPlan.toUpperCase()} tarifingizda limit ${maxLimit} ta mahsulot. Yangi mahsulot qo‘shish uchun tarifni oshiring.`,
        'warning'
      );
      return;
    }
    const newId = `dish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    targetProductIdRef.current = newId;
    selectedFileRef.current = null;
    setEditingDish(null);
    setDishName('');
    const defaultCat = categories.length > 0 ? categories[0].name : 'Fast Food';
    setDishCategory(defaultCat);
    setDishPrice(35000);
    setDishDiscountPrice(undefined);
    setDishDescription('');
    setDishImage('');
    setImagePreview('');
    setImageUploadError(null);
    setDishAvailable(true);
    setDishStockQuantity(undefined);
    setDishExtraInfo('');
    setDishAddons([]);
    setIsModalOpen(true);
  };

  // Open modal for editing dish
  const handleOpenEdit = (dish: MenuItem) => {
    targetProductIdRef.current = dish.id;
    selectedFileRef.current = null;
    setEditingDish(dish);
    setDishName(dish.name);
    setDishCategory(dish.category || (categories[0]?.name ?? 'Boshqalar'));
    setDishPrice(dish.price);
    setDishDiscountPrice(dish.discountPrice);
    setDishDescription(dish.description || '');
    setDishImage(dish.image || '');
    setImagePreview(dish.image || '');
    setImageUploadError(null);
    setDishAvailable(dish.isAvailable);
    setDishStockQuantity(dish.stockQuantity);
    setDishExtraInfo(dish.extraInfo || '');
    setDishAddons(dish.addons || []);
    setIsModalOpen(true);
  };

  // Dedicated Product Image Handler with Instant Preview & Multi-Tenant Storage
  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Format validation: JPG, JPEG, PNG, WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileType = (file.type || '').toLowerCase();
    if (fileType && !allowedTypes.includes(fileType)) {
      showToast(
        'Format noto‘g‘ri',
        'Faqat JPG, JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi',
        'warning'
      );
      return;
    }

    // 2. Size limit check (< 15MB)
    if (file.size > 15 * 1024 * 1024) {
      showToast('Fayl hajmi katta', 'Iltimos, 15 MB dan kichikroq rasm tanlang', 'warning');
      return;
    }

    selectedFileRef.current = file;

    // 3. Instant local preview for immediate visual feedback
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImageUploadError(null);

    const targetCafeId = restaurant?.id || currentUser?.id;
    const targetProductId = targetProductIdRef.current || `dish_${Date.now()}`;

    if (!targetCafeId) {
      showToast('Xatolik', 'Café identifikatori topilmadi', 'error');
      return;
    }

    // 4. Background upload to isolated path: cafes/{cafeId}/products/{productId}/image_{timestamp}.{ext}
    setUploadingImage(true);
    try {
      const downloadUrl = await firestoreService.uploadCafeProductImage(
        targetCafeId,
        targetProductId,
        file,
        file.name
      );
      setDishImage(downloadUrl);
      showToast('Rasm yuklandi', 'Mahsulot rasmi saqlandi', 'success');
    } catch (err: any) {
      console.error('Product image upload error:', err);
      const errMsg = err?.message || 'Rasmni yuklab bo‘lmadi';
      setImageUploadError(errMsg);
      showToast('Rasm yuklanmadi', errMsg, 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRetryImageUpload = () => {
    if (selectedFileRef.current && fileInputRef.current) {
      const fakeEvent = {
        target: { files: [selectedFileRef.current] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleGalleryFileSelect(fakeEvent);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Category creation / update
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !restaurant) return;

    try {
      if (editingCategory) {
        const updated = await firestoreService.saveCafeCategory({
          ...editingCategory,
          name: newCatName.trim(),
          icon: newCatIcon.trim() || '🍽️',
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast('Kategoriya yangilandi', `"${newCatName}" kategoriyasi o‘zgartirildi`, 'success');
        setEditingCategory(null);
      } else {
        const newCat = await firestoreService.saveCafeCategory({
          id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          restaurantId: restaurant.id,
          name: newCatName.trim(),
          icon: newCatIcon.trim() || '🍽️',
          orderIndex: categories.length,
        });
        setCategories((prev) => [...prev, newCat]);
        showToast('Yangi kategoriya', `"${newCatName}" kategoriyasi qo‘shildi`, 'success');
      }
      setNewCatName('');
      setNewCatIcon('🍽️');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Kategoriyani saqlab bo‘lmadi', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`"${catName}" kategoriyasini o‘chirmoqchimisiz?`)) return;
    try {
      await firestoreService.deleteCafeCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (activeCategory === catName) setActiveCategory('all');
      showToast('O‘chirildi', `"${catName}" kategoriyasi o‘chirildi`, 'info');
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
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
    if (uploadingImage) {
      showToast('Kuting', 'Rasm yuklanishi tugashini kuting...', 'warning');
      return;
    }
    if (saving) return;

    if (!dishName.trim()) {
      showToast('Nomi kiritilmadi', 'Mahsulot nomini kiriting', 'warning');
      return;
    }
    if (!restaurant) return;

    setSaving(true);
    try {
      const finalImage =
        dishImage.trim() ||
        (imagePreview.startsWith('http') ? imagePreview : '') ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';

      const payload: MenuItem = {
        id: editingDish?.id || targetProductIdRef.current || `dish_${Date.now()}`,
        restaurantId: restaurant.id,
        ownerId: currentUser?.id,
        name: dishName.trim(),
        description: dishDescription.trim(),
        price: Number(dishPrice) || 0,
        discountPrice: dishDiscountPrice ? Number(dishDiscountPrice) : undefined,
        category: dishCategory.trim() || (categories[0]?.name ?? 'Boshqalar'),
        image: finalImage,
        isAvailable: dishAvailable,
        stockQuantity: dishStockQuantity ? Number(dishStockQuantity) : undefined,
        extraInfo: dishExtraInfo.trim() || undefined,
        addons: dishAddons,
        storeType: 'cafe',
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

      showToast('Muvaffaqiyatli saqlandi', `"${dishName}" menyuga kiritildi`, 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Saqlab bo‘lmadi', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete dish
  const handleDeleteDish = async (id: string, name: string) => {
    if (!confirm(`"${name}" mahsulotini rostdan ham menyudan o‘chirmoqchimisiz?`)) return;
    try {
      await firestoreService.deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      showToast('O‘chirildi', `"${name}" mahsuloti o‘chirildi`, 'info');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'O‘chirib bo‘lmadi', 'error');
    }
  };

  // Toggle availability (Stop-list / Mavjud emas)
  const handleToggleAvailability = async (dish: MenuItem) => {
    try {
      const updated = { ...dish, isAvailable: !dish.isAvailable };
      await firestoreService.saveMenuItem(updated);
      setMenuItems((prev) => prev.map((i) => (i.id === dish.id ? updated : i)));
      showToast(
        'Holat yangilandi',
        updated.isAvailable ? `"${dish.name}" sotuvda mavjud` : `"${dish.name}" mavjud emas (Stop-list) deb belgilandi`,
        'success'
      );
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((dish) => {
      const matchesCategory = activeCategory === 'all' || dish.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.category && dish.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Café menyusi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="cafe-menu-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Café Menyu & Mahsulotlar
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {menuItems.length} / {maxLimit} ta mahsulot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kategoriyalar, mahsulotlar, narxlar, chegirmalar va rasmlar boshqaruvi.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Kategoriyalarni boshqarish ({categories.length})</span>
          </button>

          <button
            onClick={handleOpenAdd}
            disabled={isLimitReached}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Mahsulot qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Limit Alert if Reached */}
      {isLimitReached && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Tarif limiti to‘lgan (<strong>{menuItems.length}/{maxLimit} ta mahsulot</strong>). Yangi mahsulot qo‘shish uchun tarifingizni yangilang.
            </span>
          </div>
        </div>
      )}

      {/* Filter & Category Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mahsulot nomi yoki tavsifi bo‘yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Barchasi ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.category === cat.name).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                  activeCategory === cat.name
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon || '🍽️'}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Mahsulot topilmadi</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeCategory !== 'all'
                ? `"${activeCategory}" kategoriyasida hozircha mahsulot yo‘q.`
                : 'Menyuga yangi mahsulot qo‘shish orqali boshlang.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi mahsulot qo‘shish</span>
            </button>
          </div>
        ) : (
          filteredItems.map((dish) => (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                !dish.isAvailable ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <img
                    src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                    alt={dish.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                    }}
                    className={`w-full h-full object-cover transition duration-300 ${
                      !dish.isAvailable ? 'grayscale opacity-75' : ''
                    }`}
                  />
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                    {dish.category}
                  </span>

                  {/* Availability quick switch */}
                  <button
                    onClick={() => handleToggleAvailability(dish)}
                    title="Bosib holatni o‘zgartiring"
                    className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition flex items-center gap-1 ${
                      dish.isAvailable
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dish.isAvailable ? 'bg-white' : 'bg-red-200'}`} />
                    <span>{dish.isAvailable ? 'Mavjud' : 'Mavjud emas'}</span>
                  </button>

                  {dish.discountPrice && dish.discountPrice < dish.price && (
                    <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      Chegirma!
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{dish.name}</h3>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-slate-900 text-sm whitespace-nowrap block">
                        {(dish.discountPrice || dish.price).toLocaleString()} so‘m
                      </span>
                      {dish.discountPrice && (
                        <span className="text-[11px] text-slate-400 line-through block">
                          {dish.price.toLocaleString()} so‘m
                        </span>
                      )}
                    </div>
                  </div>

                  {dish.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{dish.description}</p>
                  )}

                  {/* Stock or Extra info badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    {dish.stockQuantity !== undefined && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        Qoldiq: <strong>{dish.stockQuantity} ta</strong>
                      </span>
                    )}
                    {dish.extraInfo && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                        {dish.extraInfo}
                      </span>
                    )}
                  </div>

                  {dish.addons && dish.addons.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700">Qo‘shimchalar ({dish.addons.length}):</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dish.addons.map((a) => (
                          <span
                            key={a.id}
                            className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            +{a.name} ({a.price.toLocaleString()} so‘m)
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
          ))
        )}
      </div>

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Café Kategoriyalari</h3>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  setNewCatName('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create / Edit Category Form */}
            <form onSubmit={handleSaveCategory} className="p-4 bg-amber-50/50 border-b border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-700">
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo‘shish'}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ikonka (masalan: 🥤)"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-16 px-2 py-2 text-center bg-white border border-slate-200 rounded-xl text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Kategoriya nomi (masalan: Ichimliklar)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0"
                >
                  {editingCategory ? 'Saqlash' : 'Qo‘shish'}
                </button>
              </div>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCatName('');
                    setNewCatIcon('🍽️');
                  }}
                  className="text-[11px] text-slate-500 hover:underline"
                >
                  Bekor qilish
                </button>
              )}
            </form>

            {/* Categories List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Mavjud kategoriyalar:</p>
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const itemCount = menuItems.filter((i) => i.category === cat.name).length;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon || '🍽️'}</span>
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {itemCount} ta mahsulot
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCatName(cat.name);
                            setNewCatIcon(cat.icon || '🍽️');
                          }}
                          className="p-1 text-slate-400 hover:text-amber-700 rounded-md"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal with Gallery Upload and Full Fields */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingDish ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo‘shish'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Mahsulot nomi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mahsulot nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Maxsus Lavash yoki Milliy Osh"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Rasm: Galereyadan tanlash (No URL requirement!) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mahsulot rasmi (Galereyadan tanlash)
                </label>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleGalleryFileSelect}
                  className="hidden"
                />

                {imagePreview || dishImage ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100 group">
                      <img
                        src={imagePreview || dishImage}
                        alt="Preview"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />

                      {/* Uploading progress overlay */}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white p-4">
                          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                          <p className="text-xs font-bold">Rasm yuklanmoqda va siqilmoqda...</p>
                          <p className="text-[11px] text-slate-200">Iltimos kuting</p>
                        </div>
                      )}

                      {/* Action buttons overlay */}
                      {!uploadingImage && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                            <span>O‘zgartirish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDishImage('');
                              setImagePreview('');
                              setImageUploadError(null);
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>O‘chirish</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Upload Error Alert with Retry */}
                    {imageUploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{imageUploadError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRetryImageUpload}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Qayta urinish</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                        <span className="text-xs font-semibold text-amber-900">Rasm yuklanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            📱 Galereyadan tanlash
                          </p>
                          <p className="text-[11px] text-slate-500">
                            JPG, PNG yoki WebP rasm tanlang (avtomatik optimallashtiriladi)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Kategoriya & Narx */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Kategoriya *</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] text-amber-700 hover:underline font-semibold"
                    >
                      + Yangi
                    </button>
                  </div>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                    {categories.length === 0 && <option value="Boshqalar">Boshqalar</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Narx (so‘m) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Chegirma narxi & Mahsulot miqdori */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chegirma narxi (ixtiyoriy)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    placeholder="Masalan: 30000"
                    value={dishDiscountPrice ?? ''}
                    onChange={(e) =>
                      setDishDiscountPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mahsulot miqdori / Qoldiq (ixtiyoriy)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Masalan: 50 ta"
                    value={dishStockQuantity ?? ''}
                    onChange={(e) =>
                      setDishStockQuantity(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Mavjud / mavjud emas holati */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Sotuv holati</span>
                  <span className="text-[11px] text-slate-500">
                    {dishAvailable
                      ? '✅ Sotuvda mavjud — mijozlar buyurtma bera oladi'
                      : '❌ Mavjud emas (Stop-list) — mijozlar buyurtma bera olmaydi'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDishAvailable(!dishAvailable)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    dishAvailable ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  placeholder="Tarkibi, masalliqlar, porsiya haqida batafsil ma'lumot..."
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Qo‘shimcha ma’lumot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qo‘shimcha ma’lumot (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 1 porsiya 350g • Tayyorlanish vaqti 15 daqiqa"
                  value={dishExtraInfo}
                  onChange={(e) => setDishExtraInfo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Addons / Qo‘shimcha masalliqlar */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Qo‘shimcha variantlar / Add-ons (Sous, Sir, Ichimlik va h.k.)
                </label>

                {dishAddons.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {dishAddons.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{addon.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-800">
                            +{addon.price.toLocaleString()} so‘m
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(addon.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Qo‘shimcha nomi (masalan: Sir)"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Narxi"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                  >
                    Qo‘shish
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <span>Saqlash</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
