import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import { Supplier, SupplierReview } from '../types';
import { RateSupplierModal } from '../components/suppliers/RateSupplierModal';
import { SupplierReviewsModal } from '../components/suppliers/SupplierReviewsModal';
import {
  Building2,
  CheckCircle2,
  RefreshCw,
  Plus,
  ExternalLink,
  Star,
  Clock,
  ShieldCheck,
  Zap,
  Globe2,
  Sparkles,
  Truck,
  ThumbsUp,
  MessageSquare,
  Search,
  Filter,
  Award,
  PackageCheck,
} from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    supplierReviews,
    addSupplierReview,
    getSupplierReviews,
    addCustomSupplier,
    currentUser,
    store,
    showToast,
    navigateTo,
  } = useApp();

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'top_rated' | 'fast_shipping' | 'top_quality'>('all');

  // Modals state
  const [ratingSupplier, setRatingSupplier] = useState<Supplier | null>(null);
  const [viewingReviewsSupplier, setViewingReviewsSupplier] = useState<Supplier | null>(null);

  // Add custom supplier modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCountry, setCustomCountry] = useState('Uzbekistan (Tashkent)');
  const [customApi, setCustomApi] = useState('https://api.supplier.uz/v1');
  const [customDelivery, setCustomDelivery] = useState('1–2 days (Regional Express)');
  const [customShippingCost, setCustomShippingCost] = useState('20000');

  const handleSyncSupplier = async (id: string, name: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 900));
    setSyncingId(null);
    showToast('Supplier Synced!', `Catalog and stock inventory refreshed for ${name}.`, 'success');
  };

  const handleCreateCustomSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addCustomSupplier({
      name: customName.trim(),
      status: 'Connected',
      apiUrl: customApi.trim(),
      defaultShippingCost: Number(customShippingCost) || 20000,
      averageDeliveryDays: customDelivery,
      autoOrderSupported: true,
      logo: '🏢',
      country: customCountry,
      avgDeliveryDays: customDelivery,
      reliabilityScore: 5.0,
      shippingSpeedScore: 5.0,
      productQualityScore: 5.0,
      reviewCount: 0,
      recommendRate: 100,
      productCount: 0,
      description: 'Private warehouse partner integrated with automated inventory sync and order webhooks.',
    });

    setCustomName('');
    setIsModalOpen(false);
  };

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.country && s.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const speedScore = s.shippingSpeedScore || 4.5;
      const qualityScore = s.productQualityScore || 4.5;
      const overall = s.reliabilityScore || 4.5;

      if (activeFilter === 'top_rated') return overall >= 4.7;
      if (activeFilter === 'fast_shipping') return speedScore >= 4.7;
      if (activeFilter === 'top_quality') return qualityScore >= 4.7;

      return true;
    });
  }, [suppliers, searchQuery, activeFilter]);

  // Overall network summary stats
  const networkStats = useMemo(() => {
    const count = suppliers.length;
    if (count === 0) {
      return { avgSpeed: '5.0', avgQuality: '5.0', totalReviews: 0 };
    }
    const totalSpeed = suppliers.reduce((sum, s) => sum + (s.shippingSpeedScore || 4.5), 0);
    const totalQuality = suppliers.reduce((sum, s) => sum + (s.productQualityScore || 4.5), 0);
    const totalRev = suppliers.reduce((sum, s) => sum + (s.reviewCount || 0), 0);

    return {
      avgSpeed: (totalSpeed / count).toFixed(1),
      avgQuality: (totalQuality / count).toFixed(1),
      totalReviews: totalRev,
    };
  }, [suppliers]);

  return (
    <div id="suppliers-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <BackHeader
        title="Wholesale Suppliers Directory"
        subtitle="Connected dropshipping hubs, regional fulfillment warehouses, and seller-verified rating scores."
        fallbackRoute="dashboard"
        rightElement={
          <button
            id="btn-add-custom-supplier"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Supplier API</span>
          </button>
        }
      />

      {/* Network Overview Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Connected Partners</span>
          </div>
          <p className="text-2xl font-black mt-1 text-white">{suppliers.length}</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 inline" /> 100% Active API Sync
          </span>
        </div>

        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>Avg Shipping Speed</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-white">{networkStats.avgSpeed}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[10px] text-blue-300 font-medium mt-0.5 block">
            Express regional dispatch
          </span>
        </div>

        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Avg Product Quality</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-white">{networkStats.avgQuality}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-medium mt-0.5 block">
            Tested OEM defect rate &lt; 0.8%
          </span>
        </div>

        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Dropshipper Reviews</span>
          </div>
          <p className="text-2xl font-black mt-1 text-white">{networkStats.totalReviews}+</p>
          <span className="text-[10px] text-purple-300 font-medium mt-0.5 block">
            From verified Uzbek merchants
          </span>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dropshipping partner by name, warehouse, or country..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Partners ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveFilter('top_rated')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${
              activeFilter === 'top_rated'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Top Rated (4.7+)</span>
          </button>
          <button
            onClick={() => setActiveFilter('fast_shipping')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${
              activeFilter === 'fast_shipping'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fastest Shipping</span>
          </button>
          <button
            onClick={() => setActiveFilter('top_quality')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${
              activeFilter === 'top_quality'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Top Quality</span>
          </button>
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredSuppliers.map((s) => {
          const speedScore = s.shippingSpeedScore || 4.7;
          const qualityScore = s.productQualityScore || 4.8;
          const overallScore = s.reliabilityScore || 4.8;
          const reviewsCount = s.reviewCount || 0;
          const recommendPercent = s.recommendRate || 95;

          return (
            <div
              key={s.id}
              id={`supplier-card-${s.id}`}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                      {s.logo || '🏢'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                        {s.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.country || 'Global Fulfillment'}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      s.status === 'Active' || s.status === 'Connected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    ● {s.status}
                  </span>
                </div>

                {/* Description */}
                {s.description && (
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {s.description}
                  </p>
                )}

                {/* DUAL RATING SHOWCASE: Shipping Speed & Product Quality */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  {/* Overall & Recommend */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="font-extrabold text-slate-900 text-sm">
                        {overallScore} / 5.0
                      </span>
                      <span className="text-slate-400 font-medium">
                        ({reviewsCount} reviews)
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      {recommendPercent}% recommend
                    </span>
                  </div>

                  {/* Shipping Speed breakdown */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Shipping Speed:</span>
                      </span>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <span>{speedScore}</span>
                        <span className="text-slate-400 font-normal">/ 5.0</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(speedScore / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Delivery Turnaround</span>
                      <span className="font-semibold text-slate-700">
                        {s.avgDeliveryDays || s.averageDeliveryDays}
                      </span>
                    </div>
                  </div>

                  {/* Product Quality breakdown */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Product Quality:</span>
                      </span>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <span>{qualityScore}</span>
                        <span className="text-slate-400 font-normal">/ 5.0</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${(qualityScore / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Packaging & Defect Guarantee</span>
                      <span className="font-semibold text-slate-700">
                        Physical inspection &amp; warranty
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Standard Delivery Fee:
                    </span>
                    <span className="font-bold text-slate-900">
                      {s.defaultShippingCost ? `${s.defaultShippingCost.toLocaleString()} UZS` : 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" /> Connected Catalog Items:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {s.productCount ? `${s.productCount} items` : 'Connected Catalog'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Rating buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {/* Rating triggers */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRatingSupplier(s)}
                    className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Rate Partner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingReviewsSupplier(s)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                    <span>Reviews ({reviewsCount})</span>
                  </button>
                </div>

                {/* Sync & Import buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id={`sync-supplier-${s.id}`}
                    onClick={() => handleSyncSupplier(s.id, s.name)}
                    disabled={syncingId === s.id}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingId === s.id ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{syncingId === s.id ? 'Syncing...' : 'Sync Stock'}</span>
                  </button>
                  <button
                    onClick={() => navigateTo('import-product')}
                    className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Import Items</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-500 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-base">No Suppliers Found</h4>
          <p className="text-xs max-w-md mx-auto text-slate-500">
            No dropshipping partners match your current search or filter criteria. Try clearing filters or connect a custom supplier API.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Rate Dropshipping Partner Modal */}
      {ratingSupplier && (
        <RateSupplierModal
          isOpen={Boolean(ratingSupplier)}
          onClose={() => setRatingSupplier(null)}
          supplier={ratingSupplier}
          currentUserId={currentUser?.id || 'seller_current'}
          currentUserName={currentUser?.name || 'Kamronbek Alimov'}
          currentUserStoreName={store?.name || 'Sellnex Merchant Store'}
          onSubmitReview={async (reviewData) => {
            await addSupplierReview(reviewData);
          }}
        />
      )}

      {/* Supplier Reviews Drawer / Modal */}
      {viewingReviewsSupplier && (
        <SupplierReviewsModal
          isOpen={Boolean(viewingReviewsSupplier)}
          onClose={() => setViewingReviewsSupplier(null)}
          supplier={viewingReviewsSupplier}
          reviews={getSupplierReviews(viewingReviewsSupplier.id)}
          onOpenRateModal={() => {
            setRatingSupplier(viewingReviewsSupplier);
          }}
        />
      )}

      {/* Add Custom Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Connect Custom Supplier / Warehouse</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-500">
              Integrate your direct wholesale partner, local workshop, or private warehouse API into Sellnex.
            </p>

            <form onSubmit={handleCreateCustomSupplier} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Business Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Tashkent Wholesale Tech Hub"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Warehouse Hub</label>
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Endpoint / Webhook URL</label>
                <input
                  type="url"
                  value={customApi}
                  onChange={(e) => setCustomApi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-mono text-[11px] focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Avg Delivery Turnaround</label>
                  <input
                    type="text"
                    value={customDelivery}
                    onChange={(e) => setCustomDelivery(e.target.value)}
                    placeholder="e.g. 1–2 days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shipping Cost (UZS)</label>
                  <input
                    type="number"
                    value={customShippingCost}
                    onChange={(e) => setCustomShippingCost(e.target.value)}
                    placeholder="20000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-xs"
                >
                  Connect Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
