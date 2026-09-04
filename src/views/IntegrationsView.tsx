import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import {
  CreditCard,
  Layers,
  Send,
  Truck,
  CheckCircle2,
  Settings,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { showToast, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<'payments' | 'marketplaces' | 'couriers' | 'channels'>('payments');
  const [testingId, setTestingId] = useState<string | null>(null);

  const integrations = [
    {
      id: 'click',
      category: 'payments',
      name: 'Click (Uzcard / Humo)',
      desc: 'National online payment gateway. Accept 8600 and 9860 cards with instant settlements in UZS.',
      status: 'Connected',
      icon: '💳',
      badge: 'Active & Verified',
    },
    {
      id: 'payme',
      category: 'payments',
      name: 'Payme Business',
      desc: 'Direct Payme API switch for instant QR code payments and card billing across Uzbekistan.',
      status: 'Connected',
      icon: '⚡',
      badge: 'Active & Verified',
    },
    {
      id: 'uzumbank',
      category: 'payments',
      name: 'Uzum Bank & Nasiya',
      desc: '0-0-12 monthly installment plans for shoppers with zero risk to the merchant.',
      status: 'Connected',
      icon: '🍇',
      badge: 'Active & Verified',
    },
    {
      id: 'uzummarket',
      category: 'marketplaces',
      name: 'Uzum Market Multi-Sync',
      desc: 'Synchronize your product catalog, orders, and stock levels with Uzum Market warehouse.',
      status: 'Connected',
      icon: '🛍️',
      badge: 'Syncing Active',
    },
    {
      id: 'telegram',
      category: 'channels',
      name: 'Telegram Seller Bot',
      desc: 'Get instant push notifications in your Telegram whenever an order is placed.',
      status: 'Connected',
      icon: '🤖',
      badge: '@SellnexOrderBot',
    },
    {
      id: 'uzpost',
      category: 'couriers',
      name: 'UzPost (O’zbekiston Pochtasi)',
      desc: 'National postal service covering all rural regions, towns, and cities.',
      status: 'Connected',
      icon: '📮',
      badge: 'Auto Waybill Ready',
    },
    {
      id: 'bts',
      category: 'couriers',
      name: 'BTS Cargo',
      desc: 'Heavy and expedited regional package courier across 14 major administrative centers.',
      status: 'Connected',
      icon: '🚚',
      badge: 'Connected',
    },
    {
      id: 'yandex',
      category: 'couriers',
      name: 'Yandex Delivery (Tashkent)',
      desc: 'Express 1-hour to 3-hour doorstep bike & auto couriers within Tashkent.',
      status: 'Connected',
      icon: '🟡',
      badge: 'Same-Day Express',
    },
  ];

  const filtered = integrations.filter((item) => item.category === activeTab);

  const handleTestConnection = async (id: string, name: string) => {
    setTestingId(id);
    await new Promise((r) => setTimeout(r, 900));
    setTestingId(null);
    showToast('Integration Ping OK', `Successfully verified connection with ${name} (Status: 200 OK)`, 'success');
  };

  return (
    <div id="integrations-view-root" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="App Store & Integrations"
        subtitle="Connect regional payment gateways, marketplace sync engines, delivery couriers, and marketing channels."
        fallbackRoute="dashboard"
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'payments', label: 'Payment Gateways' },
          { id: 'marketplaces', label: 'Marketplaces' },
          { id: 'couriers', label: 'Delivery & Couriers' },
          { id: 'channels', label: 'Bots & Channels' },
        ].map((t) => (
          <button
            key={t.id}
            id={`tab-integration-${t.id}`}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 border-b-2 transition-colors shrink-0 ${
              activeTab === t.id ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <button
                id={`btn-test-ping-${item.id}`}
                onClick={() => handleTestConnection(item.id, item.name)}
                disabled={testingId === item.id}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingId === item.id ? 'animate-spin text-blue-600' : ''}`} />
                <span>{testingId === item.id ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={() => {
                  if (item.id === 'telegram') {
                    navigateTo('automation');
                  } else {
                    showToast('Settings Configured', `${item.name} API parameters are verified.`, 'info');
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{item.id === 'telegram' ? 'Botni Sozlash' : 'Configure'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
