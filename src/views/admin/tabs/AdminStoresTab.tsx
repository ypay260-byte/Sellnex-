import React, { useState } from 'react';
import { Store, User, Product } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Search,
  Store as StoreIcon,
  ExternalLink,
  ShieldAlert,
  Power,
  Trash2,
  Edit,
  Package,
  Calendar,
  Layers,
  ChevronRight,
  X,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface AdminStoresTabProps {
  stores: Store[];
  users: User[];
  products: Product[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminStoresTab: React.FC<AdminStoresTabProps> = ({
  stores,
  users,
  products,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'suspended' | 'trusted'>('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Seller Card edit form in modal
  const [editCardNumber, setEditCardNumber] = useState('');
  const [editCardHolder, setEditCardHolder] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [isTrusted, setIsTrusted] = useState(false);

  // When a store is opened, populate card info
  const handleOpenStoreModal = (st: Store) => {
    setSelectedStore(st);
    setEditCardNumber(st.sellerCardNumber || '');
    setEditCardHolder(st.sellerCardHolder || st.name);
    setEditBankName(st.sellerBankName || 'Uzcard / Humo');
    setIsTrusted(Boolean(st.isTrustedSeller));
    setShowDeleteConfirm(false);
  };

  // User Map lookup
  const userMap = new Map<string, User>();
  users.forEach((u) => userMap.set(u.id, u));

  // Products per store count
  const productCountMap = new Map<string, number>();
  products.forEach((p) => {
    productCountMap.set(p.storeId, (productCountMap.get(p.storeId) || 0) + 1);
  });

  const filteredStores = stores.filter((s) => {
    const term = searchTerm.toLowerCase();
    const owner = userMap.get(s.ownerId);
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.slug.toLowerCase().includes(term) ||
      (owner && owner.email.toLowerCase().includes(term)) ||
      s.id.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return s.published !== false;
    if (statusFilter === 'suspended') return s.published === false;
    return true;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'store',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Store action performed by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit error:', err);
    }
  };

  const handleToggleStoreStatus = async () => {
    if (!selectedStore) return;
    setIsProcessing(true);
    try {
      const nextPublished = selectedStore.published === false ? true : false;
      await firestoreService.saveStore({
        ...selectedStore,
        published: nextPublished,
      });
      await recordAudit('toggle_store_publish', selectedStore.id, { published: selectedStore.published }, { published: nextPublished });
      showToast('Store Updated', `Store status changed to ${nextPublished ? 'Live' : 'Suspended (Maintenance)'}`, 'success');
      setSelectedStore({ ...selectedStore, published: nextPublished });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;
    setIsProcessing(true);
    try {
      await firestoreService.deleteStore(selectedStore.id);
      await recordAudit('delete_store', selectedStore.id, { name: selectedStore.name, slug: selectedStore.slug }, null);
      showToast('Store Removed', `Store ${selectedStore.name} permanently deleted`, 'info');
      setSelectedStore(null);
      setShowDeleteConfirm(false);
      await onRefresh();
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stores by title, slug, owner..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(
            [
              { id: 'all', label: 'All Stores' },
              { id: 'published', label: 'Live' },
              { id: 'suspended', label: 'Suspended' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => onRefresh()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No stores found matching current filter.
          </div>
        ) : (
          filteredStores.map((st) => {
            const owner = userMap.get(st.ownerId);
            const count = productCountMap.get(st.id) || 0;
            const isLive = st.published !== false;
            return (
              <div
                key={st.id}
                onClick={() => setSelectedStore(st)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 font-bold flex items-center justify-center text-sm shrink-0">
                        {st.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{st.name}</h4>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          /{st.slug}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                        isLive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {isLive ? 'Live' : 'Suspended'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mt-4">
                    <div className="flex items-center justify-between">
                      <span>Owner:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[160px]">
                        {owner ? owner.email : st.ownerId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Products:</span>
                      <span className="text-emerald-400 font-bold">{count} items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Currency:</span>
                      <span className="text-slate-200">{st.currency || 'UZS'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <a
                    href={`/store/${st.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <span className="text-slate-500 text-[11px]">
                    {new Date(st.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Store Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedStore.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Store ID: {selectedStore.id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStore(null);
                  setShowDeleteConfirm(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Public Slug:</span>
                <span className="text-white font-mono">{selectedStore.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner UID:</span>
                <span className="text-white font-mono">{selectedStore.ownerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Public Domain:</span>
                <span className="text-rose-400 font-mono">{selectedStore.domain || `${selectedStore.slug}.sellnex.uz`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold ${selectedStore.published !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedStore.published !== false ? 'Active & Live' : 'Suspended (Maintenance Mode)'}
                </span>
              </div>
            </div>

            {/* Trusted Seller & Direct Card Payouts */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className={`w-4 h-4 ${isTrusted ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Ishonchli Sotuvchi (Direct Payout)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tasdiqlangan sotuvchining xaridorlari to‘lovni to‘g‘ridan-to‘g‘ri uning shaxsiy kartasiga o‘tkazadi.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrusted}
                    onChange={(e) => setIsTrusted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {isTrusted && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sotuvchi Karta Raqami</label>
                    <input
                      type="text"
                      value={editCardNumber}
                      onChange={(e) => setEditCardNumber(e.target.value)}
                      placeholder="8600 0000 0000 0000"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Karta Egasi</label>
                    <input
                      type="text"
                      value={editCardHolder}
                      onChange={(e) => setEditCardHolder(e.target.value)}
                      placeholder="Sotuvchi F.I.O"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Bank Nomi</label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      placeholder="Uzcard / Humo / Bank"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  if (!selectedStore) return;
                  setIsProcessing(true);
                  try {
                    const updated: Store = {
                      ...selectedStore,
                      isTrustedSeller: isTrusted,
                      directPayoutApproved: isTrusted,
                      sellerCardNumber: editCardNumber.trim() || undefined,
                      sellerCardHolder: editCardHolder.trim() || undefined,
                      sellerBankName: editBankName.trim() || undefined,
                    };
                    await firestoreService.saveStore(updated);
                    await recordAudit('update_seller_trust_and_card', selectedStore.id, selectedStore, updated);
                    setSelectedStore(updated);
                    showToast('Saqlandi', 'Sotuvchi ishonch va karta holati yangilandi', 'success');
                    await onRefresh();
                  } catch (err: any) {
                    showToast('Xatolik', err.message, 'error');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Sotuvchi Ishonch va Karta Ma’lumotlarini Saqlash
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/store/${selectedStore.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center border border-slate-700 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Open Live Store</span>
              </a>

              <button
                disabled={isProcessing}
                onClick={handleToggleStoreStatus}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedStore.published !== false
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{selectedStore.published !== false ? 'Suspend Store' : 'Reactivate Store'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {!showDeleteConfirm ? (
                <button
                  disabled={isProcessing}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Store</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-bold">Permanently delete store?</span>
                  <button
                    onClick={handleDeleteStore}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
