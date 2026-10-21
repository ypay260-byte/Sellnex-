import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Store as StoreIcon,
  Package,
  Share2,
  ShoppingBag,
  ExternalLink,
  Percent,
  Settings,
  Zap,
  Boxes,
  MessageCircle,
  PhoneCall,
  Search,
  Send,
} from 'lucide-react';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, onClose }) => {
  const { navigateTo, store, getStoreUrl, openShareModal, copyStoreLink } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const faqItems = [
    {
      id: 1,
      question: '1. Sellnex nima?',
      shortAnswer: 'O‘zbekiston bozori uchun yaratilgan, bir necha daqiqada shaxsiy internet-do‘kon ochish va onlayn savdoni boshqarish platformasi.',
      details:
        'Sellnex orqali har qanday tadbirkor yoki jismoniy shaxs o‘z internet-do‘konini yaratishi, mahsulotlarini katalogga joylashi, tayyor do‘kon havolasini Instagram, Telegram yoki TikTok orqali mijozlariga yuborishi hamda tushgan buyurtmalarni bitta qulay boshqaruv panelida ko‘rishi mumkin.',
      actionLabel: 'Boshqaruv panelini ko‘rish',
      actionRoute: 'dashboard',
      icon: StoreIcon,
    },
    {
      id: 2,
      question: '2. Do‘konni qanday yarataman?',
      shortAnswer: 'Ro‘yxatdan o‘tgach, do‘koningiz nomi va unikal havolasini (slug) kiritasiz — do‘koningiz shu zahotiyoq ishga tushadi.',
      details:
        'Do‘kon nomi — bu mijozlaringiz saytga kirganda ko‘radigan asosiy nomi. Havola esa "sellnex.uz/store/sizning-nomingiz" ko‘rinishida bo‘ladi. Do‘kon dizayni, logotipi va ranglarini "Do‘kon konstruktori" sahifasida istalgan payt o‘zgartirishingiz mumkin.',
      actionLabel: 'Do‘kon konstruktoriga o‘tish',
      actionRoute: 'store-builder',
      icon: Settings,
    },
    {
      id: 3,
      question: '3. Mahsulotni qanday qo‘shaman?',
      shortAnswer: '"Mahsulotlar" sahifasiga o‘tib, "Add Product" tugmasini bosing yoki Excel/havola orqali import qiling.',
      details:
        'Mahsulot nomi, narxi, fotosurati va qisqacha tavsifini kiritib, "Mahsulotni saqlash" tugmasini bosasiz. Mahsulotingiz darhol do‘koningizda paydo bo‘ladi va mijozlar uni ko‘rib buyurtma berishlari mumkin.',
      actionLabel: 'Mahsulot qo‘shish sahifasiga o‘tish',
      actionRoute: 'products',
      icon: Package,
    },
    {
      id: 4,
      question: '4. Do‘kon havolasini qayerdan olaman?',
      shortAnswer: 'Boshqaruv panelining yuqori qismida yashil "Online" nishoni bilan do‘kon havolangiz aniq ko‘rsatilgan.',
      details:
        'Ushbu havolani "Havolani nusxalash" tugmasi orqali nusxalab, Instagram bio profilingizga, Telegram kanal/guruhlaringizga yoki mijozlaringizga xabar sifatida yuborishingiz mumkin. Sayt barcha telefon va kompyuterlarda ilova o‘rnatmasdan ochiladi.',
      actionLabel: 'Do‘kon havolasini ko‘rish',
      actionRoute: 'dashboard',
      icon: Share2,
      onCustomAction: () => {
        copyStoreLink(store.slug);
        onClose();
      },
      customActionLabel: 'Havolani nusxalash',
    },
    {
      id: 5,
      question: '5. Mijozlar qanday buyurtma beradi?',
      shortAnswer: 'Mijozlar do‘koningiz havolasiga kirib, mahsulotni tanlaydi, "Sotib olish" tugmasini bosadi va ism hamda telefonini kiritadi.',
      details:
        'Mijoz uchun ro‘yxatdan o‘tish shart emas! U bir necha soniya ichida o‘z manzilini kiritadi va to‘lov turini (Click, Payme, naqd yoki kartaga) tanlab buyurtmani tasdiqlaydi.',
      actionLabel: 'O‘z do‘koningizni sinab ko‘rish',
      actionRoute: 'public-store',
      icon: ShoppingBag,
    },
    {
      id: 6,
      question: '6. Buyurtmalarni qayerdan ko‘raman?',
      shortAnswer: 'Barcha yangi va kelib tushgan buyurtmalar "Buyurtmalar" (Orders) bo‘limida real vaqt rejimida ko‘rinadi.',
      details:
        'Buyurtma tushishi bilan siz mijozning ismi, telefon raqami, yetkazish manzili va tanlangan mahsulotlarni ko‘rishingiz mumkin. U yerdan buyurtma holatini "Qabul qilindi", "Yetkazilmoqda" yoki "Yakunlandi"ga o‘zgartirasiz.',
      actionLabel: 'Buyurtmalar bo‘limiga o‘tish',
      actionRoute: 'orders',
      icon: ShoppingBag,
    },
    {
      id: 7,
      question: '7. Mahsulot narxini qanday o‘zgartiraman?',
      shortAnswer: '"Mahsulotlar" sahifasida kerakli mahsulot yonidagi "Qalamcha" (Tahrirlash) belgisini bosing.',
      details:
        'Ochilgan oynada sotuv narxini, eski narxini (chegirma ko‘rsatish uchun) yoki qoldiq sonini yangilab "Saqlash" tugmasini bosing. O‘zgarishlar do‘konda bir lahzada yangilanadi.',
      actionLabel: 'Mahsulotlar ro‘yxatiga o‘tish',
      actionRoute: 'products',
      icon: Percent,
    },
    {
      id: 8,
      question: '8. Do‘kon ma’lumotlarini qanday tahrirlayman?',
      shortAnswer: '"Sozlamalar" yoki "Do‘kon konstruktori" sahifalarida logotip, do‘kon nomi, telefon va tavsifni o‘zgartirishingiz mumkin.',
      details:
        'Shuningdek, to‘lov kartangiz raqamini (mijozlar pul o‘tkazishi uchun), yetkazib berish narxini va ranglar mavzusini o‘zingizga moslashtirishingiz mumkin.',
      actionLabel: 'Sozlamalar sahifasiga o‘tish',
      actionRoute: 'settings',
      icon: Settings,
    },
    {
      id: 9,
      question: '9. Dropshipping va shaxsiy mahsulot sotish nima?',
      shortAnswer: 'Shaxsiy mahsulot — o‘z tovarlaringizni sotish; Dropshipping — tovar sotib olmasdan yetkazib beruvchi mahsulotini ustama bilan sotish.',
      details:
        '• O‘z mahsulotlarimni sotish: Siz ishlab chiqargan yoki oldindan sotib olgan tovarlaringizni o‘z omboringizdan sotasiz.\n• Dropshipping: Tovarni oldindan sotib olmaysiz. Yetkazib beruvchi mahsulotini do‘koningizga qo‘yasiz, ustiga o‘z foydangizni qo‘shasiz. Mijoz sizdan xarid qilgach, mahsulot unga to‘g‘ridan-to‘g‘ri yetkaziladi.',
      actionLabel: 'Katalogda rejimni ko‘rish',
      actionRoute: 'products',
      icon: Boxes,
    },
    {
      id: 10,
      question: '10. Texnik muammoga duch kelsam, nima qilaman?',
      shortAnswer: 'Sellnex qo‘llab-quvvatlash xizmati har doim yordamga tayyor — Telegram bot yoki qo‘llab-quvvatlash chati orqali bog‘laning.',
      details:
        'Har qanday savol, to‘lovlar, yetkazib berish yoki funksiyalarni ishlatish bo‘yicha muammolar yuzaga kelsa, platformadagi qo‘llab-quvvatlash guruhiga yozishingiz mumkin.',
      actionLabel: 'Telegram yordamga o‘tish',
      icon: MessageCircle,
      onCustomAction: () => {
        window.open('https://t.me/sellnex_support', '_blank');
      },
      customActionLabel: 'Telegram Support',
    },
  ];

  const filteredFaqs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (item: typeof faqItems[0]) => {
    if (item.onCustomAction) {
      item.onCustomAction();
      return;
    }
    if (item.actionRoute) {
      if (item.actionRoute === 'public-store') {
        navigateTo('public-store', { storeSlug: store.slug });
      } else {
        navigateTo(item.actionRoute);
      }
      onClose();
    }
  };

  return (
    <div
      id="help-faq-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Qo‘llanma va Ko‘p Beriladigan Savollar (FAQ)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sellnex platformasidan samarali foydalanish bo‘yicha to‘liq yo‘riqnoma
              </p>
            </div>
          </div>

          <button
            id="btn-close-help-faq"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Savolni qidiring (masalan: mahsulot, buyurtma, havola...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden transition-all"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 py-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Ushbu so‘rov bo‘yicha savol topilmadi. Boshqa kalit so‘z kiriting.
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {item.question}
                      </span>
                    </div>

                    <div className="p-1 text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 text-xs">
                      <p className="font-semibold text-slate-800 leading-relaxed">{item.shortAnswer}</p>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">{item.details}</p>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleAction(item)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <span>{item.customActionLabel || item.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Qo‘shimcha savollaringiz bormi?
          </span>
          <button
            type="button"
            onClick={() => window.open('https://t.me/sellnex_support', '_blank')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-1.5 text-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Telegram orqali yozish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
