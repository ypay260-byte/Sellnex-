import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
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
} from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, showToast, navigateTo } = useApp();

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCountry, setCustomCountry] = useState('Uzbekistan (Tashkent)');
  const [customApi, setCustomApi] = useState('https://api.supplier.uz/v1');

  const handleSyncSupplier = async (id: string, name: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 1000));
    setSyncingId(null);
    showToast('Supplier Synced!', `Catalog and stock inventory refreshed for ${name}.`, 'success');
  };

  return (
    <div id="suppliers-view-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <BackHeader
        title="Wholesale Suppliers Directory"
        subtitle="Connected dropshipping hubs, regional fulfillment warehouses, and global product sources."
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

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((s) => (
          <div
            key={s.id}
            id={`supplier-card-${s.id}`}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{s.logo}</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    s.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  ● {s.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{s.country}</span>
              </p>

              {/* Specs */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600" /> Delivery Time:</span>
                  <span className="font-bold text-slate-900">{s.avgDeliveryDays}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Reliability Score:</span>
                  <span className="font-bold text-slate-900">{s.reliabilityScore}/5.0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-600" /> Connected Catalog:</span>
                  <span className="font-semibold text-slate-900">{s.productCount} items</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
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
                className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
              >
                Import Items
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Connect Custom Supplier / Warehouse</h3>
            <p className="text-slate-500">
              Integrate your direct wholesale partner, local workshop, or private warehouse API into Sellnex.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Business Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Tashkent Wholesale Tech Hub"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Warehouse Hub</label>
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Endpoint / Webhook URL</label>
                <input
                  type="url"
                  value={customApi}
                  onChange={(e) => setCustomApi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-mono text-[11px]"
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
                type="button"
                onClick={() => {
                  showToast('Supplier Connected!', `Connected ${customName || 'Custom Supplier'} API`, 'success');
                  setIsModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-xs"
              >
                Connect Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
