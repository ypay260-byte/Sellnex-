import React, { useState, useEffect, useMemo } from 'react';
import { Blogger, BloggerAttribution } from '../../../types';
import { firestoreService } from '../../../services/firestoreService';
import {
  Users,
  Plus,
  Search,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CreditCard,
  Percent,
  Calendar,
  X,
  Send,
  Instagram,
  Phone,
  ShieldCheck,
  Key,
  Filter,
  Eye,
  Award,
  Share2,
} from 'lucide-react';

interface AdminBloggersTabProps {
  adminEmail: string;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  formatMoney: (amount: number) => string;
}

export const AdminBloggersTab: React.FC<AdminBloggersTabProps> = ({
  adminEmail,
  showToast,
  formatMoney,
}) => {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlogger, setEditingBlogger] = useState<Blogger | null>(null);
  const [selectedBloggerForStats, setSelectedBloggerForStats] = useState<Blogger | null>(null);
  const [statsAttributions, setStatsAttributions] = useState<BloggerAttribution[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsTimeFilter, setStatsTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPromoCode, setFormPromoCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTelegram, setFormTelegram] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formCommissionPercent, setFormCommissionPercent] = useState<number>(15);
  const [formDiscountType, setFormDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formSecretKey, setFormSecretKey] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string, label = 'Nusxalandi') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      showToast('Nusxa olindi', `${label}: ${text}`, 'success');
      setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  const loadBloggers = async () => {
    setIsLoading(true);
    try {
      const data = await firestoreService.getBloggers();
      setBloggers(data);
    } catch (err: any) {
      console.error('Failed to load bloggers:', err);
      showToast('Xatolik', 'Bloggerlar roʻyxatini yuklab boʻlmadi: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBloggers();
  }, []);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingBlogger(null);
    setFormName('');
    setFormPromoCode('');
    setFormPhone('');
    setFormTelegram('');
    setFormInstagram('');
    setFormCommissionPercent(15);
    setFormDiscountType('percent');
    setFormDiscountValue(10);
    setFormSecretKey(`key_${Math.random().toString(36).substring(2, 9)}`);
    setFormNotes('');
    setFormIsActive(true);
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const openEditModal = (blogger: Blogger) => {
    setEditingBlogger(blogger);
    setFormName(blogger.name);
    setFormPromoCode(blogger.promoCode);
    setFormPhone(blogger.phone || '');
    setFormTelegram(blogger.telegramHandle || '');
    setFormInstagram(blogger.instagramHandle || '');
    setFormCommissionPercent(blogger.commissionPercent);
    setFormDiscountType(blogger.discountType || 'percent');
    setFormDiscountValue(blogger.discountValue || 10);
    setFormSecretKey(blogger.secretKey || `key_${Math.random().toString(36).substring(2, 9)}`);
    setFormNotes(blogger.notes || '');
    setFormIsActive(blogger.isActive);
    setShowCreateModal(true);
  };

  // Open Stats Modal
  const openStatsModal = async (blogger: Blogger) => {
    setSelectedBloggerForStats(blogger);
    setStatsTimeFilter('all');
    setStatsLoading(true);
    try {
      const attributions = await firestoreService.getBloggerAttributions(blogger.id);
      setStatsAttributions(attributions);
    } catch (err: any) {
      console.error('Failed to load blogger stats:', err);
      showToast('Xatolik', 'Statistikani yuklab boʻlmadi', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  // Submit form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPromo = formPromoCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const cleanName = formName.trim();

    if (!cleanName || !cleanPromo) {
      showToast('Xatolik', 'Iltimos, blogger ismi va promokodini toʻliq kiriting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const bloggerId = editingBlogger ? editingBlogger.id : `blogger_${cleanPromo.toLowerCase()}_${Date.now().toString().slice(-4)}`;

      const bloggerPayload: Blogger = {
        id: bloggerId,
        name: cleanName,
        promoCode: cleanPromo,
        phone: formPhone.trim() || undefined,
        telegramHandle: formTelegram.trim().replace(/^@/, '') || undefined,
        instagramHandle: formInstagram.trim().replace(/^@/, '') || undefined,
        commissionPercent: Number(formCommissionPercent) || 0,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue) || 0,
        secretKey: formSecretKey.trim() || `key_${cleanPromo.toLowerCase()}`,
        isActive: formIsActive,
        notes: formNotes.trim() || undefined,
        totalAttributedUsers: editingBlogger?.totalAttributedUsers || 0,
        paidConversions: editingBlogger?.paidConversions || 0,
        totalRevenueUZS: editingBlogger?.totalRevenueUZS || 0,
        conversionRate: editingBlogger?.conversionRate || 0,
        createdAt: editingBlogger?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      await firestoreService.saveBlogger(bloggerPayload);

      // Audit log
      try {
        await firestoreService.createAuditLog({
          adminEmail,
          action: editingBlogger ? 'update_blogger' : 'create_blogger',
          targetType: 'blogger',
          targetId: bloggerPayload.id,
          oldValue: editingBlogger || null,
          newValue: bloggerPayload,
          details: `Blogger ${bloggerPayload.name} (${bloggerPayload.promoCode}) ${editingBlogger ? 'updated' : 'created'} by ${adminEmail}`,
          userAgent: navigator.userAgent,
        });
      } catch (auditErr) {
        console.warn('Audit error:', auditErr);
      }

      showToast(
        editingBlogger ? 'Blogger yangilandi' : 'Yangi blogger yaratildi',
        `Promokod: ${cleanPromo} muvaffaqiyatli saqlandi`,
        'success'
      );
      setShowCreateModal(false);
      setEditingBlogger(null);
      await loadBloggers();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Saqlashda xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Blogger Status (Active / Paused)
  const handleToggleStatus = async (blogger: Blogger) => {
    try {
      const updated = { ...blogger, isActive: !blogger.isActive, updatedAt: new Date().toISOString() };
      await firestoreService.saveBlogger(updated);
      setBloggers((prev) => prev.map((b) => (b.id === blogger.id ? updated : b)));
      showToast(
        updated.isActive ? 'Blogger faollashtirildi' : 'Blogger toʻxtatildi',
        `${blogger.name} (${blogger.promoCode}) holati yangilandi`,
        'info'
      );
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
  };

  // Delete Blogger
  const handleDeleteBlogger = async (blogger: Blogger) => {
    if (!window.confirm(`Haqiqatan ham "${blogger.name}" (${blogger.promoCode}) bloggerni oʻchirmoqchimisiz?`)) {
      return;
    }
    try {
      await firestoreService.deleteBlogger(blogger.id);
      setBloggers((prev) => prev.filter((b) => b.id !== blogger.id));
      showToast('Blogger oʻchirildi', `${blogger.name} oʻchirildi`, 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
  };

  // Recalculate stats button
  const handleRecalculate = async (bloggerId: string) => {
    try {
      const stats = await firestoreService.recalculateBloggerStats(bloggerId);
      setBloggers((prev) =>
        prev.map((b) =>
          b.id === bloggerId
            ? {
                ...b,
                totalAttributedUsers: stats.totalAttributedUsers,
                paidConversions: stats.paidConversions,
                totalRevenueUZS: stats.totalRevenueUZS,
                conversionRate: stats.conversionRate,
              }
            : b
        )
      );
      showToast('Statistika yangilandi', 'Haqiqiy toʻlovlar asosida qayta hisoblandi', 'success');
    } catch (err: any) {
      showToast('Xatolik', err.message, 'error');
    }
  };

  // Summary totals across all bloggers
  const summary = useMemo(() => {
    const totalBloggers = bloggers.length;
    const activeBloggers = bloggers.filter((b) => b.isActive).length;
    const totalAttributed = bloggers.reduce((acc, b) => acc + (b.totalAttributedUsers || 0), 0);
    const totalPaid = bloggers.reduce((acc, b) => acc + (b.paidConversions || 0), 0);
    const totalRevenue = bloggers.reduce((acc, b) => acc + (b.totalRevenueUZS || 0), 0);
    const avgConversion = totalAttributed > 0 ? ((totalPaid / totalAttributed) * 100).toFixed(1) : '0';
    return { totalBloggers, activeBloggers, totalAttributed, totalPaid, totalRevenue, avgConversion };
  }, [bloggers]);

  // Filtered bloggers list
  const filteredBloggers = useMemo(() => {
    return bloggers.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.phone && b.phone.includes(searchQuery)) ||
        (b.telegramHandle && b.telegramHandle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ? true : statusFilter === 'active' ? b.isActive : !b.isActive;

      return matchSearch && matchStatus;
    });
  }, [bloggers, searchQuery, statusFilter]);

  // Filtered stats for detailed modal
  const filteredAttributions = useMemo(() => {
    if (statsTimeFilter === 'all') return statsAttributions;
    const now = new Date();
    return statsAttributions.filter((a) => {
      const d = new Date(a.createdAt);
      if (statsTimeFilter === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (statsTimeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (statsTimeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= monthAgo;
      }
      return true;
    });
  }, [statsAttributions, statsTimeFilter]);

  const modalStatsSummary = useMemo(() => {
    const total = filteredAttributions.length;
    const confirmed = filteredAttributions.filter((a) => a.status === 'confirmed');
    const confirmedCount = confirmed.length;
    const pendingCount = filteredAttributions.filter((a) => a.status === 'pending').length;
    const cancelledCount = filteredAttributions.filter((a) => a.status === 'cancelled').length;
    const revenue = confirmed.reduce((acc, a) => acc + (a.amountUZS || 0), 0);
    const conversion = total > 0 ? ((confirmedCount / total) * 100).toFixed(1) : '0';
    const commission = selectedBloggerForStats
      ? (revenue * (selectedBloggerForStats.commissionPercent || 0)) / 100
      : 0;
    return { total, confirmedCount, pendingCount, cancelledCount, revenue, conversion, commission };
  }, [filteredAttributions, selectedBloggerForStats]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Bloggerlar & Hamkorlar Tizimi
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Attribution & ROI
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Har bir bloggerga alohida promokod biriktiring. Promokod orqali kelgan obuna xaridorlari, to‘lovlar,
            konversiya va har bir bloggerning daromadini alohida monitoring qiling.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadBloggers}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Blogger Qo‘shish</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Jami Bloggerlar</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.totalBloggers}</div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1">
            {summary.activeBloggers} tasi faol
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">👥 Jalb Qilingan</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{summary.totalAttributed}</div>
          <div className="text-[10px] text-slate-500 mt-1">promokod orqali ro‘yxat</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">💳 Pullik Obunalar</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{summary.totalPaid}</div>
          <div className="text-[10px] text-slate-500 mt-1">tasdiqlangan to‘lovlar</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">💰 Jami Tushum</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-400 truncate">
            {formatMoney(summary.totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">bloggerlar ulushi hisobda</div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">📊 O‘rtacha Konversiya</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{summary.avgConversion}%</div>
          <div className="text-[10px] text-slate-500 mt-1">mijoz / xarid nisbati</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Blogger ismi, promokod yoki telefon..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s === 'all' ? 'Barchasi' : s === 'active' ? 'Faol' : 'To‘xtatilgan'}
            </button>
          ))}
        </div>
      </div>

      {/* Bloggers List Grid */}
      {isLoading ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-3" />
          Bloggerlar ma’lumotlari yuklanmoqda...
        </div>
      ) : filteredBloggers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300 text-sm mb-1">Bloggerlar topilmadi</p>
          <p className="text-slate-500 max-w-sm mx-auto mb-4">
            Qidiruvingiz bo‘yicha hech qanday blogger mavjud emas yoki hali birorta hamkor qo‘shilmagan.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Birinchi Bloggerni Qo‘shish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBloggers.map((b) => {
            const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}#blogger/${b.promoCode}?key=${b.secretKey || ''}`;
            const refUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${b.promoCode}`;

            return (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Row: Name + Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                          <span>{b.name}</span>
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {b.telegramHandle && (
                            <a
                              href={`https://t.me/${b.telegramHandle}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:underline flex items-center gap-0.5"
                            >
                              <Send className="w-3 h-3" />
                              <span>@{b.telegramHandle}</span>
                            </a>
                          )}
                          {b.instagramHandle && (
                            <a
                              href={`https://instagram.com/${b.instagramHandle}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-pink-400 hover:underline flex items-center gap-0.5"
                            >
                              <Instagram className="w-3 h-3" />
                              <span>@{b.instagramHandle}</span>
                            </a>
                          )}
                          {b.phone && (
                            <span className="text-slate-400 flex items-center gap-0.5 font-mono text-[10px]">
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              <span>{b.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(b)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        b.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                          : 'bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {b.isActive ? 'Faol' : 'To‘xtatilgan'}
                    </button>
                  </div>

                  {/* Promo Code Bar */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Promokod:
                      </span>
                      <span className="font-mono font-black text-indigo-400 text-sm tracking-wider">
                        {b.promoCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                        {b.discountType === 'percent' ? `-${b.discountValue || 10}%` : `-${formatMoney(b.discountValue || 0)}`}
                      </span>
                      <button
                        onClick={() => handleCopy(b.promoCode, `code_${b.id}`, 'Promokod')}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Promokodni nusxalash"
                      >
                        {copiedKey === `code_${b.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metrics 4-Box Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 font-medium">Jalb qilingan</div>
                      <div className="font-black text-sky-400 text-base mt-0.5">
                        👥 {b.totalAttributedUsers || 0}
                      </div>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 font-medium">Pullik obuna</div>
                      <div className="font-black text-emerald-400 text-base mt-0.5">
                        💳 {b.paidConversions || 0}
                      </div>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 font-medium">Jami tushum</div>
                      <div className="font-black text-amber-400 text-xs mt-1 truncate">
                        💰 {formatMoney(b.totalRevenueUZS || 0)}
                      </div>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 font-medium">
                        Komissiya ({b.commissionPercent}%)
                      </div>
                      <div className="font-black text-purple-400 text-xs mt-1 truncate">
                        🎁 {formatMoney(((b.totalRevenueUZS || 0) * (b.commissionPercent || 0)) / 100)}
                      </div>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  {b.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-2">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openStatsModal(b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Statistika</span>
                    </button>

                    <button
                      onClick={() => handleCopy(portalUrl, `portal_${b.id}`, 'Blogger Kabinet havolasi')}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Blogger shaxsiy kabinet havolasini nusxalash"
                    >
                      {copiedKey === `portal_${b.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Kabinet</span>
                    </button>

                    <button
                      onClick={() => handleCopy(refUrl, `ref_${b.id}`, 'Referal havola')}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Blogger uchun referal havola (saytga kirish)"
                    >
                      {copiedKey === `ref_${b.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>Havola</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <button
                      onClick={() => handleRecalculate(b.id)}
                      className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Hisob-kitobni qayta tekshirish"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Qayta hisoblash</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(b)}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Tahrirlash</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBlogger(b)}
                        className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>O‘chirish</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT BLOGGER MODAL */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8 animate-fadeIn">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {editingBlogger ? 'Bloggerni Tahrirlash' : 'Yangi Blogger Qo‘shish'}
                </h3>
                <p className="text-xs text-slate-400">
                  Shaxsiy promokod va komissiya foizlarini belgilang
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Blogger / Hamkor Ismi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Masalan: Timur Alixonov"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unikal Promokod <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPromoCode}
                  onChange={(e) => setFormPromoCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="TIMUR2026"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-indigo-400 font-mono font-bold tracking-wider placeholder-slate-600 outline-hidden uppercase"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Mijozlar obuna olishda ushbu kodni kiritib chegirma oladilar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telegram (@username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">@</span>
                    <input
                      type="text"
                      value={formTelegram}
                      onChange={(e) => setFormTelegram(e.target.value.replace(/^@/, ''))}
                      placeholder="username"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-7 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Instagram (@username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">@</span>
                    <input
                      type="text"
                      value={formInstagram}
                      onChange={(e) => setFormInstagram(e.target.value.replace(/^@/, ''))}
                      placeholder="username"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-7 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Blogger Komissiyasi (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formCommissionPercent}
                      onChange={(e) => setFormCommissionPercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-hidden font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Discount to buyer */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Mijozga Chegirma Turi
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                  >
                    <option value="percent">Foizda (%)</option>
                    <option value="fixed">Qat’iy Summa (UZS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Chegirma Miqdori
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-hidden"
                  />
                </div>
              </div>

              {/* Secret Key for Blogger Portal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Blogger Shaxsiy Kabinet Kaliti (Secret Key)</span>
                  <button
                    type="button"
                    onClick={() => setFormSecretKey(`key_${Math.random().toString(36).substring(2, 9)}`)}
                    className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Qayta yaratish
                  </button>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formSecretKey}
                    onChange={(e) => setFormSecretKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-amber-300 outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Blogger bu kalit orqali boshqaruv panelsiz, faqat o‘zining statistikasini ko‘ra oladi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Izoh / Qo‘shimcha Shartlar
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Masalan: Stories va Reels reklama uchun tuzilgan shartnoma"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">Promokod Aktivligi</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingBlogger ? 'O‘zgarishlarni Saqlash' : 'Bloggerni Ro‘yxatga Olish'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAILED BLOGGER STATISTICS MODAL */}
      {/* ======================================================== */}
      {selectedBloggerForStats && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative my-8 animate-fadeIn max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-lg">
                  {selectedBloggerForStats.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedBloggerForStats.name}</h3>
                    <span className="font-mono px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold text-xs">
                      {selectedBloggerForStats.promoCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedBloggerForStats.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {selectedBloggerForStats.isActive ? 'Faol' : 'To‘xtatilgan'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Komissiya: <strong className="text-purple-400">{selectedBloggerForStats.commissionPercent}%</strong></span>
                    {selectedBloggerForStats.telegramHandle && (
                      <span className="text-sky-400">Telegram: @{selectedBloggerForStats.telegramHandle}</span>
                    )}
                    {selectedBloggerForStats.phone && <span>Tel: {selectedBloggerForStats.phone}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBloggerForStats(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Filter Bar */}
            <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-800/80 shrink-0">
              <span className="text-xs font-semibold text-slate-400">Vaqt Oralig‘i:</span>
              <div className="flex items-center gap-1.5">
                {(['all', 'today', 'week', 'month'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setStatsTimeFilter(t)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      statsTimeFilter === t
                        ? 'bg-indigo-600 text-white'
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

            {/* Modal KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 shrink-0">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block">👥 Mijozlar</span>
                <span className="text-xl font-black text-sky-400 mt-0.5 block">
                  {modalStatsSummary.total}
                </span>
                <span className="text-[9px] text-slate-500">promokod ishlatgan</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block">💳 Pullik Obuna</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                  {modalStatsSummary.confirmedCount}
                </span>
                <span className="text-[9px] text-slate-500">{modalStatsSummary.pendingCount} ta kutilmoqda</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block">💰 Jami Tushum</span>
                <span className="text-sm font-black text-amber-400 mt-1 block truncate">
                  {formatMoney(modalStatsSummary.revenue)}
                </span>
                <span className="text-[9px] text-slate-500">tasdiqlangan to‘lov</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block">🎁 Blogger Ulushi</span>
                <span className="text-sm font-black text-purple-400 mt-1 block truncate">
                  {formatMoney(modalStatsSummary.commission)}
                </span>
                <span className="text-[9px] text-slate-500">{selectedBloggerForStats.commissionPercent}% daromad</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block">📈 Konversiya</span>
                <span className="text-xl font-black text-white mt-0.5 block">
                  {modalStatsSummary.conversion}%
                </span>
                <span className="text-[9px] text-slate-500">xaridga aylangan</span>
              </div>
            </div>

            {/* Attributions Table */}
            <div className="flex-1 overflow-y-auto mt-2 rounded-2xl border border-slate-800 bg-slate-950/60">
              {statsLoading ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                  Mijozlar ro‘yxati yuklanmoqda...
                </div>
              ) : filteredAttributions.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  Tanlangan vaqt oralig‘ida birorta ham mijoz yoki xarid qayd etilmagan.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3.5">Mijoz</th>
                      <th className="py-2.5 px-3">Tarif</th>
                      <th className="py-2.5 px-3">Summa</th>
                      <th className="py-2.5 px-3">Chegirma</th>
                      <th className="py-2.5 px-3">Holat</th>
                      <th className="py-2.5 px-3 text-right">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAttributions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-white text-xs">
                            {item.userName || 'Mijoz'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.userEmail || item.userPhone || '—'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[10px] uppercase text-rose-400 font-bold">
                            {item.planName || item.planId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          {formatMoney(item.amountUZS || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-amber-400 font-mono text-[11px]">
                          {item.discountApplied ? `-${formatMoney(item.discountApplied)}` : '0 so‘m'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              item.status === 'confirmed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : item.status === 'cancelled'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {item.status === 'confirmed' ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Tasdiqlangan</span>
                              </>
                            ) : item.status === 'cancelled' ? (
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
                        <td className="py-2.5 px-3 text-right text-[11px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleString('uz-UZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="text-slate-400 text-[11px]">
                Jami <strong className="text-white">{filteredAttributions.length}</strong> ta qayd
              </div>
              <button
                onClick={() => setSelectedBloggerForStats(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
