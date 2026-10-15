import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Megaphone,
  MessageCircle,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AdBanner } from '../../types';
import { adBannerService } from '../../services/adBannerService';
import { useApp } from '../../context/AppContext';

interface AdBannerCarouselProps {
  onOpenChatModal?: () => void;
  className?: string;
}

export const AdBannerCarousel: React.FC<AdBannerCarouselProps> = ({
  onOpenChatModal,
  className = '',
}) => {
  const { navigateTo } = useApp();
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  // Load banners
  const loadBanners = async () => {
    const active = await adBannerService.getActiveBanners();
    if (active.length > 0) {
      setBanners(active);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Auto-sliding interval (every 4.5s)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused]);

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = () => {
    if (!currentBanner) return;

    // Track click
    adBannerService.recordBannerClick(currentBanner.id);

    const link = currentBanner.linkUrl || '';

    // If chat trigger
    if (link.includes('chat') || link === '#open-chat') {
      if (onOpenChatModal) {
        onOpenChatModal();
      }
      return;
    }

    // External URL
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    // In-app route
    if (link.startsWith('/products') || link === 'products') {
      navigateTo('products');
    } else if (link.startsWith('/pricing') || link === 'pricing') {
      navigateTo('pricing');
    } else if (link.startsWith('/auth') || link.includes('signup')) {
      navigateTo('auth', { mode: 'signup' });
    } else if (link.startsWith('/store/')) {
      const slug = link.replace('/store/', '');
      navigateTo('public-store', { storeSlug: slug });
    } else if (link.startsWith('/')) {
      window.location.pathname = link;
    }
  };

  return (
    <div
      id="ad-banner-slider-container"
      className={`max-w-5xl mx-auto w-full px-2 sm:px-4 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Bar with Live Tag & Direct Chat Trigger */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[11px] font-bold">
            <Megaphone className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Hamkorlik & Reklama Vitrinasi</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            50,000+ maqsadli auditoriya
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-chat-with-admin-top"
            onClick={onOpenChatModal}
            className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border border-blue-500/25 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Administrator bilan chat"
          >
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Chat</span>
          </button>
          <button
            id="btn-place-ad-slider-top"
            onClick={onOpenChatModal}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Reklama berish</span>
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div
        onClick={handleBannerClick}
        className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-xl cursor-pointer select-none transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl"
        style={{ minHeight: '160px' }}
      >
        {/* Banner Background Image */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden">
          <img
            key={currentBanner.id}
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlays for readable text */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Slide Content */}
          <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between text-white z-10">
            {/* Top row in slide */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
                  <Flame className="w-3 h-3" />
                  <span>{currentBanner.badge || 'REKLAMA'}</span>
                </span>
                {currentBanner.endDate && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Amal qilish: {currentBanner.endDate}</span>
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-1 text-[11px] text-white/90 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                <span className="font-semibold hidden sm:inline">O‘tish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bottom row in slide: Title & Subtitle */}
            <div className="space-y-1 sm:space-y-1.5 max-w-xl">
              <h3 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                {currentBanner.title}
              </h3>
              {currentBanner.subtitle && (
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 drop-shadow-xs">
                  {currentBanner.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Previous Button */}
        {banners.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Oldingi slayd"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95 z-20 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {banners.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Keyingi slayd"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95 z-20 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Slide Indicator Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-2.5 right-4 flex items-center gap-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-amber-400 shadow-xs'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slayd ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
