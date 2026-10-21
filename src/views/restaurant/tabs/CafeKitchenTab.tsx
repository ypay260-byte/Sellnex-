import React, { useState, useEffect } from 'react';
import { RestaurantOrder, RestaurantOrderStatus, RestaurantProfile } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCw,
  Bell,
  Utensils,
  Check,
  User,
  Coffee,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface CafeKitchenTabProps {
  restaurant: RestaurantProfile;
  orders: RestaurantOrder[];
  onStatusUpdate?: (order: RestaurantOrder, nextStatus: RestaurantOrderStatus) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CafeKitchenTab: React.FC<CafeKitchenTabProps> = ({
  restaurant,
  orders,
  onStatusUpdate,
  showToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'active' | 'ready' | 'served' | 'all'>('active');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filter orders for kitchen view
  const kitchenOrders = orders.filter((o) => {
    if (activeFilter === 'active') {
      return o.status === 'new' || o.status === 'accepted' || o.status === 'preparing';
    }
    if (activeFilter === 'ready') {
      return o.status === 'ready';
    }
    if (activeFilter === 'served') {
      return o.status === 'served' || o.status === 'delivered';
    }
    return true;
  });

  const handleAdvanceStatus = async (order: RestaurantOrder, targetStatus: RestaurantOrderStatus) => {
    setUpdatingOrderId(order.id);
    try {
      await firestoreService.updateRestaurantOrderStatus(order.id, targetStatus);
      showToast('Status yangilandi', `Buyurtma #${order.orderNumber} holati: ${targetStatus}`, 'success');

      if (onStatusUpdate) {
        onStatusUpdate(order, targetStatus);
      }
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Statusni yangilab bo‘lmadi', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getTimeElapsed = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Hozirgina';
      if (diffMin < 60) return `${diffMin} daqiqa oldin`;
      const diffHour = Math.floor(diffMin / 60);
      return `${diffHour} soat oldin`;
    } catch {
      return '';
    }
  };

  const getStatusBorder = (status: RestaurantOrderStatus) => {
    switch (status) {
      case 'new':
        return 'border-amber-400 bg-amber-50/20';
      case 'accepted':
        return 'border-indigo-400 bg-indigo-50/20';
      case 'preparing':
        return 'border-blue-500 bg-blue-50/20';
      case 'ready':
        return 'border-emerald-500 bg-emerald-50/20';
      case 'served':
      case 'delivered':
        return 'border-slate-300 bg-slate-50/40 opacity-70';
      case 'cancelled':
        return 'border-rose-300 bg-rose-50/30 opacity-60';
      default:
        return 'border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* KDS Header & Filter Strip */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">Oshxona Ekrani (KDS)</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Jonli Rejim
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Oshpazlar va oshxona xodimlari uchun real-vaqt rejimida yangilanuvchi buyurtmalar tizimi
            </p>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeFilter === 'active'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Faol Oshxonada ({orders.filter((o) => o.status === 'new' || o.status === 'accepted' || o.status === 'preparing').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('ready')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeFilter === 'ready'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tayyor ({orders.filter((o) => o.status === 'ready').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('served')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeFilter === 'served'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Berildi ({orders.filter((o) => o.status === 'served' || o.status === 'delivered').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tarix
          </button>
        </div>
      </div>

      {/* Kitchen Ticket Cards Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Ayni vaqtda faol buyurtmalar yo‘q</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ofitsiant yoki mijoz tomonidan yangi buyurtma yuborilishi bilan bu yerda real-vaqtda paydo bo‘ladi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => {
            const isProcessing = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`p-5 rounded-3xl border-2 transition-all space-y-4 bg-white shadow-xs flex flex-col justify-between ${getStatusBorder(
                  order.status
                )}`}
              >
                {/* Ticket Header */}
                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {order.tableNumber || 'Stol ?'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.waiterName || 'Ofitsiant'}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{getTimeElapsed(order.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Dishes / Items List */}
                <div className="space-y-2.5 flex-1 min-h-[120px]">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {item.quantity} × {item.name}
                        </span>
                      </div>

                      {/* Special instructions banner (Requirement C.3) */}
                      {item.specialInstructions && (
                        <div className="p-1.5 bg-amber-100/90 text-amber-950 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Eslatma: {item.specialInstructions}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* General order note */}
                  {order.notes && (
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-xl text-[11px] font-medium">
                      Eslatma: {order.notes}
                    </div>
                  )}
                </div>

                {/* 1-Tap Workflow Status Progression Buttons (Requirement C.6) */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {order.status === 'new' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAdvanceStatus(order, 'accepted')}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Qabul qilish</span>
                    </button>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAdvanceStatus(order, 'preparing')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Pishirishni boshlash</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAdvanceStatus(order, 'ready')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Taom Tayyor!</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAdvanceStatus(order, 'served')}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Ofitsiantga topshirildi</span>
                    </button>
                  )}

                  {order.status !== 'cancelled' && order.status !== 'served' && order.status !== 'delivered' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAdvanceStatus(order, 'cancelled')}
                      className="w-full py-1 text-slate-400 hover:text-rose-600 text-[11px] font-bold transition-colors"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
