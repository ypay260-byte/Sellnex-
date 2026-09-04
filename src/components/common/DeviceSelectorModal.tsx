import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreService } from '../../services/firestoreService';
import { Smartphone, Laptop, Check, X, Sparkles, ArrowRight } from 'lucide-react';

interface DeviceSelectorModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DeviceSelectorModal: React.FC<DeviceSelectorModalProps> = ({ forceOpen, onClose }) => {
  const { currentUser, store, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<'phone' | 'computer'>('phone');

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    try {
      const todayStr = getTodayDateString();
      const userId = currentUser?.id || 'guest';
      const storageKey = `sellnex_device_check_${userId}_${todayStr}`;
      const generalKey = `sellnex_device_check_${todayStr}`;

      const alreadyRecorded = localStorage.getItem(storageKey) || localStorage.getItem(generalKey);
      if (alreadyRecorded) {
        return;
      }

      // Detect hardware type based on userAgent & window width
      const isMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      const detected = isMobile ? 'phone' : 'computer';
      setSelectedType(detected);

      // Open modal after initial render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);

      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, [currentUser?.id]);

  const handleContinue = async () => {
    setIsSaving(true);
    const todayStr = getTodayDateString();
    const userId = currentUser?.id || 'guest';
    const storeId = store?.id || (currentUser?.storeId || '');

    try {
      // 1. Save to Firebase Firestore
      await firestoreService.saveDeviceLog({
        deviceType: selectedType === 'phone' ? 'Telefon' : 'Kompyuter',
        date: todayStr,
        userId,
        storeId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      });

      // 2. Mark as completed for today in localStorage
      const storageKey = `sellnex_device_check_${userId}_${todayStr}`;
      const generalKey = `sellnex_device_check_${todayStr}`;
      localStorage.setItem(storageKey, selectedType);
      localStorage.setItem(generalKey, selectedType);

      showToast(
        'Qurilma saqlandi',
        `Bugungi kirish: ${selectedType === 'phone' ? '📱 Telefon' : '💻 Kompyuter'} sifatida qayd etildi`,
        'success'
      );
    } catch (err) {
      console.warn('Error recording device:', err);
    } finally {
      setIsSaving(false);
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="device-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-modal-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white text-center relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KUNLIK SO‘ROVNOMA</span>
          </div>

          <h3 id="device-modal-title" className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
            Bugun do‘koningizga qaysi qurilmadan kirdingiz?
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xs mx-auto">
            Qurilma turini tanlang va davom etish tugmasini bosing
          </p>
        </div>

        {/* Device Options */}
        <div className="p-6 space-y-3 bg-slate-50/50">
          {/* Phone Option */}
          <button
            type="button"
            id="btn-select-phone"
            disabled={isSaving}
            onClick={() => setSelectedType('phone')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group text-left cursor-pointer ${
              selectedType === 'phone'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/10'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selectedType === 'phone'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    📱 Telefon
                  </span>
                  {selectedType === 'phone' && (
                    <span className="text-[10px] uppercase font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Tanlandi
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Mobil brauzer yoki ilova orqali
                </span>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedType === 'phone'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 group-hover:border-blue-400'
              }`}
            >
              {selectedType === 'phone' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* Computer / Desktop Option */}
          <button
            type="button"
            id="btn-select-computer"
            disabled={isSaving}
            onClick={() => setSelectedType('computer')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group text-left cursor-pointer ${
              selectedType === 'computer'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/10'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selectedType === 'computer'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    💻 Kompyuter
                  </span>
                  {selectedType === 'computer' && (
                    <span className="text-[10px] uppercase font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Tanlandi
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Noutbuk yoki ish stoli kompyuteri
                </span>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedType === 'computer'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 group-hover:border-blue-400'
              }`}
            >
              {selectedType === 'computer' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* Primary Action Button (Requirement 6) */}
          <div className="pt-2">
            <button
              id="btn-device-continue"
              type="button"
              disabled={isSaving}
              onClick={handleContinue}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>DA’VOM ETISH</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Ushbu so‘rovnoma kuniga ko‘pi bilan 1 marta chiqadi va Firebase bazasiga saqlanadi.
          </p>
        </div>
      </div>
    </div>
  );
};
