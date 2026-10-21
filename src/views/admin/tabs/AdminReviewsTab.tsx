import React, { useState, useEffect } from 'react';
import { ProductReview, ReviewModerationStatus } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Star,
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AdminReviewsTabProps {
  adminEmail: string;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({
  adminEmail,
  showToast,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewModerationStatus>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | number>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await firestoreService.getAllProductReviews();
      setReviews(data);
    } catch (err: any) {
      console.error('Error loading reviews in admin:', err);
      showToast('Xatolik', 'Sharhlarni yuklab bo‘lmadi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (review: ProductReview, newStatus: ReviewModerationStatus) => {
    setProcessingId(review.id);
    try {
      await firestoreService.moderateProductReview(review.id, newStatus, review.productId, adminEmail);
      await firestoreService.createAuditLog({
        adminEmail,
        action: `moderate_review_${newStatus}`,
        targetType: 'product_review',
        targetId: review.id,
        targetName: review.productTitle || review.productId,
        oldValue: { status: review.status },
        newValue: { status: newStatus },
        details: `Sharh holati "${newStatus}" ga o‘zgartirildi`,
      });

      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r))
      );
      showToast('Muvaffaqiyatli', `Sharh holati: ${newStatus}`, 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Holatni o‘zgartirishda xatolik', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (review: ProductReview) => {
    if (!window.confirm(`Haqiqatan ham ushbu sharhni butunlay o‘chirmoqchimisiz?`)) {
      return;
    }

    setProcessingId(review.id);
    try {
      await firestoreService.deleteProductReview(review.id, review.productId);
      await firestoreService.createAuditLog({
        adminEmail,
        action: 'delete_product_review',
        targetType: 'product_review',
        targetId: review.id,
        targetName: review.productTitle || review.productId,
        oldValue: review,
        newValue: null,
        details: `Sharh o‘chirildi (${review.customerName})`,
      });

      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showToast('O‘chirildi', 'Sharh muvaffaqiyatli o‘chirildi va mahsulot reytingi qayta hisoblandi', 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Sharhni o‘chirishda xatolik', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (r.customerName || '').toLowerCase().includes(term) ||
      (r.comment || '').toLowerCase().includes(term) ||
      (r.productTitle || '').toLowerCase().includes(term) ||
      (r.customerPhone || '').includes(term);

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchRating = ratingFilter === 'all' || Math.round(r.rating) === ratingFilter;
    const matchVerified =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && r.verifiedPurchase) ||
      (verifiedFilter === 'unverified' && !r.verifiedPurchase);

    return matchSearch && matchStatus && matchRating && matchVerified;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span>Mahsulot Sharhlari va Baholar Moderatsiyasi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Platformadagi barcha mijoz sharhlarini tekshirish, noo‘rin fikrlarni bloklash va tasdiqlash.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={isLoading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Jami Sharhlar</span>
          <p className="text-2xl font-black text-white mt-1">{reviews.length}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-emerald-400 uppercase">Tasdiqlangan Xaridlar</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {reviews.filter((r) => r.verifiedPurchase).length}
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase">Ko‘rib Chiqilmoqda</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {reviews.filter((r) => r.status === 'pending' || r.status === 'flagged').length}
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-blue-400 uppercase">O‘rtacha Baho</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {reviews.length > 0
              ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
              : '5.0'}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Mijoz ismi, sharh matni, mahsulot yoki telefon..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Barcha Holatlar</option>
            <option value="approved">Chop etilgan (Approved)</option>
            <option value="flagged">Shubhali (Flagged)</option>
            <option value="rejected">Rad etilgan (Rejected)</option>
          </select>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Barcha Yulduzlar</option>
            <option value="5">5 Yulduz ★★★★★</option>
            <option value="4">4 Yulduz ★★★★</option>
            <option value="3">3 Yulduz ★★★</option>
            <option value="2">2 Yulduz ★★</option>
            <option value="1">1 Yulduz ★</option>
          </select>

          {/* Verified filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Hammasi (Xarid holati)</option>
            <option value="verified">Faqat tasdiqlangan xaridlar</option>
            <option value="unverified">Tasdiqlanmagan xaridlar</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / Cards */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Sharhlar yuklanmoqda...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Hech qanday sharh topilmadi.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Left: Author, Product, Content */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-xs text-white">
                      {rev.customerName || 'Noma‘lum xaridor'}
                    </span>
                    {rev.customerPhone && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rev.customerPhone}
                      </span>
                    )}

                    {/* Verified badge */}
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Tasdiqlangan Xarid
                      </span>
                    )}

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        rev.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : rev.status === 'flagged'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : rev.status === 'rejected'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {rev.status || 'approved'}
                    </span>
                  </div>

                  {/* Product context */}
                  <div className="text-[11px] text-blue-400 flex items-center gap-1">
                    <span>Mahsulot:</span>
                    <span className="font-bold text-slate-300 truncate max-w-sm">
                      {rev.productTitle || rev.productId}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(rev.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-1">
                      {rev.rating} / 5
                    </span>
                    <span className="text-slate-500 text-[11px] ml-2">
                      • {new Date(rev.createdAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
                    {rev.comment}
                  </p>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  {rev.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={processingId === rev.id}
                      onClick={() => handleModerate(rev, 'approved')}
                      className="w-full px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Tasdiqlash</span>
                    </button>
                  )}

                  {rev.status !== 'flagged' && (
                    <button
                      type="button"
                      disabled={processingId === rev.id}
                      onClick={() => handleModerate(rev, 'flagged')}
                      className="w-full px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Shubhali</span>
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={processingId === rev.id}
                      onClick={() => handleModerate(rev, 'rejected')}
                      className="w-full px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rad etish</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={processingId === rev.id}
                    onClick={() => handleDelete(rev)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/60 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>O‘chirish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
