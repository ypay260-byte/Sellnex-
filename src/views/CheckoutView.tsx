import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { firestoreService } from '../services/firestoreService';
import { AdminSettings, Order } from '../types';
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Phone,
  MapPin,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Building2,
  FileCheck,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutView: React.FC = () => {
  const {
    store,
    publicStore,
    cart,
    cartTotal,
    createOrder,
    clearCart,
    navigateTo,
    routeParams,
    formatMoney,
    showToast,
    currentUser,
  } = useApp();

  const activeStore = publicStore || store;

  // Step state: 'form' | 'payment'
  const [currentStep, setCurrentStep] = useState<'form' | 'payment'>('form');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+998 ');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [region, setRegion] = useState('Toshkent shahri');
  const [district, setDistrict] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [zipCode, setZipCode] = useState(''); // Optional ZIP code
  const [notes, setNotes] = useState('');

  // Shipping & Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<'Standard' | 'Express' | 'Pickup'>('Standard');

  // Receipt File and Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [txReceiptNumber, setTxReceiptNumber] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Admin settings for P2P Card
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

  // If orderId is in routeParams, immediately load order and switch to payment step
  useEffect(() => {
    const existingOrderId = routeParams.orderId;
    if (existingOrderId) {
      firestoreService.getOrderById(existingOrderId).then((ord) => {
        if (ord) {
          setActiveOrder(ord);
          setCurrentStep('payment');
        }
      });
    }
  }, [routeParams.orderId]);

  // Load Admin Central Card settings from Firestore
  useEffect(() => {
    let isMounted = true;
    firestoreService
      .getAdminSettings()
      .then((settings) => {
        if (isMounted && settings) {
          setAdminSettings(settings);
        }
      })
      .catch((err) => {
        console.warn('Failed to load admin settings in checkout:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen in real-time to active order changes (when admin confirms or rejects payment)
  useEffect(() => {
    if (!activeOrder?.id) return;
    const unsubscribe = firestoreService.onOrderSnapshot(activeOrder.id, (updated) => {
      if (updated) {
        setActiveOrder(updated);
        if (updated.paymentStatus === 'paid' && activeOrder.paymentStatus !== 'paid') {
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          showToast('To‘lov tasdiqlandi!', 'Buyurtmangiz muvaffaqiyatli tasdiqlandi.', 'success');
        } else if (updated.paymentStatus === 'rejected' && activeOrder.paymentStatus !== 'rejected') {
          showToast('To‘lov rad etildi', updated.receiptRejectedReason || 'Iltimos, yangi chek yuklang.', 'error');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeOrder?.id, activeOrder?.paymentStatus]);

  const uzbekistanRegions = [
    'Toshkent shahri',
    'Toshkent viloyati',
    'Samarqand viloyati',
    'Buxoro viloyati',
    'Farg‘ona viloyati',
    'Andijon viloyati',
    'Namangan viloyati',
    'Qashqadaryo viloyati',
    'Surxondaryo viloyati',
    'Jizzax viloyati',
    'Navoiy viloyati',
    'Sirdaryo viloyati',
    'Xorazm viloyati',
    'Qoraqalpog‘iston Respublikasi',
  ];

  const deliveryPrices = {
    Standard: 25000,
    Express: 45000,
    Pickup: 0,
  };

  const currentDeliveryCost = deliveryPrices[deliveryMethod];
  const grandTotal = (cartTotal || 0) + currentDeliveryCost;

  // Sellnex Payment Card from Admin Settings
  const sellnexCardNumber = adminSettings?.p2pCardNumber || '8600 3141 7549 7736';
  const sellnexCardHolder = adminSettings?.p2pCardHolder || 'Sellnex Bosh Administratsiyasi';
  const sellnexBankName = adminSettings?.p2pBankName || 'Milliy Bank / Uzcard Humo';

  const handleCopyCard = () => {
    const rawCard = sellnexCardNumber.replace(/\s+/g, '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawCard);
    }
    setCopiedCard(true);
    showToast('Karta nusxalandi', `${sellnexCardNumber} buferga nusxalandi`, 'success');
    setTimeout(() => setCopiedCard(false), 3000);
  };

  // Phone validation: must have at least 9 numeric digits
  const validatePhone = (num: string): boolean => {
    const digitsOnly = num.replace(/\D/g, '');
    // Standard uzbek phone is 9 digits (local) or 12 digits (+998XXXXXXXXX)
    return digitsOnly.length >= 9;
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError && validatePhone(val)) {
      setPhoneError(null);
    }
  };

  // Step 1: Submit Customer & Delivery Information -> Create Order in Firestore
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Ism kiritilmadi', 'Iltimos, ism va familiyangizni kiriting.', 'warning');
      return;
    }

    if (!phone.trim() || !validatePhone(phone)) {
      setPhoneError('Telefon raqami kamida 9 ta raqamdan iborat bo‘lishi kerak (masalan: +998 90 123 45 67)');
      showToast('Telefon xato', 'Iltimos, to‘g‘ri telefon raqamini kiriting.', 'warning');
      return;
    }

    if (!district.trim()) {
      showToast('Tuman kiritilmadi', 'Iltimos, tuman yoki shaharni kiriting.', 'warning');
      return;
    }

    if (!streetAddress.trim()) {
      showToast('Manzil kiritilmadi', 'Iltimos, to‘liq yetkazib berish manzilini kiriting.', 'warning');
      return;
    }

    if (!cart || cart.length === 0) {
      showToast('Savat bo‘sh', 'Xarid qilish uchun avval mahsulot tanlang.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        image:
          item.product.images?.[0] ||
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
        sellingPrice: item.product.sellingPrice,
        quantity: item.quantity,
        variant: item.selectedVariant,
        supplierCost: item.product.supplierCost || Math.round(item.product.sellingPrice * 0.7),
        profit:
          item.product.sellingPrice - (item.product.supplierCost || Math.round(item.product.sellingPrice * 0.7)),
        supplier: item.product.supplier || 'Sellnex Warehouse',
      }));

      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

      const deliveryAddr = {
        fullName: customerName.trim(),
        phone: phone.trim(),
        region,
        district: district.trim(),
        streetAddress: streetAddress.trim(),
        zipCode: zipCode.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const resolvedStoreId =
        activeStore?.id ||
        routeParams.storeId ||
        (cart.length > 0 ? cart[0].product.storeId : '') ||
        store.id;
      const resolvedOwnerId =
        activeStore?.ownerId ||
        publicStore?.ownerId ||
        store.ownerId ||
        '';

      const created = await createOrder({
        storeId: resolvedStoreId,
        ownerId: resolvedOwnerId,
        customerId: currentUser?.id || undefined,
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        deliveryAddress: deliveryAddr,
        shippingAddress: deliveryAddr,
        items: orderItems,
        quantity: totalQuantity,
        subtotal: cartTotal,
        shippingFee: currentDeliveryCost,
        paymentFee: 0,
        totalAmount: grandTotal,
        totalSupplierCost: orderItems.reduce((acc, it) => acc + it.supplierCost * it.quantity, 0),
        totalProfit: orderItems.reduce((acc, it) => acc + it.profit * it.quantity, 0),
        paymentMethod: 'Sellnex Card',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        deliveryMethod,
      });

      setActiveOrder(created);
      clearCart();
      setCurrentStep('payment');
      showToast('Buyurtma yaratildi', 'Endi to‘lovni amalga oshirib, chekni yuklang.', 'info');
    } catch (err: any) {
      console.error('Order creation error:', err);
      showToast('Xatolik yuz berdi', err.message || 'Buyurtma yaratishda xatolik', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Receipt File Selection & Drag-and-Drop
  const handleFileSelect = (file: File) => {
    setReceiptError(null);

    // Validate type: JPG, JPEG, PNG, WEBP, PDF
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || extension === 'pdf';

    if (!validExtensions.includes(extension) && !isImage && !isPdf) {
      setReceiptError("Faqat JPG, JPEG, PNG, WEBP yoki PDF formatdagi cheklar qabul qilinadi.");
      return;
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setReceiptError("Fayl hajmi 10 MB dan oshmasligi kerak.");
      return;
    }

    setReceiptFile(file);

    // Preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 2: Upload Receipt to Firebase Storage & Submit Payment Verification
  const handleSubmitPaymentConfirmation = async () => {
    if (!receiptFile) {
      setReceiptError("To‘lov chekini yuklash MAJBURIY. Iltimos, chek faylini tanlang.");
      showToast('Chek yuklanmagan', "Iltimos, to‘lov chekini yuklang.", 'warning');
      return;
    }

    if (!activeOrder) {
      showToast('Buyurtma topilmadi', 'Iltimos, qaytadan urinib ko‘ring.', 'error');
      return;
    }

    setIsUploadingReceipt(true);
    setReceiptError(null);

    try {
      // 1. Upload to real Firebase Storage (with fallback)
      const downloadUrl = await firestoreService.uploadReceipt(activeOrder.id, receiptFile);

      // 2. Submit to Firestore with paymentStatus = 'pending_verification'
      await firestoreService.submitOrderReceipt(
        activeOrder.id,
        downloadUrl,
        receiptFile.name,
        receiptFile.type,
        txReceiptNumber.trim() || undefined
      );

      // 3. Update local state
      setActiveOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: 'pending_verification',
              receiptUrl: downloadUrl,
              receiptFileName: receiptFile.name,
              receiptFileType: receiptFile.type,
              receiptTxNumber: txReceiptNumber.trim() || undefined,
            }
          : null
      );

      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      showToast(
        'To‘lov cheki yuborildi!',
        'To‘lov cheki qabul qilindi va administrator tomonidan tekshirilmoqda.',
        'success'
      );
    } catch (err: any) {
      console.error('Error uploading receipt:', err);
      setReceiptError(err.message || 'Chekni yuklashda xatolik yuz berdi.');
      showToast('Xatolik', 'Chekni yuklashda xatolik yuz berdi.', 'error');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const primaryColor = activeStore?.theme?.primaryColor || activeStore?.primaryColor || '#2563eb';

  // Empty cart fallback (only if not already in payment step with active order)
  if (currentStep === 'form' && (!cart || cart.length === 0)) {
    return (
      <div id="checkout-view-empty" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Savatingiz hozircha bo‘sh</h2>
          <p className="text-xs text-slate-500">
            Buyurtma berish uchun avval do‘kondan o‘zingizga ma’qul mahsulotni savatga qo‘shing.
          </p>
          <button
            onClick={() =>
              navigateTo('public-store', {
                storeSlug: activeStore?.slug || store.slug,
                storeId: activeStore?.id || store.id,
              })
            }
            style={{ backgroundColor: primaryColor }}
            className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Do‘konga qaytish</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 2: SELLNEX CARD PAYMENT & RECEIPT UPLOAD
  // ==========================================
  if (currentStep === 'payment' && activeOrder) {
    const isPendingVerification = activeOrder.paymentStatus === 'pending_verification';
    const isPaid = activeOrder.paymentStatus === 'paid' || activeOrder.paymentStatus === 'Paid';
    const isRejected = activeOrder.paymentStatus === 'rejected';

    return (
      <div id="checkout-payment-root" className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                navigateTo('public-store', {
                  storeSlug: activeStore?.slug || store.slug,
                  storeId: activeStore?.id || store.id,
                })
              }
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Do‘konga qaytish</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                {activeOrder.orderNumber}
              </span>
            </div>
          </div>

          {/* LIVE STATUS BANNER */}
          {isPaid && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-md animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                To‘lov tasdiqlandi
              </span>
              <h2 className="text-2xl font-black text-slate-900">To‘lovingiz Muvaffaqiyatli Tasdiqlandi!</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Buyurtmangiz tasdiqlandi va yetkazib berishga topshirildi. Kuryerimiz tez orada siz bilan bog‘lanadi.
              </p>
              <div className="pt-2">
                <button
                  onClick={() =>
                    navigateTo('order-success', {
                      orderId: activeOrder.id,
                      storeSlug: activeStore?.slug || store.slug,
                      storeId: activeStore?.id || store.id,
                    })
                  }
                  style={{ backgroundColor: primaryColor }}
                  className="px-6 py-3 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
                >
                  Buyurtma holatini kuzatish
                </button>
              </div>
            </div>
          )}

          {isPendingVerification && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-md animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-10 h-10" />
              </div>
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Tekshiruv kutilmoqda
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">To‘lov cheki tekshirilmoqda...</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Platforma administratori chekingizni tekshirmoqda. Odatda bu <strong>5-15 daqiqa</strong> vaqt oladi.
                Sahifani yopishingiz mumkin, tasdiqlanganda status avtomatik yangilanadi.
              </p>
              {activeOrder.receiptUrl && (
                <div className="pt-2 flex items-center justify-center gap-2 text-xs">
                  <a
                    href={activeOrder.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    <span>Yuklangan chekni ko‘rish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {isRejected && (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-md animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                To‘lov rad etildi
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                To‘lov cheki tasdiqlanmadi. Iltimos, yangi chek yuklang.
              </h2>
              {activeOrder.receiptRejectedReason && (
                <p className="text-xs sm:text-sm font-semibold text-rose-700 bg-white/80 p-3 rounded-xl border border-rose-200 max-w-md mx-auto">
                  Sabab: {activeOrder.receiptRejectedReason}
                </p>
              )}
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Iltimos, kartaga to‘lov qilinganligini tasdiqlovchi haqiqiy chek skrinshotini qaytadan yuklang.
              </p>
            </div>
          )}

          {/* MAIN PAYMENT DETAILS CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Sellnex Plastik Karta To‘lovi
                  </h3>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kafolatlangan To‘lov</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Quyidagi Sellnex hisob kartasiga to‘lovni amalga oshiring va to‘lov chekini yuklang.
              </p>
            </div>

            {/* Total Amount to Transfer */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  O‘tkazilishi kerak bo‘lgan summa
                </span>
                <p className="text-xs text-slate-400">Yetkazib berish xizmati bilan birga</p>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-blue-600">
                {formatMoney(activeOrder.totalAmount)}
              </span>
            </div>

            {/* Sellnex Payment Card Box */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span className="font-extrabold text-xs sm:text-sm text-white">Sellnex Markaziy To‘lov Kartasi</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-white/15 text-amber-300 border border-white/10">
                  {sellnexBankName}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Karta Raqami
                  </span>
                  <div className="font-mono text-lg sm:text-2xl font-black text-amber-300 tracking-wider">
                    {sellnexCardNumber}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Qabul qiluvchi: <strong className="text-white">{sellnexCardHolder}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCard}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                >
                  {copiedCard ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-800" />
                      <span>Nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Karta raqamini nusxalash</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-300 flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sellnex Kafolati:</strong> To‘lovingiz buyurtma to‘liq yetkazilguncha xavfsiz saqlanadi.
                  Iltimos, kartaga to‘lov qilib, chekni quyida yuklang.
                </span>
              </div>
            </div>

            {/* SECTION: RECEIPT UPLOAD (MANDATORY) */}
            {(!isPaid || isRejected) && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span>To‘lov chekini yuklash</span>
                      <span className="text-rose-600 font-extrabold">*</span>
                    </h4>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Majburiy
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    JPG, JPEG, PNG, WEBP yoki PDF formatidagi to‘lov skrinshotini yuklang.
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {/* Upload Zone / Drop Area */}
                {!receiptFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-800">
                      Chek faylini tanlash uchun bu yerga bosing
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      yoki faylni sudrab bu yerga tashlang (JPG, PNG, PDF, max 10MB)
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Faylni tanlash</span>
                    </div>
                  </div>
                ) : (
                  /* File Preview Card */
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Tanlangan Chek:</span>
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>O‘chirish / Boshqasini tanlash</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Chek skrinshoti"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer"
                          onClick={() => window.open(receiptPreview, '_blank')}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">{receiptFile.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB • {receiptFile.type || 'Hujjat'}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Yuklashga tayyor
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {receiptError && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{receiptError}</span>
                  </div>
                )}

                {/* Optional Transaction ID Input */}
                <div className="space-y-1 text-xs">
                  <label className="block font-semibold text-slate-700">
                    Tranzaksiya raqami / Chek kodi (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={txReceiptNumber}
                    onChange={(e) => setTxReceiptNumber(e.target.value)}
                    placeholder="Masalan: Click / Payme chek tranzaksiya raqami"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                  />
                </div>

                {/* SUBMIT BUTTON: CONFIRM PAYMENT (ACTIVE ONLY WHEN RECEIPT IS SELECTED) */}
                <button
                  id="btn-confirm-payment-upload"
                  type="button"
                  disabled={!receiptFile || isUploadingReceipt}
                  onClick={handleSubmitPaymentConfirmation}
                  style={{ backgroundColor: receiptFile ? primaryColor : undefined }}
                  className={`w-full py-4 rounded-xl text-white font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !receiptFile
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'hover:scale-[1.01] shadow-blue-500/25'
                  }`}
                >
                  {isUploadingReceipt ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Chek yuklanmoqda va tekshirishga yuborilmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>To‘lovni tasdiqlash</span>
                    </>
                  )}
                </button>

                {!receiptFile && (
                  <p className="text-[11px] text-center text-slate-400 font-medium">
                    * To‘lovni tasdiqlash uchun avval chek faylini yuklashingiz shart.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery & Customer Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Yetkazib berish manzili</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400 block">Qabul qiluvchi:</span>
                <strong className="text-slate-900">{activeOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Telefon:</span>
                <strong className="text-slate-900">{activeOrder.customerPhone}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Manzil:</span>
                <span className="text-slate-900 font-medium">
                  {activeOrder.deliveryAddress?.region || activeOrder.shippingAddress.region},{' '}
                  {activeOrder.deliveryAddress?.district || activeOrder.shippingAddress.district},{' '}
                  {activeOrder.deliveryAddress?.streetAddress || activeOrder.shippingAddress.streetAddress}
                  {activeOrder.deliveryAddress?.zipCode ? ` (Pochta indeksi: ${activeOrder.deliveryAddress.zipCode})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 1: CUSTOMER & DELIVERY ADDRESS FORM
  // ==========================================
  return (
    <div id="checkout-view-root" className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-200 mb-6 sm:mb-8">
          <button
            id="checkout-back-to-store"
            onClick={() =>
              navigateTo('public-store', {
                storeSlug: activeStore?.slug || store.slug,
                storeId: activeStore?.id || store.id,
              })
            }
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors min-h-[44px] py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Do‘konga qaytish</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-[140px] sm:max-w-none">
              {activeStore?.name || activeStore?.storeName || 'Do‘kon'}
            </span>
            <span className="text-[11px] sm:text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xavfsiz Xarid</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleProceedToPayment}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left 7 Cols: Customer Info & Delivery Address */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* 1. Customer Details */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1. Qabul qiluvchi ma’lumotlari</span>
                  </h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    1-bosqich
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ism / F.I.Sh. <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="checkout-input-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masalan: Azizbek Rustamov"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Telefon raqami <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="checkout-input-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className={`w-full px-3.5 py-3 border rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 font-medium text-xs sm:text-sm min-h-[44px] ${
                        phoneError ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                      }`}
                    />
                    {phoneError && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{phoneError}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Elektron pochta (ixtiyoriy)
                    </label>
                    <input
                      id="checkout-input-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="pochta@mail.uz"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600 text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>2. Yetkazib berish manzili</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Viloyat <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="checkout-select-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-300 rounded-xl outline-hidden bg-slate-50 font-medium text-xs sm:text-sm min-h-[44px]"
                    >
                      {uzbekistanRegions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tuman / shahar <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="checkout-input-city"
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Masalan: Yunusobod tumani"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      To‘liq yetkazib berish manzili (Ko‘cha, uy, xonadon) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="checkout-input-address"
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Masalan: Amir Temur ko‘chasi, 42-uy, 18-xonadon"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  {/* ZIP CODE / POCHTA KODI (OPTIONAL) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Pochta indeksi / ZIP code
                      </label>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Ixtiyoriy (Majburiy emas)
                      </span>
                    </div>
                    <input
                      id="checkout-input-zip"
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Masalan: 100000 (bo‘sh qoldirishingiz mumkin)"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kuryer uchun izoh (ixtiyoriy)
                    </label>
                    <input
                      id="checkout-input-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masalan: Yetkazishdan 15 daqiqa oldin qo‘ng‘iroq qiling"
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl outline-hidden text-xs sm:text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Yetkazib berish usuli</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { id: 'Standard' as const, title: 'Standart Yetkazish', time: '1-2 ish kuni', price: 25000 },
                      { id: 'Express' as const, title: 'Tezkor Kuryer', time: '24 soat ichida', price: 45000 },
                      { id: 'Pickup' as const, title: 'Olib ketish punkti', time: 'Filialdan olish', price: 0 },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDeliveryMethod(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all min-h-[56px] cursor-pointer ${
                          deliveryMethod === m.id
                            ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{m.title}</span>
                          {deliveryMethod === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{m.time}</p>
                        <p className="font-extrabold text-blue-700 mt-1">
                          {m.price === 0 ? 'BEPUL' : formatMoney(m.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Cart Summary & Place Order Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-slate-900" />
                  <span>Buyurtma tarkibi ({cart.length} ta mahsulot)</span>
                </h3>

                {/* Cart Items Summary */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="py-3 first:pt-0 flex items-center gap-3 text-xs">
                      <img
                        src={
                          item.product.images?.[0] ||
                          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={item.product.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.product.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Soni: {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatMoney(item.product.sellingPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Calculations */}
                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Mahsulotlar narxi:</span>
                    <span className="font-semibold text-slate-900">{formatMoney(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yetkazib berish ({deliveryMethod}):</span>
                    <span className="font-semibold text-slate-900">
                      {currentDeliveryCost === 0 ? 'BEPUL' : formatMoney(currentDeliveryCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Platforma xizmati:</span>
                    <span className="text-emerald-600 font-semibold">0 UZS (Bepul)</span>
                  </div>

                  <div className="border-t-2 border-dashed border-slate-200 pt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-700">
                        Jami To‘lov
                      </span>
                      <p className="text-[11px] text-slate-400">Barcha soliqlar va yetkazish kiritilgan</p>
                    </div>
                    <span className="text-2xl font-black text-blue-600">{formatMoney(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  id="checkout-proceed-btn"
                  type="submit"
                  disabled={isProcessing || cart.length === 0}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-4 rounded-xl text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Buyurtma rasmiylashtirilmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <span>To‘lovga o‘tish ({formatMoney(grandTotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Xavfsiz
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Butun O‘zbekiston bo‘ylab
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
