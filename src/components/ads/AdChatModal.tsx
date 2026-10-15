import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Megaphone,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Phone,
  Flame,
} from 'lucide-react';
import { AdInquiry, AdChatMessage } from '../../types';
import { adBannerService } from '../../services/adBannerService';
import { useApp } from '../../context/AppContext';

interface AdChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export const AdChatModal: React.FC<AdChatModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'product',
}) => {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'request'>('chat');
  const [inquiryId, setInquiryId] = useState<string>('');
  const [messages, setMessages] = useState<AdChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [senderName, setSenderName] = useState(
    currentUser?.name || localStorage.getItem('sellnex_ad_user_name') || ''
  );
  const [senderPhone, setSenderPhone] = useState(
    currentUser?.phone || localStorage.getItem('sellnex_ad_user_phone') || ''
  );
  const [isSending, setIsSending] = useState(false);

  // Form tab state
  const [adForm, setAdForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    category: initialCategory,
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing inquiry thread if user previously chatted
  useEffect(() => {
    if (!isOpen) return;

    const savedId = localStorage.getItem('sellnex_current_ad_inquiry_id');
    if (savedId) {
      setInquiryId(savedId);
      adBannerService.getInquiryById(savedId).then((item) => {
        if (item) {
          setMessages(item.messages || []);
          if (item.name) setSenderName(item.name);
          if (item.phone) setSenderPhone(item.phone);
        }
      });

      // Realtime listener
      const unsub = adBannerService.subscribeToInquiry(savedId, (updated) => {
        setMessages(updated.messages || []);
      });
      return () => unsub();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const finalName = senderName.trim() || currentUser?.name || 'Mijoz';
    const finalPhone = senderPhone.trim() || currentUser?.phone || '';

    localStorage.setItem('sellnex_ad_user_name', finalName);
    if (finalPhone) localStorage.setItem('sellnex_ad_user_phone', finalPhone);

    setIsSending(true);

    try {
      let currentId = inquiryId;

      // If no thread yet, create one
      if (!currentId) {
        const newInquiry = await adBannerService.createInquiry({
          name: finalName,
          phone: finalPhone,
          category: 'chat',
          message: inputMessage.trim(),
        });
        currentId = newInquiry.id;
        setInquiryId(currentId);
        setMessages(newInquiry.messages || []);
      } else {
        const updated = await adBannerService.sendMessage(currentId, {
          sender: 'user',
          senderName: finalName,
          text: inputMessage.trim(),
        });
        setMessages(updated.messages || []);
      }

      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.phone.trim()) return;

    setIsSending(true);
    try {
      const created = await adBannerService.createInquiry({
        name: adForm.name || 'Mijoz',
        phone: adForm.phone,
        category: adForm.category,
        message: adForm.message,
      });

      setInquiryId(created.id);
      setMessages(created.messages || []);
      setSenderName(created.name);
      setSenderPhone(created.phone);
      setFormSubmitted(true);

      // Switch to chat tab after a brief moment
      setTimeout(() => {
        setActiveTab('chat');
        setFormSubmitted(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit ad request:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Sellnex Reklama & Hamkorlik</h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Admin onlayn
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administrator bilan bevosita chat va so‘rovlar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 pt-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Admin bilan Chat</span>
            {messages.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'request'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Reklama So‘rovi (Forma)</span>
          </button>
        </div>

        {/* TAB 1: LIVE CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-[350px] max-h-[480px]">
            {/* User contact details (if not set) */}
            {(!senderName || !senderPhone) && (
              <div className="p-3 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap sm:flex-nowrap gap-2 items-center text-xs">
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Telefon (+998..)"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            )}

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
              {/* Welcome message from Admin */}
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  A
                </div>
                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-200 shadow-xs">
                  <div className="font-bold text-rose-400 text-[11px] mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sellnex Administratori</span>
                  </div>
                  <p className="leading-relaxed">
                    Assalomu alaykum! Sellnex platformasida reklama yoki banner joylashtirish bo‘yicha qanday savol yoki taklifingiz bor?
                    Xabaringizni yozing, tez orada javob beramiz.
                  </p>
                </div>
              </div>

              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        A
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-xs ${
                        isUser
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                          : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-xs'
                      }`}
                    >
                      <div
                        className={`text-[10px] font-bold mb-0.5 ${
                          isUser ? 'text-slate-900/70' : 'text-rose-400'
                        }`}
                      >
                        {m.senderName || (isUser ? 'Siz' : 'Administrator')}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div
                        className={`text-[9px] mt-1 text-right opacity-70`}
                      >
                        {new Date(m.timestamp).toLocaleTimeString('uz-UZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Xabaringizni yozing..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50 active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>

              <a
                href="https://t.me/sellnex_support"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                title="Telegram orqali chat"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </form>
          </div>
        )}

        {/* TAB 2: QUICK REQUEST FORM */}
        {activeTab === 'request' && (
          <div className="p-5 overflow-y-auto">
            {formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">So‘rovingiz Qabul Qilindi!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Sizning ma’lumotlaringiz saqlandi va chat bo‘limiga yo‘naltirilmoqda...
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ismingiz yoki Brend / Do‘kon nomi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Jasur (Trend Store)"
                    value={adForm.name}
                    onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefon raqamingiz (Bog‘lanish uchun) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={adForm.phone}
                    onChange={(e) => setAdForm({ ...adForm, phone: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reklama yo‘nalishi
                  </label>
                  <select
                    value={adForm.category}
                    onChange={(e) => setAdForm({ ...adForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="product">🔥 Mahsulot / Tovar reklamasi (Trend tovarlar)</option>
                    <option value="store">🏪 Onlayn do‘konni targ‘ib qilish</option>
                    <option value="wholesale">📦 Optom yetkazib beruvchi / Ombor taklifi</option>
                    <option value="banner">🖼️ Bosh sahifa slayd bannerida reklama</option>
                    <option value="logistics">🚚 Yetkazib berish va Logistika xizmati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Taklifingiz yoki Mahsulot haqida qisqacha
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Qanday mahsulot yoki xizmatni qancha muddatga reklama qilmoqchisiz?.."
                    value={adForm.message}
                    onChange={(e) => setAdForm({ ...adForm, message: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500 placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>So‘rovni Yuborish & Chat Boshlash</span>
                  </button>
                  <a
                    href="https://t.me/sellnex_support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-sky-400" />
                    <span>Telegram</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
