import React, { useState } from 'react';
import { Supplier, SupplierReview } from '../../types';
import {
  Star,
  X,
  Truck,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  currentUserId?: string;
  currentUserName?: string;
  currentUserStoreName?: string;
  onSubmitReview: (reviewData: Omit<SupplierReview, 'id' | 'createdAt'>) => Promise<void> | void;
}

const SPEED_LABELS: Record<number, string> = {
  1: 'Very Slow (> 14 days, delayed dispatch)',
  2: 'Below Average (Slower than promised)',
  3: 'Acceptable (Standard 3–7 day dispatch)',
  4: 'Fast (Prompt 24–48h fulfillment)',
  5: 'Lightning Fast (Same-day dispatch & courier)',
};

const QUALITY_LABELS: Record<number, string> = {
  1: 'Defective / Poor (High return rate, damages)',
  2: 'Subpar (Noticeable flaws, weak packaging)',
  3: 'Standard (Good wholesale condition)',
  4: 'High Quality (Clean packaging, durable)',
  5: 'Exceptional (Flawless OEM, premium finish)',
};

const POPULAR_TAGS = [
  'Next-day Delivery',
  'Protective Packaging',
  'Accurate Tracking',
  'Factory Sealed',
  'High Margins',
  'Same-Day Dispatch',
  'Local Warranty',
  'Zero Returns',
  'Quick Restock',
  'Responsive Support',
  'Minor Box Dent',
];

export const RateSupplierModal: React.FC<RateSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  currentUserId = 'user-seller-current',
  currentUserName = 'Kamronbek Alimov',
  currentUserStoreName = 'My Sellnex Store',
  onSubmitReview,
}) => {
  const [shippingSpeedRating, setShippingSpeedRating] = useState<number>(5);
  const [speedHover, setSpeedHover] = useState<number>(0);

  const [productQualityRating, setProductQualityRating] = useState<number>(5);
  const [qualityHover, setQualityHover] = useState<number>(0);

  const [recommend, setRecommend] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Protective Packaging', 'Accurate Tracking']);
  const [comment, setComment] = useState<string>('');
  const [orderReference, setOrderReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !supplier) return null;

  const overallRating = Number(
    ((shippingSpeedRating + productQualityRating) / 2).toFixed(1)
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment describing your dropshipping experience.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onSubmitReview({
        supplierId: supplier.id,
        userId: currentUserId,
        sellerName: currentUserName,
        storeName: currentUserStoreName,
        shippingSpeedRating,
        productQualityRating,
        overallRating,
        comment: comment.trim(),
        recommend,
        tags: selectedTags,
        orderReference: orderReference.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMsg('Could not save review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="rate-supplier-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="rate-supplier-modal-content"
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              {supplier.logo || '🏢'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Rate Dropshipping Partner</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Seller Feedback
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {supplier.name} • {supplier.country || 'Verified Hub'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Shipping Speed Rating */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>1. Shipping Speed & Dispatch Turnaround</span>
              </label>
              <span className="font-extrabold text-blue-600 text-sm">
                {(speedHover || shippingSpeedRating)} / 5.0
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              How prompt was the supplier in dispatching parcels and providing accurate tracking?
            </p>

            {/* Stars row */}
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (speedHover || shippingSpeedRating) >= star;
                return (
                  <button
                    key={`speed-star-${star}`}
                    type="button"
                    onClick={() => setShippingSpeedRating(star)}
                    onMouseEnter={() => setSpeedHover(star)}
                    onMouseLeave={() => setSpeedHover(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        active
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 font-semibold text-slate-700 text-xs">
                {SPEED_LABELS[speedHover || shippingSpeedRating]}
              </span>
            </div>
          </div>

          {/* Section 2: Product Quality Rating */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Product Quality & Packaging Integrity</span>
              </label>
              <span className="font-extrabold text-emerald-600 text-sm">
                {(qualityHover || productQualityRating)} / 5.0
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              How was the condition of delivered goods, defect frequency, and packaging durability?
            </p>

            {/* Stars row */}
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (qualityHover || productQualityRating) >= star;
                return (
                  <button
                    key={`quality-star-${star}`}
                    type="button"
                    onClick={() => setProductQualityRating(star)}
                    onMouseEnter={() => setQualityHover(star)}
                    onMouseLeave={() => setQualityHover(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        active
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 font-semibold text-slate-700 text-xs">
                {QUALITY_LABELS[qualityHover || productQualityRating]}
              </span>
            </div>
          </div>

          {/* Overall Rating Calculated Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200/80">
            <span className="font-semibold text-blue-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Calculated Overall Partner Score:
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="font-extrabold text-slate-900 text-sm">{overallRating}</span>
              <span className="text-slate-500 text-xs">/ 5.0</span>
            </div>
          </div>

          {/* Section 3: Recommendation Toggle */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Would you recommend this dropshipping partner to other sellers?
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  recommend
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${recommend ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Yes, Recommended</span>
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  !recommend
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs ring-2 ring-rose-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${!recommend ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Not Recommended</span>
              </button>
            </div>
          </div>

          {/* Section 4: Quick Experience Tags */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Experience Highlights (Click to toggle)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Written Review Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">
                Detailed Review & Experience Notes <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{comment.length}/400</span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={400}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="E.g., Dispatched 25 orders to Tashkent. Air cargo arrived within 4 days. Product packaging was bubble-wrapped with zero customer complaints. Margins are solid."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden transition-all text-xs"
            />
          </div>

          {/* Section 6: Order or Batch Reference (Optional) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Order or Test Batch Reference (Optional)
            </label>
            <input
              type="text"
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="e.g. #SL-1024 or 30-unit test batch"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden transition-all text-xs"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{isSubmitting ? 'Submitting Review...' : 'Submit Rating & Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
