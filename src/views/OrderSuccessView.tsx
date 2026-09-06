import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { firestoreService } from '../services/firestoreService';
import { Order, AdminSettings } from '../types';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  MapPin,
  Clock,
  RotateCw,
  Store as StoreIcon,
  XCircle,
  FileCheck,
  Upload,
  FileText,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderSuccessView: React.FC = () => {
  const { store, publicStore, orders, routeParams, navigateTo, formatMoney, showToast } = useApp();

  const activeStore = publicStore || store;
  const orderId = routeParams.orderId;

  const [order, setOrder] = useState<Order | null>(() => {
    return orders.find((o) => o.id === orderId) || (orders.length > 0 ? orders[0] : null);
  });

  // Re-upload state if rejected or pending
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [txReceiptNumber, setTxReceiptNumber] = useState('');
  const [copiedCard, setCopiedCard] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Admin Settings for Card
  useEffect(() => {
    firestoreService.getAdminSettings().then((s) => {
      if (s) setAdminSettings(s);
    });
  }, []);

  // Fetch and Subscribe to order updates in real-time
  useEffect(() => {
    if (!orderId) return;

    // Direct fetch first
    firestoreService.getOrderById(orderId).then((fetched) => {
      if (fetched) setOrder(fetched);
    });

    // Real-time listener
    const unsubscribe = firestoreService.onOrderSnapshot(orderId, (updated) => {
      if (updated) {
        setOrder((prev) => {
          if (prev && updated.paymentStatus === 'paid' && prev.paymentStatus !== 'paid') {
            try {
              confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
            } catch {
              // ignore
            }
            showToast('To‘lov tasdiqlandi!', 'Buyurtmangiz to‘lovi tasdiqlandi va qabul qilindi.', 'success');
          }
          return updated;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-md border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Buyurtma topilmadi</h2>
          <p className="text-xs text-slate-500">
            Hozircha buyurtma ma’lumotlari mavjud emas yoki tizimga kiritilmagan.
          </p>
          <button
            onClick={() =>
              navigateTo('public-store', {
                storeSlug: activeStore?.slug || store?.slug || routeParams.storeSlug || '',
                storeId: activeStore?.id || store?.id || routeParams.storeId || '',
              })
            }
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Do‘konga qaytish
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = activeStore?.theme?.primaryColor || activeStore?.primaryColor || store?.primaryColor || '#2563eb';
  const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'Paid';
  const isPendingVerification = order.paymentStatus === 'pending_verification';
  const isRejected = order.paymentStatus === 'rejected';

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

  const handleFileSelect = (file: File) => {
    setReceiptError(null);
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || ext === 'pdf';

    if (!validExtensions.includes(ext) && !isImage && !isPdf) {
      setReceiptError('Faqat JPG, JPEG, PNG, WEBP yoki PDF formatdagi cheklar qabul qilinadi.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setReceiptError('Fayl hajmi 10 MB dan oshmasligi kerak.');
      return;
    }

    setReceiptFile(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile || !order) return;
    setIsUploading(true);
    setReceiptError(null);

    try {
      const downloadUrl = await firestoreService.uploadReceipt(order.id, receiptFile);
      await firestoreService.submitOrderReceipt(
        order.id,
        downloadUrl,
        receiptFile.name,
        receiptFile.type,
        txReceiptNumber.trim() || undefined
      );

      setOrder((prev) =>
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

      setReceiptFile(null);
      setReceiptPreview(null);
      showToast('Chek yuklandi', 'To‘lov cheki tekshirish uchun yuborildi.', 'success');
    } catch (err: any) {
      setReceiptError(err.message || 'Chek yuklashda xatolik yuz berdi');
      showToast('Xatolik', 'Chek yuklashda xatolik yuz berdi', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const deliveryAddress = order.deliveryAddress || order.shippingAddress;
  const addressLine = [
    deliveryAddress?.streetAddress || (deliveryAddress as any)?.street || '',
    deliveryAddress?.district || (deliveryAddress as any)?.city || '',
    deliveryAddress?.region || '',
    deliveryAddress?.zipCode ? `ZIP: ${deliveryAddress.zipCode}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div id="order-success-root" className="min-h-screen bg-slate-50 py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Status Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-4">
          {isPaid ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : isPendingVerification ? (
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md animate-pulse">
              <Clock className="w-9 h-9" />
            </div>
          ) : isRejected ? (
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <XCircle className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-md">
              <CreditCard className="w-9 h-9" />
            </div>
          )}

          <div>
            <span
              className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isPaid
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : isPendingVerification
                  ? 'text-amber-800 bg-amber-100 border-amber-300'
                  : isRejected
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : 'text-blue-700 bg-blue-50 border-blue-200'
              }`}
            >
              {isPaid
                ? 'To‘lov Tasdiqlandi'
                : isPendingVerification
                ? 'Chek Tekshirilmoqda'
                : isRejected
                ? 'To‘lov Rad Etildi'
                : 'To‘lov Kutilmoqda'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {isPaid
                ? 'Xaridingiz uchun tashakkur!'
                : isPendingVerification
                ? 'To‘lov chekingiz tekshirilmoqda...'
                : isRejected
                ? 'To‘lov cheki tasdiqlanmadi'
                : 'Buyurtmangiz qabul qilindi!'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Buyurtma raqami: <strong className="text-slate-900 font-mono">{order.orderNumber}</strong>.
              {isPaid
                ? ' Buyurtma tasdiqlandi va yetkazib berish jarayoniga topshirildi.'
                : isPendingVerification
                ? ' Administrator to‘lovingizni tekshirmoqda (5-15 daqiqa). Sahifa avtomatik yangilanadi.'
                : isRejected
                ? ' Chek tasdiqlanmadi. Iltimos, haqiqiy to‘lov chekini qaytadan yuklang.'
                : ' To‘lovni amalga oshirib, chekni yuklashingiz so‘raladi.'}
            </p>

            {isRejected && order.receiptRejectedReason && (
              <p className="text-xs font-semibold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 mt-2 max-w-md mx-auto">
                Rad etilish sababi: {order.receiptRejectedReason}
              </p>
            )}
          </div>

          {/* Fulfillment Stepper */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Yetkazib berish bosqichlari
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                  ✓
                </div>
                <p className="font-bold text-slate-900 text-[11px]">Buyurtma</p>
                <p className="text-[10px] text-slate-400">Yaratildi</p>
              </div>

              <div className="space-y-1">
                <div
                  className={`w-8 h-8 rounded-full text-white flex items-center justify-center mx-auto text-xs font-bold ${
                    isPaid ? 'bg-emerald-600' : isPendingVerification ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                  }`}
                >
                  {isPaid ? '✓' : isPendingVerification ? '⏳' : '2'}
                </div>
                <p className="font-bold text-slate-900 text-[11px]">To‘lov</p>
                <p
                  className={`text-[10px] font-medium ${
                    isPaid ? 'text-emerald-600' : isPendingVerification ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {isPaid ? 'Tasdiqlandi' : isPendingVerification ? 'Kutilmoqda' : 'Kutilmoqda'}
                </p>
              </div>

              <div className="space-y-1">
                <div
                  className={`w-8 h-8 rounded-full text-white flex items-center justify-center mx-auto text-xs font-bold ${
                    isPaid ? 'bg-blue-600 animate-pulse' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-700 text-[11px]">Yig‘ish</p>
                <p className="text-[10px] text-slate-400">{isPaid ? 'Jarayonda' : 'Navbatda'}</p>
              </div>

              <div className="space-y-1 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xs font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-700 text-[11px]">Kuryer</p>
                <p className="text-[10px] text-slate-400">Yetkazish</p>
              </div>
            </div>
          </div>
        </div>

        {/* RE-UPLOAD RECEIPT FORM IF PENDING / REJECTED */}
        {(!isPaid || isRejected) && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>To‘lov va Chek Yuklash</span>
            </h3>

            {/* Sellnex Card Details */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Sellnex To‘lov Kartasi:</span>
                <span className="text-[10px] font-mono text-amber-300">{sellnexBankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-black text-amber-300">{sellnexCardNumber}</span>
                <button
                  onClick={handleCopyCard}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {copiedCard ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCard ? 'Nusxalandi' : 'Nusxa'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300">
                Qabul qiluvchi: <strong className="text-white">{sellnexCardHolder}</strong>
              </p>
              <div className="text-xs text-emerald-400 font-bold flex justify-between pt-1 border-t border-white/10">
                <span>To‘lov summasi:</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </div>

            {/* File Input */}
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

            {!receiptFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer hover:bg-slate-50 transition-all"
              >
                <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-xs text-slate-800">
                  {order.receiptUrl ? 'Yangi chek yuklash uchun bu yerga bosing' : 'To‘lov chekini tanlang'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP yoki PDF (max 10MB)</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs">{receiptFile.name}</p>
                    <p className="text-slate-400">{(receiptFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReceiptFile(null);
                    setReceiptPreview(null);
                  }}
                  className="p-1 text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {receiptError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {receiptError}
              </p>
            )}

            <button
              disabled={!receiptFile || isUploading}
              onClick={handleSubmitReceipt}
              style={{ backgroundColor: receiptFile ? primaryColor : undefined }}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !receiptFile ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'hover:scale-[1.01]'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Chek yuklanmoqda...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>To‘lov chekini tasdiqlash uchun yuborish</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Order Details Receipt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-slate-400">Buyurtma Raqami</p>
              <p className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Taxminiy Yetkazish</p>
              <p className="font-bold text-slate-900 text-sm">24 – 48 Soat</p>
            </div>
          </div>

          {/* Shipping & Payment summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Yetkazib berish manzili</span>
              </p>
              <p className="text-slate-700 font-medium">{order.customerName}</p>
              <p className="text-slate-500">{addressLine || 'Toshkent shahri'}</p>
              <p className="text-slate-500 font-medium">{order.customerPhone}</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>To‘lov Usuli & Holati</span>
              </p>
              <p className="text-slate-700 font-medium">Usul: {order.paymentMethod || 'Sellnex Card'}</p>
              <p
                className={`font-semibold ${
                  isPaid ? 'text-emerald-600' : isPendingVerification ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                To‘lov: {order.paymentStatus || 'Kutilmoqda'}
              </p>
              {order.receiptUrl && (
                <a
                  href={order.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold pt-1"
                >
                  <span>Yuklangan chekni ko‘rish</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="font-bold text-slate-800">Xarid qilingan mahsulotlar</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">
                      Soni: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatMoney((item.price || item.sellingPrice || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-1.5 text-slate-600">
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>Jami To‘lov:</span>
              <span className="text-blue-600 font-extrabold">{formatMoney(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="success-continue-shopping"
            onClick={() =>
              navigateTo('public-store', {
                storeSlug: activeStore?.slug || store?.slug || routeParams.storeSlug || '',
                storeId: activeStore?.id || store?.id || routeParams.storeId || '',
              })
            }
            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-800 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Xaridni davom ettirish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
