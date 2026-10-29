import React, { useState, useEffect, useMemo } from 'react';
import { Blogger, BloggerAttribution } from '../types';
import { firestoreService } from '../services/firestoreService';
import {
  Users,
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  CreditCard,
  Percent,
  Calendar,
  Lock,
  Key,
  ShieldCheck,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Share2,
  ExternalLink,
  ArrowRight,
  Gift,
} from 'lucide-react';

interface BloggerPortalViewProps {
  initialCode?: string;
  initialKey?: string;
}

export const BloggerPortalView: React.FC<BloggerPortalViewProps> = ({
  initialCode = '',
  initialKey = '',
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState(initialCode);
  const [secretKeyInput, setSecretKeyInput] = useState(initialKey);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Authenticated Blogger State
  const [blogger, setBlogger] = useState<Blogger | null>(null);
  const [attributions, setAttributions] = useState<BloggerAttribution[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check URL params or session storage on mount
  useEffect(() => {
    const rawHash = typeof window !== 'undefined' ? window.location.hash : '';
    const rawSearch = typeof window !== 'undefined' ? window.location.search : '';

    let code = initialCode;
    let key = initialKey;

    // Check search params
    const sParams = new URLSearchParams(rawSearch);
    if (!code) code = sParams.get('code') || sParams.get('blogger') || '';
    if (!key) key = sParams.get('key') || '';

    // Check hash params (#blogger/TIMUR?key=...)
    if (rawHash) {
      const cleanHash = rawHash.replace(/^#\/?/, '');
      if (cleanHash.startsWith('blogger/')) {
        const parts = cleanHash.split('?')[0].split('/');
        if (parts[1]) code = decodeURIComponent(parts[1]);
      }
      const qIndex = rawHash.indexOf('?');
      if (qIndex !== -1) {
        const hParams = new URLSearchParams(rawHash.slice(qIndex));
        if (!key) key = hParams.get('key') || '';
        if (!code) code = hParams.get('code') || '';
      }
    }

    // Check sessionStorage
    if (!code || !key) {
      try {
        const cached = sessionStorage.getItem('sellnex_blogger_session');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.code && parsed.key) {
            code = parsed.code;
            key = parsed.key;
          }
        }
      } catch {}
    }

    if (code) setPromoCodeInput(code.toUpperCase());
    if (key) setSecretKeyInput(key);

    if (code && key) {
      handleLogin(code.toUpperCase(), key);
    }
  }, [initialCode, initialKey]);

  // Handle Login
  const handleLogin = async (codeToVerify?: string, keyToVerify?: string) => {
    const code = (codeToVerify || promoCodeInput).trim().toUpperCase();
    const key = (keyToVerify || secretKeyInput).trim();

    if (!code || !key) {
      setAuthError('Iltimos, promokod va maxfiy kalitni kiriting');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const foundBlogger = await firestoreService.getBloggerByPromoCode(code);
      if (!foundBlogger) {
        setAuthError('Bunday promokodga ega blogger topilmadi');
        setIsAuthenticating(false);
        return;
      }

      if (!foundBlogger.isActive) {
        setAuthError('Ushbu blogger hamkorligi hozirda faol emas');
        setIsAuthenticating(false);
        return;
      }

      if (foundBlogger.secretKey !== key) {
        setAuthError('Maxfiy kalit (Secret Key) noto‘g‘ri kiritildi');
        setIsAuthenticating(false);
        return;
      }

      // Successful auth
      setBlogger(foundBlogger);
      try {
        sessionStorage.setItem(
          'sellnex_blogger_session',
          JSON.stringify({ code: foundBlogger.promoCode, key: foundBlogger.secretKey })
        );
      } catch {}

      // Load this blogger's attributions
      await loadAttributions(foundBlogger.id);
    } catch (err: any) {
      console.error('Blogger login error:', err);
      setAuthError('Tizimga kirishda xatolik yuz berdi: ' + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadAttributions = async (bloggerId: string) => {
    setIsLoadingData(true);
    try {
      const list = await firestoreService.getBloggerAttributions(bloggerId);
      setAttributions(list);
    } catch (err) {
      console.error('Failed to load attributions:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    setBlogger(null);
    setAttributions([]);
    try {
      sessionStorage.removeItem('sellnex_blogger_session');
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const formatMoney = (amount: number = 0) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  // Mask client identity for PII privacy (e.g. +998 90 *** ** 45)
  const maskPhoneOrEmail = (raw?: string) => {
    if (!raw) return '—';
    if (raw.includes('@')) {
      const [name, domain] = raw.split('@');
      const visible = name.slice(0, 3);
      return `${visible}***@${domain}`;
    }
    const clean = raw.replace(/\s+/g, '');
    if (clean.length >= 7) {
      return `${clean.slice(0, 6)} *** ** ${clean.slice(-2)}`;
    }
    return `${clean.slice(0, 3)}***`;
  };

  // Filtered attributions by time
  const filteredAttributions = useMemo(() => {
    if (timeFilter === 'all') return attributions;
    const now = new Date();
    return attributions.filter((a) => {
      const d = new Date(a.createdAt);
      if (timeFilter === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= monthAgo;
      }
      return true;
    });
  }, [attributions, timeFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalClients = filteredAttributions.length;
    const confirmedList = filteredAttributions.filter((a) => a.status === 'confirmed');
    const confirmedCount = confirmedList.length;
    const pendingCount = filteredAttributions.filter((a) => a.status === 'pending').length;
    const totalRevenue = confirmedList.reduce((acc, a) => acc + (a.amountUZS || 0), 0);
    const commissionPercent = blogger?.commissionPercent || 15;
    const bloggerEarnings = (totalRevenue * commissionPercent) / 100;
    const conversionRate = totalClients > 0 ? ((confirmedCount / totalClients) * 100).toFixed(1) : '0';

    return {
      totalClients,
      confirmedCount,
      pendingCount,
      totalRevenue,
      bloggerEarnings,
      conversionRate,
    };
  }, [filteredAttributions, blogger]);

  // LOGIN SCREEN
  if (!blogger) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 antialiased">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-black text-white tracking-tight">
              Sellnex Blogger Kabineti
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              O‘z promokodingiz orqali jalb qilingan mijozlar, tasdiqlangan to‘lovlar va daromadlaringizni real vaqtda kuzating.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sizning Promokodingiz
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">#</span>
                <input
                  type="text"
                  required
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="TIMUR2026"
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs font-mono font-bold text-indigo-400 uppercase outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maxfiy Kirish Kaliti (Secret Key)
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={secretKeyInput}
                  onChange={(e) => setSecretKeyInput(e.target.value)}
                  placeholder="key_xxxxxxxxx"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs font-mono text-white outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Ushbu kalit Sellnex administratsiyasi tomonidan sizga taqdim etiladi.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Kabinetga Kirish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Sellnex Bosh Sahifasiga Qaytish
            </a>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED BLOGGER DASHBOARD
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${blogger.promoCode}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bar */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            {blogger.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">{blogger.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono text-[10px] font-bold">
                {blogger.promoCode}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Sellnex Hamkorlik Paneli</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => loadAttributions(blogger.id)}
            disabled={isLoadingData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Welcome & Referral Share Card */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/50 p-5 sm:p-6 rounded-3xl border border-indigo-900/50 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase mb-2">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Hamkorlik Shartnomasi Faol</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Xush kelibsiz, {blogger.name}! 👋
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Sizning promokodingiz orqali obuna xarid qilgan foydalanuvchilarga{' '}
                <strong className="text-emerald-400">
                  {blogger.discountType === 'percent' ? `${blogger.discountValue || 10}%` : `${formatMoney(blogger.discountValue || 0)}`} chegirma
                </strong>{' '}
                beriladi, har bir muvaffaqiyatli to‘lovdan esa sizga{' '}
                <strong className="text-purple-400">{blogger.commissionPercent}% komissiya</strong> yoziladi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              {/* Promo code badge with copy */}
              <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-3 w-full sm:w-auto justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Promokod</span>
                  <span className="font-mono font-black text-indigo-400 text-sm tracking-wider">
                    {blogger.promoCode}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(blogger.promoCode, 'code')}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Nusxalash"
                >
                  {copiedKey === 'code' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Referral Link Copy */}
              <button
                onClick={() => handleCopy(referralLink, 'link')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {copiedKey === 'link' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Referal Havolani Nusxalash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Time Filter Bar */}
        <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Statistika davri:</span>
          </span>

          <div className="flex items-center gap-1.5">
            {(['all', 'today', 'week', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  timeFilter === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t === 'all'
                  ? 'Barchasi'
                  : t === 'today'
                  ? 'Bugun'
                  : t === 'week'
                  ? 'Shu hafta'
                  : 'Shu oy'}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400">👥 Jalb Qilinganlar</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400">
              {stats.totalClients}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">promokod orqali kelgan</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400">💳 Pullik Obunalar</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats.confirmedCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.pendingCount > 0 ? `${stats.pendingCount} ta to‘lov kutilmoqda` : 'muvaffaqiyatli to‘lovlar'}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400">💰 Jami Savdo (Tushum)</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-400 truncate">
              {formatMoney(stats.totalRevenue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">tasdiqlangan tushum</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-indigo-300">🎁 Sizning Daromadingiz</span>
              <Gift className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-300 truncate">
              {formatMoney(stats.bloggerEarnings)}
            </div>
            <div className="text-[10px] text-indigo-400/80 mt-1">
              {blogger.commissionPercent}% komissiya asosida
            </div>
          </div>
        </div>

        {/* Transactions / Customers Ledger */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Promokod Bo‘yicha Xaridlar Tarixi</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                  {filteredAttributions.length} ta
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mijozlarning shaxsiy ma’lumotlari xavfsizlik maqsadida qisman yashirilgan
              </p>
            </div>
          </div>

          {isLoadingData ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
              Statistika yuklanmoqda...
            </div>
          ) : filteredAttributions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Hozircha ushbu vaqt oralig‘ida promokoddan foydalanish holatlari qayd etilmagan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mijoz (Shaxsiy)</th>
                    <th className="py-3 px-3">Tarif</th>
                    <th className="py-3 px-3">To‘lov Summasi</th>
                    <th className="py-3 px-3">Sizning Ulushingiz</th>
                    <th className="py-3 px-3">Holat</th>
                    <th className="py-3 px-4 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {filteredAttributions.map((a) => {
                    const isConfirmed = a.status === 'confirmed';
                    const commission = isConfirmed
                      ? ((a.amountUZS || 0) * (blogger.commissionPercent || 0)) / 100
                      : 0;

                    return (
                      <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs">
                            {a.userName ? `${a.userName.slice(0, 3)}***` : 'Mijoz'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {maskPhoneOrEmail(a.userPhone || a.userEmail)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[10px] uppercase text-rose-400 font-bold">
                            {a.planName || a.planId}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          {formatMoney(a.amountUZS || 0)}
                        </td>
                        <td className="py-3 px-3 font-bold text-purple-300">
                          {isConfirmed ? formatMoney(commission) : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              isConfirmed
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : a.status === 'cancelled'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {isConfirmed ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Tasdiqlangan</span>
                              </>
                            ) : a.status === 'cancelled' ? (
                              <>
                                <XCircle className="w-2.5 h-2.5" />
                                <span>Bekor qilingan</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-2.5 h-2.5" />
                                <span>Kutilmoqda</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] text-slate-500 font-mono">
                          {new Date(a.createdAt).toLocaleString('uz-UZ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
