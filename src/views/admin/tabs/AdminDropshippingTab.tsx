import React, { useState, useEffect } from 'react';
import {
  DropshippingCategory,
  DropshippingCatalogProduct,
  Order,
  Store,
  User,
  OrderStatus,
} from '../../../types';
import { firestoreService, compressProductImageBlob, compressReceiptFile } from '../../../services/firestoreService';
import { UZBEKISTAN_REGIONS_LIST } from '../../../data/uzbekistanLocations';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  Building2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  X,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MapPin,
  User as UserIcon,
  Phone,
  Store as StoreIcon,
  RefreshCw,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface AdminDropshippingTabProps {
  orders: Order[];
  stores: Store[];
  users: User[];
  adminEmail: string;
  adminUid?: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  formatMoney: (amount: number) => string;
}

export const AdminDropshippingTab: React.FC<AdminDropshippingTabProps> = ({
  orders,
  stores,
  users,
  adminEmail,
  adminUid,
  onRefresh,
  showToast,
  formatMoney,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories' | 'orders'>('products');
  const [loading, setLoading] = useState(false);

  // Categories & Products state
  const [categories, setCategories] = useState<DropshippingCategory[]>([]);
  const [catalog, setCatalog] = useState<DropshippingCatalogProduct[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state: Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DropshippingCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    order: 1,
    isActive: true,
  });

  // Modals state: Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DropshippingCatalogProduct | null>(null);
  const [productFormData, setProductFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'],
    supplierCost: 100000,
    recommendedPrice: 180000,
    minSellingPrice: 130000,
    stock: 50,
    isAvailable: true,
    deliveryInfo: 'Barcha viloyatlarga 1-3 kunda yetkazib beriladi',
    estimatedDeliveryDays: '1-2 kun',
    isActive: true,
    supplierName: 'Sahiy Distribyutsiya',
    supplierProductCode: 'SHY-SKU-001',
    supplierUrl: 'https://sahiy.uz',
    defaultDeliveryFee: 15000,
    commissionPercent: 5,
    sku: 'DP-PROD-01',
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // Modals state: Order Details & Receipt
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewReceiptModalUrl, setViewReceiptModalUrl] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // In-app Delete Confirmation Modal State (replaces blocked window.confirm)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'product' | 'category';
    id: string;
    title: string;
  } | null>(null);

  // Sahiy / External Supplier Order Edit State
  const [supplierOrderState, setSupplierOrderState] = useState({
    supplierName: '',
    externalOrderId: '',
    supplierProductCode: '',
    supplierUrl: '',
    supplierCost: 0,
    shippingCost: 0,
    orderDate: new Date().toISOString().split('T')[0],
    estimatedArrivalDate: '',
    status: 'ordered' as NonNullable<Order['supplierOrder']>['status'],
    adminNotes: '',
  });

  // Orders Filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderRegionFilter, setOrderRegionFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Initial Data Load
  const loadDropshippingData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        firestoreService.getDropshippingCategories(false),
        firestoreService.getDropshippingCatalog(),
      ]);
      setCategories(cats);
      setCatalog(prods);
      if (cats.length > 0 && !productFormData.categoryId) {
        setProductFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err) {
      console.error('Failed to load dropshipping admin data:', err);
      showToast('Xatolik', 'Dropshipping ma‘lumotlarini yuklashda xatolik yuz berdi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropshippingData();
  }, []);

  // Update supplier order state when an order is selected
  useEffect(() => {
    if (selectedOrder) {
      const items = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
      const firstItem = items[0];
      const sup = selectedOrder.supplierOrder || {
        supplierName: firstItem?.supplier || 'Sahiy',
        externalOrderId: '',
        supplierProductCode: '',
        supplierUrl: '',
        supplierCost: selectedOrder.totalSupplierCost || firstItem?.supplierCost || 0,
        shippingCost: selectedOrder.shippingFee || 15000,
        orderDate: new Date().toISOString().split('T')[0],
        estimatedArrivalDate: '',
        status: 'not_ordered',
        adminNotes: '',
      };
      setSupplierOrderState({
        supplierName: sup.supplierName || 'Sahiy',
        externalOrderId: sup.externalOrderId || '',
        supplierProductCode: sup.supplierProductCode || '',
        supplierUrl: sup.supplierUrl || '',
        supplierCost: sup.supplierCost || 0,
        shippingCost: sup.shippingCost || 0,
        orderDate: sup.orderDate || new Date().toISOString().split('T')[0],
        estimatedArrivalDate: sup.estimatedArrivalDate || '',
        status: sup.status || 'not_ordered',
        adminNotes: sup.adminNotes || '',
      });
    }
  }, [selectedOrder]);

  // ==========================================
  // CATEGORY ACTIONS (ADMIN EXCLUSIVE)
  // ==========================================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      order: categories.length + 1,
      isActive: true,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: DropshippingCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      order: cat.order || 1,
      isActive: cat.isActive !== false,
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressProductImageBlob(file, 800, 0.85);
      setCategoryFormData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
      }));
      showToast('Rasm yuklandi', 'Kategoriya rasmi muvaffaqiyatli tanlandi.', 'success');
    } catch (err: any) {
      showToast('Xatolik', 'Rasm yuklashda xatolik yuz berdi: ' + err.message, 'error');
    }
  };

  const handleCreateInitialCategories = async () => {
    try {
      setLoading(true);
      const defaultCats = [
        {
          name: 'Elektronika va Gadjetlar',
          description: 'Smartfonlar, quloqchinlar va aqlli gadjetlar',
          imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
          order: 1,
          isActive: true,
        },
        {
          name: 'Kiyim va Poyabzallar',
          description: 'Erkaklar, ayollar va bolalar uchun sifatli kiyimlar',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          order: 2,
          isActive: true,
        },
        {
          name: 'Go‘zallik va Parvarish',
          description: 'Kosmetika, parfyumeriya va tana parvarishi',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
          order: 3,
          isActive: true,
        },
        {
          name: 'Uy va Oshxona',
          description: 'Uy-ro‘zg‘or buyumlari va qulay oshxona anjomlari',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
          order: 4,
          isActive: true,
        },
        {
          name: 'Aksessuarlar va Hamyonlar',
          description: 'Charm hamyonlar, soatlar va kamarlar',
          imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
          order: 5,
          isActive: true,
        },
      ];

      for (const cat of defaultCats) {
        const catId = `dscat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await firestoreService.saveDropshippingCategory({
          id: catId,
          ...cat,
          createdAt: new Date().toISOString(),
        });
      }
      showToast('Kategoriyalar yaratildi', 'Standart dropshipping kategoriyalari muvaffaqiyatli saqlandi.', 'success');
      await loadDropshippingData();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Kategoriyalarni yuklashda xatolik yuz berdi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Kategoriya nomi kiritilmadi', 'Iltimos, kategoriya nomini yozing', 'warning');
      return;
    }

    try {
      const catId = editingCategory?.id || `dscat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const payload: DropshippingCategory = {
        id: catId,
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim(),
        imageUrl: categoryFormData.imageUrl.trim(),
        order: Number(categoryFormData.order) || 1,
        isActive: categoryFormData.isActive,
        createdAt: editingCategory?.createdAt || new Date().toISOString(),
      };

      await firestoreService.saveDropshippingCategory(payload);
      showToast('Kategoriya saqlandi', `"${payload.name}" muvaffaqiyatli saqlandi.`, 'success');
      setIsCategoryModalOpen(false);
      await loadDropshippingData();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Kategoriyani saqlashda xatolik yuz berdi', 'error');
    }
  };

  const handleDeleteCategory = (cat: DropshippingCategory) => {
    setDeleteConfirmTarget({
      type: 'category',
      id: cat.id,
      title: cat.name,
    });
  };

  const handleToggleCategoryActive = async (cat: DropshippingCategory) => {
    try {
      const currentActive = cat.isActive !== false;
      const updated = { ...cat, isActive: !currentActive };
      await firestoreService.saveDropshippingCategory(updated);
      showToast('Kategoriya holati yangilandi', `"${cat.name}" ${updated.isActive ? 'faollashtirildi' : 'nofaol qilindi'}.`, 'success');
      await loadDropshippingData();
    } catch (err: any) {
      showToast('Xatolik', 'Kategoriya holatini o‘zgartirib bo‘lmadi', 'error');
    }
  };

  // ==========================================
  // PRODUCT ACTIONS (ADMIN EXCLUSIVE)
  // ==========================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    const defaultCatId = categories[0]?.id || '';
    setProductFormData({
      title: '',
      description: '',
      categoryId: defaultCatId,
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'],
      supplierCost: 100000,
      recommendedPrice: 180000,
      minSellingPrice: 130000,
      stock: 50,
      isAvailable: true,
      deliveryInfo: 'Barcha viloyatlarga 1-3 kunda yetkazib beriladi',
      estimatedDeliveryDays: '1-2 kun',
      isActive: true,
      supplierName: 'Sahiy Distribyutsiya',
      supplierProductCode: `SHY-${Math.floor(100 + Math.random() * 900)}`,
      supplierUrl: 'https://sahiy.uz',
      defaultDeliveryFee: 15000,
      commissionPercent: 5,
      sku: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setNewImageUrl('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: DropshippingCatalogProduct) => {
    setEditingProduct(prod);
    setProductFormData({
      title: prod.title || '',
      description: prod.description || '',
      categoryId: prod.categoryId || (categories[0]?.id || ''),
      images: prod.images && prod.images.length > 0 ? [...prod.images] : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
      supplierCost: prod.supplierCost || 0,
      recommendedPrice: prod.recommendedPrice || 0,
      minSellingPrice: prod.minSellingPrice || 0,
      stock: prod.stock ?? 50,
      isAvailable: prod.isAvailable !== false,
      deliveryInfo: prod.deliveryInfo || 'Barcha viloyatlarga 1-3 kunda yetkazib beriladi',
      estimatedDeliveryDays: prod.estimatedDeliveryDays || '1-2 kun',
      isActive: prod.isActive !== false,
      supplierName: prod.supplierName || 'Sahiy Distribyutsiya',
      supplierProductCode: prod.supplierProductCode || '',
      supplierUrl: prod.supplierUrl || '',
      defaultDeliveryFee: prod.defaultDeliveryFee || 15000,
      commissionPercent: prod.commissionPercent || 5,
      sku: prod.sku || `DP-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setNewImageUrl('');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.title.trim()) {
      showToast('Nomi kiritilmadi', 'Mahsulot nomini kiriting', 'warning');
      return;
    }
    const supplierCost = Math.max(0, Number(productFormData.supplierCost) || 0);
    const minSellingPrice = Math.max(0, Number(productFormData.minSellingPrice) || 0);
    const recommendedPrice = Math.max(0, Number(productFormData.recommendedPrice) || 0);

    if (minSellingPrice > 0 && supplierCost > 0 && minSellingPrice < supplierCost) {
      showToast('Narx xatosi', 'Eng kam sotish narxi xarid narxidan kam bo‘lmasligi lozim.', 'warning');
      return;
    }
    if (recommendedPrice > 0 && minSellingPrice > 0 && recommendedPrice < minSellingPrice) {
      showToast('Narx xatosi', 'Tavsiya etilgan narx eng kam narxdan yuqori bo‘lishi lozim.', 'warning');
      return;
    }

    setIsActionProcessing(true);
    try {
      let catId = productFormData.categoryId;
      let catName = 'Umumiy';
      const selectedCat = categories.find((c) => c.id === catId);

      if (selectedCat) {
        catName = selectedCat.name;
      } else if (categories.length > 0) {
        catId = categories[0].id;
        catName = categories[0].name;
      } else {
        // Automatically create a default category so product save never fails
        catId = `dscat_${Date.now()}`;
        catName = 'Barcha Mahsulotlar';
        await firestoreService.saveDropshippingCategory({
          id: catId,
          name: catName,
          description: 'Standart dropshipping kategoriyasi',
          imageUrl: productFormData.images[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }

      const prodId = editingProduct?.id || `dscatprod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const payload: DropshippingCatalogProduct = {
        id: prodId,
        title: (productFormData.title || '').trim(),
        description: (productFormData.description || '').trim(),
        images: (productFormData.images || []).filter(Boolean),
        categoryId: catId,
        categoryName: catName,
        supplierCost,
        recommendedPrice,
        minSellingPrice,
        stock: Number(productFormData.stock) || 0,
        isAvailable: productFormData.isAvailable !== false,
        deliveryInfo: (productFormData.deliveryInfo || 'Barcha viloyatlarga 1-3 kunda yetkazib beriladi').trim(),
        estimatedDeliveryDays: (productFormData.estimatedDeliveryDays || '1-2 kun').trim(),
        isActive: productFormData.isActive !== false,
        supplierName: (productFormData.supplierName || 'Sahiy Distribyutsiya').trim(),
        supplierProductCode: productFormData.supplierProductCode ? productFormData.supplierProductCode.trim() : undefined,
        supplierUrl: productFormData.supplierUrl ? productFormData.supplierUrl.trim() : undefined,
        defaultDeliveryFee: Number(productFormData.defaultDeliveryFee) || 15000,
        commissionPercent: Number(productFormData.commissionPercent) || 5,
        sku: (productFormData.sku || '').trim() || `DP-${Date.now().toString().slice(-4)}`,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
      };

      await firestoreService.saveDropshippingProduct(payload);
      showToast('Mahsulot saqlandi', `"${payload.title}" katalogga saqlandi.`, 'success');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadDropshippingData();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Mahsulotni saqlashda xatolik yuz berdi', 'error');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleDeleteProduct = (prod: DropshippingCatalogProduct) => {
    setDeleteConfirmTarget({
      type: 'product',
      id: prod.id,
      title: prod.title,
    });
  };

  const executeConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsActionProcessing(true);
    try {
      if (deleteConfirmTarget.type === 'product') {
        await firestoreService.deleteDropshippingProduct(deleteConfirmTarget.id);
        showToast('Mahsulot o‘chirildi', `"${deleteConfirmTarget.title}" katalogdan o‘chirildi.`, 'info');
      } else {
        const res = await firestoreService.deleteDropshippingCategory(deleteConfirmTarget.id);
        if (!res.success) {
          showToast('Kategoriyani o‘chirib bo‘lmaydi', res.error, 'error');
          setIsActionProcessing(false);
          return;
        }
        showToast('Kategoriya o‘chirildi', `"${deleteConfirmTarget.title}" tizimdan o‘chirildi.`, 'info');
      }
      setDeleteConfirmTarget(null);
      await loadDropshippingData();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'O‘chirishda xatolik yuz berdi', 'error');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleToggleProductActive = async (prod: DropshippingCatalogProduct) => {
    try {
      const currentActive = prod.isActive !== false;
      const updated = { ...prod, isActive: !currentActive };
      await firestoreService.saveDropshippingProduct(updated);
      showToast('Holat yangilandi', `"${prod.title}" ${updated.isActive ? 'faollashtirildi' : 'nofaol qilindi'}.`, 'success');
      await loadDropshippingData();
    } catch (err: any) {
      showToast('Xatolik', 'Holatni o‘zgartirib bo‘lmadi', 'error');
    }
  };

  // Image upload helper for products
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressProductImageBlob(file, 800, 0.75);
      setProductFormData((prev) => ({
        ...prev,
        images: [dataUrl, ...(prev.images || []).filter((img) => !img.startsWith('data:image')).slice(0, 4)],
      }));
      showToast('Rasm yuklandi', 'Mahsulot rasmi ro‘yxatga qo‘shildi.', 'success');
    } catch (err: any) {
      showToast('Xatolik', 'Rasm yuklashda xatolik yuz berdi: ' + (err?.message || ''), 'error');
    }
  };

  // ==========================================
  // ORDER ACTIONS: RECEIPT & SUPPLIER ORDER (SECTIONS 6, 8, 11, 13)
  // ==========================================
  const handleConfirmReceipt = async (orderId: string) => {
    setIsActionProcessing(true);
    try {
      await firestoreService.confirmOrderPayment(orderId, adminUid, adminEmail);
      showToast('To‘lov tasdiqlandi!', `#${selectedOrder?.orderNumber || orderId} to‘lovi muvaffaqiyatli tasdiqlandi.`, 'success');
      await onRefresh();
      // Update selected order in view
      const updated = await firestoreService.getOrderById(orderId);
      if (updated) setSelectedOrder(updated);
    } catch (err: any) {
      showToast('Xatolik', err.message || 'To‘lovni tasdiqlashda xatolik yuz berdi', 'error');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleRejectReceipt = async () => {
    if (!selectedOrder) return;
    if (!rejectReason.trim()) {
      showToast('Sabab kiritilmadi', 'Iltimos, rad etish sababini yozing', 'warning');
      return;
    }

    setIsActionProcessing(true);
    try {
      await firestoreService.rejectOrderPayment(selectedOrder.id, rejectReason.trim(), adminEmail, adminUid);
      showToast('Chek rad etildi', `#${selectedOrder.orderNumber} cheki rad etildi va mijozga xabar yuborildi.`, 'info');
      setIsRejectModalOpen(false);
      setRejectReason('');
      await onRefresh();
      const updated = await firestoreService.getOrderById(selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Chekni rad etishda xatolik yuz berdi', 'error');
    } finally {
      setIsActionProcessing(false);
    }
  };

  // Update External Supplier Order (Sahiy / Supplier Order - Section 13)
  const handleSaveSupplierOrder = async () => {
    if (!selectedOrder) return;
    setIsActionProcessing(true);
    try {
      let targetOrderStatus: OrderStatus | undefined = undefined;
      if (supplierOrderState.status === 'ordered') targetOrderStatus = 'Supplier Ordered';
      if (supplierOrderState.status === 'in_transit') targetOrderStatus = 'Shipped';
      if (supplierOrderState.status === 'delivered_to_hub') targetOrderStatus = 'Processing';

      await firestoreService.updateSupplierOrder(selectedOrder.id, supplierOrderState, targetOrderStatus);
      showToast('Yetkazib beruvchi ma‘lumotlari saqlandi', 'Tashqi buyurtma kodi va holati yangilandi.', 'success');
      await onRefresh();
      const updated = await firestoreService.getOrderById(selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Yetkazib beruvchi ma‘lumotlarini saqlashda xatolik', 'error');
    } finally {
      setIsActionProcessing(false);
    }
  };

  // Toggle delivery direction (Direct to customer or via seller)
  const handleToggleDeliveryDirection = async (direction: 'direct_to_customer' | 'via_seller') => {
    if (!selectedOrder) return;
    try {
      await firestoreService.updateOrder(selectedOrder.id, { deliveryDirection: direction });
      setSelectedOrder((prev) => (prev ? { ...prev, deliveryDirection: direction } : null));
      showToast('Yo‘nalish yangilandi', `Yetkazish yo‘nalishi "${direction === 'direct_to_customer' ? 'Bevosita xaridorga' : 'Avval sotuvchiga'}" deb belgilandi.`, 'success');
      await onRefresh();
    } catch (err: any) {
      showToast('Xatolik', 'Yo‘nalishni saqlashda xatolik', 'error');
    }
  };

  // Export Dropshipping Orders to CSV (Section 10 Requirement)
  const exportOrdersToCsv = () => {
    if (dropshippingOrders.length === 0) {
      showToast('Buyurtmalar yo‘q', 'Eksport qilish uchun buyurtmalar mavjud emas.', 'info');
      return;
    }

    const headers = [
      'Buyurtma Raqami',
      'Sana',
      'Xaridor Ismi',
      'Xaridor Telefoni',
      'Viloyat',
      'Tuman',
      'Ko‘cha va Uy',
      'Do‘kon Nomi',
      'Sotuvchi Ismi',
      'Mahsulotlar',
      'Jami Summa (UZS)',
      'Xarid Narxi (UZS)',
      'Sellnex Komissiyasi (UZS)',
      'Sotuvchi Foydasi (UZS)',
      'To‘lov Holati',
      'Buyurtma Holati',
      'Yetkazish Turi',
      'Tashqi Buyurtma Kodi',
    ];

    const rows = dropshippingOrders.map((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const itemsStr = items.map((i) => `${i?.title || 'Mahsulot'} (${i?.quantity || 1}x)`).join('; ');
      return [
        o.orderNumber || '',
        o.createdAt ? new Date(o.createdAt).toLocaleDateString('uz-UZ') : '',
        `"${o.customerName || ''}"`,
        `"${o.customerPhone || ''}"`,
        `"${o.shippingAddress?.region || ''}"`,
        `"${o.shippingAddress?.district || ''}"`,
        `"${o.shippingAddress?.streetAddress || ''}"`,
        `"${o.storeName || ''}"`,
        `"${o.sellerName || ''}"`,
        `"${itemsStr}"`,
        o.totalAmount || 0,
        o.totalSupplierCost || 0,
        o.commissionAmount || Math.round((o.totalAmount || 0) * 0.05),
        o.sellerProfitAmount || Math.max(0, (o.totalAmount || 0) - (o.totalSupplierCost || 0) - (o.shippingFee || 0) - Math.round((o.totalAmount || 0) * 0.05)),
        o.paymentStatus || '',
        o.orderStatus || '',
        o.deliveryDirection === 'via_seller' ? 'Avval sotuvchiga' : 'Bevosita xaridorga',
        `"${o.supplierOrder?.externalOrderId || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sellnex_Dropshipping_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Eksport qilindi', 'Dropshipping buyurtmalari CSV faylga yuklandi.', 'success');
  };

  // Filter dropshipping orders from global orders
  const dropshippingOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const items = Array.isArray(o.items) ? o.items : [];
    // If explicitly marked as dropshipping or contains dropshipping catalog items
    const isDropship =
      o.businessMode === 'dropshipping' ||
      items.some((i) => i && (i.businessMode === 'dropshipping' || i.catalogProductId || (i.supplier && i.supplier !== 'Local Warehouse')));

    if (!isDropship) return false;

    // Filters
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderRegionFilter !== 'all' && o.shippingAddress?.region !== orderRegionFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const match =
        Boolean(o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        Boolean(o.customerName && o.customerName.toLowerCase().includes(q)) ||
        Boolean(o.customerPhone && o.customerPhone.includes(q)) ||
        Boolean(o.supplierOrder?.externalOrderId && o.supplierOrder.externalOrderId.toLowerCase().includes(q)) ||
        items.some((i) => Boolean(i?.title && i.title.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* Top Header & Sub-Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">Dropshipping Markazi</h2>
              <span className="bg-blue-600/30 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/40 uppercase">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Barcha kategoriyalar, xarid narxlari va dropshipping buyurtmalari boshqaruvi
            </p>
          </div>
        </div>

        {/* 3 Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'products' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Katalog ({catalog.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'categories' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kategoriyalar ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Buyurtmalar ({dropshippingOrders.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: PRODUCTS CATALOG MANAGEMENT (ADMIN EXCLUSIVE) */}
      {/* ======================================================== */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Katalog mahsulotlarini qidirish..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Barcha Kategoriyalar</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yangi Mahsulot Qo‘shish</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Mahsulot</th>
                    <th className="py-3 px-4">Kategoriya</th>
                    <th className="py-3 px-4">Xarid Narxi</th>
                    <th className="py-3 px-4">Tavsiya / Eng Kam</th>
                    <th className="py-3 px-4">Yetkazib Beruvchi</th>
                    <th className="py-3 px-4">Zaxira</th>
                    <th className="py-3 px-4">Holati</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {catalog.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Boxes className="w-10 h-10 mx-auto mb-3 opacity-30 text-blue-400" />
                        <p className="font-bold text-sm text-slate-300">Hozircha dropshipping tovarlari mavjud emas</p>
                        <p className="text-xs text-slate-500 mt-1">Yangi tovar qo‘shish tugmasi orqali katalogga mahsulot yuklang.</p>
                        <button
                          type="button"
                          onClick={handleOpenAddProduct}
                          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Birinchi Mahsulotni Yuklash</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    catalog
                      .filter((p) => {
                        const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
                        const q = searchQuery.toLowerCase().trim();
                        const matchSearch =
                          !q ||
                          Boolean(p.title && p.title.toLowerCase().includes(q)) ||
                          Boolean(p.sku && p.sku.toLowerCase().includes(q)) ||
                          Boolean(p.supplierName && p.supplierName.toLowerCase().includes(q));
                        return matchCat && matchSearch;
                      })
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100'}
                                alt=""
                                className="w-12 h-12 object-cover rounded-xl border border-slate-700 shrink-0 bg-slate-950"
                              />
                            <div>
                              <div className="font-bold text-white text-xs line-clamp-1">{prod.title}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {prod.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">{prod.categoryName}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {formatMoney(prod.supplierCost)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-blue-400">{formatMoney(prod.recommendedPrice)}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Min: {formatMoney(prod.minSellingPrice)}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-200 block">{prod.supplierName}</span>
                          {prod.supplierProductCode && (
                            <span className="text-[10px] text-slate-500 font-mono">{prod.supplierProductCode}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              prod.stock > 10 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {prod.stock} dona
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleProductActive(prod)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                              prod.isActive !== false
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {prod.isActive !== false ? 'Faol (Sotuvda)' : 'Nofaol'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: CATEGORIES MANAGEMENT (ADMIN EXCLUSIVE) */}
      {/* ======================================================== */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Dropshipping Kategoriyalari</h3>
              <p className="text-xs text-slate-400">
                Faqat admin tomonidan boshqariladi. Yangi tovarlar yuklash uchun kategoriyalarni yarating.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateInitialCategories}
                disabled={loading}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                title="Tizimga standart 5 ta kategoriyani avtomatik qo‘shish"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Standart Kategoriyalarni Yuklash</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yangi Kategoriya</span>
              </button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Layers className="w-7 h-7 text-blue-400" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-bold text-white text-sm">Kategoriyalar mavjud emas</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mahsulotlarni guruhlash uchun standart kategoriyalarni bir tugma bilan yuklashingiz yoki o‘zingiz xohlagan yangi kategoriyani kiritishingiz mumkin.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateInitialCategories}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Standart 5 ta Kategoriyani Yuklash</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Noldan Kategoriya Yaratish</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const productCount = catalog.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={cat.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200'}
                      alt=""
                      className="w-16 h-16 object-cover rounded-xl border border-slate-700 shrink-0 bg-slate-950"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm truncate">{cat.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryActive(cat)}
                          title="Holatni o‘zgartirish (Faol / Nofaol)"
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded cursor-pointer transition ${
                            cat.isActive !== false ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/60' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          {cat.isActive !== false ? 'Faol' : 'Nofaol'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {cat.description || 'Tavsif kiritilmagan'}
                      </p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Tartib raqami: <strong className="text-slate-300">#{cat.order || 1}</strong> • Mahsulotlar: <strong className="text-blue-400">{productCount} ta</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>O‘chirish</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: DROPSHIPPING ORDERS & FULFILLMENT (SECTIONS 6, 10, 11, 13) */}
      {/* ======================================================== */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Top Controls: Filter by Region, Status, Search & Export */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Buyurtma #, xaridor yoki Sahiy ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="all">Barcha Holatlar</option>
                <option value="Pending">Yangi (Pending)</option>
                <option value="pending_payment_verification">To‘lov tekshirilmoqda</option>
                <option value="confirmed">To‘lov tasdiqlangan</option>
                <option value="Supplier Ordered">Yetkazib beruvchiga berildi</option>
                <option value="Shipped">Yo‘lda (Kuryerda)</option>
                <option value="Delivered">Yetkazib berildi</option>
                <option value="Cancelled">Bekor qilingan</option>
              </select>

              {/* Region Filter */}
              <select
                value={orderRegionFilter}
                onChange={(e) => setOrderRegionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 max-w-[180px]"
              >
                <option value="all">Barcha Viloyatlar</option>
                {UZBEKISTAN_REGIONS_LIST.map((r) => (
                  <option key={r.region} value={r.region}>
                    {r.region}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportOrdersToCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV Eksport</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Buyurtma</th>
                    <th className="py-3 px-4">Xaridor</th>
                    <th className="py-3 px-4">Hudud</th>
                    <th className="py-3 px-4">Sotuvchi & Do‘kon</th>
                    <th className="py-3 px-4">Mahsulot</th>
                    <th className="py-3 px-4">Summa & Foyda</th>
                    <th className="py-3 px-4">To‘lov / Chek</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4 text-right">Boshqarish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dropshippingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-xs">Hozircha dropshipping buyurtmalari mavjud emas</p>
                      </td>
                    </tr>
                  ) : (
                    dropshippingOrders.map((order) => {
                      const items = Array.isArray(order.items) ? order.items : [];
                      const firstItem = items[0];
                      const hasReceipt = Boolean(order.receiptUrl);
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-white text-xs">{order.orderNumber}</span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{order.customerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 font-medium block">
                              {order.shippingAddress?.region || 'Toshkent'}
                            </span>
                            <span className="text-[10px] text-slate-500">{order.shippingAddress?.district}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-blue-400 block">{order.storeName || 'Sellnex Do‘koni'}</span>
                            <span className="text-[10px] text-slate-400">{order.sellerName || 'Sotuvchi'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 max-w-xs">
                              {firstItem?.image && (
                                <img
                                  src={firstItem.image}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                                />
                              )}
                              <span className="text-xs text-slate-300 truncate font-medium">
                                {firstItem?.title || 'Mahsulot'} {items.length > 1 && `(+${items.length - 1})`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-black text-white">{formatMoney(order.totalAmount)}</div>
                            <div className="text-[10px] text-emerald-400 font-bold">
                              Foyda: +{formatMoney(order.sellerProfitAmount || 0)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.paymentStatus === 'paid' || order.paymentStatus === 'Paid'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : order.paymentStatus === 'pending_verification'
                                    ? 'bg-amber-950 text-amber-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {order.paymentStatus}
                              </span>
                              {hasReceipt && (
                                <button
                                  onClick={() => setViewReceiptModalUrl(order.receiptUrl || null)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400"
                                  title="Chekni ko‘rish"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200">
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-sm"
                            >
                              Ko‘rish
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: UNIFIED SINGLE-PAGE ORDER ROUTING DETAILS (SECTIONS 10, 11) */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl text-slate-200 space-y-6 animate-scaleIn max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">Buyurtma #{selectedOrder.orderNumber}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[10px] font-extrabold border border-blue-800">
                      Dropshipping Modeli
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Sana: {new Date(selectedOrder.createdAt).toLocaleString('uz-UZ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* SECTION 11 REQUIREMENT: WHERE ORDER CAME FROM AND WHERE IT GOES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Box 1: Origin & Seller */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <StoreIcon className="w-4 h-4" />
                    <span>Sotuvchi va Do‘kon Ma‘lumotlari</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Do‘kon nomi:</span>
                      <span className="font-bold text-white">{selectedOrder.storeName || 'Sellnex Do‘koni'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sotuvchi ID:</span>
                      <span className="font-mono text-slate-300">{selectedOrder.ownerId || 'Mavjud emas'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mahsulot manbai:</span>
                      <span className="font-bold text-amber-400">
                        {selectedOrder.supplierOrder?.supplierName || selectedOrder.items[0]?.supplier || 'Sahiy Ombori'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Qayerdan keladi:</span>
                      <span className="font-semibold text-slate-300">
                        Yetkazib beruvchi markaziy tarqatish ombori (Toshkent)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Box 2: Destination & Customer */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>Xaridor va Qayerga Borishi (Manzil)</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Qabul qiluvchi:</span>
                      <span className="font-bold text-white">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Telefon:</span>
                      <a href={`tel:${selectedOrder.customerPhone}`} className="font-mono font-bold text-blue-400 hover:underline">
                        {selectedOrder.customerPhone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Viloyat va Tuman:</span>
                      <span className="font-semibold text-white">
                        {selectedOrder.shippingAddress?.region}, {selectedOrder.shippingAddress?.district}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">To‘liq manzil:</span>
                      <span className="font-medium text-slate-300 text-right max-w-xs">
                        {selectedOrder.shippingAddress?.streetAddress || 'Ko‘rsatilmagan'}
                      </span>
                    </div>
                    {selectedOrder.shippingAddress?.notes && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mo‘ljal / Izoh:</span>
                        <span className="text-amber-300 text-right max-w-xs">{selectedOrder.shippingAddress.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Direction Selector (Section 9 Requirement) */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Yetkazish Yo‘nalishi (Routing Type):</span>
                  <span className="text-[11px] text-slate-400">
                    Mahsulot yetkazib beruvchidan kimga yuborilishi kerakligini belgilang.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleDeliveryDirection('direct_to_customer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedOrder.deliveryDirection !== 'via_seller'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    1. Bevosita xaridorga
                  </button>
                  <button
                    onClick={() => handleToggleDeliveryDirection('via_seller')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedOrder.deliveryDirection === 'via_seller'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    2. Avval sotuvchiga
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Buyurtma qilingan mahsulotlar ({(selectedOrder.items || []).length})
                </span>
                <div className="divide-y divide-slate-850">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item?.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-slate-800"
                        />
                        <div>
                          <h5 className="font-bold text-white text-xs">{item?.title || 'Mahsulot'}</h5>
                          <span className="text-[10px] text-slate-400">
                            Soni: {item?.quantity || 1} dona • Xarid: {formatMoney(item?.supplierCost || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-white text-xs">
                          {formatMoney((item?.sellingPrice || 0) * (item?.quantity || 1))}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          Foyda: +{formatMoney((item?.profit || 0) * (item?.quantity || 1))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown & Balances (Sections 5, 12 Requirement) */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Moliyaviy Hisob-Kitob (Snapshot)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Jami Xarid Narxi:</span>
                    <span className="font-mono font-bold text-white text-xs mt-0.5 block">
                      {formatMoney(selectedOrder.totalSupplierCost || 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Yetkazib Berish:</span>
                    <span className="font-mono font-bold text-white text-xs mt-0.5 block">
                      {formatMoney(selectedOrder.shippingFee || 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Sellnex Komissiyasi:</span>
                    <span className="font-mono font-bold text-blue-400 text-xs mt-0.5 block">
                      {formatMoney(selectedOrder.commissionAmount || Math.round(selectedOrder.totalAmount * 0.05))}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/60">
                    <span className="text-[10px] text-emerald-400 block font-bold">Sotuvchi Sof Foydasi:</span>
                    <span className="font-mono font-black text-emerald-300 text-xs mt-0.5 block">
                      +{formatMoney(selectedOrder.sellerProfitAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Verification Section (Section 8 Requirement) */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>To‘lov Cheki Tekshiruvi (Receipt Verification)</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-950 text-emerald-400'
                        : selectedOrder.paymentStatus === 'rejected'
                        ? 'bg-rose-950 text-rose-400'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    Holat: {selectedOrder.paymentStatus}
                  </span>
                </div>

                {selectedOrder.receiptUrl ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setViewReceiptModalUrl(selectedOrder.receiptUrl || null)}
                        className="relative group cursor-pointer w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950"
                      >
                        <img src={selectedOrder.receiptUrl} alt="Chek" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">
                          {selectedOrder.receiptFileName || 'To‘lov cheki fayli'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Yuklangan: {selectedOrder.receiptUploadedAt ? new Date(selectedOrder.receiptUploadedAt).toLocaleString('uz-UZ') : 'Yaqinda'}
                        </span>
                        {selectedOrder.receiptTxNumber && (
                          <span className="text-[10px] font-mono text-blue-400 block">
                            Tranzaksiya: {selectedOrder.receiptTxNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmReceipt(selectedOrder.id)}
                        disabled={isActionProcessing || selectedOrder.paymentStatus === 'paid'}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tasdiqlash</span>
                      </button>
                      <button
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={isActionProcessing || selectedOrder.paymentStatus === 'rejected'}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rad etish</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 rounded-xl text-center text-xs text-slate-400">
                    Xaridor hali to‘lov chekini yuklamagan.
                  </div>
                )}
              </div>

              {/* External Supplier Order (Sahiy / Supplier Order - Section 13 Requirement) */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Sahiy / Tashqi Yetkazib Beruvchiga Buyurtma Berish</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Yetkazib beruvchi nomi:</label>
                    <input
                      type="text"
                      value={supplierOrderState.supplierName}
                      onChange={(e) => setSupplierOrderState({ ...supplierOrderState, supplierName: e.target.value })}
                      placeholder="Sahiy Distribyutsiya"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tashqi buyurtma raqami (Sahiy ID):</label>
                    <input
                      type="text"
                      value={supplierOrderState.externalOrderId}
                      onChange={(e) => setSupplierOrderState({ ...supplierOrderState, externalOrderId: e.target.value })}
                      placeholder="SHY-ORD-10924"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Yetkazib beruvchi buyurtma holati:</label>
                    <select
                      value={supplierOrderState.status}
                      onChange={(e) => setSupplierOrderState({ ...supplierOrderState, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="not_ordered">Yetkazib beruvchiga berilmagan</option>
                      <option value="ordered">Buyurtma berildi (Ordered)</option>
                      <option value="in_transit">Yo‘lda / Kuryerda (In Transit)</option>
                      <option value="delivered_to_hub">Omborga yetib keldi (At Hub)</option>
                      <option value="delivered_to_customer">Xaridorga topshirildi</option>
                      <option value="cancelled">Bekor qilindi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Taxminiy yetib kelish sanasi:</label>
                    <input
                      type="date"
                      value={supplierOrderState.estimatedArrivalDate}
                      onChange={(e) => setSupplierOrderState({ ...supplierOrderState, estimatedArrivalDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSupplierOrder}
                    disabled={isActionProcessing}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Yetkazib beruvchi ma‘lumotlarini yangilash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FULL RECEIPT PHOTO ZOOM VIEW (SECTION 8) */}
      {/* ======================================================== */}
      {viewReceiptModalUrl && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-2xl w-full flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between text-white">
              <span className="font-bold text-sm">To‘lov Cheki (Kattalashtirilgan ko‘rinish)</span>
              <button
                onClick={() => setViewReceiptModalUrl(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center">
              <img
                src={viewReceiptModalUrl}
                alt="Chek"
                className="max-h-[78vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REJECT RECEIPT REASON INPUT */}
      {/* ======================================================== */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-black text-white text-base">To‘lov chekini rad etish</h4>
            <p className="text-xs text-slate-400">
              Xaridorga chek nima uchun rad etilganligini tushuntiring (masalan: summa yetarli emas yoki skrinshot ko‘rinmayapti).
            </p>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masalan: Chekdagi summa to‘liq emas yoki chek matni xiralashgan..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectReceipt}
                disabled={isActionProcessing || !rejectReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Rad etishni tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CREATE / EDIT DROPSHIPPING PRODUCT (ADMIN ONLY) */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 space-y-5 animate-scaleIn max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <h3 className="font-black text-base text-white">
                {editingProduct ? 'Mahsulotni Tahrirlash' : 'Katalogga Yangi Mahsulot Qo‘shish'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Mahsulot Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productFormData.title}
                  onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                  placeholder="Masalan: Simsiz Bluetooth Quloqchin Pro ANC"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kategoriya</label>
                  <select
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {categories.length === 0 && (
                      <option value="">Standart Kategoriya (Avtomatik yaratiladi)</option>
                    )}
                    {productFormData.categoryId && !categories.some((c) => c.id === productFormData.categoryId) && (
                      <option value={productFormData.categoryId}>
                        {editingProduct?.categoryName || 'Mavjud Kategoriya'}
                      </option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">SKU / Kod</label>
                  <input
                    type="text"
                    value={productFormData.sku}
                    onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Price Fields (Section 3 Requirement) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                    Xarid Narxi (UZS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={productFormData.supplierCost}
                    onChange={(e) => setProductFormData({ ...productFormData, supplierCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                    Eng Kam Sotish Narxi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={productFormData.minSellingPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, minSellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                    Tavsiya Etilgan Narx <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={productFormData.recommendedPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, recommendedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-blue-400 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Supplier Info (Section 3 & 13) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Yetkazib Beruvchi Nomi</label>
                  <input
                    type="text"
                    value={productFormData.supplierName}
                    onChange={(e) => setProductFormData({ ...productFormData, supplierName: e.target.value })}
                    placeholder="Sahiy Distribyutsiya"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Yetkazib Beruvchi Kodi (SKU)</label>
                  <input
                    type="text"
                    value={productFormData.supplierProductCode}
                    onChange={(e) => setProductFormData({ ...productFormData, supplierProductCode: e.target.value })}
                    placeholder="SHY-0092"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Yetkazib Berish Muddati</label>
                  <input
                    type="text"
                    value={productFormData.estimatedDeliveryDays}
                    onChange={(e) => setProductFormData({ ...productFormData, estimatedDeliveryDays: e.target.value })}
                    placeholder="1-2 kun"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tashqi Mahsulot Havolasi (Sahiy / Uzum URL)</label>
                <input
                  type="url"
                  value={productFormData.supplierUrl}
                  onChange={(e) => setProductFormData({ ...productFormData, supplierUrl: e.target.value })}
                  placeholder="https://sahiy.uz/product/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Images list with upload & add url */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-400 font-bold">Mahsulot Rasmlari</label>
                  <label className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fayldan yuklash</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Rasm URL havolasi (https://...)"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        setProductFormData((prev) => ({
                          ...prev,
                          images: [...prev.images, newImageUrl.trim()],
                        }));
                        setNewImageUrl('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                  >
                    Qo‘shish
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {productFormData.images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setProductFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Batafsil Tavsif</label>
                <textarea
                  rows={3}
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Mahsulot afzalliklari va texnik xususiyatlari..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isActive}
                    onChange={(e) => setProductFormData({ ...productFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">Katalogda faol (ko‘rinadigan)</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isAvailable}
                    onChange={(e) => setProductFormData({ ...productFormData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">Omborda mavjud</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isActionProcessing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {isActionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingProduct ? 'O‘zgarishlarni Saqlash' : 'Mahsulotni Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: CREATE / EDIT CATEGORY (ADMIN ONLY) */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base">
                {editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Yaratish'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Kategoriya Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Masalan: Elektronika & Gadjetlar"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Kategoriya tavsifi..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-400 font-bold">Kategoriya Rasmi</label>
                  <label className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fayldan rasm yuklash</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  {categoryFormData.imageUrl && (
                    <img
                      src={categoryFormData.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-700 shrink-0 bg-slate-950"
                    />
                  )}
                  <input
                    type="url"
                    value={categoryFormData.imageUrl}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tartib Raqami</label>
                  <input
                    type="number"
                    min={1}
                    value={categoryFormData.order}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryFormData.isActive}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs font-semibold text-white">Faol holatda</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Kategoriyani Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* MODAL 6: IN-APP DELETE CONFIRMATION (REPLACES BLOCKED WINDOW.CONFIRM) */}
      {/* ======================================================== */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-white text-base">
                {deleteConfirmTarget.type === 'product' ? 'Mahsulotni o‘chirish' : 'Kategoriyani o‘chirish'}
              </h4>
              <p className="text-xs text-slate-400">
                Rostdan ham <strong className="text-white">"{deleteConfirmTarget.title}"</strong> ni tizimdan butunlay o‘chirmoqchimisiz?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={isActionProcessing}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={executeConfirmDelete}
                disabled={isActionProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isActionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Ha, butunlay o‘chirish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
