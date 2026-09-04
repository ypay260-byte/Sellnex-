import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BackHeader } from '../components/common/BackHeader';
import {
  Bot,
  Zap,
  CheckCircle2,
  Bell,
  RefreshCw,
  Truck,
  DollarSign,
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
  Send,
  Sliders,
  ExternalLink,
  MessageSquare,
  Key,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { telegramService } from '../services/telegramService';

export const AutomationView: React.FC = () => {
  const { automationSettings, updateAutomationSettings, showToast, formatMoney } = useApp();

  const [isSimulating, setIsSimulating] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState(() => telegramService.getConfig());
  const [chatIdInput, setChatIdInput] = useState(telegramConfig.chatId || '');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [isCheckingBot, setIsCheckingBot] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [recentChats, setRecentChats] = useState<Array<{ id: string; name: string; username?: string; text?: string }>>([]);

  useEffect(() => {
    checkBotStatus();
  }, []);

  const checkBotStatus = async () => {
    setIsCheckingBot(true);
    const res = await telegramService.getBotInfo();
    if (res.success) {
      setBotInfo(res.data);
    }
    setIsCheckingBot(false);
  };

  const handleFetchUpdates = async () => {
    setIsCheckingBot(true);
    const res = await telegramService.getRecentChatUpdates();
    if (res.success && res.chats.length > 0) {
      setRecentChats(res.chats);
      if (!chatIdInput && res.chats[0]) {
        setChatIdInput(res.chats[0].id);
        const updated = telegramService.saveConfig({ chatId: res.chats[0].id });
        setTelegramConfig(updated);
        showToast('Chat ID aniqlandi!', `${res.chats[0].name} (${res.chats[0].id}) avtomatik ulandi.`, 'success');
      } else {
        showToast('Chatlar topildi', `${res.chats.length} ta Telegram chat aniqlandi.`, 'info');
      }
    } else {
      showToast('Xabar topilmadi', 'Iltimos, avval Telegramda botingizga kiring va /start bosing, so\'ng bu tugmani bosing.', 'warning');
    }
    setIsCheckingBot(false);
  };

  const handleSaveChatId = () => {
    const updated = telegramService.saveConfig({ chatId: chatIdInput.trim() });
    setTelegramConfig(updated);
    showToast('Telegram Chat ID saqlandi', `Xabarlar ${chatIdInput} chatiga yuboriladi.`, 'success');
  };

  const handleSendTestNotification = async () => {
    if (!chatIdInput) {
      showToast('Chat ID kiritilmagan', 'Iltimos, Chat ID kiriting yoki botga /start bosib "Chat ID ni aniqlash" tugmasini bosing.', 'warning');
      return;
    }
    setIsSendingTest(true);
    const res = await telegramService.sendTestMessage(chatIdInput.trim());
    setIsSendingTest(false);
    if (res.success) {
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch {
        // ignore
      }
      showToast('Telegramga xabar yuborildi! 🚀', 'Botingizni tekshiring, sinov xabari yetib bordi.', 'success');
    } else {
      showToast('Xatolik yuz berdi', res.error || 'Xabar yuborib bo\'lmadi. Botga /start bosilganini tekshiring.', 'error');
    }
  };
  const [logs, setLogs] = useState([
    {
      id: 'log-1',
      time: '10:45 AM',
      type: 'fulfillment',
      msg: 'Order #SL-1024 auto-routed to Amazon Global Hub • Tracking: UZP-88492011',
      status: 'Success',
    },
    {
      id: 'log-2',
      time: '09:12 AM',
      type: 'sync',
      msg: 'Sync completed: 42 products updated across Amazon & Uzum Market catalogs.',
      status: 'Success',
    },
    {
      id: 'log-3',
      time: 'Yesterday',
      type: 'telegram',
      msg: 'Telegram alert sent to @kamron_seller for Order #SL-1023 (Click: 850,000 UZS)',
      status: 'Success',
    },
    {
      id: 'log-4',
      time: 'Yesterday',
      type: 'pricing',
      msg: 'Smart profit calculator adjusted selling prices following UZS/USD exchange rate update.',
      status: 'Success',
    },
  ]);

  const handleToggle = (key: keyof typeof automationSettings) => {
    const updated = { ...automationSettings, [key]: !automationSettings[key] };
    updateAutomationSettings(updated);
    showToast('Automation Rule Saved', `${String(key)} rule updated.`, 'success');
  };

  const handleTriggerTestLoop = async () => {
    setIsSimulating(true);
    showToast('Automation Triggered', 'Simulating end-to-end dropshipping order fulfillment loop...', 'info');

    await new Promise((r) => setTimeout(r, 1200));

    const newLog = {
      id: `log-${Date.now()}`,
      time: 'Just now',
      type: 'fulfillment',
      msg: 'Manual test loop executed: Sample order auto-dispatched to supplier and Telegram notified.',
      status: 'Success',
    };

    setLogs([newLog, ...logs]);
    setIsSimulating(false);

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    }

    showToast('Loop Finished', 'Dropshipping automation pipeline completed with 0 errors.', 'success');
  };

  return (
    <div id="automation-view-root" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <BackHeader
        badge="Autonomous Dropshipping Core"
        title="Fulfillment & Inventory Automation"
        subtitle="Configure rules for zero-touch order routing, supplier inventory syncing, and automated courier dispatches."
        fallbackRoute="dashboard"
        rightElement={
          <button
            id="btn-run-automation-test"
            onClick={handleTriggerTestLoop}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 min-h-[40px]"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Simulating Loop...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Trigger Test Automation</span>
              </>
            )}
          </button>
        }
      />

      {/* Main Automation Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rule 1: Auto Fulfill Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Automatic Supplier Order Placement</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Automatically places the wholesale dropshipping order with Amazon/Alibaba/Uzum as soon as the customer payment is verified via Click or Payme.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Status: {automationSettings.autoFulfillOrders ? 'Enabled (Instant)' : 'Manual Approval'}
            </span>
            <button
              id="toggle-auto-fulfill"
              onClick={() => handleToggle('autoFulfillOrders')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                automationSettings.autoFulfillOrders ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  automationSettings.autoFulfillOrders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Rule 2: Stock & Inventory Sync */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Real-Time Supplier Stock & Price Sync</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Polls suppliers every 15 minutes. Automatically updates stock quantities and adjusts retail prices if supplier wholesale pricing fluctuates.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Status: {automationSettings.autoSyncInventory ? 'Active (Every 15 min)' : 'Disabled'}
            </span>
            <button
              id="toggle-auto-sync"
              onClick={() => handleToggle('autoSyncInventory')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                automationSettings.autoSyncInventory ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  automationSettings.autoSyncInventory ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Rule 3: Telegram Bot Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Instant Telegram Bot Alerts</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sends instant push alerts to your Telegram channel / bot when a customer purchases, with full customer name, phone number, and net profit calculated.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Status: {automationSettings.telegramAlerts ? 'Connected (@SellnexOrderBot)' : 'Muted'}
            </span>
            <button
              id="toggle-telegram-alerts"
              onClick={() => handleToggle('telegramAlerts')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                automationSettings.telegramAlerts ? 'bg-cyan-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  automationSettings.telegramAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Rule 4: Automated Courier Tracking Dispatch */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Regional Courier Waybill Generation</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generates barcodes and booking labels for UzPost, BTS Cargo, Fargo Express, and sends live SMS tracking codes to buyers.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Status: {automationSettings.autoTrackingUpdate ? 'Enabled (Auto Waybill)' : 'Manual Booking'}
            </span>
            <button
              id="toggle-auto-tracking"
              onClick={() => handleToggle('autoTrackingUpdate')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                automationSettings.autoTrackingUpdate ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  automationSettings.autoTrackingUpdate ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Telegram Bot Live Settings & Notification Bridge */}
      <div id="telegram-bot-integration-card" className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">Telegram Bot Xabarnoma Tizimi (Shopify Style)</h2>
                <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  ● Bot Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Har bir dropshipping buyurtmasi, mijoz ismi, telefon raqami va sof foyda to'g'ridan-to'g'ri Telegramingizga keladi.
              </p>
            </div>
          </div>

          <button
            onClick={checkBotStatus}
            disabled={isCheckingBot}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBot ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Bot holatini tekshirish</span>
          </button>
        </div>

        {/* Bot Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-slate-400 font-medium">Ulangan Bot Token:</span>
            <p className="font-mono text-cyan-300 truncate font-semibold">
              8885318556:AAG...Z4YM
            </p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Token faol va sozlangan
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-slate-400 font-medium">Bot Nomi / Username:</span>
            <p className="font-bold text-white text-sm">
              {botInfo ? `@${botInfo.username || botInfo.first_name}` : '@SellnexUzBot'}
            </p>
            <span className="text-[10px] text-slate-400">Telegram rasmiy Bot API orqali</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-slate-400 font-medium">Xabarlar holati:</span>
            <p className="font-bold text-emerald-400 text-sm">
              {telegramConfig.chatId ? 'Tayyor (Chat ulangan)' : 'Chat ID kiritilishi kutilmoqda'}
            </p>
            <span className="text-[10px] text-slate-400">Shopify kabi har bir buyurtmada push</span>
          </div>
        </div>

        {/* Chat ID Input & Test Actions */}
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Sizning Telegram Chat ID yoki Kanal ID (@username yoki raqamli ID):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="input-telegram-chat-id"
                  value={chatIdInput}
                  onChange={(e) => setChatIdInput(e.target.value)}
                  placeholder="Masalan: 123456789 yoki @sizning_kanalingiz"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-hidden"
                />
                <button
                  id="btn-save-chat-id"
                  type="button"
                  onClick={handleSaveChatId}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs transition-colors shrink-0 shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-detect-chat-id"
                type="button"
                onClick={handleFetchUpdates}
                disabled={isCheckingBot}
                className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[40px]"
                title="Botga /start yozgan bo'lsangiz, ID ni avtomatik topadi"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chat ID ni aniqlash</span>
              </button>

              <button
                id="btn-send-telegram-test"
                type="button"
                onClick={handleSendTestNotification}
                disabled={isSendingTest}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-md min-h-[40px]"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-bounce' : ''}`} />
                <span>{isSendingTest ? 'Yuborilmoqda...' : 'Sinov xabari yuborish 🚀'}</span>
              </button>
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Botdan xabar olish uchun 2 ta oson qadam:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[11px]">
                <li>Telegramda o'zingiz yaratgan botga kiring va <b>/start</b> tugmasini bosing (yoki botni guruhingiz/kanalingizga admin qiling).</li>
                <li>Yuqoridagi <b>"Chat ID ni aniqlash"</b> tugmasini bosing yoki o'z Chat ID raqamingizni yozib <b>"Sinov xabari yuborish"</b>ni sinab ko'ring!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Live Automation Logs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Automation Activity Stream</h3>
            <p className="text-xs text-slate-500">Live background system events and sync triggers</p>
          </div>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ● Engine: Healthy
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                <div>
                  <p className="font-medium text-slate-900">{log.msg}</p>
                  <span className="text-[11px] text-slate-400">{log.time}</span>
                </div>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
