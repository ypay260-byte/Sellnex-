import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  MousePointer,
  Sparkles,
  MessageCircle,
  Send,
  Phone,
  User,
  Filter,
  RefreshCw,
  X,
  Flame,
  Image as ImageIcon,
} from 'lucide-react';
import { AdBanner, AdInquiry, AdChatMessage } from '../../../types';
import { adBannerService } from '../../../services/adBannerService';

interface AdminAdsTabProps {
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AdminAdsTab: React.FC<AdminAdsTabProps> = ({ showToast }) => {
  const [subTab, setSubTab] = useState<'banners' | 'chats'>('banners');
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [inquiries, setInquiries] = useState<AdInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Banner Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: 'REKLAMA',
    imageUrl: '',
    linkUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    order: 1,
    advertiserName: '',
    advertiserContact: '',
  });

  // Chat Selected Thread
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Preset sample banner images
  const sampleImages = [
    { label: 'Smart Gadjetlar', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Kiyim & Oyoq kiyim', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Sellnex Promo / Biznes', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80' },
    { label: 'To‘lovlar & Moliya', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Oziq-ovqat / Kafe', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80' },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedBanners, fetchedInquiries] = await Promise.all([
        adBannerService.getAllBanners(),
        adBannerService.getInquiries(),
      ]);
      setBanners(fetchedBanners);
      setInquiries(fetchedInquiries);
      if (fetchedInquiries.length > 0 && !selectedInquiryId) {
        setSelectedInquiryId(fetchedInquiries[0].id);
      }
    } catch (err: any) {
      showToast('Xatolik', 'Reklama ma’lumotlarini yuklashda xatolik yuz berdi', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open add/edit modal
  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      badge: 'REKLAMA',
      imageUrl: sampleImages[0].url,
      linkUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      order: (banners.length || 0) + 1,
      advertiserName: '',
      advertiserContact: '',
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditModal = (banner: AdBanner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badge: banner.badge || 'REKLAMA',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      startDate: banner.startDate || new Date().toISOString().split('T')[0],
      endDate: banner.endDate || new Date().toISOString().split('T')[0],
      isActive: banner.isActive !== false,
      order: banner.order || 1,
      advertiserName: banner.advertiserName || '',
      advertiserContact: banner.advertiserContact || '',
    });
    setIsBannerModalOpen(true);
  };

  // Quick days addition for expiry date (muddat)
  const setExpiryDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setBannerForm((prev) => ({
      ...prev,
      endDate: d.toISOString().split('T')[0],
    }));
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.imageUrl.trim()) {
      showToast('Xatolik', 'Sarlavha va surat havolasini to‘ldiring', 'error');
      return;
    }

    try {
      const saved = await adBannerService.saveBanner({
        id: editingBanner?.id,
        ...bannerForm,
        clickCount: editingBanner?.clickCount || 0,
        createdAt: editingBanner?.createdAt || new Date().toISOString(),
      });

      showToast(
        editingBanner ? 'Banner yangilandi' : 'Yangi banner qo‘shildi',
        `"${saved.title}" slayderga joylandi`,
        'success'
      );

      setIsBannerModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('Xatolik', err.message || 'Bannerni saqlashda xatolik', 'error');
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Haqiqatan ham "${title}" bannerini o‘chirmoqchimisiz?`)) return;

    try {
      await adBannerService.deleteBanner(id);
      showToast('O‘chirildi', 'Banner muvaffaqiyatli o‘chirildi', 'info');
      loadData();
    } catch (err: any) {
      showToast('Xatolik', 'Bannerni o‘chirishda xatolik', 'error');
    }
  };

  const handleToggleActive = async (banner: AdBanner) => {
    try {
      await adBannerService.saveBanner({
        ...banner,
        isActive: !banner.isActive,
      });
      loadData();
      showToast('Holat o‘zgardi', banner.isActive ? 'Banner o‘chirildi' : 'Banner yoqildi', 'info');
    } catch {
      // quiet
    }
  };

  // Send admin reply in chat
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId || !adminReplyText.trim()) return;

    setIsReplying(true);
    try {
      await adBannerService.sendMessage(selectedInquiryId, {
        sender: 'admin',
        senderName: 'Sellnex Administratori',
        text: adminReplyText.trim(),
      });

      setAdminReplyText('');
      showToast('Javob yuborildi', 'Foydalanuvchiga chat xabari yetkazildi', 'success');

      // Refresh inquiries
      const updated = await adBannerService.getInquiries();
      setInquiries(updated);
    } catch (err: any) {
      showToast('Xatolik', 'Xabar yuborishda xatolik yuz berdi', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId) || null;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Reklama & Slayder Bannerlar Boshqaruvi
              </h2>
              <p className="text-xs text-slate-400">
                Bosh sahifadagi avtomatik o‘tib turuvchi slaydlar, muddatlar, silkalar va mijozlar bilan chat
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Banner Qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Banners vs Chat Inquiries */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setSubTab('banners')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'banners'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Slayder Bannerlari ({banners.length})</span>
        </button>

        <button
          onClick={() => setSubTab('chats')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'chats'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Reklama Chatlari & So‘rovlar ({inquiries.length})</span>
          {inquiries.some((i) => i.unreadAdmin) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* SUBTAB 1: BANNERS LIST */}
      {subTab === 'banners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => {
              const isExpired = banner.endDate && banner.endDate < todayStr;
              const isLive = banner.isActive && !isExpired;

              return (
                <div
                  key={banner.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
                >
                  {/* Banner Image Preview */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                        {banner.badge || 'REKLAMA'}
                      </span>
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                          Faol Slaydda
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                          Muddati Tugagan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                          Nofaol
                        </span>
                      )}
                    </div>

                    {/* Order badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold border border-white/10">
                      № {banner.order || 1}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {banner.title}
                      </h4>
                      {banner.subtitle && (
                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Banner Details & Target Link */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Muddati: {banner.endDate || 'Cheksiz'}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-emerald-400">
                          <MousePointer className="w-3.5 h-3.5" />
                          <span>{banner.clickCount || 0} o‘tishlar</span>
                        </span>
                      </div>

                      {/* Link preview */}
                      <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-blue-400 truncate">
                          {banner.linkUrl || 'Silka belgilanmagan'}
                        </span>
                        {banner.linkUrl && (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          banner.isActive
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {banner.isActive ? 'Faol' : 'O‘chirilgan'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(banner)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id, banner.title)}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {banners.length === 0 && (
            <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
              <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="font-bold">Hozircha slayd bannerlari mavjud emas</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Birinchi bannerni qo‘shish
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CHATS & INQUIRIES */}
      {subTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
          {/* Thread List (Left) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-3 space-y-2 overflow-y-auto max-h-[600px]">
            <div className="text-xs font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>Suhbatlar</span>
              <span>{inquiries.length} ta</span>
            </div>

            {inquiries.map((inq) => {
              const isSelected = inq.id === selectedInquiryId;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiryId(inq.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate">{inq.name || 'Mijoz'}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(inq.updatedAt || inq.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                    {inq.lastMessage || inq.message || 'Yangi xabar'}
                  </p>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-mono">{inq.phone || 'Tel yo‘q'}</span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {inq.category}
                    </span>
                  </div>
                </div>
              );
            })}

            {inquiries.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                Hozircha hech qanday chat so‘rovi yo‘q
              </div>
            )}
          </div>

          {/* Active Chat Conversation (Right) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden max-h-[600px]">
            {selectedInquiry ? (
              <>
                {/* Header */}
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{selectedInquiry.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Tel: {selectedInquiry.phone}</span>
                        <span>•</span>
                        <span className="text-amber-400">Bo‘lim: {selectedInquiry.category}</span>
                      </p>
                    </div>
                  </div>

                  {selectedInquiry.phone && (
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Qo‘ng‘iroq</span>
                    </a>
                  )}
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
                  {selectedInquiry.messages && selectedInquiry.messages.length > 0 ? (
                    selectedInquiry.messages.map((m) => {
                      const isAdmin = m.sender === 'admin';
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-2 ${
                            isAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-xs ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                                : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <div
                              className={`text-[10px] font-bold mb-0.5 ${
                                isAdmin ? 'text-slate-900/70' : 'text-rose-400'
                              }`}
                            >
                              {isAdmin ? 'Administrator (Siz)' : m.senderName || 'Mijoz'}
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                            <div className="text-[9px] mt-1 text-right opacity-70">
                              {new Date(m.timestamp).toLocaleTimeString('uz-UZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Ushbu so‘rov bo‘yicha xabarlar topilmadi
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSendAdminReply}
                  className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Mijozga javob yozish..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !adminReplyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Yuborish</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-6">
                <MessageCircle className="w-10 h-10 mb-2 text-slate-700" />
                <span>Chap tomondagi suhbatlardan birini tanlang</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BANNER */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-white relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingBanner ? 'Bannerni Tahrirlash' : 'Yangi Slayd Banner Qo‘shish'}
                </h3>
                <p className="text-xs text-slate-400">
                  Surat, havola va amal qilish muddatini kiriting
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Banner Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Smart Gadjetlar & Elektronika ombori"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Qisqacha Tavsif (Matn)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Toshkent omboridan 24 soatda butun O‘zbekistonga yetkazish"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Beydj (Yorliq)
                  </label>
                  <input
                    type="text"
                    placeholder="REKLAMA, HOT PROMO, AKSIYA..."
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tartib raqami (Slayd tartibi)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Surat Havolasi (Image URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono mb-2"
                />

                {/* Sample quick selectors */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Tayyor namunalar:</span>
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, imageUrl: s.url })}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Link (Sayt yoki Ilova silkasi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yo‘naltiruvchi Silka (Sayt yoki ilovadagi havola) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... yoki /products yoki /store/slug yoki #open-chat"
                  value={bannerForm.linkUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Foydalanuvchi suratni bosganda to‘g‘ridan-to‘g‘ri shu manzilga o‘tadi
                </p>
              </div>

              {/* Duration / Expiry Date (Muddatini belgilash) */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Amal Qilish Muddati (Tugash sanasi) *</span>
                </label>

                <input
                  type="date"
                  required
                  value={bannerForm.endDate}
                  onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                />

                {/* Quick days selector buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Tezkor muddat:</span>
                  {[3, 7, 15, 30, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setExpiryDays(days)}
                      className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] border border-amber-500/30 font-bold transition-colors cursor-pointer"
                    >
                      +{days} kun
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-medium text-slate-200">
                  Banner hozir faol ko‘rinsinmi?
                </span>
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  {editingBanner ? 'Saqlash' : 'Bannerni Joylash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
