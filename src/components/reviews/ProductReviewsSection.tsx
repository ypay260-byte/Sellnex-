import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../../types';
import { firestoreService } from '../../services/firestoreService';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Send,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  User,
  Clock,
} from 'lucide-react';

interface ProductReviewsSectionProps {
  product: Product;
  formatMoney?: (val: number) => string;
  onReviewAdded?: () => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  onReviewAdded,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [verifiedStatus, setVerifiedStatus] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Load reviews on mount or productId change
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setLoading(true);
      try {
        const fetched = await firestoreService.getProductReviews(product.id);
        if (isMounted) {
          // Show approved reviews to public customers
          setReviews(fetched.filter((r) => r.status === 'approved' || !r.status));
        }
      } catch (err) {
        console.warn('Error loading product reviews:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // Live verified purchase verification when phone changes
  const checkVerificationLive = async () => {
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 9) {
      setVerifiedStatus(null);
      return;
    }
    setCheckingVerification(true);
    try {
      const res = await firestoreService.checkVerifiedPurchase(
        product.id,
        customerPhone,
        customerEmail
      );
      setVerifiedStatus(res.isVerified);
    } catch {
      setVerifiedStatus(false);
    } finally {
      setCheckingVerification(false);
    }
  };

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : (product.rating || 5.0).toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((s) => {
    const count = reviews.filter((r) => Math.round(r.rating) === s).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars: s, count, percentage };
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Iltimos, ismingizni kiriting.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Iltimos, mahsulot haqida kamida 5 ta belgidan iborat fikringizni yozing.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMsg('Baho 1 dan 5 yulduzgacha bo‘lishi kerak.');
      return;
    }

    setSubmitting(true);
    try {
      // Check real verification from order database
      let isVerified = false;
      let matchedOrderId: string | undefined = undefined;

      if (customerPhone.trim()) {
        const verifyResult = await firestoreService.checkVerifiedPurchase(
          product.id,
          customerPhone.trim(),
          customerEmail.trim()
        );
        isVerified = verifyResult.isVerified;
        matchedOrderId = verifyResult.orderId;
      }

      const newReview = await firestoreService.addProductReview({
        productId: product.id,
        storeId: product.storeId || '',
        productTitle: product.title,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        rating,
        comment: comment.trim(),
        verifiedPurchase: isVerified,
        orderId: matchedOrderId,
        status: 'approved',
      });

      setReviews((prev) => [newReview, ...prev]);
      setSuccessMsg(
        isVerified
          ? 'Rahmat! Sharhingiz tasdiqlangan xarid nishoni bilan muvaffaqiyatli chop etildi.'
          : 'Rahmat! Sharhingiz muvaffaqiyatli qo‘shildi.'
      );

      // Reset form
      setComment('');
      setRating(5);

      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sharhni saqlashda xatolik yuz berdi. Iltimos qaytadan urining.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Yaqinda';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="product-reviews-container" className="space-y-8 pt-6 border-t border-slate-200">
      {/* Overall Ratings Summary Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Mijozlar fikrlari va baholar ({totalReviews})</span>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            ★ {avgRating} / 5.0
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Score Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-5xl font-black text-slate-900 tracking-tight">{avgRating}</span>
            <div className="flex items-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {totalReviews > 0 ? `${totalReviews} ta sharh asosida` : 'Birinchi sharhni siz qoldiring!'}
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2">
            {starCounts.map((sc) => (
              <div key={sc.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-600 flex items-center gap-1">
                  {sc.stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${sc.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right font-medium text-slate-400">{sc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Mahsulot haqida fikringizni bildiring</span>
        </h4>
        <p className="text-xs text-slate-500 mb-5">
          Sizning sharhingiz boshqa xaridorlarga to‘g‘ri tanlov qilishda yordam beradi.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Interactive Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mahsulotga bahongiz:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`${s} yulduz`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 hover:text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 ml-2">
                {rating === 5
                  ? "A'lo (5/5)"
                  : rating === 4
                  ? 'Yaxshi (4/5)'
                  : rating === 3
                  ? 'Qoniqarli (3/5)'
                  : rating === 2
                  ? 'Yomon (2/5)'
                  : 'Juda yomon (1/5)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ismingiz *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masalan: Sardor Aliyev"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqamingiz <span className="font-normal text-slate-400">(Xaridni tasdiqlash uchun)</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setVerifiedStatus(null);
                }}
                onBlur={checkVerificationLive}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
              {checkingVerification && (
                <span className="text-[11px] text-slate-400 mt-1 block">Xarid tekshirilmoqda...</span>
              )}
              {verifiedStatus === true && (
                <span className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Haqiqiy xaridingiz tasdiqlandi!
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fikringiz (Sharh) *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Mahsulot sifati, yetkazib berish va o‘z taassurotlaringiz haqida yozing..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Yuborilmoqda...' : 'Sharhni chop etish'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Individual Customer Reviews List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">
          Sharhlar ro‘yxati ({reviews.length})
        </h4>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 animate-pulse text-xs text-slate-400">
            Sharhlar yuklanmoqda...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">Hozircha sharhlar yo‘q</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Ushbu mahsulot haqida birinchi bo‘lib o‘z fikringizni bildiring!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                      {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">
                          {rev.customerName}
                        </span>
                        {/* Verified Purchase Badge (Requirement 7) */}
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Tasdiqlangan xarid
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400 bg-amber-50/60 px-2 py-1 rounded-lg border border-amber-100">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(rev.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1">
                      {rev.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-10">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
