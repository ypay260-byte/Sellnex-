import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Settings,
  Sparkles,
  Save,
} from 'lucide-react';

export const DeliveryView: React.FC = () => {
  const { formatMoney, showToast } = useApp();

  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(300000);
  const [shippingZones, setShippingZones] = useState([
    { region: 'Tashkent City', standardFee: 20000, expressFee: 35000, deliveryTime: '12 – 24 Hours' },
    { region: 'Tashkent Region', standardFee: 25000, expressFee: 40000, deliveryTime: '24 Hours' },
    { region: 'Samarkand Region', standardFee: 30000, expressFee: 50000, deliveryTime: '24 – 48 Hours' },
    { region: 'Bukhara Region', standardFee: 30000, expressFee: 50000, deliveryTime: '24 – 48 Hours' },
    { region: 'Fergana Valley (Fergana, Andijan, Namangan)', standardFee: 30000, expressFee: 50000, deliveryTime: '24 – 48 Hours' },
    { region: 'Kashkadarya & Surkhandarya', standardFee: 35000, expressFee: 55000, deliveryTime: '48 Hours' },
    { region: 'Khorezm & Republic of Karakalpakstan', standardFee: 40000, expressFee: 65000, deliveryTime: '48 – 72 Hours' },
    { region: 'Navoiy & Jizzakh & Sirdaryo', standardFee: 30000, expressFee: 45000, deliveryTime: '24 – 48 Hours' },
  ]);

  const handleUpdateFee = (index: number, field: 'standardFee' | 'expressFee', val: number) => {
    const updated = [...shippingZones];
    updated[index][field] = val;
    setShippingZones(updated);
  };

  const handleSaveAll = () => {
    showToast('Shipping Rates Saved!', 'Regional delivery matrix updated for checkout calculation.', 'success');
  };

  return (
    <div id="delivery-view-root" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header with Back button */}
      <BackHeader
        title="Regional Delivery & Couriers"
        subtitle="Configure courier integrations, regional shipping fees, and free delivery thresholds for Uzbekistan."
        fallbackRoute="dashboard"
        rightElement={
          <button
            id="btn-save-delivery-rates"
            onClick={handleSaveAll}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Shipping Matrix</span>
          </button>
        }
      />

      {/* Free Shipping Rule Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Free Delivery Threshold Promotion</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatically make shipping free at checkout when cart total exceeds this amount.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active Promotion
          </span>
        </div>

        <div className="pt-2 flex items-center gap-3 max-w-md">
          <input
            type="number"
            step="50000"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            className="flex-1 px-4 py-2.5 text-sm font-bold border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          <span className="text-xs font-mono text-slate-500">UZS</span>
        </div>
      </div>

      {/* Regional Matrix Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Uzbekistan Regional Rates Matrix</h3>
          <span className="text-xs text-slate-400">Integrated with UzPost & BTS Cargo</span>
        </div>

        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Region / Zone</th>
                <th className="py-3.5 px-3">Est. Delivery Time</th>
                <th className="py-3.5 px-3">Standard Courier Fee (UZS)</th>
                <th className="py-3.5 px-3">Express 24h Fee (UZS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shippingZones.map((z, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{z.region}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{z.deliveryTime}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <input
                      type="number"
                      step="5000"
                      value={z.standardFee}
                      onChange={(e) => handleUpdateFee(idx, 'standardFee', Number(e.target.value))}
                      className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-hidden bg-slate-50 focus:bg-white min-h-[36px]"
                    />
                  </td>

                  <td className="py-3.5 px-3">
                    <input
                      type="number"
                      step="5000"
                      value={z.expressFee}
                      onChange={(e) => handleUpdateFee(idx, 'expressFee', Number(e.target.value))}
                      className="w-32 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-hidden bg-slate-50 focus:bg-white min-h-[36px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {shippingZones.map((z, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{z.region}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {z.deliveryTime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Standard (UZS)</label>
                  <input
                    type="number"
                    step="5000"
                    value={z.standardFee}
                    onChange={(e) => handleUpdateFee(idx, 'standardFee', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-hidden bg-slate-50 focus:bg-white min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Express 24h (UZS)</label>
                  <input
                    type="number"
                    step="5000"
                    value={z.expressFee}
                    onChange={(e) => handleUpdateFee(idx, 'expressFee', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-hidden bg-slate-50 focus:bg-white min-h-[40px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
