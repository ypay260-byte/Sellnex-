import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, BusinessMode } from '../types';
import { BackHeader } from '../components/common/BackHeader';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Share2,
  Link2,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  ShoppingBag,
  Boxes,
  UploadCloud,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    deleteProduct,
    duplicateProduct,
    togglePublishProduct,
    addProduct,
    updateProduct,
    navigateTo,
    formatMoney,
    store,
    getStoreUrl,
    getProductUrl,
    copyStoreLink,
    copyProductLink,
    openShareModal,
    uploadImage,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft' | 'Out of stock'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [businessModeFilter, setBusinessModeFilter] = useState<'All' | BusinessMode>('All');
  const [sortField, setSortField] = useState<'createdAt' | 'sellingPrice' | 'calculatedProfit' | 'salesCount'>('createdAt');

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for manual add/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    businessMode: 'personal' as BusinessMode,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    supplier: 'Local Warehouse' as Product['supplier'],
    supplierCost: 0,
    shippingCost: 0,
    sellingPrice: 180000,
    stock: 35,
    status: 'Published' as Product['status'],
    sku: 'SL-NEW-01',
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchMode = businessModeFilter === 'All' || p.businessMode === businessModeFilter;
      return matchSearch && matchStatus && matchCat && matchMode;
    })
    .sort((a, b) => {
      if (sortField === 'sellingPrice') return b.sellingPrice - a.sellingPrice;
      if (sortField === 'calculatedProfit') return b.calculatedProfit - a.calculatedProfit;
      if (sortField === 'salesCount') return (b.salesCount || 0) - (a.salesCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleOpenAdd = (defaultMode: BusinessMode = 'personal') => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      businessMode: defaultMode,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      supplier: defaultMode === 'personal' ? 'Local Warehouse' : 'Uzum Market',
      supplierCost: defaultMode === 'personal' ? 0 : 150000,
      shippingCost: defaultMode === 'personal' ? 0 : 20000,
      sellingPrice: 180000,
      stock: 35,
      status: 'Published',
      sku: `SL-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      description: p.description || '',
      category: p.category || 'General',
      businessMode: p.businessMode || 'personal',
      imageUrl: p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      supplier: p.supplier || 'Local Warehouse',
      supplierCost: p.supplierCost || 0,
      shippingCost: p.shippingCost || 0,
      sellingPrice: p.sellingPrice || 0,
      stock: p.stock ?? 35,
      status: p.status || 'Published',
      sku: p.sku || `SL-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);

      // Fast local preview using FileReader
      const reader = new FileReader();
      reader.onload = async (event) => {
        const localDataUrl = event.target?.result as string;
        if (localDataUrl) {
          setFormData((prev) => ({ ...prev, imageUrl: localDataUrl }));
        }
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage in background or store as URL
      try {
        const url = await uploadImage(`products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, file);
        if (url) {
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }
      } catch (uploadErr) {
        console.warn('Storage upload note:', uploadErr);
      }

      showToast('Image Loaded', 'Product image ready', 'success');
    } catch (err: any) {
      console.error('Image upload error:', err);
      showToast('Upload Warning', 'Image loaded locally for product', 'info');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title Required', 'Please enter a product title.', 'warning');
      return;
    }

    const isPersonal = formData.businessMode === 'personal';
    const supplierCost = isPersonal ? 0 : Number(formData.supplierCost || 0);
    const shippingCost = isPersonal ? 0 : Number(formData.shippingCost || 0);
    const sellingPrice = Number(formData.sellingPrice || 0);
    const calculatedProfit = isPersonal ? sellingPrice : Math.max(0, sellingPrice - (supplierCost + shippingCost));

    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || 'Quality product on Sellnex.',
          category: formData.category.trim() || 'General',
          businessMode: formData.businessMode,
          images: [formData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
          supplier: formData.supplier,
          supplierCost,
          shippingCost,
          sellingPrice,
          calculatedProfit,
          stock: Number(formData.stock || 1),
          status: formData.status,
          sku: formData.sku,
        });
      } else {
        await addProduct({
          storeId: store.id,
          title: formData.title.trim(),
          description: formData.description.trim() || 'Quality product available on Sellnex.',
          category: formData.category.trim() || 'General',
          businessMode: formData.businessMode,
          images: [formData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
          supplier: formData.supplier,
          supplierCost,
          shippingCost,
          paymentFeePercent: 1.5,
          platformFeePercent: 0,
          profitType: 'fixed',
          profitValue: calculatedProfit,
          calculatedProfit,
          sellingPrice,
          stock: Number(formData.stock || 1),
          status: formData.status,
          sku: formData.sku,
          variants: [{ id: 'v1', name: 'Standard', options: ['Default'] }],
          rating: 5.0,
          reviewCount: 1,
          featured: false,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast('Save Error', err?.message || 'Could not save product. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="products-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Products Catalog"
        subtitle="Manage personal inventory or dropshipping items, generate public social links, and track profits."
        fallbackRoute="dashboard"
        rightElement={
          <div className="flex items-center gap-2">
            <button
              id="btn-products-import"
              onClick={() => navigateTo('import-product')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs border border-blue-200/80 transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Zap className="w-4 h-4" />
              <span>1-Click Importer</span>
            </button>

            <button
              id="btn-products-manual-add"
              onClick={() => handleOpenAdd('personal')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        }
      />

      {/* Public Store Quick Share Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">{store.name} Public Store Link</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                Publicly Accessible
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 select-all">
              {getStoreUrl(store.slug)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-copy-public-store-link"
            onClick={() => copyStoreLink(store.slug)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Copy Store Link</span>
          </button>

          <button
            id="btn-open-public-store"
            onClick={() => navigateTo('public-store', { storeSlug: store.slug })}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Store</span>
          </button>

          <button
            id="btn-share-public-store"
            onClick={() =>
              openShareModal({
                title: 'Share Your Online Store',
                subtitle: 'Share your store link on Instagram bio, TikTok, or Telegram channel.',
                url: getStoreUrl(store.slug),
              })
            }
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Store</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="products-search-input"
            type="text"
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Business Mode filter */}
          <select
            id="filter-business-mode-select"
            value={businessModeFilter}
            onChange={(e) => setBusinessModeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-hidden"
          >
            <option value="All">All Business Modes</option>
            <option value="personal">Personal Products</option>
            <option value="dropshipping">Dropshipping</option>
          </select>

          {/* Status filter */}
          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Out of stock">Out of stock</option>
          </select>

          {/* Category filter */}
          <select
            id="filter-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Sort field */}
          <select
            id="filter-sort-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium outline-hidden"
          >
            <option value="createdAt">Newest First</option>
            <option value="sellingPrice">Price: High to Low</option>
            <option value="calculatedProfit">Profit: Highest</option>
            <option value="salesCount">Best Selling</option>
          </select>
        </div>
      </div>

      {/* Products Display (Desktop Table + Mobile Cards) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">You haven't added any products yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your own personal products or import items from dropshipping suppliers.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                id="empty-add-personal-btn"
                onClick={() => handleOpenAdd('personal')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Personal Product</span>
              </button>
              <button
                id="empty-import-product-btn"
                onClick={() => navigateTo('import-product')}
                className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-all inline-flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>1-Click Importer</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-3">Mode</th>
                    <th className="py-3.5 px-3">Supplier / Origin</th>
                    <th className="py-3.5 px-3">Cost + Ship</th>
                    <th className="py-3.5 px-3">Selling Price</th>
                    <th className="py-3.5 px-3">Net Profit</th>
                    <th className="py-3.5 px-3">Stock</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Links & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.map((p) => {
                    const totalSupplierCost = p.supplierCost + p.shippingCost;
                    const isPersonal = p.businessMode === 'personal';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Product details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-slate-900 truncate leading-snug">{p.title}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                SKU: {p.sku} • {p.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Mode */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isPersonal
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isPersonal ? <Boxes className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                            <span>{isPersonal ? 'Personal' : 'Dropship'}</span>
                          </span>
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-3">
                          <span className="font-medium text-slate-800">{p.supplier || (isPersonal ? 'Own Stock' : 'Uzum Market')}</span>
                        </td>

                        {/* Cost */}
                        <td className="py-3.5 px-3">
                          <span className="text-slate-600">{formatMoney(totalSupplierCost)}</span>
                        </td>

                        {/* Selling price */}
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {formatMoney(p.sellingPrice)}
                        </td>

                        {/* Profit */}
                        <td className="py-3.5 px-3 font-bold text-emerald-600">
                          +{formatMoney(p.calculatedProfit)}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3">
                          <span className={`font-semibold ${p.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {p.stock} units
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <button
                            id={`toggle-publish-${p.id}`}
                            onClick={() => togglePublishProduct(p.id)}
                            title="Click to toggle status"
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-transform hover:scale-105 ${
                              p.status === 'Published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Draft'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.status}
                          </button>
                        </td>

                        {/* Action Buttons & Direct Links */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Copy direct link */}
                            <button
                              id={`copy-product-link-${p.id}`}
                              onClick={() => copyProductLink(p.id, store.slug)}
                              title="Copy Public Product Link"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>

                            {/* Share product modal */}
                            <button
                              id={`share-product-btn-${p.id}`}
                              onClick={() =>
                                openShareModal({
                                  title: `Share "${p.title}"`,
                                  subtitle: 'Share direct product link on Instagram, Telegram, or WhatsApp.',
                                  url: getProductUrl(store.slug, p.id),
                                  productTitle: p.title,
                                  productPrice: p.sellingPrice,
                                  productImage: p.images[0],
                                })
                              }
                              title="Share Product on Instagram/Telegram"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            {/* Open storefront page */}
                            <button
                              id={`view-store-product-${p.id}`}
                              onClick={() => navigateTo('public-product', { storeSlug: store.slug, productId: p.id })}
                              title="View Live Storefront Page"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              id={`edit-product-${p.id}`}
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Product"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Duplicate */}
                            <button
                              id={`duplicate-product-${p.id}`}
                              onClick={() => duplicateProduct(p.id)}
                              title="Duplicate"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              id={`delete-product-${p.id}`}
                              onClick={() => deleteProduct(p.id)}
                              title="Delete Product"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Product Cards View */}
            <div className="block lg:hidden divide-y divide-slate-100 p-3 space-y-3">
              {filteredProducts.map((p) => {
                const isPersonal = p.businessMode === 'personal';

                return (
                  <div key={p.id} id={`mobile-product-card-${p.id}`} className="pt-3 first:pt-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">{p.title}</h4>
                          <button
                            id={`mobile-toggle-publish-${p.id}`}
                            onClick={() => togglePublishProduct(p.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              p.status === 'Published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Draft'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.status}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                              isPersonal ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isPersonal ? 'Personal' : 'Dropship'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono truncate">
                            {p.sku} • {p.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Selling Price</span>
                            <span className="text-xs font-bold text-slate-900">{formatMoney(p.sellingPrice)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Net Profit</span>
                            <span className="text-xs font-bold text-emerald-600">+{formatMoney(p.calculatedProfit)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Stock</span>
                            <span className={`text-xs font-bold ${p.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                              {p.stock} pcs
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        onClick={() => copyProductLink(p.id, store.slug)}
                        className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-blue-200 min-h-[36px]"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>

                      <button
                        onClick={() =>
                          openShareModal({
                            title: `Share "${p.title}"`,
                            subtitle: 'Share link on Instagram, Telegram, or WhatsApp.',
                            url: getProductUrl(store.slug, p.id),
                            productTitle: p.title,
                            productPrice: p.sellingPrice,
                            productImage: p.images[0],
                          })
                        }
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 min-h-[36px]"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => navigateTo('public-product', { storeSlug: store.slug, productId: p.id })}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center border border-slate-200 min-h-[36px] min-w-[36px]"
                        title="View Live"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center border border-slate-200 min-h-[36px] min-w-[36px]"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => duplicateProduct(p.id)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center justify-center border border-slate-200 min-h-[36px] min-w-[36px]"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center justify-center border border-rose-200 min-h-[36px] min-w-[36px]"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Product Modal (with Two Business Modes) */}
      {isModalOpen && (
        <div id="product-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure your product details, business mode, pricing, and live public store link.
              </p>
            </div>

            {/* Business Mode Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Choose Business Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="mode-tab-personal"
                  onClick={() => setFormData({ ...formData, businessMode: 'personal', supplier: 'Local Warehouse' })}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    formData.businessMode === 'personal'
                      ? 'border-purple-600 bg-purple-50/80 text-purple-950 ring-2 ring-purple-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold">Personal Products</span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    For sellers with own inventory or manufactured goods.
                  </span>
                </button>

                <button
                  type="button"
                  id="mode-tab-dropship"
                  onClick={() => setFormData({ ...formData, businessMode: 'dropshipping', supplier: 'Uzum Market' })}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    formData.businessMode === 'dropshipping'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Dropshipping</span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Import from suppliers & add your profit margin.
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-input-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Handmade Leather Wallet, T-shirt, or Watch"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              {/* Image Input with Upload Option */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Product Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  )}
                  <input
                    id="modal-input-image"
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... or click Upload"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                  <label
                    className={`cursor-pointer px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors ${
                      isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>{isUploadingImage ? 'Loading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    id="modal-input-category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Clothes, Shoes, Accessories"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Stock (dona)</label>
                  <input
                    id="modal-input-stock"
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              {/* Personal Mode: Only single clean Selling Price */}
              {formData.businessMode === 'personal' ? (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
                  <label className="block font-bold text-blue-950 text-xs">
                    Mahsulot Narxi / Selling Price (UZS) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="modal-input-price"
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                      placeholder="e.g. 180000"
                      className="w-full pl-3 pr-14 py-2.5 bg-white border border-blue-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-extrabold text-base text-slate-900 shadow-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      UZS
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Mijozingiz do‘konda aynan shu narxni ko‘radi va to‘laydi: <strong className="font-extrabold">{formatMoney(formData.sellingPrice)}</strong>
                  </p>
                </div>
              ) : (
                /* Dropshipping Mode: Supplier Cost, Shipping, Selling Price & Profit */
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Supplier Platform</label>
                      <select
                        id="modal-select-supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                      >
                        <option value="Uzum Market">Uzum Market</option>
                        <option value="Alibaba">Alibaba</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Custom Supplier">Local Dropship Supplier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Supplier Cost (UZS)</label>
                      <input
                        id="modal-input-cost"
                        type="number"
                        value={formData.supplierCost}
                        onChange={(e) => setFormData({ ...formData, supplierCost: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Estimated Shipping (UZS)</label>
                      <input
                        id="modal-input-shipping"
                        type="number"
                        value={formData.shippingCost}
                        onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Customer Selling Price (UZS)</label>
                      <input
                        id="modal-input-price-dropship"
                        type="number"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-blue-400 bg-blue-50 rounded-xl outline-hidden font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold flex items-center justify-between">
                    <span>Calculated Net Profit:</span>
                    <span className="text-sm font-black text-emerald-700">
                      +{formatMoney(Math.max(0, formData.sellingPrice - (formData.supplierCost + formData.shippingCost)))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  id="modal-cancel-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="modal-save-btn"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{isSaving ? 'Saving & Publishing...' : 'Save & Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
