import React, { useState, useEffect } from 'react';
import {
  RestaurantProfile,
  MenuItem,
  CafeCategory,
  CafeTable,
  RestaurantOrder,
  RestaurantOrderItem,
} from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Coffee,
  Plus,
  Minus,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  Utensils,
  Clock,
  Sparkles,
  RotateCw,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CafeWaiterTerminalTabProps {
  restaurant: RestaurantProfile;
  menuItems: MenuItem[];
  categories: CafeCategory[];
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onOrderCreated?: (order: RestaurantOrder) => void;
  preselectedTable?: string;
}

export const CafeWaiterTerminalTab: React.FC<CafeWaiterTerminalTabProps> = ({
  restaurant,
  menuItems,
  categories,
  showToast,
  onOrderCreated,
  preselectedTable,
}) => {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(preselectedTable || 'Stol 1');
  const [waiterName, setWaiterName] = useState<string>('Ofitsiant 1');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Active cart items in waiter terminal
  interface TerminalCartItem {
    item: MenuItem;
    quantity: number;
    specialInstructions: string;
  }
  const [cartItems, setCartItems] = useState<TerminalCartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInstructionsIndex, setEditingInstructionsIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadTables() {
      try {
        const tList = await firestoreService.getCafeTables(restaurant.id);
        setTables(tList);
        if (preselectedTable) {
          setSelectedTable(preselectedTable);
        } else if (tList.length > 0) {
          setSelectedTable(tList[0].tableNumber);
        }
      } catch (err) {
        console.warn('Could not load tables for waiter terminal:', err);
      }
    }
    loadTables();
  }, [restaurant.id, preselectedTable]);

  // Fast category and search filtering
  const filteredMenuItems = menuItems.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddItem = (item: MenuItem) => {
    if (!item.isAvailable) {
      showToast('Tugagan', `"${item.name}" hozirda mavjud emas.`, 'warning');
      return;
    }

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((c) => c.item.id === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { item, quantity: 1, specialInstructions: '' }];
    });
  };

  const handleUpdateQty = (idx: number, delta: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== idx);
      }
      updated[idx].quantity = newQty;
      return updated;
    });
  };

  const handleSetSpecialInstructions = (idx: number, instructions: string) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[idx].specialInstructions = instructions;
      return updated;
    });
  };

  // Live order calculations
  const subtotal = cartItems.reduce((acc, c) => acc + (c.item.discountPrice || c.item.price) * c.quantity, 0);
  const totalAmount = subtotal;

  // Submit order with duplicate prevention (Requirement C.9)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showToast('Buyurtma bo‘sh', 'Iltimos, avval taomlarni tanlang.', 'warning');
      return;
    }

    if (isSubmitting) return; // Prevent double-click duplicates

    setIsSubmitting(true);
    try {
      const orderItems: RestaurantOrderItem[] = cartItems.map((c) => {
        const p = c.item.discountPrice || c.item.price;
        return {
          menuItemId: c.item.id,
          name: c.item.name,
          price: p,
          discountPrice: c.item.discountPrice,
          quantity: c.quantity,
          image: c.item.imageUrl || c.item.image,
          imageUrl: c.item.imageUrl || c.item.image,
          specialInstructions: c.specialInstructions.trim() || undefined,
          totalPrice: p * c.quantity,
        };
      });

      const newOrder = await firestoreService.createRestaurantOrder({
        restaurantId: restaurant.id,
        ownerId: restaurant.ownerId,
        customerName: `${selectedTable} (${waiterName})`,
        customerPhone: restaurant.phone || '—',
        deliveryAddress: `Café Ichida: ${selectedTable}`,
        deliveryNotes: orderNotes.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        orderType: orderType,
        tableNumber: selectedTable,
        waiterName: waiterName.trim() || 'Ofitsiant',
        items: orderItems,
        subtotal,
        deliveryFee: 0,
        totalAmount,
        status: 'new',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
      });

      // Update table status to occupied
      const matchedTable = tables.find((t) => t.tableNumber === selectedTable);
      if (matchedTable) {
        await firestoreService.saveCafeTable({
          ...matchedTable,
          status: 'occupied',
          currentWaiter: waiterName,
          currentOrderId: newOrder.id,
        });
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast(
        'Buyurtma oshxonaga yuborildi!',
        `${selectedTable} uchun buyurtma #${newOrder.orderNumber} yaratildi.`,
        'success'
      );

      // Reset cart
      setCartItems([]);
      setOrderNotes('');

      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      showToast('Xatolik', err.message || 'Buyurtmani yaratib bo‘lmadi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('uz-UZ').format(val) + " so'm";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Columns: Menu Items Selection */}
      <div className="lg:col-span-7 space-y-4">
        {/* Top Controls: Waiter Name, Table Number, Order Type */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Stol Raqami *
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber} {t.status === 'occupied' ? '(Band)' : '(Ochiq)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Ofitsiant Ismi *
              </label>
              <input
                type="text"
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                placeholder="Ofitsiant ismi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Buyurtma Turi
              </label>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`py-1.5 rounded-lg transition-all ${
                    orderType === 'dine_in' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Stolda
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-1.5 rounded-lg transition-all ${
                    orderType === 'takeaway' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Olib ketish
                </button>
              </div>
            </div>
          </div>

          {/* Search bar & Category chips */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Taom yoki ichimlik qidirish..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Barchasi
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                    selectedCategory === c.name
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
          {filteredMenuItems.map((item) => {
            const inCart = cartItems.find((c) => c.item.id === item.id);
            const price = item.discountPrice || item.price;

            return (
              <div
                key={item.id}
                onClick={() => handleAddItem(item)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-white shadow-2xs hover:border-amber-400 hover:shadow-xs select-none ${
                  !item.isAvailable ? 'opacity-50 pointer-events-none bg-slate-50' : ''
                } ${inCart ? 'ring-2 ring-amber-500/30 border-amber-500' : 'border-slate-200'}`}
              >
                <div>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {!item.isAvailable && (
                      <span className="absolute inset-0 bg-slate-900/60 text-white text-[10px] font-extrabold flex items-center justify-center">
                        Tugagan
                      </span>
                    )}
                    {inCart && (
                      <span className="absolute top-1.5 right-1.5 bg-amber-600 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{item.name}</h4>
                  <span className="text-[10px] text-slate-400 block truncate">{item.category}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-900">{formatMoney(price)}</span>
                  <button
                    type="button"
                    className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 5 Columns: Current Waiter Ticket & Live Calculation */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-6 space-y-5 sticky top-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">Buyurtma Cheki</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-extrabold">
                {selectedTable}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Ofitsiant: {waiterName}</span>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => setCartItems([])}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Cart Item List */}
        {cartItems.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Chek bo‘sh</p>
            <p className="text-[11px]">Chap tomondagi taomlarni bosib chekka qo‘shing.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {cartItems.map((c, idx) => {
              const itemPrice = (c.item.discountPrice || c.item.price) * c.quantity;
              const hasInstructions = Boolean(c.specialInstructions);
              const isEditingInst = editingInstructionsIndex === idx;

              return (
                <div
                  key={c.item.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{c.item.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatMoney(c.item.discountPrice || c.item.price)} × {c.quantity}
                      </span>
                    </div>

                    {/* Qty +/- buttons */}
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="p-1 rounded text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-slate-900 w-5 text-center">
                        {c.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="p-1 rounded text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-900 w-20 text-right font-mono">
                      {formatMoney(itemPrice)}
                    </span>
                  </div>

                  {/* Special Kitchen Instructions (Requirement C.3) */}
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {isEditingInst ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={c.specialInstructions}
                          onChange={(e) => handleSetSpecialInstructions(idx, e.target.value)}
                          placeholder="Masalan: Piyozi kam, muzsiz, sous alohida"
                          className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-amber-300 bg-amber-50/50 text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setEditingInstructionsIndex(null)}
                          className="px-2 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          onClick={() => setEditingInstructionsIndex(idx)}
                          className={`text-[11px] cursor-pointer flex items-center gap-1 ${
                            hasInstructions ? 'text-amber-800 font-bold' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{hasInstructions ? `Oshxonaga: "${c.specialInstructions}"` : '+ Oshxona uchun eslatma'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingInstructionsIndex(idx)}
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          {hasInstructions ? 'O‘zgartirish' : ''}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Overall Order Notes */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Umumiy Eslatma (ixtiyoriy)
          </label>
          <input
            type="text"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Masalan: 10 daqiqadan so‘ng olib kelinsin"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
          />
        </div>

        {/* Calculation Summary & Submit */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Jami taomlar soni:</span>
            <span className="font-bold text-slate-900">
              {cartItems.reduce((acc, c) => acc + c.quantity, 0)} dona
            </span>
          </div>

          <div className="flex items-center justify-between text-base font-black text-slate-900">
            <span>To‘lov Summasi:</span>
            <span className="text-xl text-amber-700 font-mono">{formatMoney(totalAmount)}</span>
          </div>

          <button
            type="button"
            disabled={cartItems.length === 0 || isSubmitting}
            onClick={handleSubmitOrder}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Oshxonaga yuborilmoqda...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Buyurtmani Oshxonaga Yuborish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
