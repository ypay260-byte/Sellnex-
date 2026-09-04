import React, { useState } from 'react';
import { AdminSettings } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Settings as SettingsIcon,
  Save,
  Send,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  DollarSign,
  Shield,
  Bot,
  RefreshCw,
  Power,
  Globe,
  BellRing,
} from 'lucide-react';

interface AdminSettingsTabProps {
  settings: AdminSettings | null;
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  adminEmail,
  onRefresh,
  showToast,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State initialized from Firestore Admin Settings
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode || false);
  const [allowRegistration, setAllowRegistration] = useState(settings?.allowRegistration !== false);
  const [usdToUzsRate, setUsdToUzsRate] = useState(settings?.usdToUzsRate || 12800);
  const [p2pCardNumber, setP2pCardNumber] = useState(settings?.p2pCardNumber || '8600 3141 7549 7736');
  const [p2pCardHolder, setP2pCardHolder] = useState(settings?.p2pCardHolder || 'Sellnex Bosh Administratsiyasi');
  const [p2pBankName, setP2pBankName] = useState(settings?.p2pBankName || 'Milliy Bank / Uzcard Humo');
  const [p2pPhoneNumber, setP2pPhoneNumber] = useState(settings?.p2pPhoneNumber || '+998 90 123 45 67');
  const [p2pInstructions, setP2pInstructions] = useState(
    settings?.p2pInstructions ||
      'To‘lovni ko‘rsatilgan markaziy administratsiya karta raqamiga yuboring. Mahsulot mijozga yetkazilgach sotuvchiga pul o‘tkaziladi.'
  );
  const [telegramBotToken, setTelegramBotToken] = useState(settings?.telegramBotToken || '8221894297:AAGsXEaVM0qcPcukoOhzux3ohR_EctKqdvs');
  const [telegramAdminChatId, setTelegramAdminChatId] = useState(settings?.telegramAdminChatId || '');
  const [supportTelegram, setSupportTelegram] = useState(settings?.supportTelegram || '@sellnex_support');
  const [supportEmail, setSupportEmail] = useState(settings?.supportEmail || 'support@sellnex.uz');
  const [supportPhone, setSupportPhone] = useState(settings?.supportPhone || '+998 71 200 00 00');
  const [notifyOnNewUser, setNotifyOnNewUser] = useState(settings?.notifyOnNewUser !== false);
  const [notifyOnP2P, setNotifyOnP2P] = useState(settings?.notifyOnP2P !== false);
  const [notifyOnOrder, setNotifyOnOrder] = useState(settings?.notifyOnOrder || false);

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updatedSettings: Partial<AdminSettings> = {
        maintenanceMode,
        allowRegistration,
        usdToUzsRate: Number(usdToUzsRate),
        p2pCardNumber: p2pCardNumber.trim(),
        p2pCardHolder: p2pCardHolder.trim(),
        p2pBankName: p2pBankName.trim(),
        p2pPhoneNumber: p2pPhoneNumber.trim(),
        p2pInstructions: p2pInstructions.trim(),
        telegramBotToken: telegramBotToken.trim(),
        telegramAdminChatId: telegramAdminChatId.trim(),
        supportTelegram: supportTelegram.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim(),
        notifyOnNewUser,
        notifyOnP2P,
        notifyOnOrder,
      };

      await firestoreService.saveAdminSettings(updatedSettings);

      await firestoreService.createAuditLog({
        adminEmail,
        action: 'update_platform_settings',
        targetType: 'admin_settings',
        targetId: 'global',
        oldValue: null,
        newValue: updatedSettings,
        details: `Platform settings updated by ${adminEmail}`,
        userAgent: navigator.userAgent,
      });

      showToast('Settings Saved', 'Platform configuration synchronized with Firestore database', 'success');
      await onRefresh();
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Test Telegram Notification
  const handleTestTelegramNotification = async () => {
    if (!telegramBotToken || !telegramAdminChatId) {
      showToast('Missing Credentials', 'Please input Telegram Bot Token and Chat ID before testing', 'error');
      return;
    }

    try {
      const message = `🔔 <b>Sellnex Admin Alert Test</b>\n\n✅ Telegram Dispatcher active.\n👤 Admin: ${adminEmail}\n⏰ Time: ${new Date().toLocaleString()}`;
      const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramAdminChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      showToast('Test Sent', 'Telegram test notification delivered to Admin Chat ID!', 'success');
    } catch (err: any) {
      showToast('Telegram Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">System Governance</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Platform Global Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure platform maintenance mode, currency exchange rates, Telegram bot alerts, and support contacts.
          </p>
        </div>

        <button
          onClick={() => onRefresh()}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSavePlatformSettings} className="space-y-6">
        {/* Maintenance & Registrations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Power className="w-4 h-4 text-rose-400" />
            <span>Platform State & Accessibility</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Global Maintenance Mode</div>
                <div className="text-[11px] text-slate-500">Temporarily suspend storefronts for platform maintenance</div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    maintenanceMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Allow New Merchant Signups</div>
                <div className="text-[11px] text-slate-500">Enable or freeze new merchant registration flow</div>
              </div>
              <button
                type="button"
                onClick={() => setAllowRegistration(!allowRegistration)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  allowRegistration ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowRegistration ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Currency & Exchange */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Currency & Valuation Exchange Rates</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">USD to UZS Official Conversion Rate</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">$1.00 USD =</span>
                <input
                  type="number"
                  value={usdToUzsRate}
                  onChange={(e) => setUsdToUzsRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                />
                <span className="text-slate-400 font-bold">UZS</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Used for dual currency calculations and plan checkouts.</span>
            </div>
          </div>
        </div>

        {/* Central Admin Escrow P2P Card Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Bosh Administratsiya P2P Escrow Karta Sozlamalari</span>
            </h3>
            <span className="text-[11px] bg-emerald-950 text-emerald-300 font-mono px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
              Markaziy Kassa
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Xaridorlar to‘lov qilganda mablag‘ avval mana shu kartaga tushadi. Sotuvchi mahsulotni yetkazib bergandan so‘ng administratsiya sotuvchining kartasiga pulni tashlab beradi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Markaziy Karta Raqami *</label>
              <input
                type="text"
                value={p2pCardNumber}
                onChange={(e) => setP2pCardNumber(e.target.value)}
                placeholder="8600 3141 7549 7736"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Karta Egasi (F.I.O yoki Tashkilot) *</label>
              <input
                type="text"
                value={p2pCardHolder}
                onChange={(e) => setP2pCardHolder(e.target.value)}
                placeholder="Sellnex Bosh Administratsiyasi"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Nomi / Tizim</label>
              <input
                type="text"
                value={p2pBankName}
                onChange={(e) => setP2pBankName(e.target.value)}
                placeholder="Milliy Bank / Uzcard Humo"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bog‘lanish Telefon Raqami</label>
              <input
                type="text"
                value={p2pPhoneNumber}
                onChange={(e) => setP2pPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Xaridorlar uchun to‘lov ko‘rsatmasi</label>
              <textarea
                rows={2}
                value={p2pInstructions}
                onChange={(e) => setP2pInstructions(e.target.value)}
                placeholder="To‘lovni ko‘rsatilgan markaziy administratsiya karta raqamiga yuboring..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Automation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Admin Telegram Bot Dispatcher</span>
            </h3>

            <button
              type="button"
              onClick={handleTestTelegramNotification}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Send Test Ping</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telegram Bot Token (from @BotFather)</label>
              <input
                type="text"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admin Telegram Chat ID</label>
              <input
                type="text"
                value={telegramAdminChatId}
                onChange={(e) => setTelegramAdminChatId(e.target.value)}
                placeholder="e.g. 987654321 or @admin_channel"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={notifyOnNewUser}
                onChange={(e) => setNotifyOnNewUser(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800"
              />
              <span>Notify on New User Registration</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={notifyOnP2P}
                onChange={(e) => setNotifyOnP2P(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800"
              />
              <span>Notify on P2P Payment Submitted</span>
            </label>
          </div>
        </div>

        {/* Support Contacts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-400" />
            <span>Platform Support Helpdesk Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Telegram Support</label>
              <input
                type="text"
                value={supportTelegram}
                onChange={(e) => setSupportTelegram(e.target.value)}
                placeholder="@sellnex_support"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@sellnex.uz"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Support Phone Hotline</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+998 71 200 00 00"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Global Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
