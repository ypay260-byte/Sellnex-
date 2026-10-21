import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CafeTable, RestaurantProfile, TableStatus } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Users,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCw,
  Download,
  ExternalLink,
  Coffee,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface CafeTablesTabProps {
  restaurant: RestaurantProfile;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onSelectTableForOrder?: (tableNumber: string) => void;
}

export const CafeTablesTab: React.FC<CafeTablesTabProps> = ({
  restaurant,
  showToast,
  onSelectTableForOrder,
}) => {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<CafeTable | null>(null);

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TableStatus>('available');

  // QR Preview Modal
  const [qrModalTable, setQrModalTable] = useState<CafeTable | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getCafeTables(restaurant.id);
      setTables(data);
    } catch (e: any) {
      console.error('Error loading tables:', e);
      showToast('Xatolik', 'Stollarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [restaurant.id]);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setTableNumber(`Stol ${tables.length + 1}`);
    setCapacity(4);
    setNotes('');
    setStatus('available');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: CafeTable) => {
    setEditingTable(t);
    setTableNumber(t.tableNumber);
    setCapacity(t.capacity || 4);
    setNotes(t.notes || '');
    setStatus(t.status || 'available');
    setIsModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      showToast('Stol raqami talab qilinadi', '', 'warning');
      return;
    }

    try {
      const tableId = editingTable ? editingTable.id : `tbl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const tableData: CafeTable = {
        id: tableId,
        restaurantId: restaurant.id,
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity) || 4,
        status,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
        createdAt: editingTable?.createdAt || new Date().toISOString(),
      };

      await firestoreService.saveCafeTable(tableData);
      showToast('Saqlandi!', `"${tableNumber}" stoli muvaffaqiyatli saqlandi.`, 'success');
      setIsModalOpen(false);
      await loadTables();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Stolni saqlashda xatolik yuz berdi', 'error');
    }
  };

  const handleDeleteTable = async (t: CafeTable) => {
    if (!window.confirm(`Haqiqatan ham "${t.tableNumber}" stolini o‘chirmoqchimisiz?`)) {
      return;
    }
    try {
      await firestoreService.deleteCafeTable(t.id);
      setTables((prev) => prev.filter((item) => item.id !== t.id));
      showToast('O‘chirildi', `"${t.tableNumber}" stoli o‘chirildi`, 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Stolni o‘chirishda xatolik', 'error');
    }
  };

  const handleQuickStatusChange = async (t: CafeTable, newStatus: TableStatus) => {
    try {
      await firestoreService.saveCafeTable({ ...t, status: newStatus });
      setTables((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, status: newStatus } : item))
      );
      showToast('Holat yangilandi', `"${t.tableNumber}": ${newStatus}`, 'info');
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
  };

  // Generate Table QR Code (with pre-filled table query param)
  const handleOpenQr = async (t: CafeTable) => {
    setQrModalTable(t);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sellnex.uz';
    // Deep link directly to digital menu with table pre-selected (Feature 4 A.6, A.7)
    const tableUrl = `${origin}/?restaurantSlug=${restaurant.slug}&table=${encodeURIComponent(t.tableNumber)}`;
    try {
      const dataUrl = await QRCode.toDataURL(tableUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !qrModalTable) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${restaurant.name.replace(/\s+/g, '_')}_${qrModalTable.tableNumber.replace(/\s+/g, '_')}.png`;
    a.click();
    showToast('QR yuklandi!', 'PNG rasm qurilmangizga saqlandi', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            <span>Café Stollari va QR Menyular Boshqaruvi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Har bir stol uchun alohida QR-kod yarating. Mijozlar skaner qilganda stol raqami avtomatik tanlanadi.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Stol Qo‘shish</span>
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 animate-pulse">
          Stollar yuklanmoqda...
        </div>
      ) : tables.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Coffee className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Hozircha stollar mavjud emas</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
          >
            Birinchi stolni qo‘shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 bg-white shadow-xs ${
                t.status === 'occupied'
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : t.status === 'reserved'
                  ? 'border-purple-300 bg-purple-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {t.tableNumber}
                  </h3>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.capacity || 4} kishilik</span>
                  </span>
                </div>

                {/* Status Badge */}
                <select
                  value={t.status}
                  onChange={(e) => handleQuickStatusChange(t, e.target.value as TableStatus)}
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                    t.status === 'occupied'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : t.status === 'reserved'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <option value="available">Bo‘sh (Ochiq)</option>
                  <option value="occupied">Band (Buyurtmada)</option>
                  <option value="reserved">Band qilingan (Bron)</option>
                  <option value="cleaning">Tozalanmoqda</option>
                </select>
              </div>

              {t.notes && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {t.notes}
                </p>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenQr(t)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Stol QR-kodini ko‘rish va yuklab olish"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-600" />
                  <span>Stol QR</span>
                </button>

                <div className="flex items-center gap-1">
                  {onSelectTableForOrder && (
                    <button
                      type="button"
                      onClick={() => onSelectTableForOrder(t.tableNumber)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
                      title="Ushbu stolga buyurtma ochish"
                    >
                      Buyurtma
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTable(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingTable ? 'Stolni tahrirlash' : 'Yangi stol qo‘shish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stol Nomi / Raqami *</label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Masalan: Stol 1, VIP Stol, Terrasa 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sig‘imi (kishi soni)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Holati</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TableStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none"
                >
                  <option value="available">Bo‘sh (Ochiq)</option>
                  <option value="occupied">Band (Buyurtmada)</option>
                  <option value="reserved">Band qilingan (Bron)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eslatma (ixtiyoriy)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masalan: Oyna yonida, rozetkasi bor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Preview & Download Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                {qrModalTable.tableNumber}
              </span>
              <button
                onClick={() => setQrModalTable(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{restaurant.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mijozlar telefon kamerasini ushbu QR-kodga qaratishlari kifoya
              </p>
            </div>

            {qrDataUrl && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrModalTable.tableNumber}`}
                  className="w-56 h-56 mx-auto rounded-xl"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>QR-kodni yuklab olish (PNG)</span>
              </button>
              <button
                type="button"
                onClick={() => setQrModalTable(null)}
                className="w-full py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
