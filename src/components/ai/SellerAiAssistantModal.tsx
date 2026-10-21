import React, { useState } from 'react';
import { AiActionType, Product } from '../../types';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Send,
  RotateCw,
  FileText,
  Type,
  Tags,
  Share2,
  Search,
  Languages,
  Wand2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SellerAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Partial<Product>;
  onApplyContent?: (content: { title?: string; description?: string; category?: string }) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SellerAiAssistantModal: React.FC<SellerAiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  onApplyContent,
  showToast,
}) => {
  const [activeAction, setActiveAction] = useState<AiActionType>('generate_description');
  const [productName, setProductName] = useState(initialProduct?.title || '');
  const [existingDescription, setExistingDescription] = useState(initialProduct?.description || '');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [price, setPrice] = useState<number>(initialProduct?.sellingPrice || 0);
  const [targetLanguage, setTargetLanguage] = useState<'uz' | 'ru' | 'en'>('uz');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'casual' | 'luxury' | 'concise'>('professional');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [keyFeatures, setKeyFeatures] = useState<string>('');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const aiActions: { id: AiActionType; label: string; icon: any; desc: string }[] = [
    {
      id: 'generate_description',
      label: 'Tavsif Yaratish',
      icon: FileText,
      desc: 'Mahsulot nomi va xususiyatlaridan jozibador e-tijorat tavsifi',
    },
    {
      id: 'improve_description',
      label: 'Tavsifni Yaxshilash',
      icon: Wand2,
      desc: 'Mavjud matnni imlo, tuzilma va sotuvchanlik jihatdan boyitish',
    },
    {
      id: 'generate_title',
      label: 'Sarlavha (Title)',
      icon: Type,
      desc: 'Qidiruvda yuqori o‘rin oluvchi 5 ta professional sarlavha',
    },
    {
      id: 'suggest_categories',
      label: 'Kategoriya Tanlash',
      icon: Tags,
      desc: 'Mahsulotga eng mos keluvchi toifalar va bo‘limlar',
    },
    {
      id: 'social_promo',
      label: 'Telegram & Instagram Post',
      icon: Share2,
      desc: 'Ijtimoiy tarmoqlar uchun emojilar va heshteglar bilan tayyor post',
    },
    {
      id: 'seo_metadata',
      label: 'SEO Meta Ma‘lumotlar',
      icon: Search,
      desc: 'Google qidiruvi uchun meta title, meta description va slug',
    },
    {
      id: 'translate',
      label: 'Tarjima (UZ / RU / EN)',
      icon: Languages,
      desc: 'Mahsulot ma‘lumotlarini o‘zbek, rus yoki ingliz tiliga aniq tarjima qilish',
    },
    {
      id: 'suggest_keywords',
      label: 'Kalit So‘zlar (Keywords)',
      icon: Sparkles,
      desc: 'Qidiruv tizimlari va Uzum uchun 10-15 ta ommabop teglar',
    },
  ];

  const handleExecuteAi = async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeAction,
          productName,
          existingDescription,
          details,
          category,
          price: Number(price) || 0,
          targetLanguage,
          tone,
          targetAudience,
          keyFeatures,
          seoKeywords,
          includeEmojis,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI yordamchidan javob olishda xatolik yuz berdi.');
      }

      setGeneratedOutput(data.output || '');
      showToast('AI Natijasi Tayyor!', 'Quyidagi tahrir oynasida natijani ko‘rishingiz mumkin.', 'success');
    } catch (err: any) {
      console.error('AI Assistant invocation error:', err);
      setErrorMsg(err.message || 'AI xizmatiga ulanishda xatolik. Qaytadan urinib ko‘ring.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast('Nusxa olindi!', 'Matn xotiraga nusxalandi.', 'success');
  };

  const handleApply = () => {
    if (!onApplyContent || !generatedOutput) return;

    if (activeAction === 'generate_title') {
      // Pick first line
      const cleanTitle = generatedOutput.replace(/^[0-9]+[.)\s]*/m, '').split('\n')[0].trim();
      onApplyContent({ title: cleanTitle });
      showToast('Qo‘llandi!', 'Sarlavha mahsulot formasiga kiritildi.', 'success');
    } else if (activeAction === 'generate_description' || activeAction === 'improve_description' || activeAction === 'translate') {
      onApplyContent({ description: generatedOutput.trim() });
      showToast('Qo‘llandi!', 'Tavsif mahsulot formasiga kiritildi.', 'success');
    } else if (activeAction === 'suggest_categories') {
      const cleanCat = generatedOutput.replace(/^[0-9]+[.)\s]*/m, '').split('\n')[0].trim();
      onApplyContent({ category: cleanCat });
      showToast('Qo‘llandi!', 'Kategoriya mahsulot formasiga kiritildi.', 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Sellnex AI Sotuvchi Yordamchisi</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Katalogingizni takomillashtiring, sotuvchan tavsiflar va ijtimoiy postlar yarating
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Action Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Kerakli Harakatni Tanlang:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {aiActions.map((act) => {
                const Icon = act.icon;
                const isSelected = activeAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActiveAction(act.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-extrabold leading-tight">{act.label}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {act.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Fields Container */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mahsulot Nomi *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Masalan: Smartfon Xiaomi Redmi 13C 128GB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategoriya yoki Soha
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Masalan: Elektronika > Smartfonlar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Narxi (so‘m)
                </label>
                <input
                  type="number"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Masalan: 1850000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Natija Tili
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="uz">O‘zbek tili (Lotin)</option>
                  <option value="ru">Rus tili (Русский)</option>
                  <option value="en">Ingliz tili (English)</option>
                </select>
              </div>
            </div>

            {/* Existing description or detail hints */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeAction === 'improve_description'
                  ? 'Yaxshilanadigan mavjud tavsif *'
                  : 'Qo‘shimcha tafsilotlar, xususiyatlar yoki eslatmalar'}
              </label>
              <textarea
                rows={3}
                value={activeAction === 'improve_description' ? existingDescription : details}
                onChange={(e) =>
                  activeAction === 'improve_description'
                    ? setExistingDescription(e.target.value)
                    : setDetails(e.target.value)
                }
                placeholder={
                  activeAction === 'improve_description'
                    ? 'Yaxshilamoqchi bo‘lgan matningizni bu yerga joylang...'
                    : 'Masalan: Ranglari qora va ko‘k, batareyasi 2 kun yetadi, kafolat 1 yil...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            {/* Advanced AI Fine-Tuning Controls */}
            <div className="pt-2 border-t border-slate-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tone Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ohang / Uslub (Tone)
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="professional">👔 Professional & Rasmiy</option>
                    <option value="friendly">🤝 Do‘stona & Samimiy</option>
                    <option value="casual">👕 Oddiy & Kundalik (Erkin)</option>
                    <option value="luxury">💎 Hashamatli & Premium (Luxury)</option>
                    <option value="concise">⚡ Qisqa & Aniq (Concise)</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maqsadli Auditoriya (Target Audience)
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="all">👥 Barchaga / Umumiy xaridorlar</option>
                    <option value="youth">🛹 Yoshlar va talabalar</option>
                    <option value="women">👗 Ayollar va qizlar</option>
                    <option value="men">👔 Erkaklar</option>
                    <option value="family">🏡 Oila va uy bekalari</option>
                    <option value="business">💼 Tadbirkorlar va ofis xodimlari</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Key Features */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Asosiy xususiyatlar (Key Features)
                  </label>
                  <input
                    type="text"
                    value={keyFeatures}
                    onChange={(e) => setKeyFeatures(e.target.value)}
                    placeholder="Masalan: 100% paxta, suv o‘tkazmaydi, 2 yil kafolat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                {/* SEO Keywords */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SEO Kalit So‘zlari (SEO Keywords)
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="Masalan: sifatli krossovka, arzon poyabzal, toshkent"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Include Emojis Checkbox */}
              <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  ✨ Chiroyli emojilar va vizual belgilardan foydalanish
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isLoading || (!productName && !existingDescription && !details)}
                onClick={handleExecuteAi}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>AI generatsiya qilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI bilan yaratish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Result Output Box */}
          {generatedOutput && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Natijasi (Tahrirlanadigan ko‘rinish):</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
                  </button>

                  {onApplyContent && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mahsulotga qo‘llash</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={8}
                value={generatedOutput}
                onChange={(e) => setGeneratedOutput(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 leading-relaxed font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
