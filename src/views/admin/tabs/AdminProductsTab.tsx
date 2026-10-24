import React, { useState } from 'react';
import { Product, Store, User } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Search,
  Package,
  ShieldAlert,
  CheckCircle,
  EyeOff,
  Trash2,
  ExternalLink,
  Flag,
  AlertTriangle,
  RefreshCw,
  X,
  Tag,
  DollarSign,
  Edit2,
  Check,
} from 'lucide-react';

interface AdminProductsTabProps {
  products: Product[];
  stores: Store[];
  users: User[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  formatMoney: (amount: number) => string;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  stores,
  users,
  adminEmail,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'published' | 'flagged' | 'draft'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Direct Edit Product State for Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    sellingPrice: 0,
    stock: 0,
    status: 'Published' as Product['status'],
  });

  // Direct Delete Target State
  const [directDeleteProduct, setDirectDeleteProduct] = useState<Product | null>(null);

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.id, s));

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const st = storeMap.get(p.storeId);
    const matchesSearch =
      p.title.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      (st && st.name.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterMode === 'all') return true;
    if (filterMode === 'published') return p.status === 'Published';
    if (filterMode === 'flagged') return (p as any).moderationStatus === 'flagged';
    if (filterMode === 'draft') return p.status === 'Draft';
    return true;
  });

  const recordAudit = async (action: string, targetId: string, oldVal: any, newVal: any) => {
    try {
      await firestoreService.createAuditLog({
        adminEmail,
        action,
        targetType: 'product',
        targetId,
        oldValue: oldVal,
        newValue: newVal,
        details: `Product moderation by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.warn('Audit fail:', err);
    }
  };

  const handleTogglePublish = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true);
    try {
      const nextStatus = selectedProduct.status === 'Published' ? 'Draft' : 'Published';
      await firestoreService.updateProduct(selectedProduct.id, { status: nextStatus });
      await recordAudit('toggle_product_status', selectedProduct.id, { status: selectedProduct.status }, { status: nextStatus });
      showToast('Product Updated', `Status changed to ${nextStatus}`, 'success');
      setSelectedProduct({ ...selectedProduct, status: nextStatus });
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlagProduct = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true);
    try {
      const updates = {
        moderationStatus: 'flagged' as const,
        moderationReason: flagReason || 'Prohibited / Trademark violation',
        status: 'Draft' as const, // Force unpublish
      };
      await firestoreService.updateProduct(selectedProduct.id, updates as any);
      await recordAudit('flag_product', selectedProduct.id, null, updates);
      showToast('Product Flagged', 'Product marked as flagged and forced to Draft status', 'warning');
      setSelectedProduct({ ...selectedProduct, ...updates } as any);
      setFlagReason('');
      await onRefresh();
    } catch (err: any) {
      showToast('Flagging Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveProduct = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true);
    try {
      const updates = {
        moderationStatus: 'approved' as const,
        moderationReason: null,
        status: 'Published' as const,
      };
      await firestoreService.updateProduct(selectedProduct.id, updates as any);
      await recordAudit('approve_product', selectedProduct.id, null, updates);
      showToast('Product Approved', 'Product cleared and approved for live sales', 'success');
      setSelectedProduct({ ...selectedProduct, ...updates } as any);
      await onRefresh();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true);
    try {
      await firestoreService.deleteProduct(selectedProduct.id);
      await recordAudit('delete_product', selectedProduct.id, { title: selectedProduct.title }, null);
      showToast('Product Deleted', `Removed ${selectedProduct.title}`, 'info');
      setSelectedProduct(null);
      setShowDeleteConfirm(false);
      await onRefresh();
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditFormData({
      title: prod.title || '',
      description: prod.description || '',
      category: prod.category || '',
      sellingPrice: prod.sellingPrice || 0,
      stock: prod.stock || 0,
      status: prod.status || 'Published',
    });
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editFormData.title.trim()) {
      showToast('Xatolik', 'Mahsulot nomini kiriting', 'warning');
      return;
    }
    setIsProcessing(true);
    try {
      const updates = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        category: editFormData.category.trim() || 'General',
        sellingPrice: Math.max(0, Number(editFormData.sellingPrice) || 0),
        stock: Math.max(0, Number(editFormData.stock) || 0),
        status: editFormData.status,
      };
      await firestoreService.updateProduct(editingProduct.id, updates);
      await recordAudit('edit_product_admin', editingProduct.id, { title: editingProduct.title }, updates);
      showToast('Mahsulot saqlandi', `"${updates.title}" muvaffaqiyatli yangilandi`, 'success');
      setEditingProduct(null);
      await onRefresh();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Mahsulotni yangilashda xatolik', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteDirectDelete = async () => {
    if (!directDeleteProduct) return;
    setIsProcessing(true);
    try {
      await firestoreService.deleteProduct(directDeleteProduct.id);
      await recordAudit('delete_product_admin', directDeleteProduct.id, { title: directDeleteProduct.title }, null);
      showToast('Mahsulot o‘chirildi', `"${directDeleteProduct.title}" tizimdan o‘chirildi`, 'info');
      setDirectDeleteProduct(null);
      await onRefresh();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'O‘chirishda xatolik yuz berdi', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products across all stores..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(
            [
              { id: 'all', label: 'All Catalog' },
              { id: 'published', label: 'Published' },
              { id: 'flagged', label: 'Flagged / Violations' },
              { id: 'draft', label: 'Draft' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterMode(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === item.id
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

      {/* Product Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Parent Store</th>
                <th className="py-3.5 px-4 font-semibold">Price & Profit</th>
                <th className="py-3.5 px-4 font-semibold">Inventory</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const st = storeMap.get(p.storeId);
                  const isFlagged = (p as any).moderationStatus === 'flagged';
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-white truncate">{p.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">{p.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium truncate max-w-[140px]">
                          {st ? st.name : p.storeId}
                        </div>
                        {st && <div className="text-[10px] text-slate-500 font-mono">/{st.slug}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{formatMoney(p.price)}</div>
                        <div className="text-[10px] text-emerald-400">
                          Profit: {formatMoney(p.price - (p.originalPrice || p.price * 0.7))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-200">{p.stock} in stock</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isFlagged
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : p.status === 'Published'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isFlagged ? 'FLAGGED' : p.status}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditProduct(p);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDirectDeleteProduct(p);
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(p);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white truncate max-w-md">{selectedProduct.title}</h3>
                <p className="text-xs text-slate-400 font-mono">Product ID: {selectedProduct.id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setShowDeleteConfirm(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <img
                src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                alt={selectedProduct.title}
                className="w-24 h-24 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"
              />
              <div className="space-y-1 text-xs text-slate-300 min-w-0">
                <div className="text-slate-400 line-clamp-3">{selectedProduct.description}</div>
                <div className="font-bold text-white pt-1">Price: {formatMoney(selectedProduct.price)}</div>
                <div className="text-slate-400">Stock: {selectedProduct.stock} units</div>
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Moderation Action
              </label>

              <div className="flex gap-2">
                <button
                  disabled={isProcessing}
                  onClick={handleApproveProduct}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>

                <button
                  disabled={isProcessing}
                  onClick={handleTogglePublish}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>{selectedProduct.status === 'Published' ? 'Force Unpublish' : 'Publish'}</span>
                </button>
              </div>

              {/* Flag Section */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="Reason for flag (Counterfeit, Illegal, Prohibited...)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                  />
                  <button
                    disabled={isProcessing}
                    onClick={handleFlagProduct}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Flag Item</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {!showDeleteConfirm ? (
                <button
                  disabled={isProcessing}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Product</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-bold">Confirm delete product?</span>
                  <button
                    onClick={handleDeleteProduct}
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
      {/* Admin Direct Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Mahsulotni Tahrirlash</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Mahsulot Nomi</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Narxi (UZS)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editFormData.sellingPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-blue-500 font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Zaxiradagi Soni</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kategoriya</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Holati (Status)</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="Published">Published (Sotuvda)</option>
                    <option value="Draft">Draft (Qoralama)</option>
                    <option value="Archived">Archived (Arxivda)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tavsif</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>O‘zgarishlarni Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Direct Delete Confirmation Modal */}
      {directDeleteProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-200 animate-scaleIn text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-white text-base">Mahsulotni o‘chirish</h4>
              <p className="text-xs text-slate-400 mt-1">
                Rostdan ham <strong className="text-white">"{directDeleteProduct.title}"</strong> mahsulotini tizimdan butunlay o‘chirmoqchimisiz?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDirectDeleteProduct(null)}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleExecuteDirectDelete}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Ha, butunlay o‘chirish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
