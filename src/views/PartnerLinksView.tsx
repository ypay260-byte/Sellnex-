import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import {
  Link2,
  Copy,
  Plus,
  TrendingUp,
  Share2,
  CheckCircle2,
  Percent,
  Sparkles,
  Users,
  DollarSign,
} from 'lucide-react';

interface PartnerLink {
  id: string;
  campaignName: string;
  creatorName: string;
  source: string;
  commissionPercent: number;
  url: string;
  clicks: number;
  ordersCount: number;
  totalSales: number;
  commissionPaid: number;
  netProfit: number;
}

export const PartnerLinksView: React.FC = () => {
  const { store, getStoreUrl, formatMoney, showToast } = useApp();

  const [links, setLinks] = useState<PartnerLink[]>(() => [
    {
      id: 'pl-1',
      campaignName: 'Tashkent Tech TikTok Review',
      creatorName: '@tech_tashkent',
      source: 'TikTok',
      commissionPercent: 10,
      url: `${getStoreUrl(store.slug)}?ref=tech_tashkent&utm_source=tiktok`,
      clicks: 1420,
      ordersCount: 48,
      totalSales: 4800000,
      commissionPaid: 480000,
      netProfit: 860000,
    },
    {
      id: 'pl-2',
      campaignName: 'Telegram Gadgets Channel Promo',
      creatorName: '@gadgets_uz',
      source: 'Telegram',
      commissionPercent: 8,
      url: `${getStoreUrl(store.slug)}?ref=gadgets_uz&utm_source=telegram`,
      clicks: 890,
      ordersCount: 29,
      totalSales: 3100000,
      commissionPaid: 248000,
      netProfit: 620000,
    },
  ]);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [source, setSource] = useState('Instagram');
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = (creatorName || campaignName).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newLink: PartnerLink = {
      id: `pl-${Date.now()}`,
      campaignName: campaignName || 'Creator Campaign',
      creatorName: creatorName || 'Affiliate Partner',
      source,
      commissionPercent,
      url: `${getStoreUrl(store.slug)}?ref=${cleanRef}&utm_source=${source.toLowerCase()}`,
      clicks: 0,
      ordersCount: 0,
      totalSales: 0,
      commissionPaid: 0,
      netProfit: 0,
    };

    setLinks([newLink, ...links]);
    setIsModalOpen(false);
    showToast('Tracking Link Created!', `Generated trackable URL for ${newLink.creatorName}`, 'success');
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Link Copied!', 'Campaign URL copied to clipboard.', 'info');
  };

  return (
    <div id="partner-links-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Affiliate & Creator Links"
        subtitle="Create custom attribution links for influencers on Instagram, TikTok, and Telegram to track sales and pay commissions."
        fallbackRoute="dashboard"
        rightElement={
          <button
            id="btn-create-partner-link"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Tracking Link</span>
          </button>
        }
      />

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Affiliate Sales</p>
          <p className="text-xl font-black text-slate-900">
            {formatMoney(links.reduce((acc, l) => acc + l.totalSales, 0))}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Across all creators</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Clicks Tracked</p>
          <p className="text-xl font-black text-blue-600">
            {links.reduce((acc, l) => acc + l.clicks, 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Unique visitor sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Net Profit Generated</p>
          <p className="text-xl font-black text-emerald-600">
            {formatMoney(links.reduce((acc, l) => acc + l.netProfit, 0))}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">After creator commissions</span>
        </div>
      </div>

      {/* Links Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Campaign & Creator</th>
                <th className="py-3.5 px-3">Source Channel</th>
                <th className="py-3.5 px-3">Commission</th>
                <th className="py-3.5 px-3">Clicks</th>
                <th className="py-3.5 px-3">Orders</th>
                <th className="py-3.5 px-3">Gross Sales</th>
                <th className="py-3.5 px-3">Net Profit</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{link.campaignName}</p>
                    <p className="text-[11px] text-blue-600 font-medium">{link.creatorName}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {link.source}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-900">
                    {link.commissionPercent}%
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                    {link.clicks.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {link.ordersCount}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {formatMoney(link.totalSales)}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-emerald-600">
                    +{formatMoney(link.netProfit)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 ml-auto min-h-[36px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {links.map((link) => (
            <div key={link.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{link.campaignName}</p>
                  <p className="text-[11px] text-blue-600 font-medium">{link.creatorName}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                  {link.source}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Commission</span>
                  <span className="font-bold text-slate-800">{link.commissionPercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Clicks</span>
                  <span className="font-bold text-slate-800">{link.clicks.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Orders</span>
                  <span className="font-bold text-slate-800">{link.ordersCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Net Profit</span>
                  <span className="font-black text-emerald-600">+{formatMoney(link.netProfit)}</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(link.url)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Tracking Link</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Create Creator Tracking Link</h3>

            <form onSubmit={handleCreateLink} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Samarkand Lifestyle Bloggers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Creator / Handle</label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. @nodira_lifestyle"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Traffic Channel</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-slate-50"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Telegram">Telegram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Direct">Direct Referral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-bold"
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
                  Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
