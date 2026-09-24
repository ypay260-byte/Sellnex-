import React, { useState } from 'react';
import { Supplier, SupplierReview } from '../../types';
import {
  Star,
  X,
  Truck,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Plus,
  Heart,
  Share2,
} from 'lucide-react';

interface SupplierReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  reviews: SupplierReview[];
  onOpenRateModal: () => void;
}

export const SupplierReviewsModal: React.FC<SupplierReviewsModalProps> = ({
  isOpen,
  onClose,
  supplier,
  reviews,
  onOpenRateModal,
}) => {
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  if (!isOpen || !supplier) return null;

  const filteredReviews = filterStar
    ? reviews.filter((r) => Math.round(r.overallRating) === filterStar)
    : reviews;

  const totalReviews = reviews.length;
  const avgSpeed = supplier.shippingSpeedScore || 4.8;
  const avgQuality = supplier.productQualityScore || 4.8;
  const avgOverall = supplier.reliabilityScore || 4.8;
  const recommendRate = supplier.recommendRate || 95;

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Distribution counts
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.overallRating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  return (
    <div
      id="supplier-reviews-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="supplier-reviews-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              {supplier.logo || '🏢'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{supplier.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Dropshipper Reviews
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {supplier.country || 'Global Hub'} • {supplier.avgDeliveryDays || supplier.averageDeliveryDays}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Scorecard Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
            {/* Overall Score */}
            <div className="flex flex-col items-center justify-center p-3 bg-white/10 rounded-xl text-center">
              <span className="text-3xl font-black text-amber-400 flex items-center gap-1">
                {avgOverall}
                <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
              </span>
              <span className="text-[11px] font-medium text-slate-300 mt-1">
                Overall Reliability ({totalReviews} reviews)
              </span>
            </div>

            {/* Dual Score Metric */}
            <div className="flex flex-col justify-center space-y-2 p-3 bg-white/10 rounded-xl">
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-blue-300 font-bold">
                    <Truck className="w-3.5 h-3.5 text-blue-400" /> Shipping Speed:
                  </span>
                  <span className="font-extrabold text-white">{avgSpeed}/5.0</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${(avgSpeed / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Product Quality:
                  </span>
                  <span className="font-extrabold text-white">{avgQuality}/5.0</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(avgQuality / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommendation Metric */}
            <div className="flex flex-col items-center justify-center p-3 bg-white/10 rounded-xl text-center">
              <span className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                <ThumbsUp className="w-5 h-5 text-emerald-400" />
                {recommendRate}%
              </span>
              <span className="text-[11px] font-medium text-slate-300 mt-1">
                Recommend this Partner
              </span>
            </div>
          </div>

          {/* Rating Breakdown Distribution & Filter Pills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">Rating Distribution & Filters</h4>
              {filterStar && (
                <button
                  onClick={() => setFilterStar(null)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Clear Filter (Show All)
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterStar(null)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                  filterStar === null
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={`star-filter-${star}`}
                  type="button"
                  onClick={() => setFilterStar(filterStar === star ? null : star)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition-colors ${
                    filterStar === star
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{star}★</span>
                  <span className="text-[10px] opacity-75">({starCounts[star] || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Showing {filteredReviews.length} Verified Seller Reviews</span>
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenRateModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No reviews found for this rating.</p>
                <p className="text-xs">Be the first merchant to rate this dropshipping partner!</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenRateModal();
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Rate Supplier Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((rev) => {
                  const isLiked = likedReviews[rev.id] || false;
                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {rev.sellerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{rev.sellerName}</span>
                              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Verified Seller
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {rev.storeName || 'Merchant Store'}
                              {rev.orderReference && ` • Tested with ${rev.orderReference}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 font-bold text-slate-900">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{rev.overallRating}</span>
                            <span className="text-[10px] text-slate-400">/ 5.0</span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Dual Ratings Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-[11px] flex items-center gap-1 border border-blue-100">
                          <Truck className="w-3 h-3 text-blue-600" />
                          <span>Shipping Speed:</span>
                          <strong className="text-blue-900">{rev.shippingSpeedRating}★</strong>
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px] flex items-center gap-1 border border-emerald-100">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Product Quality:</span>
                          <strong className="text-emerald-900">{rev.productQualityRating}★</strong>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            rev.recommend
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {rev.recommend ? '● Recommends Partner' : '● Not Recommended'}
                        </span>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        {rev.comment}
                      </p>

                      {/* Experience Tags */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rev.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Feedback Footer */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Was this review helpful to your store?</span>
                        <button
                          type="button"
                          onClick={() => toggleLike(rev.id)}
                          className={`flex items-center gap-1 font-semibold px-2 py-1 rounded-lg transition-colors ${
                            isLiked
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>Helpful ({(rev.likesCount || 0) + (isLiked ? 1 : 0)})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-[11px] text-slate-500">
            Reviews are submitted by verified merchant store owners in Uzbekistan.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
