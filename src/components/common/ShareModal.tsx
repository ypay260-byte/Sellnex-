import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Send,
  X,
  Sparkles,
  Smartphone,
  Globe,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  url: string;
  storeSlug?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  formatMoney?: (val: number) => string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
  storeSlug,
  productTitle,
  productPrice,
  productImage,
  formatMoney,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [guideMsg, setGuideMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (customNote?: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      if (customNote) {
        setGuideMsg(customNote);
      }
      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch {
        // ignore
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      if (customNote) setGuideMsg(customNote);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = productTitle
    ? `🛍️ ${productTitle}${productPrice && formatMoney ? ` — ${formatMoney(productPrice)}` : ''}\n\n👉 Buy online here:\n${url}`
    : `🛒 Check out my official online store:\n👉 ${url}`;

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Public Share Link</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {subtitle || 'Share this public link on Instagram Bio, Telegram channel, TikTok or WhatsApp. Customers can view and order without logging in.'}
          </p>
        </div>

        {/* Product preview if provided */}
        {productTitle && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{productTitle}</p>
              {productPrice && formatMoney && (
                <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                  {formatMoney(productPrice)}
                </p>
              )}
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                Live on Public Store
              </span>
            </div>
          </div>
        )}

        {/* URL Box & Copy */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Public Direct Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono select-all truncate">
              {url}
            </div>
            <button
              id="btn-modal-copy-link"
              onClick={() => handleCopy()}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          {guideMsg && (
            <p className="text-[11px] font-semibold text-pink-700 bg-pink-50 p-2 rounded-xl border border-pink-200 animate-in fade-in">
              {guideMsg}
            </p>
          )}
        </div>

        {/* Quick Social Share Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Share Directly to Channels
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Telegram */}
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
            >
              <Send className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold">Telegram</span>
              <span className="text-[9px] text-sky-600">Channel / Chat</span>
            </a>

            {/* Instagram Bio helper */}
            <button
              onClick={() => {
                handleCopy('Instagram Bio uchun havola nusxalandi! Profilingizga kirib "Links" bo\'limiga qo\'yishingiz mumkin.');
              }}
              className="p-3 bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100/70 hover:to-purple-100/70 border border-pink-200 text-pink-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
            >
              <Smartphone className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold">Instagram</span>
              <span className="text-[9px] text-pink-600">Bio & Story</span>
            </button>

            {/* WhatsApp */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
            >
              <Share2 className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold">WhatsApp</span>
              <span className="text-[9px] text-emerald-600">Direct Share</span>
            </a>

            {/* QR Code toggle */}
            <button
              onClick={() => setShowQr(!showQr)}
              className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group ${
                showQr
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <QrCode className={`w-5 h-5 ${showQr ? 'text-white' : 'text-slate-600'} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-extrabold">QR Code</span>
              <span className={`text-[9px] ${showQr ? 'text-blue-100' : 'text-slate-500'}`}>Scan on Phone</span>
            </button>
          </div>
        </div>

        {/* QR Code display */}
        {showQr && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-center animate-in fade-in">
            <img src={qrCodeUrl} alt="Store QR Code" className="w-44 h-44 rounded-xl shadow-xs border bg-white p-2" />
            <p className="text-[11px] text-slate-500 max-w-xs">
              Scan with your phone camera or print on promotional flyers, business cards and packaging.
            </p>
          </div>
        )}

        {/* Footer Actions: Test in New Window & Close */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Open Link in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
